import { ChatMessage } from '@/types';
import { ChatConversation } from '@/services/chatPersistence';

/**
 * Mode type for chat interface
 * - design: Design mode with ChatAgent for banner creation
 * - search: Search mode with web grounding
 */
export type ChatMode = 'design' | 'search';

/**
 * Pending action awaiting user approval from tool execution
 */
export interface PendingAction {
  name: string;
  args: Record<string, unknown>;
  preview?: string;
}

/**
 * Main ChatInterface component props
 */
export interface ChatInterfaceProps {
  /**
   * Callback when user selects a generated prompt
   * to create a design in the canvas
   */
  onGenerateFromPrompt: (prompt: string) => void;
}

/**
 * ChatHeader component props
 */
export interface ChatHeaderProps {
  /** Current chat mode */
  mode: ChatMode;
  /** Callback when mode changes */
  onModeChange: (mode: ChatMode) => void;
  /** Callback when new chat button is clicked */
  onNewChat: () => void;
  /** Whether conversation history is visible */
  showHistory: boolean;
  /** Callback to toggle history visibility */
  onToggleHistory: () => void;
  /** Callback when settings button is clicked */
  onShowSettings: () => void;
  /** Whether user is authenticated (shows persistence features) */
  isAuthenticated: boolean;
}

/**
 * ChatMessage component props
 */
export interface ChatMessageProps {
  /** The message to display */
  message: ChatMessage;
  /** Callback when generate button is clicked for a prompt */
  onGenerateFromPrompt: (prompt: string) => void;
}

/**
 * ChatInput component props
 */
export interface ChatInputProps {
  /** Current input value */
  value: string;
  /** Callback when input changes */
  onChange: (value: string) => void;
  /** Callback when send button is clicked or Enter is pressed */
  onSend: () => void;
  /** Whether a request is in progress (disables send) */
  loading: boolean;
  /** Current chat mode (for placeholder text) */
  mode: ChatMode;
  /** Array of attached image base64 strings */
  attachedImages: string[];
  /** Callback when images are uploaded */
  onImageUpload: (files: FileList) => void;
  /** Callback when an attached image is removed */
  onRemoveImage: (index: number) => void;
  /** Whether files are being processed */
  processingFiles: boolean;
  /** File input ref for triggering picker */
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

/**
 * ConversationHistory component props
 */
export interface ConversationHistoryProps {
  /** Whether the history dropdown is visible */
  show: boolean;
  /** Callback to close the history dropdown */
  onClose: () => void;
  /** List of conversations to display */
  conversations: ChatConversation[];
  /** Currently active conversation ID */
  activeConversationId: string | null;
  /** Whether conversations are being loaded */
  loading: boolean;
  /** Callback when a conversation is selected */
  onLoadConversation: (conversationId: string) => void;
  /** Callback when a conversation is deleted */
  onDeleteConversation: (conversationId: string) => void;
}

/**
 * LoadingIndicator component props
 */
export interface LoadingIndicatorProps {
  /** Optional custom message to display */
  message?: string;
}

/**
 * ExecutingIndicator component props
 */
export interface ExecutingIndicatorProps {
  /** Name of the tool being executed */
  toolName: string;
}

/**
 * Return type for useChatPersistence hook
 */
export interface UseChatPersistenceReturn {
  /** Current conversation ID */
  conversationId: string | null;
  /** Set conversation ID */
  setConversationId: (id: string | null) => void;
  /** List of user conversations */
  conversations: ChatConversation[];
  /** Whether history dropdown is visible */
  showHistory: boolean;
  /** Set history dropdown visibility */
  setShowHistory: (show: boolean) => void;
  /** Whether conversations are being loaded */
  loadingHistory: boolean;
  /** Ensure a conversation exists (creates if needed) */
  ensureConversation: (mode: ChatMode) => Promise<string>;
  /** Save a message to the current conversation with optional metadata */
  saveMessage: (
    conversationId: string,
    role: 'user' | 'model',
    content: string,
    extra?: {
      images?: string[];
      generated_images?: string[];
      model_used?: string;
      tokens_used?: number;
      response_time_ms?: number;
    },
  ) => Promise<void>;
  /** Start a new conversation (resets state) */
  startNewConversation: () => void;
  /** Load an existing conversation with its messages */
  loadConversation: (conversationId: string) => Promise<void>;
  /** Delete a conversation */
  deleteConversation: (conversationId: string) => Promise<void>;
  /** Refresh the conversations list */
  refreshConversations: () => Promise<void>;
}

/**
 * Return type for useFileAttachment hook
 */
export interface UseFileAttachmentReturn {
  /** Array of attached image base64 strings */
  attachedImages: string[];
  /** Set attached images */
  setAttachedImages: (images: string[]) => void;
  /** Whether files are being processed */
  processingFiles: boolean;
  /** Handle image upload from file input */
  handleImageUpload: (files: FileList) => Promise<void>;
  /** Remove an image by index */
  removeImage: (index: number) => void;
  /** File input ref for triggering picker */
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

/**
 * Return type for useChatMessages hook
 */
export interface UseChatMessagesReturn {
  /** Current input value */
  input: string;
  /** Set input value */
  setInput: (value: string) => void;
  /** Current chat mode */
  mode: ChatMode;
  /** Set chat mode */
  setMode: (mode: ChatMode) => void;
  /** Whether a request is in progress */
  loading: boolean;
  /** Array of chat messages */
  messages: ChatMessage[];
  /** Set messages */
  setMessages: (messages: ChatMessage[]) => void;
  /** Whether a tool is being executed */
  isExecuting: boolean;
  /** Name of the tool being executed */
  executingTool: string | null;
  /** Pending action awaiting approval */
  pendingAction: PendingAction | null;
  /** Handle send message */
  handleSend: () => Promise<void>;
}

/**
 * Return type for useAutoScroll hook
 */
export interface UseAutoScrollReturn {
  /** Ref to attach to the bottom element for auto-scrolling */
  bottomRef: React.RefObject<HTMLDivElement | null>;
}
