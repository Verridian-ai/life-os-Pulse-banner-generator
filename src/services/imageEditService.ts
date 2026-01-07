import { MODELS } from '../constants';
import { api } from './api';
import { getUserAPIKeys } from './apiKeyStorage';

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
