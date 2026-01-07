import { api } from './api';
import { PromptEnhanceContext } from './llm-types';
import { aiCache } from './aiCache';

import { validatePrompt } from '../utils/inputValidation';

/**
 * Enhance a user prompt using Gemini 3 Pro
 * Transforms basic prompts into detailed, optimized image generation prompts
 *
 * @param rawPrompt - The user's original prompt to enhance
 * @param context - Optional context for industry, style, or brand colors
 * @returns Enhanced prompt optimized for LinkedIn banner generation
 */
export const enhancePrompt = async (
    rawPrompt: string,
    context?: PromptEnhanceContext
): Promise<{ enhancedPrompt: string; originalPrompt: string }> => {
    const prompt = validatePrompt(rawPrompt);
    // Generate cache key combining prompt and context
    const cacheKey = `enhance_${prompt}_${JSON.stringify(context || {})}`;

    // Check cache (with fuzzy matching)
    const cached = aiCache.getSimilar(cacheKey);
    if (cached) {
        console.log('[Prompt Enhance] Using cached response');
        return JSON.parse(cached);
    }

    console.log('[Prompt Enhance] Enhancing prompt:', prompt.substring(0, 50) + '...');

    const response = await api.post<{ enhancedPrompt: string; originalPrompt: string }>('/api/ai/prompt/enhance', {
        prompt,
        context
    });

    // Cache the result
    aiCache.set(cacheKey, JSON.stringify(response));

    console.log('[Prompt Enhance] ✅ Enhancement complete');
    return response;
};
