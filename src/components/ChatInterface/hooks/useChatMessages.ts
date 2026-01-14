import { useState, useMemo, useCallback, MutableRefObject, useEffect } from 'react';
import { ChatMessage, Part } from '@/types';
import { generateSearchResponse } from '@/services/chatService';
import { getUserAPIKeys } from '@/services/apiKeyStorage';
import { ChatAgent } from '@/services/chatAgent';
import { ActionExecutor } from '@/services/actionExecutor';
import { getAgentSuggestions, AgentSuggestion } from '@/services/agentRegistry';
import type { ChatMode, PendingAction, UseChatMessagesReturn } from '../types';
import type { UseChatPersistenceReturn } from '../types';
import type { UseFileAttachmentReturn } from '../types';
import { INITIAL_MESSAGE } from '../constants';

interface UseChatMessagesOptions {
  /** User ID (null if not authenticated) */
  userId: string | null;
  /** Callback to update background image from tool execution */
  setBgImage: (url: string) => void;
  /** Chat persistence hook ref (to avoid circular dependency) */
  persistenceRef: MutableRefObject<UseChatPersistenceReturn | null>;
  /** File attachment hook instance */
  fileAttachment: UseFileAttachmentReturn;
}

/**
 * Custom hook for managing chat messages and sending logic
 * Handles message state, API integration, tool execution, and error handling
 */
export function useChatMessages({
  userId,
  setBgImage,
  persistenceRef,
  fileAttachment,
}: UseChatMessagesOptions): UseChatMessagesReturn & { agentSuggestions: AgentSuggestion[] } {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<ChatMode>('design');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executingTool, setExecutingTool] = useState<string | null>(null);
  const [agentSuggestions, setAgentSuggestions] = useState<AgentSuggestion[]>([]);

  // Intelligent agent routing suggestions
  useEffect(() => {
    if (input.length > 5) {
      const suggestions = getAgentSuggestions(input);
      setAgentSuggestions(suggestions);
    } else {
      setAgentSuggestions([]);
    }
  }, [input]);

  /**
   * Create action executor (only once)
   * Not in preview mode - apply directly to canvas
   */
  const actionExecutor = useMemo(
    () =>
      new ActionExecutor((imageUrl, type) => {
        console.log('[useChatMessages] Applying action result:', { imageUrl, type });
        if (type === 'background') {
          setBgImage(imageUrl);
        }
        // TODO: Handle profile updates if needed
      }, false),
    [setBgImage],
  );

  /**
   * Handle tool calls from chat agent
   * Executes tools via ActionExecutor and updates messages with results
   */
  const handleToolCall = useCallback(
    async (name: string, args: Record<string, unknown>): Promise<unknown> => {
      console.log('[useChatMessages] Tool call:', name, args);

      // Show executing indicator
      setExecutingTool(name);
      setIsExecuting(true);

      try {
        // Execute the tool call
        const result = await actionExecutor.executeToolCall({ name, args });

        // Show success/failure in chat
        if (result.success) {
          setMessages((prev) => [
            ...prev,
            {
              role: 'model',
              text: `✓ EXECUTED: ${name.toUpperCase().replace(/_/g, ' ')}\n\nResult: ${result.result || 'Success'}`,
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: 'model',
              text: `✗ FAILED: ${name.toUpperCase().replace(/_/g, ' ')}\n\nError: ${result.error || 'Unknown error'}`,
            },
          ]);
        }

        return result;
      } catch (error) {
        console.error('[useChatMessages] Tool execution error:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      } finally {
        setIsExecuting(false);
        setExecutingTool(null);
        setPendingAction(null);
      }
    },
    [actionExecutor],
  );

  /**
   * Handle conversation updates from chat agent
   * ChatAgent already returns the correct display format
   */
  const handleConversationUpdate = useCallback((updatedMessages: ChatMessage[]) => {
    setMessages(updatedMessages);
  }, []);

  /**
   * Create chat agent (only once)
   * CRITICAL: Must persist across renders with empty deps to maintain conversation history
   */
  const chatAgent = useMemo(
    () =>
      new ChatAgent({
        onToolCall: handleToolCall,
        onUpdate: handleConversationUpdate,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [], // Empty deps - we want this to persist
  );

  /**
   * Handle sending a message
   * Validates API keys, handles both design and search modes, manages persistence
   */
  const handleSend = useCallback(async (): Promise<void> => {
    if ((!input.trim() && fileAttachment.attachedImages.length === 0) || loading) return;

    const userMsg = input;
    const currentImages = [...fileAttachment.attachedImages];
    const startTime = Date.now();

    // Clear inputs immediately
    setInput('');
    fileAttachment.setAttachedImages([]);
    setAgentSuggestions([]); // Clear suggestions

    // Add user message to state
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: userMsg, images: currentImages.length > 0 ? currentImages : undefined },
    ]);
    setLoading(true);

    // Ensure conversation exists and save user message (async, don't block)
    let activeConvId: string | null = null;
    if (userId) {
      activeConvId = (await persistenceRef.current?.ensureConversation(mode)) || null;
      if (activeConvId && persistenceRef.current) {
        // Save user message in background
        persistenceRef.current.saveMessage(activeConvId, 'user', userMsg, {
          images: currentImages.length > 0 ? currentImages : undefined,
        });
      }
    }

    try {
      // Pre-flight API key validation
      // Skip check if product has server-side API keys configured
      const keys = await getUserAPIKeys();
      const hasAnyKeys = keys.openrouter_api_key || keys.gemini_api_key || keys.hasProductKeys;
      if (!hasAnyKeys) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'model',
            text: '⚠️ NO API KEYS CONFIGURED\n\nI need an OpenRouter or Gemini API key to respond to your message.\n\nPlease add at least one API key in Settings (gear icon in the top-right corner).',
          },
        ]);
        setLoading(false);
        return;
      }

      if (mode === 'design') {
        // Use ChatAgent for design mode
        const response = await chatAgent.chat(
          userMsg,
          currentImages.length > 0 ? currentImages : undefined,
        );

        // Save assistant message if we have a conversation
        if (activeConvId && response && persistenceRef.current) {
          const responseTime = Date.now() - startTime;
          await persistenceRef.current.saveMessage(activeConvId, 'model', response, {
            model_used: 'openrouter/gemini-2.5-pro',
            response_time_ms: responseTime,
          });
          // Refresh conversation list to update last_message_at
          persistenceRef.current.refreshConversations();
        }
      } else {
        // Keep existing search mode implementation
        // Build history
        const history = messages.map((m) => {
          const parts: Part[] = [{ text: m.text }];
          if (m.images) {
            m.images.forEach((img) => {
              const base64Data = img.split(',')[1] || img;
              const mimeType = img.substring(img.indexOf(':') + 1, img.indexOf(';')) || 'image/png';
              parts.push({ inlineData: { mimeType, data: base64Data } });
            });
          }
          return { role: m.role, parts };
        });

        const response = await generateSearchResponse(userMsg, history);

        // Grounding extraction removed as we are no longer using Gemini SDK
        const groundings: { title: string; url: string }[] = [];

        setMessages((prev) => [
          ...prev,
          {
            role: 'model',
            text: response.text,
            groundingUrls: groundings.length > 0 ? groundings : undefined,
          },
        ]);

        // Save search response if we have a conversation
        if (activeConvId && response.text && persistenceRef.current) {
          const responseTime = Date.now() - startTime;
          await persistenceRef.current.saveMessage(activeConvId, 'model', response.text, {
            model_used: 'gemini-search',
            response_time_ms: responseTime,
          });
          persistenceRef.current.refreshConversations();
        }
      }
    } catch (e) {
      console.error('[useChatMessages] Error:', e);

      // Parse error type and provide specific messages
      let errorMessage = 'SORRY, I ENCOUNTERED AN ERROR. PLEASE TRY AGAIN.';

      if (e instanceof Error) {
        const errorText = e.message.toLowerCase();

        if (
          errorText.includes('api key') ||
          errorText.includes('unauthorized') ||
          errorText.includes('401')
        ) {
          errorMessage =
            '⚠️ API KEY ERROR\n\nYour API key is invalid or expired. Please check your API keys in Settings (gear icon in the top-right corner).';
        } else if (
          errorText.includes('quota') ||
          errorText.includes('rate limit') ||
          errorText.includes('429')
        ) {
          errorMessage =
            '⚠️ QUOTA EXCEEDED\n\nYour API quota has been exceeded or rate limit reached. Please try again later or check your API provider dashboard.';
        } else if (
          errorText.includes('network') ||
          errorText.includes('fetch') ||
          errorText.includes('connection')
        ) {
          errorMessage =
            '⚠️ NETWORK ERROR\n\nFailed to connect to the AI service. Please check your internet connection and try again.';
        } else {
          errorMessage = `⚠️ ERROR\n\n${e.message}\n\nPlease try again or contact support if the issue persists.`;
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: errorMessage,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, fileAttachment, loading, userId, persistenceRef, mode, messages, chatAgent]);

  return {
    input,
    setInput,
    mode,
    setMode,
    loading,
    messages,
    setMessages,
    isExecuting,
    executingTool,
    pendingAction,
    handleSend,
    agentSuggestions,
  };
}
