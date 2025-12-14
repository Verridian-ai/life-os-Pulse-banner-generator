import { GoogleGenAI } from '@google/genai';
import { MODELS, DESIGN_SYSTEM_INSTRUCTION } from '../constants';
import { Part } from '../types';
import type { ImageEditTurn, BrandProfile } from '../types/ai';
import { uploadImage } from './supabase';
import { createImage } from './database';
// classifyError, getUserFriendlyMessage removed

// Types
type LLMProvider = 'gemini' | 'openrouter';

type OpenRouterContentItem =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };

type OpenRouterMessage = {
  role: string;
  content: string | OpenRouterContentItem[];
};

const getSettings = () => {
  const provider = (localStorage.getItem('llm_provider') as LLMProvider) || 'openrouter';

  // Get API keys from localStorage or environment variables only
  // Users must configure their own API keys via Settings or environment
  const geminiKey =
    localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
  const openRouterKey =
    localStorage.getItem('openrouter_api_key') || import.meta.env.VITE_OPENROUTER_API_KEY || '';
  const replicateKey =
    localStorage.getItem('replicate_api_key') || import.meta.env.VITE_REPLICATE_API_KEY || '';
  const stackKey =
    localStorage.getItem('stack_api_key') || import.meta.env.VITE_STACK_API_KEY || '';
  const model = localStorage.getItem('llm_model') || 'nano-banana-pro';
  const imageModel = localStorage.getItem('llm_image_model') || MODELS.imageGen;
  const upscaleModel =
    localStorage.getItem('llm_upscale_model') ||
    'nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73ab241b637189a1445ad';

  return {
    provider,
    geminiKey,
    openRouterKey,
    replicateKey,
    stackKey,
    model,
    imageModel,
    upscaleModel,
  };
};

// --- Google Client ---
const getGoogleClient = (key: string) => {
  return new GoogleGenAI({ apiKey: key });
};

// --- OpenRouter Client (Fetch wrapper) ---
const callOpenRouter = async (apiKey: string, model: string, messages: OpenRouterMessage[]) => {
  if (!apiKey) throw new Error('OpenRouter API Key not found');

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin, // Required by OpenRouter
      'X-Title': 'NanoBanna Pro', // Required by OpenRouter
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      // Typical parameters, can be adjusted
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`OpenRouter Error: ${err.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
};

// --- OpenRouter Image Generation Client ---
const callOpenRouterImageGen = async (
  apiKey: string,
  model: string,
  prompt: string,
  aspectRatio: string = '16:9',
): Promise<string> => {
  console.log('[OpenRouter Image] Starting generation with:', {
    model,
    aspectRatio,
    hasApiKey: !!apiKey,
  });

  if (!apiKey) {
    throw new Error('OpenRouter API Key not found. Please add it in Settings.');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'NanoBanna Pro',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      modalities: ['image', 'text'],
      image_config: {
        aspect_ratio: aspectRatio,
      },
    }),
  });

  console.log('[OpenRouter Image] Response status:', response.status);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('[OpenRouter Image] API Error:', errorData);
    throw new Error(
      `OpenRouter Image Error: ${errorData.error?.message || response.statusText}`,
    );
  }

  const data = await response.json();

  // Extract image from response
  const images = data.choices?.[0]?.message?.images;

  if (!images || images.length === 0) {
    console.error('[OpenRouter Image] No images in response:', data);
    throw new Error('OpenRouter returned no images in response');
  }

  // Get the first image (base64 data URL)
  const imageDataUrl = images[0]?.image_url?.url;

  if (!imageDataUrl) {
    throw new Error('OpenRouter image data URL is missing');
  }

  console.log('[OpenRouter Image] ✅ Image generated successfully');
  return imageDataUrl; // Returns data:image/png;base64,...
};

// --- Replicate Client ---
const callReplicate = async (apiKey: string, version: string, input: Record<string, unknown>) => {
  console.log('[Replicate] Starting prediction with:', { version, hasApiKey: !!apiKey });

  if (!apiKey) {
    throw new Error('Replicate API Key not found. Please add it in Settings.');
  }

  // Use proxy in development to avoid CORS issues
  const isDev = import.meta.env.DEV;
  const baseUrl = isDev ? '/api/replicate' : 'https://api.replicate.com';

  console.log(`[Replicate] Using ${isDev ? 'proxy' : 'direct'} endpoint:`, baseUrl);

  try {
    // 1. Start Prediction
    const startResponse = await fetch(`${baseUrl}/v1/predictions`, {
      method: 'POST',
      headers: {
        ...(isDev ? { 'x-replicate-token': apiKey } : { Authorization: `Token ${apiKey}` }),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ version, input }),
    });

    console.log('[Replicate] Start response status:', startResponse.status);

    if (!startResponse.ok) {
      const errorText = await startResponse.text();
      console.error('[Replicate] API Error:', errorText);

      let parsedError;
      try {
        parsedError = JSON.parse(errorText);
      } catch {
        throw new Error(`Replicate API error (${startResponse.status}): ${errorText}`);
      }

      // Handle specific error types
      if (startResponse.status === 401) {
        throw new Error('Invalid Replicate API key. Please check your Settings.');
      } else if (startResponse.status === 402) {
        throw new Error('Replicate account has insufficient credits.');
      } else if (startResponse.status === 404) {
        throw new Error('Replicate model not found. Model may be outdated.');
      } else if (startResponse.status === 429) {
        throw new Error('Replicate rate limit exceeded. Please wait and try again.');
      }

      throw new Error(`Replicate Error: ${parsedError.detail || startResponse.statusText}`);
    }

    const startData = await startResponse.json();
    const predictionId = startData.id;
    console.log('[Replicate] Prediction started:', predictionId);

    // 2. Poll for Result
    let prediction = startData;
    let pollCount = 0;
    const maxPolls = 120; // 2 minutes max (120 seconds)

    while (
      prediction.status !== 'succeeded' &&
      prediction.status !== 'failed' &&
      prediction.status !== 'canceled'
    ) {
      if (pollCount >= maxPolls) {
        throw new Error('Replicate prediction timed out after 2 minutes.');
      }

      await new Promise((r) => setTimeout(r, 1000)); // Poll every 1s
      const pollResponse = await fetch(`${baseUrl}/v1/predictions/${predictionId}`, {
        headers: {
          ...(isDev ? { 'x-replicate-token': apiKey } : { Authorization: `Token ${apiKey}` }),
          'Content-Type': 'application/json',
        },
      });

      if (!pollResponse.ok) {
        console.error('[Replicate] Poll failed:', pollResponse.status);
        throw new Error(`Replicate polling failed: ${pollResponse.statusText}`);
      }

      prediction = await pollResponse.json();
      pollCount++;

      if (pollCount % 5 === 0) {
        console.log('[Replicate] Polling...', { status: prediction.status, pollCount });
      }
    }

    if (prediction.status === 'succeeded') {
      console.log('[Replicate] ✅ Prediction succeeded');
      return prediction.output;
    } else {
      console.error('[Replicate] ❌ Prediction failed:', prediction.error);
      throw new Error(`Replicate Prediction Failed: ${prediction.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('[Replicate] Call failed:', error);
    throw error;
  }
};

// STRICT CONSTRAINT for all visual generation
const PROFILE_ZONE_CONSTRAINT =
  " IMPORTANT CONSTRAINT: Do NOT place any text, logos, or important visual elements in the bottom-left corner area (coordinates 0,0 to 568,264). This area is obscured by the user's profile picture. ALL TEXT MUST BE PLACED IN THE CENTER OR RIGHT SIDE.";

// Diagnostics
export const testGeminiConnection = async (): Promise<boolean> => {
  try {
    const { geminiKey } = getSettings();
    if (!geminiKey) return false;

    const ai = getGoogleClient(geminiKey);
    const result = await ai.models.generateContent({
      model: 'google/gemini-2.0-flash-exp',
      contents: { parts: [{ text: 'Test' }] },
    });
    // In new SDK, result is the response object directly or has .response.
    // Checking documentation pattern: await client.models.generateContent(...) returns response
    return !!result.candidates?.[0]?.content?.parts?.[0]?.text;
  } catch (error) {
    console.error('Gemini Test Failed:', error);
    return false;
  }
};

// --- Unified Functions ---

export const generateDesignChatResponse = async (
  prompt: string,
  images: string[] = [], // base64 strings
  history: { role: string; parts: Part[] }[] = [],
  _isRetry: boolean = false,
) => {
  const { provider, geminiKey, openRouterKey, model } = getSettings();

  console.log('[Chat] Starting chat with:', {
    provider,
    model,
    hasImages: images.length > 0,
    isRetry: _isRetry,
  });

  // 1. OpenRouter Path
  if (provider === 'openrouter') {
    // Convert History to OpenAI format for OpenRouter
    const messages: OpenRouterMessage[] = history.map((h) => {
      const content: OpenRouterContentItem[] = h.parts
        .map((p): OpenRouterContentItem | null => {
          if (p.text) return { type: 'text', text: p.text };
          if (p.inlineData)
            return {
              type: 'image_url',
              image_url: { url: `data:${p.inlineData.mimeType};base64,${p.inlineData.data}` },
            };
          return null;
        })
        .filter((p): p is OpenRouterContentItem => p !== null);
      return { role: h.role === 'model' ? 'assistant' : 'user', content };
    });

    // Add current user message
    const currentContent: OpenRouterContentItem[] = [{ type: 'text', text: prompt }];
    images.forEach((img) => {
      // Ensure base64 is clean
      const base64 = img; // Usually implies full data URI in this context based on app flow
      currentContent.push({ type: 'image_url', image_url: { url: base64 } });
    });
    messages.push({ role: 'user', content: currentContent });

    // Add system instruction if supported (usually accepted as 'system' role)
    const systemContent: OpenRouterContentItem[] = [
      { type: 'text', text: DESIGN_SYSTEM_INSTRUCTION + PROFILE_ZONE_CONSTRAINT },
    ];
    messages.unshift({
      role: 'system',
      content: systemContent,
    });

    const text = await callOpenRouter(openRouterKey, model, messages);
    return { text, groundingMetadata: null }; // OpenRouter generic doesn't return grounding usually
  }

  // 2. Google Gemini Path (Original Logic)
  // Use specific Thinking model for 'design' mode if using Gemini directly
  try {
    const ai = getGoogleClient(geminiKey);

    const currentParts: Part[] = [{ text: prompt }];
    images.forEach((img) => {
      const base64Data = img.split(',')[1] || img;
      const mimeType = img.substring(img.indexOf(':') + 1, img.indexOf(';')) || 'image/png';
      currentParts.push({ inlineData: { mimeType, data: base64Data } });
    });

    const response = await ai.models.generateContent({
      model: MODELS.textThinking, // gemini-3-pro-preview
      contents: [...history, { role: 'user', parts: currentParts }],
      config: {
        systemInstruction: DESIGN_SYSTEM_INSTRUCTION + PROFILE_ZONE_CONSTRAINT,
        thinkingConfig: { thinkingBudget: 32768 },
      },
    });

    return {
      text: response.text || "I'm having trouble thinking of a response right now.",
      groundingMetadata: response.candidates?.[0]?.groundingMetadata,
    };
  } catch (error) {
    console.error('Gemini Design Error:', error);

    // AUTO-FALLBACK: If Gemini fails, try OpenRouter
    if (!_isRetry && openRouterKey) {
      console.warn('[Chat] ⚠️ Gemini chat failed, falling back to OpenRouter');

      try {
        // Convert history to OpenAI format
        const messages: OpenRouterMessage[] = history.map((h) => {
          const content: OpenRouterContentItem[] = h.parts
            .map((p): OpenRouterContentItem | null => {
              if (p.text) return { type: 'text', text: p.text };
              if (p.inlineData)
                return {
                  type: 'image_url',
                  image_url: { url: `data:${p.inlineData.mimeType};base64,${p.inlineData.data}` },
                };
              return null;
            })
            .filter((p): p is OpenRouterContentItem => p !== null);
          return { role: h.role === 'model' ? 'assistant' : 'user', content };
        });

        const currentContent: OpenRouterContentItem[] = [{ type: 'text', text: prompt }];
        images.forEach((img) => {
          currentContent.push({ type: 'image_url', image_url: { url: img } });
        });
        messages.push({ role: 'user', content: currentContent });
        const systemContent: OpenRouterContentItem[] = [
          { type: 'text', text: DESIGN_SYSTEM_INSTRUCTION + PROFILE_ZONE_CONSTRAINT },
        ];
        messages.unshift({
          role: 'system',
          content: systemContent,
        });

        const fallbackModel = model || 'google/gemini-3-pro-preview';
        const text = await callOpenRouter(openRouterKey, fallbackModel, messages);

        console.log('[Chat] ✅ OpenRouter fallback successful!');
        return { text, groundingMetadata: null };
      } catch (fallbackError) {
        console.error('[Chat] ❌ OpenRouter fallback also failed:', fallbackError);
        throw error; // Throw original error
      }
    }

    throw error;
  }
};

// --- Agentic Capabilities ---

const AGENT_TOOLS = [
  {
    name: 'generate_background',
    description: 'Generates a new background image for the banner based on a text prompt.',
    parameters: {
      type: 'OBJECT',
      properties: {
        prompt: { type: 'STRING', description: 'The visual description of the image to generate' },
        style: {
          type: 'STRING',
          description: "The artistic style (e.g., 'photorealistic', 'cyberpunk', 'minimalist')",
        },
      },
      required: ['prompt'],
    },
  },
  {
    name: 'magic_edit',
    description: 'Edits the existing background image using a text instruction.',
    parameters: {
      type: 'OBJECT',
      properties: {
        instruction: {
          type: 'STRING',
          description: "The editing instruction (e.g., 'make it sunset', 'add a laptop')",
        },
      },
      required: ['instruction'],
    },
  },
  {
    name: 'remove_background',
    description: 'Removes the background from the current image, leaving only the main subject.',
    parameters: {
      type: 'OBJECT',
      properties: {},
      required: [],
    },
  },
  {
    name: 'upscale_image',
    description: 'Upscales the current image 2x to high resolution.',
    parameters: {
      type: 'OBJECT',
      properties: {},
      required: [],
    },
  },
];

interface AgentToolCall {
  name: string;
  args: Record<string, unknown>;
}

interface AgentHistoryItem {
  role: string;
  parts?: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>;
}

export const generateAgentResponse = async (
  userTranscript: string,
  currentScreenshot: string | null, // Base64
  history: AgentHistoryItem[] = [],
  _isRetry: boolean = false,
): Promise<{ text: string; toolCalls?: AgentToolCall[] }> => {
  const { geminiKey, openRouterKey, model } = getSettings();

  console.log('[Voice Agent] Starting with:', {
    hasGeminiKey: !!geminiKey,
    hasOpenRouterKey: !!openRouterKey,
    isRetry: _isRetry,
  });

  if (!geminiKey && !openRouterKey) {
    return { text: 'I need a Gemini or OpenRouter API Key to work. Please check your settings.' };
  }

  try {
    const ai = getGoogleClient(geminiKey);

    const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [
      { text: userTranscript },
    ];
    if (currentScreenshot) {
      parts.push({ inlineData: { mimeType: 'image/png', data: currentScreenshot.split(',')[1] } });
    }

    // Using generateContent with tools config
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      config: {
        systemInstruction:
          'You are Nano, an expert design partner. You are helpful, enthusiastic, and concise. You have access to tools to control the canvas. When a user asks to change the background or edit something, USE THE TOOLS. Do not just describe what you would do.',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tools: [{ functionDeclarations: AGENT_TOOLS as any }],
      },
      contents: [
        ...history, // Previous history
        { role: 'user', parts: parts }, // Current message
      ],
    });

    // Handle Tool Calls
    const candidates = response.candidates;
    let text = '';
    try {
      text = response.text || '';
    } catch {
      text = '';
    }

    let functionCalls: AgentToolCall[] = [];
    if (candidates && candidates[0]?.content?.parts) {
      functionCalls = candidates[0].content.parts
        .filter(
          (
            part,
          ): part is typeof part & {
            functionCall: { name: string; args: Record<string, unknown> };
          } => 'functionCall' in part && part.functionCall !== undefined,
        )
        .map((part) => part.functionCall);
    }

    if (functionCalls.length > 0) {
      return { text: text, toolCalls: functionCalls };
    }

    return { text };
  } catch (error) {
    console.error('Agent Error:', error);

    // AUTO-FALLBACK: If Gemini fails, try OpenRouter
    if (!_isRetry && openRouterKey) {
      console.warn('[Voice Agent] ⚠️ Gemini agent failed, falling back to OpenRouter');

      try {
        const messages: OpenRouterMessage[] = [];

        // Convert history
        history.forEach((msg) => {
          if (msg.role === 'user' || msg.role === 'assistant') {
            const content: OpenRouterContentItem[] = [];
            if (msg.parts) {
              msg.parts.forEach((part) => {
                if (part.text) content.push({ type: 'text', text: part.text });
                if (part.inlineData) {
                  content.push({
                    type: 'image_url',
                    image_url: {
                      url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
                    },
                  });
                }
              });
            }
            messages.push({ role: msg.role, content });
          }
        });

        // Add current message
        const currentContent: OpenRouterContentItem[] = [{ type: 'text', text: userTranscript }];
        if (currentScreenshot) {
          currentContent.push({
            type: 'image_url',
            image_url: { url: `data:image/png;base64,${currentScreenshot}` },
          });
        }
        messages.push({ role: 'user', content: currentContent });

        // Add system instruction
        messages.unshift({
          role: 'system',
          content:
            'You are Nano, an expert design partner. You are helpful, enthusiastic, and concise. You help users create LinkedIn banners.',
        });

        const fallbackModel = model || 'google/gemini-3-pro-preview';
        const text = await callOpenRouter(openRouterKey, fallbackModel, messages);

        console.log('[Voice Agent] ✅ OpenRouter fallback successful!');

        // Note: OpenRouter doesn't support tool calls in the same way, so return text only
        return { text, toolCalls: [] };
      } catch (fallbackError) {
        console.error('[Voice Agent] ❌ OpenRouter fallback also failed:', fallbackError);
        return { text: "I'm having trouble connecting. Please check your API keys." };
      }
    }

    return { text: "I'm having trouble connecting to my brain right now." };
  }
};

export const generateThinkingResponse = async (
  prompt: string,
  history: { role: string; parts: Part[] }[] = [],
) => {
  // Currently 'Thinking' mode in chat interface calls this.
  // For OpenRouter, we just use standard chat completion.
  const { provider, geminiKey, openRouterKey, model } = getSettings();

  if (provider === 'openrouter') {
    // Re-use logic or simplify?
    // Simplification for text-only thinking
    const messages = history.map((h) => ({
      role: h.role === 'model' ? 'assistant' : 'user',
      content: h.parts.map((p) => p.text).join('\n'),
    }));
    messages.push({ role: 'user', content: prompt });

    const text = await callOpenRouter(openRouterKey, model, messages);
    return { text, groundingMetadata: null };
  }

  // Gemini Path
  try {
    const ai = getGoogleClient(geminiKey);
    const response = await ai.models.generateContent({
      model: MODELS.textThinking,
      contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
      },
    });
    return {
      text: response.text || 'No response generated.',
      groundingMetadata: response.candidates?.[0]?.groundingMetadata,
    };
  } catch (error) {
    console.error('Gemini Thinking Error:', error);
    throw error;
  }
};

export const generateSearchResponse = async (
  prompt: string,
  history: { role: string; parts: Part[] }[] = [],
) => {
  // OpenRouter doesn't inherently support Google Search grounding unless using specific perplexity models maybe.
  // We will Default to Gemini for Search if provider is 'openrouter' BUT warn/fallback?
  // OR we just perform a standard completion and Model might hallucinate or know facts.
  // Let's force Gemini logic for Search if possible, or just standard chat if OpenRouter selected.

  const { provider, geminiKey, openRouterKey, model } = getSettings();

  if (provider === 'openrouter') {
    // Just do standard chat
    const messages: Array<{ role: string; content: string }> = history.map((h) => ({
      role: h.role === 'model' ? 'assistant' : 'user',
      content: h.parts
        .map((p) => p.text)
        .filter((t): t is string => t !== undefined)
        .join('\n'),
    }));
    messages.push({ role: 'user', content: prompt });
    messages.unshift({
      role: 'system',
      content: 'You are a helpful assistant. Search the web if you can (simulation).',
    });

    const text = await callOpenRouter(openRouterKey, model, messages);
    return { text, groundingMetadata: null };
  }

  try {
    const ai = getGoogleClient(geminiKey);
    const response = await ai.models.generateContent({
      model: MODELS.textBasic,
      contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    return {
      text: response.text || 'No response generated.',
      groundingMetadata: response.candidates?.[0]?.groundingMetadata,
    };
  } catch (error) {
    console.error('Gemini Search Error:', error);
    throw error;
  }
};

// ... (Other functions like generateImage and editImage likely remain Gemini-specific for now unless user has image models on OR)
// For now, we keep Image generation constrained to Gemini as it's specialized.
// We can expose the key setting though.

export const generatePromptFromRefImages = async (images: string[], userHint: string) => {
  // This uses 'thinking' model which is great for visual analysis.
  // Can switch to OpenRouter vision models (gpt-4o, claude-3)
  const { provider, geminiKey, openRouterKey, model } = getSettings();

  if (provider === 'openrouter') {
    const contentArray: OpenRouterContentItem[] = [
      {
        type: 'text',
        text: `Analyze available reference images. Extract aesthetic. User hint: ${userHint}. Write a LinkedIn banner prompt.`,
      },
    ];
    images.forEach((img) => {
      contentArray.push({ type: 'image_url', image_url: { url: img } });
    });
    const messages: OpenRouterMessage[] = [
      {
        role: 'user',
        content: contentArray,
      },
    ];

    return await callOpenRouter(openRouterKey, model, messages);
  }

  // Gemini
  try {
    const ai = getGoogleClient(geminiKey);
    const parts: Part[] = [];
    images.forEach((img) => {
      const base64Data = img.split(',')[1] || img;
      const mimeType = img.substring(img.indexOf(':') + 1, img.indexOf(';')) || 'image/png';
      parts.push({ inlineData: { mimeType, data: base64Data } });
    });
    parts.push({
      text: `Analyze ... User's specific intent: "${userHint}" ... Return ONLY prompt.`,
    });

    const response = await ai.models.generateContent({
      model: MODELS.textThinking,
      contents: [{ role: 'user', parts }],
      config: { thinkingConfig: { thinkingBudget: 1024 } },
    });

    return response.text || '';
  } catch (error) {
    console.error('Magic Prompt Error:', error);
    throw error;
  }
};

// Image Generation with Gemini 3 Pro Image (supports 14 refs, multi-turn, 4K)
export const generateImage = async (
  prompt: string,
  referenceImages: string[] = [], // Up to 14 reference images
  size: '1K' | '2K' | '4K' = '4K',
  editHistory: ImageEditTurn[] = [],
  _isRetry: boolean = false, // Internal flag for fallback retry
): Promise<string> => {
  const { provider, geminiKey, openRouterKey, imageModel } = getSettings();
  const modelToUse = imageModel;

  console.log('[Image Gen] Starting generation with:', {
    provider,
    model: modelToUse,
    size,
    refImagesCount: referenceImages.length,
    editHistoryCount: editHistory.length,
    hasGeminiKey: !!geminiKey,
    hasOpenRouterKey: !!openRouterKey,
    isRetry: _isRetry,
  });

  // PRIMARY: Try OpenRouter Gemini image generation first (bypasses billing issues!)
  console.log('[Image Gen] 🎯 Using OpenRouter Gemini as primary method');

  try {
    if (!openRouterKey) {
      throw new Error('OpenRouter API key not found. Falling back to Replicate.');
    }

    // Use Google's Gemini via OpenRouter
    // Use the selected model from settings, or fallback to the constant
    const openRouterModel = modelToUse || MODELS.imageGen;
    const safePrompt = `Professional LinkedIn Banner, 1584x396 pixels ratio (approx 4:1 aspect), high quality. ${prompt} ${PROFILE_ZONE_CONSTRAINT}`;

    const imageDataUrl = await callOpenRouterImageGen(
      openRouterKey,
      openRouterModel,
      safePrompt,
      '16:9',
    );

    console.log('[Image Gen] ✅ OpenRouter Gemini successful!');

    // Upload to Supabase
    try {
      console.log('[Image Gen] Uploading OpenRouter image to Supabase...');
      const fileName = `generated_${Date.now()}.png`;
      const publicUrl = await uploadImage(imageDataUrl, fileName);
      console.log('[Image Gen] ✅ Saved to Supabase:', publicUrl);

      // Save to database
      try {
        await createImage({
          storage_url: publicUrl,
          file_name: fileName,
          prompt: prompt,
          model_used: 'gemini-2.5-flash-image (via OpenRouter)',
          quality: size,
          generation_type: 'generate',
        });
        console.log('[Image Gen] ✅ Saved to database and gallery');
      } catch (dbError) {
        console.warn('[Image Gen] Database save failed (non-fatal):', dbError);
      }

      return publicUrl;
    } catch (uploadError) {
      console.warn('[Image Gen] Supabase upload failed, returning base64:', uploadError);
      return imageDataUrl;
    }
  } catch (openRouterError) {
    console.error('[Image Gen] ❌ OpenRouter Gemini failed:', openRouterError);
    console.log('[Image Gen] 🔄 Falling back to Replicate FLUX...');

    // FALLBACK: Use Replicate FLUX.1-schnell
    try {
      const { replicateKey } = getSettings();
      if (!replicateKey) {
        throw new Error('Replicate API key not found. Please add it in Settings.');
      }

      const fluxVersion = 'black-forest-labs/flux-schnell';
      console.log('[Image Gen] Calling Replicate FLUX.1-schnell...');

      const fluxPrompt = `Professional LinkedIn banner, 1584x396 pixels, 16:9 aspect ratio. ${prompt}`;

      const output = await callReplicate(replicateKey, fluxVersion, {
        prompt: fluxPrompt,
        width: 1584,
        height: 396,
        num_outputs: 1,
        guidance_scale: 3.5,
        num_inference_steps: 4,
      });

      const imageUrl = Array.isArray(output) ? output[0] : output;
      console.log('[Image Gen] ✅ Replicate FLUX fallback successful!');
      console.log('[Image Gen] 💡 Using Replicate because OpenRouter failed');

      return imageUrl;
    } catch (replicateError) {
      console.error('[Image Gen] ❌ Replicate also failed:', replicateError);
      throw new Error(
        'All image generation methods failed. Please check your API keys in Settings.',
      );
    }
  }
};

// OLD GEMINI-DIRECT CODE REMOVED - NOW USING OPENROUTER-FIRST APPROACH
// Image generation now uses OpenRouter Gemini as primary, with Replicate as fallback

// ======================================================================

export const editImage = async (base64Image: string, prompt: string) => {
  const { geminiKey } = getSettings();

  if (!geminiKey) {
    throw new Error('Gemini API key not found. Please add your API key in Settings.');
  }

  const ai = getGoogleClient(geminiKey);

  // Improved base64 extraction
  let base64Data: string;
  let mimeType: string;

  if (base64Image.startsWith('data:')) {
    const matches = base64Image.match(/^data:([^;]+);base64,(.+)$/);
    if (matches) {
      mimeType = matches[1];
      base64Data = matches[2];
    } else {
      base64Data = base64Image.split(',')[1] || base64Image;
      mimeType = 'image/png';
    }
  } else {
    base64Data = base64Image;
    mimeType = 'image/png';
  }

  const safePrompt = `${prompt} ${PROFILE_ZONE_CONSTRAINT}`;

  console.log('[Image Edit] Starting edit with model:', MODELS.imageEdit);

  try {
    const response = await ai.models.generateContent({
      model: MODELS.imageEdit,
      contents: {
        parts: [{ inlineData: { mimeType, data: base64Data } }, { text: safePrompt }],
      },
      config: { imageConfig: { aspectRatio: '16:9' } },
    });

    console.log('[Image Edit] API response received, extracting image...');

    const candidates = response.candidates || [];
    if (candidates.length === 0) {
      throw new Error(
        'API returned no candidates. Response may have been blocked by safety filters.',
      );
    }

    for (const part of candidates[0].content?.parts || []) {
      if (part.inlineData) {
        console.log('[Image Edit] ✓ Edited image extracted successfully');
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error(`No edited image in API response. Candidates: ${candidates.length}`);
  } catch (error) {
    console.error('[Image Edit] FAILED:', error);

    // Provide more helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('Invalid Gemini API key. Please check your API key in Settings.');
      } else if (error.message.includes('quota')) {
        throw new Error('API quota exceeded. Please check your Gemini API usage.');
      } else if (error.message.includes('safety')) {
        throw new Error('Content blocked by safety filters. Try a different edit prompt.');
      }
    }

    throw error;
  }
};

export const analyzeImageForPrompts = async (
  base64Image: string,
): Promise<{ magicEdit: string[]; generation: string[] }> => {
  const { geminiKey } = getSettings();
  try {
    const ai = getGoogleClient(geminiKey);
    const parts: Part[] = [
      { inlineData: { mimeType: 'image/png', data: base64Image.split(',')[1] } },
      {
        text: `Analyze this banner background image. 
            
            1. Suggest 3 "Magic Edit" prompts to enhance it (e.g., "Add a futuristic neon glow", "Change background to a sunset city").
            2. Suggest 3 "generation" prompts to create a NEW image with a similar style/vibe.
            
            Return JSON format:
            {
                "magicEdit": ["prompt 1", "prompt 2", "prompt 3"],
                "generation": ["prompt 1", "prompt 2", "prompt 3"]
            }`,
      },
    ];

    const response = await ai.models.generateContent({
      model: MODELS.textThinking, // Gemini 2.0 Flash/Pro
      contents: [{ role: 'user', parts }],
      config: { responseMimeType: 'application/json' },
    });

    const text = response.text || '{}';
    const json = JSON.parse(text);
    return {
      magicEdit: json.magicEdit || [],
      generation: json.generation || [],
    };
  } catch (error) {
    console.error('Analysis Error:', error);
    return { magicEdit: [], generation: [] };
  }
};

export const removeBackground = async (imageBase64: string): Promise<string> => {
  const { replicateKey } = getSettings();
  if (!replicateKey) throw new Error('Missing Replicate API Key');

  const version = 'cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003';
  const image = imageBase64.startsWith('data:')
    ? imageBase64
    : `data:image/png;base64,${imageBase64}`;

  try {
    const output = await callReplicate(replicateKey, version, { image });
    return output as string;
  } catch (error) {
    console.error('Remove BG Failed:', error);
    throw error;
  }
};

export const upscaleImage = async (imageBase64: string, scale: number = 2): Promise<string> => {
  const { replicateKey, upscaleModel } = getSettings();
  if (!replicateKey) throw new Error('Missing Replicate API Key');

  // version is the part after colon
  const version = upscaleModel.includes(':') ? upscaleModel.split(':')[1] : upscaleModel;

  const image = imageBase64.startsWith('data:')
    ? imageBase64
    : `data:image/png;base64,${imageBase64}`;

  try {
    const output = await callReplicate(replicateKey, version, { image, scale });
    return output as string;
  } catch (error) {
    console.error('Upscale Failed:', error);
    throw error;
  }
};

/**
 * Analyze canvas screenshot and suggest improvements using vision AI
 * Considers brand profile if available for personalized suggestions
 */
export const analyzeCanvasAndSuggest = async (
  canvasScreenshot: string,
  brandProfile: BrandProfile | null = null,
): Promise<{ suggestions: string[]; reasoning: string }> => {
  const { geminiKey } = getSettings();
  if (!geminiKey) throw new Error('Gemini API Key required for canvas analysis');

  try {
    const ai = getGoogleClient(geminiKey);

    const base64Data = canvasScreenshot.split(',')[1] || canvasScreenshot;

    let brandContext = '';
    if (brandProfile) {
      const colors = brandProfile.colors.map((c) => c.hex).join(', ');
      const styles = brandProfile.styleKeywords.join(', ');
      brandContext = `\nBrand Guidelines:
- Colors: ${colors}
- Style Keywords: ${styles}
- Industry: ${brandProfile.industry || 'General'}
- Target Audience: ${brandProfile.targetAudience || 'Professional'}`;
    }

    const parts: Part[] = [
      { inlineData: { mimeType: 'image/png', data: base64Data } },
      {
        text: `Analyze this LinkedIn banner design (1584x396px).${brandContext}

Provide 3 specific improvement suggestions to enhance:
1. Visual appeal and professional polish
2. LinkedIn engagement potential
3. Brand consistency (if brand profile provided)

Important: Remember the bottom-left corner (568x264px) is covered by profile picture.

Return JSON format:
{
  "suggestions": [
    "Specific improvement 1",
    "Specific improvement 2",
    "Specific improvement 3"
  ],
  "reasoning": "Brief explanation of why these improvements will enhance the design"
}`,
      },
    ];

    const response = await ai.models.generateContent({
      model: MODELS.textThinking, // Use thinking model for better analysis
      contents: [{ role: 'user', parts }],
      config: {
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingBudget: 2048 },
      },
    });

    const result = JSON.parse(response.text || '{}');

    return {
      suggestions: result.suggestions || [],
      reasoning: result.reasoning || '',
    };
  } catch (error) {
    console.error('Canvas Analysis Error:', error);
    return {
      suggestions: [],
      reasoning: 'Failed to analyze canvas. Please try again.',
    };
  }
};
