// usePromptEnhance - Reusable hook for AI prompt enhancement
import { useState, useCallback } from 'react';
import { enhancePrompt, PromptEnhanceContext } from '@/services/llm';

interface UsePromptEnhanceReturn {
  enhance: (prompt: string, context?: PromptEnhanceContext) => Promise<string | null>;
  isEnhancing: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Custom hook for enhancing prompts using AI
 * Can be used across any prompt input in the application
 */
export function usePromptEnhance(): UsePromptEnhanceReturn {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enhance = useCallback(async (prompt: string, context?: PromptEnhanceContext): Promise<string | null> => {
    if (!prompt.trim()) {
      setError('Please enter a prompt to enhance');
      return null;
    }

    setIsEnhancing(true);
    setError(null);

    try {
      console.log('[usePromptEnhance] Enhancing prompt:', prompt.substring(0, 50) + '...');
      const result = await enhancePrompt(prompt, context);

      if (result.enhancedPrompt) {
        console.log('[usePromptEnhance] Enhancement successful');
        return result.enhancedPrompt;
      }

      setError('Enhancement returned empty result');
      return null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Enhancement failed';
      console.error('[usePromptEnhance] Error:', message);
      setError(message);
      return null;
    } finally {
      setIsEnhancing(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    enhance,
    isEnhancing,
    error,
    clearError,
  };
}
