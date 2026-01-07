import { useState, useEffect, useCallback } from 'react';
import { ChatMessage } from '@/types';
import {
  getConversations,
  createConversation,
  getConversationWithMessages,
  addMessage,
  deleteConversation as deleteConversationService,
  type ChatConversation,
} from '@/services/chatPersistence';
import type { ChatMode, UseChatPersistenceReturn } from '../types';
import { INITIAL_MESSAGE } from '../constants';

interface UseChatPersistenceOptions {
  /** Current user ID (null if not authenticated) */
  userId: string | null;
  /** Current chat mode */
  mode: ChatMode;
  /** Callback to update messages when loading a conversation */
  onMessagesLoaded?: (messages: ChatMessage[]) => void;
  /** Callback to update mode when loading a conversation */
  onModeChanged?: (mode: ChatMode) => void;
}

/**
 * Custom hook for managing chat conversation persistence
 * Handles conversation CRUD operations and message persistence
 */
export function useChatPersistence({
  userId,
  mode,
  onMessagesLoaded,
  onModeChanged,
}: UseChatPersistenceOptions): UseChatPersistenceReturn {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load conversations list when user is authenticated
  useEffect(() => {
    if (!userId) return;

    const loadConversations = async () => {
      setLoadingHistory(true);
      try {
        const convos = await getConversations({ mode, limit: 20 });
        setConversations(convos);
        console.log('[useChatPersistence] Loaded', convos.length, 'conversations');
      } catch (error) {
        console.error('[useChatPersistence] Failed to load conversations:', error);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadConversations();
  }, [userId, mode]);

  /**
   * Ensure a conversation exists for the current session
   * Creates a new conversation if one doesn't exist
   * @returns Conversation ID or empty string if failed/not authenticated
   */
  const ensureConversation = useCallback(
    async (conversationMode: ChatMode): Promise<string> => {
      if (!userId) return '';

      // If we already have a conversation, return its ID
      if (conversationId) return conversationId;

      // Create new conversation
      try {
        const conversation = await createConversation(conversationMode);
        if (conversation) {
          setConversationId(conversation.id);
          console.log('[useChatPersistence] Created conversation:', conversation.id);
          return conversation.id;
        }
      } catch (error) {
        console.error('[useChatPersistence] Failed to create conversation:', error);
      }
      return '';
    },
    [userId, conversationId],
  );

  /**
   * Save a message to the database
   * @param convId - Conversation ID to save to
   * @param role - Message role ('user' or 'model')
   * @param content - Message content
   * @param extra - Optional metadata (images, model info, etc.)
   */
  const saveMessage = useCallback(
    async (
      convId: string,
      role: 'user' | 'model',
      content: string,
      extra?: {
        images?: string[];
        generated_images?: string[];
        model_used?: string;
        tokens_used?: number;
        response_time_ms?: number;
      },
    ): Promise<void> => {
      if (!userId || !convId) return;

      try {
        // Convert 'model' role to 'assistant' for persistence
        const persistenceRole = role === 'model' ? 'assistant' : role;

        await addMessage(convId, {
          role: persistenceRole,
          content,
          images: extra?.images,
          generatedImages: extra?.generated_images,
          modelUsed: extra?.model_used,
          tokensUsed: extra?.tokens_used,
          responseTimeMs: extra?.response_time_ms,
        });
        console.log('[useChatPersistence] Saved message to conversation:', convId);
      } catch (error) {
        console.error('[useChatPersistence] Failed to save message:', error);
      }
    },
    [userId],
  );

  /**
   * Start a new conversation
   * Resets conversation ID and clears history
   */
  const startNewConversation = useCallback(() => {
    setConversationId(null);
    console.log('[useChatPersistence] Started new conversation');
  }, []);

  /**
   * Load an existing conversation with its messages
   * @param convId - Conversation ID to load
   */
  const loadConversation = useCallback(
    async (convId: string): Promise<void> => {
      if (!userId) return;

      setLoadingHistory(true);
      try {
        const result = await getConversationWithMessages(convId);
        if (result) {
          setConversationId(result.conversation.id);

          // Update mode if callback provided
          const loadedMode = result.conversation.mode as ChatMode;
          if (onModeChanged && (loadedMode === 'design' || loadedMode === 'search')) {
            onModeChanged(loadedMode);
          }

          // Convert saved messages to ChatMessage format
          // Filter out system messages and map roles
          const loadedMessages: ChatMessage[] = result.messages
            .filter((msg) => msg.role !== 'system')
            .map((msg) => ({
              role: (msg.role === 'assistant' ? 'model' : 'user') as 'model' | 'user',
              text: msg.content,
              images: msg.images?.length ? msg.images : undefined,
            }));

          // Prepend initial message if not present
          if (loadedMessages.length === 0 || loadedMessages[0].role !== 'model') {
            loadedMessages.unshift(INITIAL_MESSAGE);
          }

          // Update messages if callback provided
          if (onMessagesLoaded) {
            onMessagesLoaded(loadedMessages);
          }

          console.log(
            '[useChatPersistence] Loaded conversation:',
            convId,
            'with',
            result.messages.length,
            'messages',
          );
        }
      } catch (error) {
        console.error('[useChatPersistence] Failed to load conversation:', error);
      } finally {
        setLoadingHistory(false);
        setShowHistory(false);
      }
    },
    [userId, onMessagesLoaded, onModeChanged],
  );

  /**
   * Delete a conversation
   * If the deleted conversation is the current one, starts a new conversation
   * @param convId - Conversation ID to delete
   */
  const deleteConversation = useCallback(
    async (convId: string): Promise<void> => {
      if (!userId) return;

      try {
        await deleteConversationService(convId);
        setConversations((prev) => prev.filter((c) => c.id !== convId));

        // If we deleted the current conversation, reset
        if (convId === conversationId) {
          startNewConversation();
        }

        console.log('[useChatPersistence] Deleted conversation:', convId);
      } catch (error) {
        console.error('[useChatPersistence] Failed to delete conversation:', error);
      }
    },
    [userId, conversationId, startNewConversation],
  );

  /**
   * Refresh the conversations list
   */
  const refreshConversations = useCallback(async (): Promise<void> => {
    if (!userId) return;

    try {
      const convos = await getConversations({ mode, limit: 20 });
      setConversations(convos);
      console.log('[useChatPersistence] Refreshed conversations');
    } catch (error) {
      console.error('[useChatPersistence] Failed to refresh conversations:', error);
    }
  }, [userId, mode]);

  return {
    conversationId,
    setConversationId,
    conversations,
    showHistory,
    setShowHistory,
    loadingHistory,
    ensureConversation,
    saveMessage,
    startNewConversation,
    loadConversation,
    deleteConversation,
    refreshConversations,
  };
}
