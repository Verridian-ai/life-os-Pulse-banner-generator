// LLM Service - Refactored to use Backend Proxy for Security & Observability
import { MODELS, DESIGN_SYSTEM_INSTRUCTION } from '../constants';
import { Part } from '../types';
import type { ImageEditTurn } from '../types/ai';
import { api } from './api';
import { resizeToLinkedInBanner, prepareForOutpainting } from '../utils/imageUtils';
import { getUserAPIKeys } from './apiKeyStorage';

// Types (Subset needed for frontend)
type OpenRouterContentItem =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };

type ChatMessage = {
  role: string;
  content: string | OpenRouterContentItem[];
};

const PROFILE_ZONE_CONSTRAINT = " IMPORTANT CONSTRAINT: Do NOT place any text, logos, or important visual elements in the bottom-left corner area (coordinates 0,0 to 568,264).";

// --- Chat Wrappers ---

export const generateDesignChatResponse = async (
  prompt: string,
  images: string[] = [],
  history: { role: string; parts: Part[] }[] = [],
) => {
  // Construct messages on client to maintain state control, but send to server for execution
  const messages: ChatMessage[] = history.map((h) => ({
    role: h.role === 'model' ? 'assistant' : 'user',
    content: h.parts.map(p => p.text ? { type: 'text', text: p.text } : { type: 'image_url', image_url: { url: p.inlineData ? `data:${p.inlineData.mimeType};base64,${p.inlineData.data}` : '' } }).filter(Boolean) as OpenRouterContentItem[]
  }));

  const currentContent: OpenRouterContentItem[] = [{ type: 'text', text: prompt }];
  images.forEach(img => currentContent.push({ type: 'image_url', image_url: { url: img } }));
  messages.push({ role: 'user', content: currentContent });

  const systemContent: OpenRouterContentItem[] = [{ type: 'text', text: DESIGN_SYSTEM_INSTRUCTION + PROFILE_ZONE_CONSTRAINT }];
  messages.unshift({ role: 'system', content: systemContent });

  // Call Backend API
  const response = await api.post<{ text: string }>('/api/ai/chat', {
    messages,
    model: MODELS.openrouter.glm47, // Updated to user requested model
    provider: 'openrouter'
  });

  return { text: response.text, groundingMetadata: null };
};

export const generateAgentResponse = async (
  userTranscript: string,
  currentScreenshot: string | null,
  history: { role: string; parts: Part[] }[] = [],
) => {
  const messages: ChatMessage[] = history.map(h => ({ role: h.role === 'model' ? 'assistant' : 'user', content: h.parts?.[0]?.text || '' }));

  const content: OpenRouterContentItem[] = [{ type: 'text', text: userTranscript }];
  if (currentScreenshot) content.push({ type: 'image_url', image_url: { url: currentScreenshot } });

  messages.push({ role: 'user', content });
  messages.unshift({ role: 'system', content: "You are Nano, an expert design partner. You are helpful, enthusiastic, and concise." });

  const response = await api.post<{ text: string }>('/api/ai/chat', {
    messages,
    model: MODELS.openrouter.glm47,
    provider: 'openrouter'
  });

  return { text: response.text };
};

export const generateThinkingResponse = async (prompt: string) => {
  const messages = [{ role: 'system', content: 'You are a deep thinking assistant.' }, { role: 'user', content: prompt }];

  const response = await api.post<{ text: string }>('/api/ai/chat', {
    messages,
    model: MODELS.openrouter.glm47,
    provider: 'openrouter'
  });

  return { text: response.text, groundingMetadata: null };
};

export const generateSearchResponse = async (prompt: string, history: { role: string; parts: Part[] }[] = []) => {
  // Construct messages for Perplexity (Online Model)
  // Perplexity works best with standard OpenAI-like message format
  const messages: ChatMessage[] = history.map((h) => ({
    role: h.role === 'model' ? 'assistant' : 'user',
    content: h.parts.map(p => p.text ? { type: 'text', text: p.text } : null).filter(Boolean) as OpenRouterContentItem[]
  }));

  // Add current prompt
  messages.push({ role: 'user', content: [{ type: 'text', text: prompt }] });

  // Add system instruction for search behavior
  messages.unshift({
    role: 'system',
    content: [{ type: 'text', text: "You are an expert Trend Researcher for LinkedIn branding. Search the web for the latest trends, data, and visual styles. Be specific, cite sources if possible, and focus on actionable insights for banner design." }]
  });

  // Call Backend API with Perplexity Model
  const response = await api.post<{ text: string }>('/api/ai/chat', {
    messages,
    model: MODELS.openrouter.sonarDeepResearch,
    provider: 'openrouter'
  });

  return { text: response.text, groundingMetadata: null };
};

export const generatePromptFromRefImages = async (images: string[], userHint: string) => {
  const content: OpenRouterContentItem[] = [{ type: 'text', text: `Analyze these reference images. Hint: ${userHint}. Return a prompt.` }];
  images.forEach(img => content.push({ type: 'image_url', image_url: { url: img } }));

  const response = await api.post<{ text: string }>('/api/ai/chat', {
    messages: [{ role: 'user', content }],
    model: MODELS.openrouter.glm47,
    provider: 'openrouter'
  });
  return response.text;
};

// --- Image Gen (Refactored) ---
export const generateImage = async (
  prompt: string,
  _referenceImages: string[] = [],
  _size: '1K' | '2K' | '4K' = '4K',
  isBanner: boolean = false, // New param
  _editHistory: ImageEditTurn[] = [],
  _isRetry: boolean = false
): Promise<string> => {
  let imageUrl = '';
  // Force banner dimensions for all generations if isBanner is true
  const dimensions = isBanner ? { width: 1584, height: 396 } : { aspect_ratio: '16:9' };

  console.log('[Image Gen] Starting generation pipeline for:', prompt);

  // Fetch keys for BYOK support
  const keys = await getUserAPIKeys().catch(() => ({} as any));

  // 1. Try Nano Banana Pro via OpenRouter (Gemini)
  try {
    console.log('[Image Gen] Attempting Nano Banana Pro (OpenRouter)...');
    const response = await api.post<{ url: string }>('/api/ai/image/generate', {
      prompt,
      model: MODELS.imageGen, // google/gemini-3-pro-image-preview
      provider: 'openrouter',
      openRouterKey: keys.openrouter_api_key,
      ...dimensions
    });
    imageUrl = response.url;
    console.log('[Image Gen] ✅ Nano Banana Pro success');
  } catch (err) {
    console.warn('[Image Gen] ⚠️ Nano Banana Pro (OpenRouter) failed:', err);

    // 2. Fallback to Nano Banana Pro via Replicate
    try {
      console.log('[Image Gen] Attempting Nano Banana Pro (Replicate)...');
      const response = await api.post<{ url: string }>('/api/ai/image/generate', {
        prompt,
        model: 'google/nano-banana-pro', // Replicate ID
        provider: 'replicate',
        replicateKey: keys.replicate_api_key,
        ...dimensions
      });
      imageUrl = response.url;
      console.log('[Image Gen] ✅ Replicate fallback success');
    } catch (err2) {
      console.warn('[Image Gen] ⚠️ Replicate fallback failed:', err2);

      // 3. Fallback to Flux (Replicate)
      try {
        console.log('[Image Gen] Attempting Flux fallback...');
        const response = await api.post<{ url: string }>('/api/ai/image/generate', {
          prompt,
          model: 'black-forest-labs/flux-1-schnell',
          provider: 'replicate',
          replicateKey: keys.replicate_api_key,
          ...dimensions
        });
        imageUrl = response.url;
        console.log('[Image Gen] ✅ Flux fallback success');
      } catch (err3) {
        console.error('[Image Gen] ❌ All providers failed:', err3);
        throw new Error('Image generation failed across all providers');
      }
    }
  }

  // 4. Mandatory Resizing Pipeline
  // Regardless of which model generated it, enforce exact 1584x396 dimensions
  if (isBanner && imageUrl) {
    try {
      console.log('[Image Gen] 📏 Resizing to 1584x396 (Smart Expand)...');

      // 1. Prepare Composite & Mask (Image centered, white bars, mask preserves image)
      const { image: composite, mask } = await prepareForOutpainting(imageUrl);

      // 2. Call Flux Fill Pro via editImage
      const expandPrompt = `${prompt} . High quality, seamless background extension, cinematic lighting, comprehensive background.`;

      // We pass the composite as the "base image" and the mask to guide the AI
      const expandedUrl = await editImage(composite, expandPrompt, mask, 'black-forest-labs/flux-fill-pro');

      if (expandedUrl) {
        imageUrl = expandedUrl;
        console.log('[Image Gen] ✅ Smart Expand complete');
      } else {
        throw new Error("Flux Fill returned empty URL");
      }

    } catch (error) {
      console.error("[Image Gen] ⚠️ Smart Expand failed. Fallback to Cover Crop:", error);
      // Fallback: Standard Canvas Resizing (Crop)
      imageUrl = await resizeToLinkedInBanner(imageUrl, { quality: 0.95, fit: 'cover' });
      console.log('[Image Gen] ✅ Fallback Resize complete');
    }
  }

  return imageUrl;
};

// --- Image Edit & Analysis Tools (Implemented) ---

export const editImage = async (base64Image: string, prompt: string, mask?: string, modelOverride?: string) => {
  // Fetch keys for BYOK support
  const keys = await getUserAPIKeys().catch(() => ({} as any));

  // Try OpenRouter (Gemini) for editing first as it's "Context Aware"
  try {
    const response = await api.post<{ url: string }>('/api/ai/image/edit', {
      image: base64Image,
      mask,
      prompt: prompt,
      provider: modelOverride ? 'replicate' : 'openrouter', // Force replicate if modelOverride is set (Flux)
      model: modelOverride || MODELS.imageEdit,
      openRouterKey: keys.openrouter_api_key,
      replicateKey: keys.replicate_api_key
    });
    return response.url;
  } catch (err) {
    console.warn('[Edit] OpenRouter edit failed, falling back to Replicate', err);
    // Fallback handled by backend defaulting to Replicate/InstructPix2Pix
    const response = await api.post<{ url: string }>('/api/ai/image/edit', {
      image: base64Image,
      prompt: prompt,
      provider: 'replicate',
      replicateKey: keys.replicate_api_key
    });
    return response.url;
  }
};

export const analyzeImageForPrompts = async (base64Image: string) => {
  const content: OpenRouterContentItem[] = [
    { type: 'image_url', image_url: { url: base64Image.startsWith('data:') ? base64Image : `data:image/png;base64,${base64Image}` } },
    { type: 'text', text: 'Suggest 3 magic edit prompts and 3 generation prompts. Return JSON: { "magicEdit": [], "generation": [] }' }
  ];

  const response = await api.post<{ text: string }>('/api/ai/chat', {
    messages: [{ role: 'user', content: content }],
    model: MODELS.openrouter.glm47,
    provider: 'openrouter'
  });

  const text = response.text;
  try {
    const json = JSON.parse(text.replace(/```json|```/g, ''));
    return { magicEdit: json.magicEdit || [], generation: json.generation || [] };
  } catch {
    return { magicEdit: [], generation: [] };
  }
};

export const removeBackground = async (imageBase64: string, model?: string) => {
  const response = await api.post<{ url: string }>('/api/ai/image/remove-bg', {
    image: imageBase64,
    model // Optional model override
  });
  return response.url;
};

export const upscaleImage = async (imageBase64: string, scale: number = 2, model?: string) => {
  const response = await api.post<{ url: string }>('/api/ai/image/upscale', {
    image: imageBase64,
    scale,
    model // Optional model override
  });
  return response.url;
};

export const outpaintImage = async (imageBase64: string, prompt: string, direction: 'left' | 'right' | 'up' | 'down', model?: string) => {
  const response = await api.post<{ url: string }>('/api/ai/image/outpaint', {
    image: imageBase64,
    prompt,
    direction,
    model
  });
  return response.url;
};

export const restoreImage = async (imageBase64: string, codeformer_fidelity: number = 0.7) => {
  const response = await api.post<{ url: string }>('/api/ai/image/restore', {
    image: imageBase64,
    fidelity: codeformer_fidelity
  });
  return response.url;
};

export const analyzeCanvasAndSuggest = async (canvasScreenshot: string, _brandProfile: unknown = null) => {
  const content: OpenRouterContentItem[] = [
    { type: 'image_url', image_url: { url: canvasScreenshot.startsWith('data:') ? canvasScreenshot : `data:image/png;base64,${canvasScreenshot}` } },
    { type: 'text', text: 'Analyze this LinkedIn banner. Suggest 3 improvements. Return JSON: { "suggestions": [], "reasoning": "" }' }
  ];

  const messages: ChatMessage[] = [
    { role: 'system', content: "You are Nano Banna Pro, an expert design AI." },
    { role: 'user', content: content }
  ];

  const response = await api.post<{ text: string }>('/api/ai/chat', {
    messages,
    model: MODELS.openrouter.glm47,
    provider: 'openrouter'
  });

  const text = response.text;
  try {
    const json = JSON.parse(text.replace(/```json|```/g, ''));
    return { suggestions: json.suggestions || [], reasoning: json.reasoning || '' };
  } catch {
    return { suggestions: [], reasoning: 'Analysis failed' };
  }
};



