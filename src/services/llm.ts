// LLM Service - Refactored to use Backend Proxy for Security & Observability
import { MODELS, DESIGN_SYSTEM_INSTRUCTION } from '../constants';
import { Part } from '../types';
import type { ImageEditTurn } from '../types/ai';

import { resizeToLinkedInBanner, resizeToCanvasDimensions, prepareForOutpainting } from '../utils/imageUtils';
import { getUserAPIKeys } from './apiKeyStorage';
import { api } from './api';

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

/**
 * Enhance a user prompt using Gemini 3 Pro
 * Transforms basic prompts into detailed, optimized image generation prompts
 *
 * @param prompt - The user's original prompt to enhance
 * @param context - Optional context for industry, style, or brand colors
 * @returns Enhanced prompt optimized for LinkedIn banner generation
 */
export interface PromptEnhanceContext {
  industry?: string;      // e.g., "tech", "finance", "healthcare"
  style?: string;         // e.g., "professional", "creative", "minimal"
  brandColors?: string[]; // e.g., ["#1a73e8", "#34a853"]
}

export const enhancePrompt = async (
  prompt: string,
  context?: PromptEnhanceContext
): Promise<{ enhancedPrompt: string; originalPrompt: string }> => {
  console.log('[Prompt Enhance] Enhancing prompt:', prompt.substring(0, 50) + '...');

  const response = await api.post<{ enhancedPrompt: string; originalPrompt: string }>('/api/ai/prompt/enhance', {
    prompt,
    context
  });

  console.log('[Prompt Enhance] ✅ Enhancement complete');
  return response;
};

// --- Image Gen (Refactored) ---
// NOTE: OpenRouter does NOT support image generation - it's a chat completions proxy only.
// All image generation goes through Replicate (Imagen-3, Flux, etc.)

// Canvas dimensions type for multi-format support
export type CanvasDimensions = {
  width: number;
  height: number;
} | null;

export const generateImage = async (
  prompt: string,
  _referenceImages: string[] = [],
  _size: '1K' | '2K' | '4K' = '4K',
  canvasDimensions: CanvasDimensions = null, // Updated: accepts dimensions object or null
  _editHistory: ImageEditTurn[] = [],
  _isRetry: boolean = false
): Promise<string> => {
  let imageUrl = '';
  // Use provided canvas dimensions or fall back to 16:9 for generic images
  const dimensions = canvasDimensions
    ? { width: canvasDimensions.width, height: canvasDimensions.height }
    : { aspect_ratio: '16:9' };
  const shouldResize = canvasDimensions !== null;

  console.log('[Image Gen] Starting generation pipeline for:', prompt);
  console.log('[Image Gen] Dimensions:', dimensions, 'shouldResize:', shouldResize);

  // Try to fetch keys - if auth fails, we'll still try with server-side keys
  let keys: Partial<Awaited<ReturnType<typeof getUserAPIKeys>>> = {};
  try {
    keys = await getUserAPIKeys();
  } catch (authError) {
    console.log('[Image Gen] Auth check skipped - will use server product keys if available');
  }

  // Note: We don't block here - server will use its own env keys if user has none
  console.log('[Image Gen] User API Keys available:', {
    hasReplicate: !!keys.hasReplicateKey || !!keys.replicate_api_key,
    canGenerateImages: !!keys.canGenerateImages,
    hasProductKeys: !!keys.hasProductKeys
  });

  // 1. Primary: Try Nano Banana Pro (Gemini 3 Pro Image via OpenRouter)
  // This is the highest quality option with text-in-image support
  try {
    console.log('[Image Gen] Attempting Nano Banana Pro (OpenRouter)...');
    const response = await api.post<{ url: string; error?: string }>('/api/ai/image/generate', {
      prompt,
      model: MODELS.imageGen, // google/gemini-3-pro-image-preview
      provider: 'openrouter',
      ...dimensions
    });

    if (response.error) {
      throw new Error(response.error);
    }

    imageUrl = response.url;
    console.log('[Image Gen] ✅ Nano Banana Pro success');
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.warn('[Image Gen] ⚠️ Nano Banana Pro failed:', errMsg);

    // 2. Fallback to Flux Schnell (fast, reliable via Replicate)
    try {
      console.log('[Image Gen] Attempting Flux Schnell fallback (Replicate)...');
      const response = await api.post<{ url: string; error?: string }>('/api/ai/image/generate', {
        prompt,
        model: 'black-forest-labs/flux-schnell',
        provider: 'replicate',
        ...dimensions
      });

      if (response.error) {
        throw new Error(response.error);
      }

      imageUrl = response.url;
      console.log('[Image Gen] ✅ Flux Schnell fallback success');
    } catch (err2) {
      const errMsg2 = err2 instanceof Error ? err2.message : String(err2);
      console.warn('[Image Gen] ⚠️ Flux Schnell failed:', errMsg2);

      // 3. Last resort: Flux Dev (higher quality but slower)
      try {
        console.log('[Image Gen] Attempting Flux Dev fallback...');
        const response = await api.post<{ url: string; error?: string }>('/api/ai/image/generate', {
          prompt,
          model: 'black-forest-labs/flux-dev',
          provider: 'replicate',
          ...dimensions
        });

        if (response.error) {
          throw new Error(response.error);
        }

        imageUrl = response.url;
        console.log('[Image Gen] ✅ Flux Dev fallback success');
      } catch (err3) {
        const errMsg3 = err3 instanceof Error ? err3.message : String(err3);
        console.error('[Image Gen] ❌ All providers failed. Last error:', errMsg3);

        // Provide helpful error message based on error type
        const isKeyError = errMsg3.includes('KEY_MISSING') || errMsg3.includes('Unauthorized') || errMsg3.includes('not configured');
        const helpText = isKeyError
          ? 'Please add API keys in Settings to enable image generation.'
          : 'Please try again or check your internet connection.';
        throw new Error(`Image generation failed: ${errMsg3}. ${helpText}`);
      }
    }
  }

  // 4. Mandatory Resizing Pipeline for all canvas formats
  // Resize generated images to match exact canvas dimensions
  if (shouldResize && canvasDimensions && imageUrl) {
    const { width: targetWidth, height: targetHeight } = canvasDimensions;
    const aspectRatio = targetWidth / targetHeight;

    // Use Smart Expand (Flux Fill) for banner-like formats (wide aspect ratios 2:1 or wider)
    const useSmartExpand = aspectRatio >= 2.0;

    if (useSmartExpand) {
      try {
        console.log(`[Image Gen] 📏 Smart Expand to ${targetWidth}x${targetHeight}...`);

        // 1. Prepare Composite & Mask (Image centered, white bars, mask preserves image)
        const { image: composite, mask } = await prepareForOutpainting(imageUrl, targetWidth, targetHeight);

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
        imageUrl = await resizeToCanvasDimensions(imageUrl, targetWidth, targetHeight, { quality: 0.95, fit: 'cover' });
        console.log('[Image Gen] ✅ Fallback Resize complete');
      }
    } else {
      // For square or portrait formats, just resize with cover crop
      try {
        console.log(`[Image Gen] 📏 Resizing to ${targetWidth}x${targetHeight}...`);
        imageUrl = await resizeToCanvasDimensions(imageUrl, targetWidth, targetHeight, { quality: 0.95, fit: 'cover' });
        console.log('[Image Gen] ✅ Resize complete');
      } catch (error) {
        console.error('[Image Gen] ⚠️ Resize failed:', error);
        // Return original if resize fails
      }
    }
  }

  return imageUrl;
};

// --- Image Edit & Analysis Tools (Implemented) ---

export const editImage = async (base64Image: string, prompt: string, mask?: string, modelOverride?: string) => {
  // Fetch keys for BYOK support
  const keys = await getUserAPIKeys().catch(() => ({} as Record<string, never>));

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



