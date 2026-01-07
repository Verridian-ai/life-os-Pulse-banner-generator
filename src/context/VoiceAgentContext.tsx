/* eslint-disable react-refresh/only-export-components */
/**
 * Voice Agent Context - Centralized state management for voice agent interactions
 *
 * This module provides a React Context for managing voice agent connections,
 * including state tracking, error handling, retry logic, and connection quality monitoring.
 *
 * @module VoiceAgentContext
 * @see {@link ./docs/VOICE_AGENT_GUIDE.md} for comprehensive usage documentation
 *
 * @example Basic usage
 * ```tsx
 * import { useVoiceAgent } from '@/context/VoiceAgentContext';
 *
 * function MyComponent() {
 *   const { connectionState, connect, disconnect } = useVoiceAgent();
 *
 *   return (
 *     <button onClick={connectionState === 'connected' ? disconnect : connect}>
 *       {connectionState === 'connected' ? 'Disconnect' : 'Connect'}
 *     </button>
 *   );
 * }
 * ```
 */
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { OpenAIRealtimeClient, ToolCall, TranscriptEntry } from '@/services/openaiRealtimeClient';
import { ActionExecutor, ActionResult, OnUpdateCallback, CanvasCallbacks } from '@/services/actionExecutor';
import { getVoiceAPIKey } from '@/services/apiKeyStorage';

import { ConnectionState, ConnectionQuality } from '@/types';

/**
 * Voice Agent Context Type
 *
 * Interface for the voice agent context value provided to consumers.
 *
 * @interface VoiceAgentContextType
 */
interface VoiceAgentContextType {
  // Connection state
  /** Backward-compatible boolean connection flag (derived from connectionState) */
  isConnected: boolean;
  /** Current connection state (disconnected, connecting, connected, disconnecting, error) */
  connectionState: ConnectionState;
  /** Connection quality indicator (good, fair, poor) or null when not connected */
  connectionQuality: ConnectionQuality | null;
  /** Whether the voice agent is actively listening for user speech */
  isListening: boolean;
  /** Whether the AI is currently speaking (text-to-speech output) */
  isSpeaking: boolean;

  // Conversation data
  /** Transcript of conversation between user and AI */
  transcript: TranscriptEntry[];
  /** Pending voice command action awaiting user approval */
  pendingAction: {
    toolCall: ToolCall;
    result: ActionResult;
  } | null;
  /** Whether an action is currently being executed */
  executingAction: boolean;
  /** Legacy error field (use errorMessage instead) */
  error: string | null;
  /** User-friendly error message for display in UI */
  errorMessage: string | null;

  // Retry tracking
  /** Current retry attempt number (0-3) */
  retryCount: number;
  /** Maximum number of retry attempts before giving up (3) */
  maxRetries: number;

  // Connection timing
  /** Timestamp (Date.now()) when connection was established, null if not connected */
  connectionStartTime: number | null;
  /** Timestamp (Date.now()) of last user/AI activity, null if not connected */
  lastActivityTime: number | null;

  // Methods
  /** Connect to OpenAI Realtime voice service */
  connect: () => Promise<void>;
  /** Disconnect from voice service */
  disconnect: () => Promise<void>;
  /** Manually retry connection after error */
  retry: () => Promise<void>;
  /** Approve and execute pending voice command action */
  approveAction: () => Promise<void>;
  /** Reject pending voice command action */
  rejectAction: () => void;
  /** Clear conversation transcript */
  clearTranscript: () => void;
  /** Register a prompt setter callback from child components */
  registerPromptSetter: (setter: (prompt: string) => void) => void;
  /** Register tab and studio mode navigation callbacks */
  registerTabSetter: (setActiveTab: (tab: Tab) => void, setStudioMode?: (mode: StudioMode) => void) => void;
}
import { Tab, StudioMode } from '@/constants';

const VoiceAgentContext = createContext<VoiceAgentContextType | undefined>(undefined);

/**
 * Voice Agent Provider Props
 *
 * @interface VoiceAgentProviderProps
 */
interface VoiceAgentProviderProps {
  /** React children to wrap with voice agent context */
  children: React.ReactNode;
  /** Callback for AI model updates (tracks usage, costs, etc.) */
  onUpdate: OnUpdateCallback;
  /** Optional setter to inject AI prompts into generation input (for voice-to-prompt) */
  setGenPrompt?: (prompt: string) => void;
  /** Optional canvas manipulation callbacks for voice control (add text, upscale, etc.) */
  canvasCallbacks?: CanvasCallbacks;
}

export function VoiceAgentProvider({ children, onUpdate, setGenPrompt, canvasCallbacks }: VoiceAgentProviderProps) {
  // Configuration
  const MAX_RETRIES = 3;

  // State
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [pendingAction, setPendingAction] = useState<{
    toolCall: ToolCall;
    result: ActionResult;
  } | null>(null);
  const [executingAction, setExecutingAction] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [connectionStartTime, setConnectionStartTime] = useState<number | null>(null);
  const [lastActivityTime, setLastActivityTime] = useState<number | null>(null);

  // References
  const liveClientRef = useRef<OpenAIRealtimeClient | null>(null);
  const actionExecutorRef = useRef<ActionExecutor | null>(null);
  const promptSetterRef = useRef<((prompt: string) => void) | null>(setGenPrompt || null);
  const connectingRef = useRef(false); // Prevents double connection race condition
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Calculate exponential backoff delay for retry attempts
   * Returns delay in milliseconds: 1s, 2s, 4s for attempts 1, 2, 3
   */
  const getRetryDelay = useCallback((attemptNumber: number): number => {
    return Math.pow(2, attemptNumber - 1) * 1000; // 2^0 * 1000 = 1s, 2^1 * 1000 = 2s, 2^2 * 1000 = 4s
  }, []);

  /**
   * Register a prompt setter callback from child components
   * This allows AppContent to register its setGenPrompt function
   */
  const registerPromptSetter = useCallback((setter: (prompt: string) => void) => {
    console.log('[VoiceAgentContext] Prompt setter registered');
    promptSetterRef.current = setter;
    // Update the action executor if it exists
    if (actionExecutorRef.current) {
      actionExecutorRef.current.setPromptSetter(setter);
    }
  }, []);

  /**
   * Register tab navigation callbacks
   */
  const registerTabSetter = useCallback((setActiveTab: (tab: Tab) => void, setStudioMode?: (mode: StudioMode) => void) => {
    console.log('[VoiceAgentContext] Tab setter registered');
    if (actionExecutorRef.current) {
      actionExecutorRef.current.setCanvasCallbacks({
        setActiveTab,
        setStudioMode,
      });
    }
  }, []);

  /**
   * Connect to OpenAI Realtime voice session
   *
   * Initiates a WebSocket connection to OpenAI's Realtime API for voice interactions.
   * Handles the full connection lifecycle including state management, error handling,
   * and retry coordination.
   *
   * @async
   * @throws {Error} When API key is missing/invalid, microphone unavailable, or connection fails
   * @returns {Promise<void>} Resolves when connected, rejects on error
   *
   * @example
   * ```tsx
   * const { connect } = useVoiceAgent();
   *
   * try {
   *   await connect();
   *   console.log('Voice agent connected!');
   * } catch (error) {
   *   console.error('Connection failed:', error);
   *   // Error state is automatically set, auto-retry will be triggered
   * }
   * ```
   *
   * State transitions:
   * - Sets connectionState to 'connecting' before attempting
   * - Sets connectionState to 'connected' on success
   * - Sets connectionState to 'error' on failure (triggers auto-retry)
   *
   * Race condition prevention:
   * - Uses connectingRef.current to prevent duplicate simultaneous connections
   * - Returns early if already connecting or connected
   *
   * On success:
   * - Resets retry count to 0
   * - Sets connection start time and last activity time
   * - Clears any pending retry timeouts
   *
   * On failure:
   * - Sets error message for user display
   * - Cleans up client instances
   * - Throws error to trigger auto-retry mechanism
   */
  const connect = useCallback(async () => {
    // CRITICAL: Prevent double connection race condition
    // Use ref for synchronous check (state updates are async)
    if (connectingRef.current) {
      console.log('[VoiceAgentContext] Already connecting, ignoring duplicate call');
      return;
    }
    if (liveClientRef.current) {
      console.log('[VoiceAgentContext] Already connected, disconnecting first...');
      await liveClientRef.current.disconnect();
      liveClientRef.current = null;
    }

    connectingRef.current = true;
    console.log('[VoiceAgentContext] Starting connection...');

    // Set connecting state
    setConnectionState('connecting');
    setError(null);
    setErrorMessage(null);

    try {
      // Get OpenAI API key for voice connection
      const keyResult = await getVoiceAPIKey();

      if ('error' in keyResult) {
        throw new Error(keyResult.error);
      }

      const openaiKey = keyResult.voiceKey;

      // Create OpenAIRealtimeClient instance
      const client = new OpenAIRealtimeClient(openaiKey);
      liveClientRef.current = client;

      // Create ActionExecutor in preview mode with prompt setter and canvas callbacks for voice control
      const executor = new ActionExecutor(
        onUpdate,
        true,
        undefined,
        promptSetterRef.current || undefined,
        canvasCallbacks
      );
      actionExecutorRef.current = executor;

      // Connect with callbacks
      // These callbacks handle real-time events from the OpenAI Realtime API
      await client.connect(
        // onMessage - Called when AI speaks (text-to-speech output)
        (text) => {
          console.log('[VoiceAgentContext] AI speaking:', text);
          setIsSpeaking(true);

          // Reset speaking state after a delay (estimated audio playback duration)
          // This provides visual feedback while audio plays
          setTimeout(() => {
            setIsSpeaking(false);
          }, 2000);
        },

        // onStatus - WebSocket connection status updates
        (status) => {
          console.log('[VoiceAgentContext] Connection status:', status);
          // Sync connection and listening state with WebSocket status
          setIsConnected(status);
          setIsListening(status);
        },

        // onToolCall - AI wants to execute a voice command (e.g., "upscale this image")
        // Tool calls are first previewed to the user before being applied
        async (toolCall: ToolCall) => {
          console.log('[VoiceAgentContext] Tool call received:', toolCall);

          // Execute in preview mode (non-destructive, shows what will happen)
          setExecutingAction(true);
          try {
            const result = await executor.executeToolCall(toolCall);
            // Store for user approval via LiveActionPanel
            setPendingAction({ toolCall, result });
          } catch (err) {
            console.error('[VoiceAgentContext] Tool execution error:', err);
            setError(err instanceof Error ? err.message : 'Tool execution failed');
          } finally {
            setExecutingAction(false);
          }
        },

        // onTranscript - Conversation history updates (user and AI messages)
        (entry: TranscriptEntry) => {
          console.log('[VoiceAgentContext] Transcript entry:', entry);

          // Track user activity for idle detection
          setLastActivityTime(Date.now());

          setTranscript((prev) => {
            // DEDUPLICATION: Prevent duplicate entries that can occur during
            // rapid speech or network hiccups. Skip entries with same role/text
            // that arrive within 2 seconds of each other.
            const lastEntry = prev[prev.length - 1];
            if (lastEntry &&
              lastEntry.role === entry.role &&
              lastEntry.text === entry.text &&
              entry.timestamp - lastEntry.timestamp < 2000) {
              console.log('[VoiceAgentContext] Skipping duplicate entry');
              return prev; // Skip duplicate
            }
            return [...prev, entry];
          });
        }
      );

      connectingRef.current = false;

      // Set connected state on success
      setConnectionState('connected');
      setIsConnected(true);

      // Reset retry count on successful connection
      setRetryCount(0);

      // Track connection start time
      setConnectionStartTime(Date.now());
      setLastActivityTime(Date.now());

      // Clear any pending retry timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }

      console.log('[VoiceAgentContext] Connected successfully');
    } catch (err) {
      console.error('[VoiceAgentContext] Connection failed:', err);
      const errorMsg = err instanceof Error ? err.message : 'Connection failed';

      // Set error state on failure
      setConnectionState('error');
      setError(errorMsg);
      setErrorMessage(errorMsg);
      setIsConnected(false);
      setIsListening(false);

      // Cleanup on failure
      if (liveClientRef.current) {
        await liveClientRef.current.disconnect();
        liveClientRef.current = null;
      }
      actionExecutorRef.current = null;
      connectingRef.current = false;

      throw err;
    }
  }, [onUpdate, canvasCallbacks]);

  /**
   * Disconnect from voice session
   *
   * Cleanly terminates the voice agent connection and resets all state.
   * Clears any pending retry timeouts and cleanup resources.
   *
   * @async
   * @returns {Promise<void>} Resolves when disconnected
   *
   * @example
   * ```tsx
   * const { disconnect } = useVoiceAgent();
   *
   * await disconnect();
   * console.log('Voice agent disconnected');
   * ```
   *
   * State transitions:
   * - Sets connectionState to 'disconnecting' during cleanup
   * - Sets connectionState to 'disconnected' when complete
   *
   * Cleanup actions:
   * - Resets connectingRef to allow reconnection
   * - Clears any pending retry timeouts
   * - Resets retry count
   * - Disconnects OpenAI client
   * - Clears action executor
   * - Resets all state flags (isConnected, isListening, isSpeaking)
   * - Clears pending actions and errors
   * - Resets connection timing
   */
  const disconnect = useCallback(async () => {
    console.log('[VoiceAgentContext] Disconnecting...');

    // Set disconnecting state
    setConnectionState('disconnecting');

    // Reset connecting flag to allow reconnection
    connectingRef.current = false;

    // Clear any pending retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    // Reset retry count on manual disconnect
    setRetryCount(0);

    if (liveClientRef.current) {
      await liveClientRef.current.disconnect();
      liveClientRef.current = null;
    }

    actionExecutorRef.current = null;
    setIsConnected(false);
    setIsListening(false);
    setIsSpeaking(false);
    setPendingAction(null);
    setExecutingAction(false);
    setError(null);
    setErrorMessage(null);

    // Clear connection timing
    setConnectionStartTime(null);
    setLastActivityTime(null);

    // Set disconnected state after cleanup
    setConnectionState('disconnected');

    console.log('[VoiceAgentContext] Disconnected');
  }, []);

  /**
   * Retry connection after error (manual user-initiated retry)
   *
   * Clears error state and attempts immediate reconnection. This is typically
   * called when the user clicks the retry button in the UI (voice toggle button
   * or error toast).
   *
   * @async
   * @returns {Promise<void>} Resolves when reconnected, rejects on error
   *
   * @example
   * ```tsx
   * const { connectionState, retry, errorMessage } = useVoiceAgent();
   *
   * if (connectionState === 'error') {
   *   return (
   *     <div>
   *       <p>Error: {errorMessage}</p>
   *       <button onClick={retry}>Retry Connection</button>
   *     </div>
   *   );
   * }
   * ```
   *
   * Behavior:
   * - Cancels any pending auto-retry timeout (manual retry takes precedence)
   * - Clears error message and error state
   * - Resets retry count to 0 (fresh start for user-initiated retry)
   * - Immediately calls connect() without delay
   *
   * Difference from auto-retry:
   * - Manual retry: Immediate, resets count, user-initiated
   * - Auto-retry: Delayed (exponential backoff), increments count, automatic
   */
  const retry = useCallback(async () => {
    console.log('[VoiceAgentContext] Manual retry requested');

    // Clear any pending auto-retry
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    // Clear error state
    setError(null);
    setErrorMessage(null);

    // Reset retry count on manual retry (user-initiated action)
    setRetryCount(0);

    // Attempt connection
    await connect();
  }, [connect]);

  /**
   * Auto-retry effect with exponential backoff
   *
   * Automatically retries failed connections using exponential backoff strategy.
   * Only activates for retryable errors and when retry count hasn't exceeded maximum.
   *
   * @effect Triggers when connectionState changes to 'error'
   *
   * Retry schedule:
   * - Attempt 1: 1 second delay (2^0 * 1000ms)
   * - Attempt 2: 2 second delay (2^1 * 1000ms)
   * - Attempt 3: 4 second delay (2^2 * 1000ms)
   * - After 3 attempts: Stops retrying (user must manually retry)
   *
   * Cleanup:
   * - Clears retry timeout on unmount
   * - Clears retry timeout when connectionState changes
   * - Prevents memory leaks from abandoned retries
   *
   * @see {@link retry} for manual retry behavior
   */
  useEffect(() => {
    // Only auto-retry if in error state and haven't exceeded max retries
    if (connectionState === 'error' && retryCount < MAX_RETRIES) {
      const nextAttempt = retryCount + 1;
      const delay = getRetryDelay(nextAttempt);

      console.log(`[VoiceAgentContext] Scheduling auto-retry ${nextAttempt}/${MAX_RETRIES} in ${delay}ms`);

      retryTimeoutRef.current = setTimeout(async () => {
        console.log(`[VoiceAgentContext] Auto-retry attempt ${nextAttempt}/${MAX_RETRIES}`);
        setRetryCount(nextAttempt);

        try {
          await connect();
        } catch {
          // Error already handled by connect(), just log
          console.log(`[VoiceAgentContext] Auto-retry ${nextAttempt} failed`);
        }
      }, delay);

      // Cleanup timeout on unmount or state change
      return () => {
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = null;
        }
      };
    }
  }, [connectionState, retryCount, connect, getRetryDelay, MAX_RETRIES]);

  /**
   * Connection quality monitoring effect
   *
   * Continuously monitors connection health by polling WebSocket latency and
   * audio buffer metrics from the OpenAI Realtime client.
   *
   * @effect Triggers when connectionState changes to 'connected'
   *
   * Quality thresholds:
   * - Good: <200ms latency AND <5 audio underruns
   * - Fair: 200-500ms latency OR 5-15 audio underruns
   * - Poor: >500ms latency OR >15 audio underruns
   *
   * Polling frequency: Every 2 seconds while connected
   *
   * Use case: Display connection quality indicator in UI to warn users of
   * degraded connections before they become problematic.
   *
   * Cleanup:
   * - Clears interval on disconnect
   * - Sets connectionQuality to null when not connected
   */
  useEffect(() => {
    if (connectionState !== 'connected' || !liveClientRef.current) {
      setConnectionQuality(null);
      return;
    }

    // Poll metrics every 2 seconds while connected
    const metricsInterval = setInterval(() => {
      if (!liveClientRef.current) return;

      const metrics = liveClientRef.current.getConnectionMetrics();

      // Calculate quality based on latency and underruns
      // Thresholds chosen based on real-world testing:
      // - Good: <200ms latency, <5 underruns (imperceptible delays, smooth audio)
      // - Fair: 200-500ms latency OR 5-15 underruns (noticeable but usable)
      // - Poor: >500ms latency OR >15 underruns (significant disruption, suggest reconnect)

      let quality: ConnectionQuality = 'good';

      // Check poor conditions first (most severe)
      if (metrics.latencyMs > 500 || metrics.audioUnderruns > 15) {
        quality = 'poor';
      }
      // Then check fair conditions (moderate issues)
      else if (metrics.latencyMs > 200 || metrics.audioUnderruns > 5) {
        quality = 'fair';
      }
      // Otherwise, quality is good (default)

      setConnectionQuality(quality);
    }, 2000);

    // Cleanup interval on disconnect or unmount
    return () => {
      clearInterval(metricsInterval);
    };
  }, [connectionState]);

  /**
   * Approve and execute the pending action
   *
   * Applies a previewed voice command action to the canvas. Actions are first
   * previewed to the user for approval before being permanently applied.
   *
   * @async
   * @returns {Promise<void>} Resolves when action is applied
   *
   * @example
   * ```tsx
   * const { pendingAction, approveAction, rejectAction } = useVoiceAgent();
   *
   * if (pendingAction) {
   *   return (
   *     <div>
   *       <p>Action: {pendingAction.toolCall.function_name}</p>
   *       <button onClick={approveAction}>Approve</button>
   *       <button onClick={rejectAction}>Reject</button>
   *     </div>
   *   );
   * }
   * ```
   *
   * Workflow:
   * 1. Checks if pendingAction exists
   * 2. Sets executingAction to true (shows loading state)
   * 3. Applies the previewed result via ActionExecutor
   * 4. Clears pendingAction on success
   * 5. Sets error on failure
   * 6. Sets executingAction to false (hides loading state)
   */
  const approveAction = useCallback(async () => {
    if (!pendingAction || !actionExecutorRef.current) {
      console.warn('[VoiceAgentContext] No pending action to approve');
      return;
    }

    console.log('[VoiceAgentContext] Approving action...');
    setExecutingAction(true);

    try {
      // Apply the previewed result
      if (pendingAction.result.success && pendingAction.result.result) {
        actionExecutorRef.current.applyPreview(pendingAction.result.result);
        console.log('[VoiceAgentContext] Action applied successfully');
      } else {
        throw new Error(pendingAction.result.error || 'Action failed');
      }
    } catch (err) {
      console.error('[VoiceAgentContext] Failed to apply action:', err);
      setError(err instanceof Error ? err.message : 'Failed to apply action');
    } finally {
      setPendingAction(null);
      setExecutingAction(false);
    }
  }, [pendingAction]);

  /**
   * Reject the pending action
   *
   * Discards a previewed voice command action without applying it to the canvas.
   * The preview is removed and no changes are made.
   *
   * @returns {void}
   *
   * @example
   * ```tsx
   * const { pendingAction, rejectAction } = useVoiceAgent();
   *
   * if (pendingAction) {
   *   return (
   *     <div>
   *       <p>Preview: {pendingAction.result.preview}</p>
   *       <button onClick={rejectAction}>Cancel</button>
   *     </div>
   *   );
   * }
   * ```
   */
  const rejectAction = useCallback(() => {
    console.log('[VoiceAgentContext] Rejecting action');
    setPendingAction(null);
  }, []);

  /**
   * Clear conversation transcript
   *
   * Removes all transcript entries from both the context state and the
   * OpenAI Realtime client's conversation history.
   *
   * @returns {void}
   *
   * @example
   * ```tsx
   * const { transcript, clearTranscript } = useVoiceAgent();
   *
   * return (
   *   <div>
   *     <p>Messages: {transcript.length}</p>
   *     <button onClick={clearTranscript}>Clear History</button>
   *   </div>
   * );
   * ```
   */
  const clearTranscript = useCallback(() => {
    console.log('[VoiceAgentContext] Clearing transcript');
    setTranscript([]);

    if (liveClientRef.current) {
      liveClientRef.current.clearTranscript();
    }
  }, []);

  const value: VoiceAgentContextType = {
    isConnected,
    connectionState,
    connectionQuality,
    isListening,
    isSpeaking,
    transcript,
    pendingAction,
    executingAction,
    error,
    errorMessage,
    retryCount,
    maxRetries: MAX_RETRIES,
    connectionStartTime,
    lastActivityTime,
    connect,
    disconnect,
    retry,
    approveAction,
    rejectAction,
    clearTranscript,
    registerPromptSetter,
    registerTabSetter,
  };

  return <VoiceAgentContext.Provider value={value}>{children}</VoiceAgentContext.Provider>;
}

/**
 * Hook to access voice agent context
 * Throws error if used outside provider
 */
export function useVoiceAgent(): VoiceAgentContextType {
  const context = useContext(VoiceAgentContext);

  if (!context) {
    throw new Error('useVoiceAgent must be used within a VoiceAgentProvider');
  }

  return context;
}
