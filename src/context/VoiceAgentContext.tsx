// Voice Agent Context - Centralized state management for voice agent interactions
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { OpenAIRealtimeClient, ToolCall, TranscriptEntry } from '@/services/openaiRealtimeClient';
import { ActionExecutor, ActionResult, OnUpdateCallback, CanvasCallbacks } from '@/services/actionExecutor';
import { getVoiceAPIKey } from '@/services/apiKeyStorage';

interface VoiceAgentContextType {
  // Connection state
  isConnected: boolean;
  isListening: boolean;
  isSpeaking: boolean;

  // Conversation data
  transcript: TranscriptEntry[];
  pendingAction: {
    toolCall: ToolCall;
    result: ActionResult;
  } | null;
  executingAction: boolean;
  error: string | null;

  // Methods
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  approveAction: () => Promise<void>;
  rejectAction: () => void;
  clearTranscript: () => void;
  registerPromptSetter: (setter: (prompt: string) => void) => void;
}

const VoiceAgentContext = createContext<VoiceAgentContextType | undefined>(undefined);

interface VoiceAgentProviderProps {
  children: React.ReactNode;
  onUpdate: OnUpdateCallback;
  setGenPrompt?: (prompt: string) => void; // For voice-to-prompt enhancement
  canvasCallbacks?: CanvasCallbacks; // Canvas manipulation callbacks for voice control
}

export function VoiceAgentProvider({ children, onUpdate, setGenPrompt, canvasCallbacks }: VoiceAgentProviderProps) {
  // State
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [pendingAction, setPendingAction] = useState<{
    toolCall: ToolCall;
    result: ActionResult;
  } | null>(null);
  const [executingAction, setExecutingAction] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // References
  const liveClientRef = useRef<OpenAIRealtimeClient | null>(null);
  const actionExecutorRef = useRef<ActionExecutor | null>(null);
  const promptSetterRef = useRef<((prompt: string) => void) | null>(setGenPrompt || null);
  const connectingRef = useRef(false); // Prevents double connection race condition

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
   * Connect to OpenAI Realtime voice session
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
    setError(null);

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
      await client.connect(
        // onMessage - AI is speaking
        (text) => {
          console.log('[VoiceAgentContext] AI speaking:', text);
          setIsSpeaking(true);

          // Reset speaking state after a delay (audio playback duration)
          setTimeout(() => {
            setIsSpeaking(false);
          }, 2000);
        },

        // onStatus - connection status
        (status) => {
          console.log('[VoiceAgentContext] Connection status:', status);
          setIsConnected(status);
          setIsListening(status);
        },

        // onToolCall - AI wants to execute an action
        async (toolCall: ToolCall) => {
          console.log('[VoiceAgentContext] Tool call received:', toolCall);

          // Execute in preview mode
          setExecutingAction(true);
          try {
            const result = await executor.executeToolCall(toolCall);
            setPendingAction({ toolCall, result });
          } catch (err) {
            console.error('[VoiceAgentContext] Tool execution error:', err);
            setError(err instanceof Error ? err.message : 'Tool execution failed');
          } finally {
            setExecutingAction(false);
          }
        },

        // onTranscript - conversation updates (with deduplication)
        (entry: TranscriptEntry) => {
          console.log('[VoiceAgentContext] Transcript entry:', entry);
          setTranscript((prev) => {
            // Prevent duplicate entries (same role and text within 2 seconds)
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
      console.log('[VoiceAgentContext] Connected successfully');
    } catch (err) {
      console.error('[VoiceAgentContext] Connection failed:', err);
      setError(err instanceof Error ? err.message : 'Connection failed');
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
   */
  const disconnect = useCallback(async () => {
    console.log('[VoiceAgentContext] Disconnecting...');

    // Reset connecting flag to allow reconnection
    connectingRef.current = false;

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

    console.log('[VoiceAgentContext] Disconnected');
  }, []);

  /**
   * Approve and execute the pending action
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
   */
  const rejectAction = useCallback(() => {
    console.log('[VoiceAgentContext] Rejecting action');
    setPendingAction(null);
  }, []);

  /**
   * Clear conversation transcript
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
    isListening,
    isSpeaking,
    transcript,
    pendingAction,
    executingAction,
    error,
    connect,
    disconnect,
    approveAction,
    rejectAction,
    clearTranscript,
    registerPromptSetter,
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
