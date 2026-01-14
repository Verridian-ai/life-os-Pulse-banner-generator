/**
 * useAgentDesign Hook
 *
 * React hook for AI-powered banner design generation using Pydantic AI agents.
 * Includes memory integration for personalized suggestions.
 */

import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  agentApi,
  BannerDesignOutput,
  BannerFeedback,
  AgentResponse,
  BannerDesignRequest,
  BannerFeedbackRequest,
} from '@/services/agentApi';

export interface UseAgentDesignState {
  isLoading: boolean;
  error: string | null;
  lastDesign: BannerDesignOutput | null;
  lastFeedback: BannerFeedback | null;
  traceId: string | null;
  tokensUsed: number;
  latencyMs: number;
  memoryUsed: boolean;
}

export interface UseAgentDesignActions {
  generateDesign: (
    prompt: string,
    options?: Partial<Omit<BannerDesignRequest, 'prompt' | 'user_id'>>,
  ) => Promise<BannerDesignOutput | null>;
  getFeedback: (
    prompt: string,
    existingDesign: Record<string, unknown>,
  ) => Promise<BannerFeedback | null>;
  clearError: () => void;
  reset: () => void;
}

export type UseAgentDesignReturn = UseAgentDesignState & UseAgentDesignActions;

/**
 * Hook for AI-powered banner design generation
 *
 * Usage:
 * ```tsx
 * const { generateDesign, isLoading, lastDesign, error } = useAgentDesign();
 *
 * const handleGenerate = async () => {
 *   const design = await generateDesign("Create a modern tech banner", {
 *     industry: "technology",
 *     brand_colors: ["#D4AF37", "#1a1a2e"]
 *   });
 *   if (design) {
 *     applyDesign(design);
 *   }
 * };
 * ```
 */
export function useAgentDesign(): UseAgentDesignReturn {
  const { user, session } = useAuth();

  const [state, setState] = useState<UseAgentDesignState>({
    isLoading: false,
    error: null,
    lastDesign: null,
    lastFeedback: null,
    traceId: null,
    tokensUsed: 0,
    latencyMs: 0,
    memoryUsed: false,
  });

  const generateDesign = useCallback(
    async (
      prompt: string,
      options: Partial<Omit<BannerDesignRequest, 'prompt' | 'user_id'>> = {},
    ): Promise<BannerDesignOutput | null> => {
      if (!user?.id) {
        setState((s) => ({ ...s, error: 'User not authenticated' }));
        return null;
      }

      setState((s) => ({ ...s, isLoading: true, error: null }));

      try {
        const request: BannerDesignRequest = {
          prompt,
          user_id: user.id,
          session_id: session?.id,
          ...options,
        };

        const response: AgentResponse<BannerDesignOutput> =
          await agentApi.generateBannerDesign(request);

        if (response.success && response.output) {
          setState((s) => ({
            ...s,
            isLoading: false,
            lastDesign: response.output!,
            traceId: response.trace_id || null,
            tokensUsed: response.tokens_used,
            latencyMs: response.latency_ms,
            memoryUsed: response.memory_used,
          }));
          return response.output;
        } else {
          setState((s) => ({
            ...s,
            isLoading: false,
            error: response.error || 'Design generation failed',
          }));
          return null;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setState((s) => ({
          ...s,
          isLoading: false,
          error: errorMessage,
        }));
        return null;
      }
    },
    [user, session],
  );

  const getFeedback = useCallback(
    async (
      prompt: string,
      existingDesign: Record<string, unknown>,
    ): Promise<BannerFeedback | null> => {
      if (!user?.id) {
        setState((s) => ({ ...s, error: 'User not authenticated' }));
        return null;
      }

      setState((s) => ({ ...s, isLoading: true, error: null }));

      try {
        const request: BannerFeedbackRequest = {
          prompt,
          user_id: user.id,
          session_id: session?.id,
          existing_design: existingDesign,
        };

        const response: AgentResponse<BannerFeedback> = await agentApi.getBannerFeedback(request);

        if (response.success && response.output) {
          setState((s) => ({
            ...s,
            isLoading: false,
            lastFeedback: response.output!,
            traceId: response.trace_id || null,
            tokensUsed: response.tokens_used,
            latencyMs: response.latency_ms,
            memoryUsed: response.memory_used,
          }));
          return response.output;
        } else {
          setState((s) => ({
            ...s,
            isLoading: false,
            error: response.error || 'Feedback generation failed',
          }));
          return null;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setState((s) => ({
          ...s,
          isLoading: false,
          error: errorMessage,
        }));
        return null;
      }
    },
    [user, session],
  );

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      lastDesign: null,
      lastFeedback: null,
      traceId: null,
      tokensUsed: 0,
      latencyMs: 0,
      memoryUsed: false,
    });
  }, []);

  return {
    ...state,
    generateDesign,
    getFeedback,
    clearError,
    reset,
  };
}
