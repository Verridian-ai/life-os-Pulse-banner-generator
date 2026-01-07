import { MODELS } from '../constants';
import type { ImageEditTurn, BrandProfile } from '../types/ai';
import { prepareForOutpainting, resizeToCanvasDimensions } from '../utils/imageUtils';
import { api } from './api';
import { getUserAPIKeys } from './apiKeyStorage';
import { editImage } from './imageEditService';
import { CanvasDimensions } from './llm-types';
import { aiCache } from './aiCache';

import { validatePrompt } from '../utils/inputValidation';

export const generateImage = async (
    rawPrompt: string,
    _referenceImages: string[] = [],
    _size: '1K' | '2K' | '4K' = '4K',
    canvasDimensions: CanvasDimensions = null, // Updated: accepts dimensions object or null
    _editHistory: ImageEditTurn[] = [],
    _isRetry: boolean = false,
    brandProfile: BrandProfile | null = null
): Promise<string> => {
    // Validate and sanitize prompt
    const prompt = validatePrompt(rawPrompt, 1000); // Stricter limit for image prompts

    // Enhance prompt with brand guidelines if available
    let enhancedPrompt = prompt;
    if (brandProfile) {
        const colors = brandProfile.colors.map(c => `${c.name} (${c.hex})`).join(', ');
        const styles = brandProfile.styleKeywords.join(', ');
        enhancedPrompt = `${prompt}. MANDATORY BRAND GUIDELINES: Colors: ${colors}. Style: ${styles}. Professional LinkedIn branding.`;
        console.log('[Image Gen] 🎨 Applying brand guidelines to prompt');
    }

    // Generate cache key based on enhanced prompt and dimensions
    const dimsKey = canvasDimensions ? `${canvasDimensions.width}x${canvasDimensions.height}` : 'default';
    // Use safe base64 encoding for unicode prompts
    const safePrompt = typeof window !== 'undefined'
        ? btoa(unescape(encodeURIComponent(enhancedPrompt))).substring(0, 32)
        : Buffer.from(enhancedPrompt).toString('base64').substring(0, 32);

    const cacheKey = `img_${safePrompt}_${dimsKey}`;

    // Check cache
    const cachedUrl = aiCache.get(cacheKey);
    if (cachedUrl) {
        console.log('[Image Gen] ⚡ Using cached result for:', enhancedPrompt);
        return cachedUrl;
    }

    let imageUrl = '';
    // Use provided canvas dimensions or fall back to 16:9 for generic images
    const dimensions = canvasDimensions
        ? { width: canvasDimensions.width, height: canvasDimensions.height }
        : { aspect_ratio: '16:9' };
    const shouldResize = canvasDimensions !== null;

    console.log('[Image Gen] Starting generation pipeline for:', enhancedPrompt);

    // Try to fetch keys - if auth fails, we'll still try with server-side keys
    try {
        await getUserAPIKeys();
    } catch {
        console.log('[Image Gen] Auth check skipped - will use server product keys if available');
    }

    // 1. Primary: Try Nano Banana Pro
    try {
        console.log('[Image Gen] Attempting Nano Banana Pro (OpenRouter)...');
        const response = await api.post<{ url: string; error?: string }>('/api/ai/image/generate', {
            prompt: enhancedPrompt,
            model: MODELS.imageGen,
            provider: 'openrouter',
            ...dimensions
        });

        if (response.error) throw new Error(response.error);
        imageUrl = response.url;
        console.log('[Image Gen] ✅ Nano Banana Pro success');
    } catch {
        console.warn('[Image Gen] ⚠️ Nano Banana Pro failed, falling back to Flux Schnell');

        // 2. Fallback to Flux Schnell
        try {
            const response = await api.post<{ url: string; error?: string }>('/api/ai/image/generate', {
                prompt: enhancedPrompt,
                model: 'black-forest-labs/flux-schnell',
                provider: 'replicate',
                ...dimensions
            });

            if (response.error) throw new Error(response.error);
            imageUrl = response.url;
            console.log('[Image Gen] ✅ Flux Schnell fallback success');
        } catch {
            // 3. Last resort: Flux Dev
            try {
                const response = await api.post<{ url: string; error?: string }>('/api/ai/image/generate', {
                    prompt: enhancedPrompt,
                    model: 'black-forest-labs/flux-dev',
                    provider: 'replicate',
                    ...dimensions
                });

                if (response.error) throw new Error(response.error);
                imageUrl = response.url;
                console.log('[Image Gen] ✅ Flux Dev fallback success');
            } catch {
                throw new Error(`Image generation failed across all providers.`);
            }
        }
    }

    // 4. Mandatory Resizing Pipeline
    if (shouldResize && canvasDimensions && imageUrl) {
        const { width: targetWidth, height: targetHeight } = canvasDimensions;
        const aspectRatio = targetWidth / targetHeight;
        const useSmartExpand = aspectRatio >= 2.0;

        if (useSmartExpand) {
            try {
                const { image: composite, mask } = await prepareForOutpainting(imageUrl, targetWidth, targetHeight);
                const expandPrompt = `${enhancedPrompt} . High quality, seamless background extension.`;
                const expandedUrl = await editImage(composite, expandPrompt, mask, 'black-forest-labs/flux-fill-pro');
                if (expandedUrl) imageUrl = expandedUrl;
            } catch {
                imageUrl = await resizeToCanvasDimensions(imageUrl, targetWidth, targetHeight, { quality: 0.95, fit: 'cover' });
            }
        } else {
            try {
                imageUrl = await resizeToCanvasDimensions(imageUrl, targetWidth, targetHeight, { quality: 0.95, fit: 'cover' });
            } catch (error) {
                console.error('[Image Gen] ⚠️ Resize failed:', error);
            }
        }
    }

    // Cache the successful result
    if (imageUrl) {
        aiCache.set(cacheKey, imageUrl);
    }

    return imageUrl;
};
