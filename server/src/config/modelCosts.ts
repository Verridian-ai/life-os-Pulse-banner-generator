/**
 * Model Cost Registry
 *
 * Pricing data for all AI models used in the application.
 * Used for accurate cost attribution in Langfuse observability.
 *
 * Prices are in USD per 1M tokens (for LLMs) or per image (for image models).
 * Updated: 2025-01
 */

// Token-based model pricing (per 1M tokens)
export interface TokenModelPricing {
    type: 'token';
    inputCostPer1M: number;
    outputCostPer1M: number;
    provider: string;
}

// Image-based model pricing (per image)
export interface ImageModelPricing {
    type: 'image';
    costPerImage: number;
    provider: string;
}

// Audio-based model pricing (per minute or per request)
export interface AudioModelPricing {
    type: 'audio';
    costPerMinute?: number;
    costPerRequest?: number;
    provider: string;
}

export type ModelPricing = TokenModelPricing | ImageModelPricing | AudioModelPricing;

/**
 * Registry of all model costs
 * Keys should match the model identifiers used in API calls
 */
export const MODEL_COSTS: Record<string, ModelPricing> = {
    // =========================================================================
    // OpenRouter Chat Models (via OpenRouter)
    // =========================================================================

    // Google Gemini
    'google/gemini-2.0-flash-exp:free': {
        type: 'token',
        inputCostPer1M: 0,
        outputCostPer1M: 0,
        provider: 'openrouter'
    },
    'google/gemini-2.0-flash-thinking-exp:free': {
        type: 'token',
        inputCostPer1M: 0,
        outputCostPer1M: 0,
        provider: 'openrouter'
    },
    'google/gemini-flash-1.5': {
        type: 'token',
        inputCostPer1M: 0.075,
        outputCostPer1M: 0.3,
        provider: 'openrouter'
    },
    'google/gemini-pro-1.5': {
        type: 'token',
        inputCostPer1M: 1.25,
        outputCostPer1M: 5.0,
        provider: 'openrouter'
    },

    // Anthropic Claude
    'anthropic/claude-3.5-sonnet': {
        type: 'token',
        inputCostPer1M: 3.0,
        outputCostPer1M: 15.0,
        provider: 'openrouter'
    },
    'anthropic/claude-3-opus': {
        type: 'token',
        inputCostPer1M: 15.0,
        outputCostPer1M: 75.0,
        provider: 'openrouter'
    },
    'anthropic/claude-3-haiku': {
        type: 'token',
        inputCostPer1M: 0.25,
        outputCostPer1M: 1.25,
        provider: 'openrouter'
    },

    // OpenAI GPT
    'openai/gpt-4o': {
        type: 'token',
        inputCostPer1M: 2.5,
        outputCostPer1M: 10.0,
        provider: 'openrouter'
    },
    'openai/gpt-4o-mini': {
        type: 'token',
        inputCostPer1M: 0.15,
        outputCostPer1M: 0.6,
        provider: 'openrouter'
    },
    'openai/gpt-4-turbo': {
        type: 'token',
        inputCostPer1M: 10.0,
        outputCostPer1M: 30.0,
        provider: 'openrouter'
    },

    // DeepSeek
    'deepseek/deepseek-chat': {
        type: 'token',
        inputCostPer1M: 0.14,
        outputCostPer1M: 0.28,
        provider: 'openrouter'
    },
    'deepseek/deepseek-r1': {
        type: 'token',
        inputCostPer1M: 0.55,
        outputCostPer1M: 2.19,
        provider: 'openrouter'
    },

    // Meta Llama
    'meta-llama/llama-3.3-70b-instruct': {
        type: 'token',
        inputCostPer1M: 0.4,
        outputCostPer1M: 0.4,
        provider: 'openrouter'
    },
    'meta-llama/llama-3.1-405b-instruct': {
        type: 'token',
        inputCostPer1M: 2.7,
        outputCostPer1M: 2.7,
        provider: 'openrouter'
    },

    // Mistral
    'mistralai/mistral-large': {
        type: 'token',
        inputCostPer1M: 2.0,
        outputCostPer1M: 6.0,
        provider: 'openrouter'
    },
    'mistralai/codestral-mamba': {
        type: 'token',
        inputCostPer1M: 0.25,
        outputCostPer1M: 0.25,
        provider: 'openrouter'
    },

    // =========================================================================
    // Replicate Image Models
    // =========================================================================

    // Black Forest Labs Flux
    'black-forest-labs/flux-schnell': {
        type: 'image',
        costPerImage: 0.003,
        provider: 'replicate'
    },
    'black-forest-labs/flux-dev': {
        type: 'image',
        costPerImage: 0.025,
        provider: 'replicate'
    },
    'black-forest-labs/flux-pro': {
        type: 'image',
        costPerImage: 0.055,
        provider: 'replicate'
    },
    'black-forest-labs/flux-fill-pro': {
        type: 'image',
        costPerImage: 0.05,
        provider: 'replicate'
    },

    // Google Imagen
    'google/imagen-3': {
        type: 'image',
        costPerImage: 0.04,
        provider: 'replicate'
    },

    // Stability AI
    'stability-ai/stable-diffusion-3.5-large': {
        type: 'image',
        costPerImage: 0.035,
        provider: 'replicate'
    },
    'stability-ai/sdxl': {
        type: 'image',
        costPerImage: 0.002,
        provider: 'replicate'
    },

    // Image Processing Models
    'cjwbw/rembg': {
        type: 'image',
        costPerImage: 0.0015,
        provider: 'replicate'
    },
    'nightmareai/real-esrgan': {
        type: 'image',
        costPerImage: 0.002,
        provider: 'replicate'
    },
    'sczhou/codeformer': {
        type: 'image',
        costPerImage: 0.005,
        provider: 'replicate'
    },
    'timbrooks/instruct-pix2pix': {
        type: 'image',
        costPerImage: 0.01,
        provider: 'replicate'
    },

    // =========================================================================
    // OpenAI Direct
    // =========================================================================

    'gpt-4o-realtime-preview': {
        type: 'audio',
        costPerMinute: 0.06, // Audio input
        provider: 'openai'
    },

    // =========================================================================
    // Default/Fallback
    // =========================================================================

    '_default_token': {
        type: 'token',
        inputCostPer1M: 1.0,
        outputCostPer1M: 3.0,
        provider: 'unknown'
    },
    '_default_image': {
        type: 'image',
        costPerImage: 0.02,
        provider: 'unknown'
    }
};

/**
 * Get model pricing information
 */
export function getModelPricing(modelId: string): ModelPricing {
    // Direct match
    if (MODEL_COSTS[modelId]) {
        return MODEL_COSTS[modelId];
    }

    // Try partial match (for version hashes)
    const normalized = modelId.toLowerCase();
    for (const [key, pricing] of Object.entries(MODEL_COSTS)) {
        if (normalized.includes(key.toLowerCase()) || key.toLowerCase().includes(normalized)) {
            return pricing;
        }
    }

    // Default based on model type inference
    if (
        normalized.includes('flux') ||
        normalized.includes('imagen') ||
        normalized.includes('stable') ||
        normalized.includes('sdxl') ||
        normalized.includes('rembg') ||
        normalized.includes('esrgan') ||
        normalized.includes('codeformer')
    ) {
        return MODEL_COSTS._default_image;
    }

    return MODEL_COSTS._default_token;
}

/**
 * Calculate cost for a token-based model call
 */
export function calculateTokenCost(
    modelId: string,
    inputTokens: number,
    outputTokens: number
): number {
    const pricing = getModelPricing(modelId);
    if (pricing.type !== 'token') {
        console.warn(`[ModelCosts] Expected token pricing for ${modelId}, got ${pricing.type}`);
        return 0;
    }

    const inputCost = (inputTokens / 1_000_000) * pricing.inputCostPer1M;
    const outputCost = (outputTokens / 1_000_000) * pricing.outputCostPer1M;

    return inputCost + outputCost;
}

/**
 * Calculate cost for an image-based model call
 */
export function calculateImageCost(modelId: string, imageCount: number = 1): number {
    const pricing = getModelPricing(modelId);
    if (pricing.type !== 'image') {
        console.warn(`[ModelCosts] Expected image pricing for ${modelId}, got ${pricing.type}`);
        return 0;
    }

    return pricing.costPerImage * imageCount;
}

/**
 * Calculate cost for an audio-based model call
 */
export function calculateAudioCost(modelId: string, durationMinutes: number): number {
    const pricing = getModelPricing(modelId);
    if (pricing.type !== 'audio') {
        console.warn(`[ModelCosts] Expected audio pricing for ${modelId}, got ${pricing.type}`);
        return 0;
    }

    if (pricing.costPerMinute) {
        return pricing.costPerMinute * durationMinutes;
    }

    return pricing.costPerRequest || 0;
}

/**
 * Get all models for a specific provider
 */
export function getModelsByProvider(provider: string): Record<string, ModelPricing> {
    const result: Record<string, ModelPricing> = {};
    for (const [key, pricing] of Object.entries(MODEL_COSTS)) {
        if (pricing.provider === provider && !key.startsWith('_')) {
            result[key] = pricing;
        }
    }
    return result;
}

/**
 * Export all model IDs
 */
export function getAllModelIds(): string[] {
    return Object.keys(MODEL_COSTS).filter(key => !key.startsWith('_'));
}
