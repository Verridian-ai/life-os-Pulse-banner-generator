/**
 * useAgentStatus Hook
 *
 * React hook for monitoring agent service health and capabilities.
 */

import { useState, useEffect, useCallback } from 'react';
import { agentApi, AgentHealthStatus, isAgentServiceAvailable } from '@/services/agentApi';

export interface UseAgentStatusState {
  isAvailable: boolean;
  isChecking: boolean;
  lastCheck: Date | null;
  health: AgentHealthStatus | null;
  error: string | null;
}

export interface UseAgentStatusActions {
  checkStatus: () => Promise<void>;
  refresh: () => void;
}

export type UseAgentStatusReturn = UseAgentStatusState & UseAgentStatusActions;

/**
 * Hook for monitoring agent service status
 *
 * Usage:
 * ```tsx
 * const { isAvailable, health, checkStatus } = useAgentStatus();
 *
 * // Check if agent features are available
 * if (isAvailable) {
 *   // Show AI design features
 * }
 *
 * // Manual status refresh
 * await checkStatus();
 * ```
 */
export function useAgentStatus(
  options: { autoCheck?: boolean; interval?: number } = {}
): UseAgentStatusReturn {
  const { autoCheck = true, interval = 60000 } = options;

  const [state, setState] = useState<UseAgentStatusState>({
    isAvailable: false,
    isChecking: false,
    lastCheck: null,
    health: null,
    error: null,
  });

  const checkStatus = useCallback(async () => {
    setState((s) => ({ ...s, isChecking: true, error: null }));

    try {
      const available = await isAgentServiceAvailable();

      if (available) {
        const health = await agentApi.healthCheck();
        setState((s) => ({
          ...s,
          isChecking: false,
          isAvailable: true,
          health,
          lastCheck: new Date(),
        }));
      } else {
        setState((s) => ({
          ...s,
          isChecking: false,
          isAvailable: false,
          health: null,
          lastCheck: new Date(),
        }));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setState((s) => ({
        ...s,
        isChecking: false,
        isAvailable: false,
        health: null,
        error: errorMessage,
        lastCheck: new Date(),
      }));
    }
  }, []);

  const refresh = useCallback(() => {
    checkStatus();
  }, [checkStatus]);

  // Auto-check on mount and interval
  useEffect(() => {
    if (!autoCheck) return;

    // Schedule for next tick to avoid synchronous setState in effect
    const timeoutId = setTimeout(() => {
      void checkStatus();
    }, 0);

    let intervalId: ReturnType<typeof setInterval> | undefined;
    if (interval > 0) {
      intervalId = setInterval(() => void checkStatus(), interval);
    }

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoCheck, interval, checkStatus]);

  return {
    ...state,
    checkStatus,
    refresh,
  };
}
