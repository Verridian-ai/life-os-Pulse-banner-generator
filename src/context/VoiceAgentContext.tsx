// Voice Agent Context - Centralized state management for voice agent interactions
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { LiveClient, ToolCall, TranscriptEntry } from '@/services/liveClient';
import { ActionExecutor, ActionResult, OnUpdateCallback } from '@/services/actionExecutor';
import { getUserAPIKeys } from '@/services/apiKeyStorage';

// Pending action structure matching LiveActionPanel expectations
interface PendingAction {
  toolCall: ToolCall;
  result: ActionResult;
}

interface VoiceAgentContextType {
  // Connection state
  isConnected: boolean;
  isListening: boolean;
  isSpeaking: boolean;

  // Conversation data
  transcript: TranscriptEntry[];
  pendingAction: PendingAction | null;
  executingAction: boolean;
  error: string | null;

  // Methods
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  approveAction: () => Promise<void>;
  rejectAction: () => void;
  clearTranscript: () => void;
}

const VoiceAgentContext = createContext<VoiceAgentContextType | undefined>(undefined);

interface VoiceAgentProviderProps {
  children: React.ReactNode;
  onUpdate: OnUpdateCallback;
}

export function VoiceAgentProvider({ children, onUpdate }: VoiceAgentProviderProps) {
  // State
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [executingAction, setExecutingAction] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // References
  const liveClientRef = useRef<LiveClient | null>(null);
  const actionExecutorRef = useRef<ActionExecutor | null>(null);

  /**
   * Connect to Gemini Live voice session
   */
  const connect = useCallback(async () => {
    console.log('[VoiceAgentContext] Starting connection...');
    setError(null);

    try {
      // Get Gemini API key
      const apiKeys = await getUserAPIKeys();
      const geminiKey = apiKeys.gemini_api_key;

      if (!geminiKey) {
        throw new Error('Gemini API key not found. Please add it in Settings.');
      }

      // Create LiveClient instance
      const client = new LiveClient(geminiKey);
      liveClientRef.current = client;

      // Create ActionExecutor in preview mode
      const executor = new ActionExecutor(onUpdate, true);
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
            // Store both toolCall and result for the LiveActionPanel
            setPendingAction({ toolCall, result });
          } catch (err) {
            console.error('[VoiceAgentContext] Tool execution error:', err);
            setError(err instanceof Error ? err.message : 'Tool execution failed');
          } finally {
            setExecutingAction(false);
          }
        },

        // onTranscript - conversation updates
        (entry: TranscriptEntry) => {
          console.log('[VoiceAgentContext] Transcript entry:', entry);
          setTranscript((prev) => [...prev, entry]);
        }
      );

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

      throw err;
    }
  }, [onUpdate]);

  /**
   * Disconnect from voice session
   */
  const disconnect = useCallback(async () => {
    console.log('[VoiceAgentContext] Disconnecting...');

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
      // Apply the previewed result (access result from the PendingAction structure)
      const { result } = pendingAction;
      if (result.success && result.result) {
        actionExecutorRef.current.applyPreview(result.result);
        console.log('[VoiceAgentContext] Action applied successfully');
      } else {
        throw new Error(result.error || 'Action failed');
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
