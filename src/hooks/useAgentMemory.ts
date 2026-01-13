/**
 * useAgentMemory Hook
 *
 * React hook for interacting with Cognee-powered agent memory.
 * Enables searching past designs, storing preferences, and learning from interactions.
 */

import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { agentApi, MemorySearchResult } from '@/services/agentApi';

export interface UseAgentMemoryState {
  isSearching: boolean;
  isStoring: boolean;
  searchResults: MemorySearchResult[];
  error: string | null;
  lastStoredId: string | null;
}

export interface UseAgentMemoryActions {
  search: (
    query: string,
    options?: { agentId?: string; limit?: number }
  ) => Promise<MemorySearchResult[]>;
  storePreference: (
    content: string,
    agentId?: string
  ) => Promise<string | null>;
  storeInsight: (
    content: string,
    agentId?: string
  ) => Promise<string | null>;
  storeFeedback: (
    content: string,
    success: boolean,
    agentId?: string
  ) => Promise<string | null>;
  cognify: (agentId: string) => Promise<boolean>;
  clearError: () => void;
  clearResults: () => void;
}

export type UseAgentMemoryReturn = UseAgentMemoryState & UseAgentMemoryActions;

/**
 * Hook for interacting with Cognee agent memory
 *
 * Usage:
 * ```tsx
 * const { search, storePreference, searchResults } = useAgentMemory();
 *
 * // Search for past designs
 * const results = await search("modern tech banner");
 *
 * // Store user preference
 * await storePreference("User prefers minimal designs with blue color scheme");
 *
 * // Store learning from successful interaction
 * await storeFeedback("Generated banner with high engagement", true);
 * ```
 */
export function useAgentMemory(): UseAgentMemoryReturn {
  const { user } = useAuth();

  const [state, setState] = useState<UseAgentMemoryState>({
    isSearching: false,
    isStoring: false,
    searchResults: [],
    error: null,
    lastStoredId: null,
  });

  const search = useCallback(
    async (
      query: string,
      options: { agentId?: string; limit?: number } = {}
    ): Promise<MemorySearchResult[]> => {
      setState((s) => ({ ...s, isSearching: true, error: null }));

      try {
        const response = await agentApi.searchMemory(query, {
          agent_id: options.agentId,
          user_id: user?.id,
          limit: options.limit || 10,
        });

        if (response.success) {
          setState((s) => ({
            ...s,
            isSearching: false,
            searchResults: response.results,
          }));
          return response.results;
        } else {
          setState((s) => ({
            ...s,
            isSearching: false,
            error: 'Search failed',
            searchResults: [],
          }));
          return [];
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setState((s) => ({
          ...s,
          isSearching: false,
          error: errorMessage,
          searchResults: [],
        }));
        return [];
      }
    },
    [user]
  );

  const storeLearning = useCallback(
    async (
      content: string,
      category: 'preference' | 'insight' | 'success' | 'failure',
      agentId: string = 'banner_design'
    ): Promise<string | null> => {
      if (!user?.id) {
        setState((s) => ({ ...s, error: 'User not authenticated' }));
        return null;
      }

      setState((s) => ({ ...s, isStoring: true, error: null }));

      try {
        const response = await agentApi.storeLearning(content, agentId, {
          category,
          user_id: user.id,
        });

        if (response.success) {
          setState((s) => ({
            ...s,
            isStoring: false,
            lastStoredId: response.document_id,
          }));
          return response.document_id;
        } else {
          setState((s) => ({
            ...s,
            isStoring: false,
            error: 'Failed to store learning',
          }));
          return null;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setState((s) => ({
          ...s,
          isStoring: false,
          error: errorMessage,
        }));
        return null;
      }
    },
    [user]
  );

  const storePreference = useCallback(
    async (content: string, agentId?: string): Promise<string | null> => {
      return storeLearning(content, 'preference', agentId);
    },
    [storeLearning]
  );

  const storeInsight = useCallback(
    async (content: string, agentId?: string): Promise<string | null> => {
      return storeLearning(content, 'insight', agentId);
    },
    [storeLearning]
  );

  const storeFeedback = useCallback(
    async (
      content: string,
      success: boolean,
      agentId?: string
    ): Promise<string | null> => {
      return storeLearning(content, success ? 'success' : 'failure', agentId);
    },
    [storeLearning]
  );

  const cognify = useCallback(async (agentId: string): Promise<boolean> => {
    try {
      const response = await agentApi.cognifyAgent(agentId);
      return response.success;
    } catch {
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  const clearResults = useCallback(() => {
    setState((s) => ({ ...s, searchResults: [] }));
  }, []);

  return {
    ...state,
    search,
    storePreference,
    storeInsight,
    storeFeedback,
    cognify,
    clearError,
    clearResults,
  };
}
