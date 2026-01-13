// Chat & Brainstorm Types

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: Attachment[];
  timestamp: Date;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  model?: string;
  tokens?: number;
  actions?: ActionCommand[];
  processingTime?: number;
}

export interface Attachment {
  id: string;
  type: 'image' | 'file';
  url: string;
  name: string;
  size: number;
  mimeType?: string;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  mode: ConversationMode;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  archived: boolean;
  settings?: ConversationSettings;
}

export type ConversationMode = 'design' | 'search' | 'voice';

export interface ConversationSettings {
  model?: string;
  temperature?: number;
  systemPrompt?: string;
}

export interface ActionCommand {
  id: string;
  type: string;
  parameters: Record<string, unknown>;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result?: unknown;
}

export interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
}
