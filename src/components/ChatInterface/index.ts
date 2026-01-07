/**
 * ChatInterface - Modular chat interface for design and search modes
 *
 * This barrel file exports all types and will export components/hooks
 * as they are extracted in subsequent phases.
 */

// Export all types
export type {
  ChatMode,
  PendingAction,
  ChatInterfaceProps,
  ChatHeaderProps,
  ChatMessageProps,
  ChatInputProps,
  ConversationHistoryProps,
  LoadingIndicatorProps,
  ExecutingIndicatorProps,
  UseChatPersistenceReturn,
  UseFileAttachmentReturn,
  UseChatMessagesReturn,
  UseAutoScrollReturn,
} from './types';

// TODO: Export components (Phase 2)
export { ChatHeader, ChatMessage, ChatInput, ConversationHistory, LoadingIndicator, ExecutingIndicator } from './components';

// Export hooks (Phase 3)
export { useChatPersistence } from './hooks/useChatPersistence';
export { useFileAttachment } from './hooks/useFileAttachment';
export { useChatMessages } from './hooks/useChatMessages';
export { useAutoScroll } from './hooks/useAutoScroll';

// Export constants (Phase 4)
export { BTN_BASE, BTN_BLUE_INACTIVE, BTN_BLUE_ACTIVE, BTN_NEU_WHITE, INITIAL_MESSAGE } from './constants';

// Export utilities (Phase 4)
export { extractPrompts } from './utils';

// Export main component (Phase 5)
export { default } from './ChatInterface';
