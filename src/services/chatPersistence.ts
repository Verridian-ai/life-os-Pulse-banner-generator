import { api } from './api';
import { uploadImage, getPublicUrl } from './storage';

// Types (Keep existing interfaces)
export interface ChatConversation {
  id: string;
  userId: string;
  title: string;
  mode: 'design' | 'search' | 'voice';
  isArchived: boolean;
  isPinned: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  toolCalls?: any[];
  toolResults?: any[];
  images?: string[];
  generatedImages?: string[];
  modelUsed?: string;
  tokensUsed?: number;
  responseTimeMs?: number;
  createdAt: string;
}

export interface VoiceTranscript {
  id: string;
  userId: string;
  conversationId?: string;
  role: 'user' | 'assistant';
  content: string;
  audioDurationMs?: number;
  provider?: 'gemini' | 'openai';
  createdAt: string;
}

export interface ChatSettings {
  auto_save: boolean;
  save_images: boolean;
  default_mode: 'design' | 'search' | 'voice';
  voice_provider: 'gemini' | 'openai';
  auto_approve_actions: boolean;
}

// Conversation Operations

export const createConversation = async (mode: 'design' | 'search' | 'voice' = 'design', title?: string) => {
  try {
    const { conversation } = await api.post<{ conversation: ChatConversation }>('/api/chat/conversations', { mode, title });
    return conversation;
  } catch (e) {
    console.error('Create conversation failed', e);
    return null;
  }
};

export const getConversations = async (options?: { mode?: string; includeArchived?: boolean; limit?: number }) => {
  try {
    const params = new URLSearchParams();
    if (options?.mode) params.append('mode', options.mode);
    if (options?.includeArchived) params.append('archived', 'true');
    if (options?.limit) params.append('limit', options.limit.toString());

    const { conversations } = await api.get<{ conversations: ChatConversation[] }>(`/api/chat/conversations?${params.toString()}`);
    return conversations;
  } catch (e) {
    return [];
  }
};

export const getConversation = async (id: string) => {
  try {
    const { conversation } = await api.get<{ conversation: ChatConversation }>(`/api/chat/conversations/${id}`);
    return conversation;
  } catch (e) { return null; }
};

export const updateConversation = async (id: string, updates: Partial<ChatConversation>) => {
  try {
    const { conversation } = await api.patch<{ conversation: ChatConversation }>(`/api/chat/conversations/${id}`, updates);
    return conversation;
  } catch (e) { return null; }
};

export const deleteConversation = async (id: string) => {
  try {
    await api.delete(`/api/chat/conversations/${id}`);
    return true;
  } catch (e) { return false; }
};

export const archiveConversation = (id: string) => updateConversation(id, { isArchived: true });
export const togglePinConversation = async (id: string) => {
  const convo = await getConversation(id);
  if (!convo) return false;
  return !!await updateConversation(id, { isPinned: !convo.isPinned });
}

// Message Operations

export const addMessage = async (conversationId: string, message: Partial<ChatMessage>) => {
  try {
    const { message: newTask } = await api.post<{ message: ChatMessage }>(`/api/chat/conversations/${conversationId}/messages`, message);
    return newTask;
  } catch (e) { return null; }
}

export const getMessages = async (conversationId: string, options?: { limit?: number; offset?: number; order?: 'asc' | 'desc' }) => {
  try {
    const { messages } = await api.get<{ messages: ChatMessage[] }>(`/api/chat/conversations/${conversationId}/messages`);
    return messages;
  } catch (e) { return []; }
}

export const getConversationWithMessages = async (conversationId: string) => {
  const conversation = await getConversation(conversationId);
  if (!conversation) return null;
  const messages = await getMessages(conversationId);
  return { conversation, messages };
}

// Voice & Settings (Stubbed for now or mapped to user profile)
export const getChatSettings = async () => {
  // Map to user preferences
  try {
    const { preferences } = await api.get<{ preferences: any }>('/api/user/preferences');
    return preferences?.chat_settings || { auto_save: true, default_mode: 'design' };
  } catch (e) { return null; }
}

export const updateChatSettings = async (settings: Partial<ChatSettings>) => {
  try {
    await api.patch('/api/user/preferences', { chat_settings: settings });
    return true;
  } catch (e) { return false; }
}

export const saveVoiceTranscript = async (transcript: any) => {
  try {
    const { data } = await api.post<{ data: VoiceTranscript }>('/api/chat/transcripts', transcript);
    return data;
  } catch (e) { return null; }
}

// Export functions using Storage service
export const saveConversationExport = async (conversationId: string) => {
  const data = await getConversationWithMessages(conversationId);
  if (!data) return null;
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const file = new File([blob], `conversation_${conversationId}.json`, { type: 'application/json' });

  // Upload using generic storage service
  const { data: uploadData } = await uploadImage('user_id_placeholder', file, 'chat-exports'); // Refactor uploadImage to be generic uploadFile if needed
  if (!uploadData) return null;

  const { data: urlData } = await getPublicUrl(uploadData.path, 'chat-exports');
  return urlData.publicUrl;
}
