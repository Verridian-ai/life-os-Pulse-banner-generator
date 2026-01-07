import { api } from './api';
import { PromptEnhanceContext } from './llm-types';

/**
 * Enhance a user prompt using Gemini 3 Pro
 * Transforms basic prompts into detailed, optimized image generation prompts
 *
 * @param prompt - The user's original prompt to enhance
 * @param context - Optional context for industry, style, or brand colors
 * @returns Enhanced prompt optimized for LinkedIn banner generation
 */
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
