// Chat Persistence Service - Supabase storage for conversations and messages

import { supabase as supabaseClient } from './auth';

// Types
export interface ChatConversation {
  id: string;
  user_id: string;
  title: string;
  mode: 'design' | 'search' | 'voice';
  is_archived: boolean;
  is_pinned: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  last_message_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tool_calls?: ToolCall[];
  tool_results?: ToolResult[];
  images?: string[];
  generated_images?: string[];
  model_used?: string;
  tokens_used?: number;
  response_time_ms?: number;
  created_at: string;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolResult {
  tool_call_id: string;
  success: boolean;
  result?: unknown;
  error?: string;
}

export interface VoiceTranscript {
  id: string;
  user_id: string;
  conversation_id?: string;
  role: 'user' | 'assistant';
  content: string;
  audio_duration_ms?: number;
  tool_calls?: ToolCall[];
  provider?: 'gemini' | 'openai';
  created_at: string;
}

export interface ChatSettings {
  auto_save: boolean;
  save_images: boolean;
  default_mode: 'design' | 'search' | 'voice';
  voice_provider: 'gemini' | 'openai';
  auto_approve_actions: boolean;
}

// Get Supabase client
const getSupabase = () => {
  if (!supabaseClient) {
    console.warn('[ChatPersistence] Supabase not configured');
    return null;
  }
  return supabaseClient;
};

// Proxy for safe access
const supabase = new Proxy({} as NonNullable<typeof supabaseClient>, {
  get(_target, prop) {
    const client = getSupabase();
    if (!client) {
      throw new Error('Supabase not configured');
    }
    return client[prop as keyof typeof client];
  },
});

// ============================================================================
// CONVERSATION OPERATIONS
// ============================================================================

/**
 * Create a new conversation
 */
export const createConversation = async (
  mode: 'design' | 'search' | 'voice' = 'design',
  title?: string
): Promise<ChatConversation | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.warn('[ChatPersistence] User not authenticated');
    return null;
  }

  const { data, error } = await supabase
    .from('chat_conversations')
    .insert({
      user_id: user.id,
      title: title || 'New Conversation',
      mode,
    })
    .select()
    .single();

  if (error) {
    console.error('[ChatPersistence] Create conversation error:', error);
    return null;
  }

  console.log('[ChatPersistence] Created conversation:', data.id);
  return data;
};

/**
 * Get all conversations for current user
 */
export const getConversations = async (options?: {
  mode?: 'design' | 'search' | 'voice';
  includeArchived?: boolean;
  limit?: number;
}): Promise<ChatConversation[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from('chat_conversations')
    .select('*')
    .eq('user_id', user.id);

  if (options?.mode) {
    query = query.eq('mode', options.mode);
  }

  if (!options?.includeArchived) {
    query = query.eq('is_archived', false);
  }

  query = query
    .order('is_pinned', { ascending: false })
    .order('last_message_at', { ascending: false })
    .limit(options?.limit || 50);

  const { data, error } = await query;

  if (error) {
    console.error('[ChatPersistence] Get conversations error:', error);
    return [];
  }

  return data || [];
};

/**
 * Get a single conversation by ID
 */
export const getConversation = async (conversationId: string): Promise<ChatConversation | null> => {
  const { data, error } = await supabase
    .from('chat_conversations')
    .select('*')
    .eq('id', conversationId)
    .single();

  if (error) {
    console.error('[ChatPersistence] Get conversation error:', error);
    return null;
  }

  return data;
};

/**
 * Update conversation
 */
export const updateConversation = async (
  conversationId: string,
  updates: Partial<Pick<ChatConversation, 'title' | 'is_archived' | 'is_pinned' | 'metadata'>>
): Promise<ChatConversation | null> => {
  const { data, error } = await supabase
    .from('chat_conversations')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', conversationId)
    .select()
    .single();

  if (error) {
    console.error('[ChatPersistence] Update conversation error:', error);
    return null;
  }

  return data;
};

/**
 * Delete conversation (and all messages)
 */
export const deleteConversation = async (conversationId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('chat_conversations')
    .delete()
    .eq('id', conversationId);

  if (error) {
    console.error('[ChatPersistence] Delete conversation error:', error);
    return false;
  }

  console.log('[ChatPersistence] Deleted conversation:', conversationId);
  return true;
};

/**
 * Archive conversation
 */
export const archiveConversation = async (conversationId: string): Promise<boolean> => {
  const result = await updateConversation(conversationId, { is_archived: true });
  return result !== null;
};

/**
 * Pin/unpin conversation
 */
export const togglePinConversation = async (conversationId: string): Promise<boolean> => {
  const conversation = await getConversation(conversationId);
  if (!conversation) return false;

  const result = await updateConversation(conversationId, { is_pinned: !conversation.is_pinned });
  return result !== null;
};

// ============================================================================
// MESSAGE OPERATIONS
// ============================================================================

/**
 * Add a message to a conversation
 */
export const addMessage = async (
  conversationId: string,
  message: {
    role: 'user' | 'assistant' | 'system';
    content: string;
    tool_calls?: ToolCall[];
    tool_results?: ToolResult[];
    images?: string[];
    generated_images?: string[];
    model_used?: string;
    tokens_used?: number;
    response_time_ms?: number;
  }
): Promise<ChatMessage | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.warn('[ChatPersistence] User not authenticated');
    return null;
  }

  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      conversation_id: conversationId,
      user_id: user.id,
      role: message.role,
      content: message.content,
      tool_calls: message.tool_calls || null,
      tool_results: message.tool_results || null,
      images: message.images || [],
      generated_images: message.generated_images || [],
      model_used: message.model_used,
      tokens_used: message.tokens_used,
      response_time_ms: message.response_time_ms,
    })
    .select()
    .single();

  if (error) {
    console.error('[ChatPersistence] Add message error:', error);
    return null;
  }

  console.log('[ChatPersistence] Added message:', data.id);
  return data;
};

/**
 * Get messages for a conversation
 */
export const getMessages = async (
  conversationId: string,
  options?: {
    limit?: number;
    offset?: number;
    order?: 'asc' | 'desc';
  }
): Promise<ChatMessage[]> => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: options?.order !== 'desc' })
    .range(options?.offset || 0, (options?.offset || 0) + (options?.limit || 100) - 1);

  if (error) {
    console.error('[ChatPersistence] Get messages error:', error);
    return [];
  }

  return data || [];
};

/**
 * Delete a message
 */
export const deleteMessage = async (messageId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('chat_messages')
    .delete()
    .eq('id', messageId);

  if (error) {
    console.error('[ChatPersistence] Delete message error:', error);
    return false;
  }

  return true;
};

/**
 * Get conversation with messages
 */
export const getConversationWithMessages = async (
  conversationId: string
): Promise<{ conversation: ChatConversation; messages: ChatMessage[] } | null> => {
  const conversation = await getConversation(conversationId);
  if (!conversation) return null;

  const messages = await getMessages(conversationId);

  return { conversation, messages };
};

// ============================================================================
// VOICE TRANSCRIPT OPERATIONS
// ============================================================================

/**
 * Save voice transcript entry
 */
export const saveVoiceTranscript = async (
  transcript: {
    role: 'user' | 'assistant';
    content: string;
    conversation_id?: string;
    audio_duration_ms?: number;
    tool_calls?: ToolCall[];
    provider?: 'gemini' | 'openai';
  }
): Promise<VoiceTranscript | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('voice_transcripts')
    .insert({
      user_id: user.id,
      ...transcript,
    })
    .select()
    .single();

  if (error) {
    console.error('[ChatPersistence] Save voice transcript error:', error);
    return null;
  }

  return data;
};

/**
 * Get voice transcripts
 */
export const getVoiceTranscripts = async (options?: {
  conversationId?: string;
  limit?: number;
}): Promise<VoiceTranscript[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from('voice_transcripts')
    .select('*')
    .eq('user_id', user.id);

  if (options?.conversationId) {
    query = query.eq('conversation_id', options.conversationId);
  }

  query = query
    .order('created_at', { ascending: false })
    .limit(options?.limit || 100);

  const { data, error } = await query;

  if (error) {
    console.error('[ChatPersistence] Get voice transcripts error:', error);
    return [];
  }

  return data || [];
};

// ============================================================================
// CHAT SETTINGS OPERATIONS
// ============================================================================

/**
 * Get user's chat settings
 */
export const getChatSettings = async (): Promise<ChatSettings | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_preferences')
    .select('chat_settings')
    .eq('user_id', user.id)
    .single();

  if (error) {
    // Return defaults if not found
    return {
      auto_save: true,
      save_images: true,
      default_mode: 'design',
      voice_provider: 'gemini',
      auto_approve_actions: false,
    };
  }

  return data?.chat_settings as ChatSettings || {
    auto_save: true,
    save_images: true,
    default_mode: 'design',
    voice_provider: 'gemini',
    auto_approve_actions: false,
  };
};

/**
 * Update user's chat settings
 */
export const updateChatSettings = async (settings: Partial<ChatSettings>): Promise<boolean> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  // Get current settings
  const currentSettings = await getChatSettings();
  const newSettings = { ...currentSettings, ...settings };

  const { error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: user.id,
      chat_settings: newSettings,
    });

  if (error) {
    console.error('[ChatPersistence] Update chat settings error:', error);
    return false;
  }

  return true;
};

// ============================================================================
// EXPORT OPERATIONS
// ============================================================================

/**
 * Export conversation to JSON
 */
export const exportConversation = async (conversationId: string): Promise<string | null> => {
  const result = await getConversationWithMessages(conversationId);
  if (!result) return null;

  const exportData = {
    exported_at: new Date().toISOString(),
    conversation: result.conversation,
    messages: result.messages,
  };

  return JSON.stringify(exportData, null, 2);
};

/**
 * Save conversation export to storage
 */
export const saveConversationExport = async (conversationId: string): Promise<string | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const exportJson = await exportConversation(conversationId);
  if (!exportJson) return null;

  const fileName = `${user.id}/${conversationId}_${Date.now()}.json`;
  const blob = new Blob([exportJson], { type: 'application/json' });
  const file = new File([blob], `conversation_${conversationId}.json`, { type: 'application/json' });

  const { error } = await supabase.storage
    .from('chat-exports')
    .upload(fileName, file);

  if (error) {
    console.error('[ChatPersistence] Save export error:', error);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('chat-exports')
    .getPublicUrl(fileName);

  return publicUrl;
};

// ============================================================================
// STORAGE QUOTA
// ============================================================================

/**
 * Get user's storage usage
 */
export const getStorageUsage = async (): Promise<{ used: number; limit: number }> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { used: 0, limit: 0 };

  // Calculate from images table
  const { data } = await supabase.rpc('calculate_user_storage', { p_user_id: user.id });

  // Default limit: 500MB for free tier
  const limitBytes = 500 * 1024 * 1024;

  return {
    used: data || 0,
    limit: limitBytes,
  };
};

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Save multiple messages at once (for importing or syncing)
 */
export const addMessagesBatch = async (
  conversationId: string,
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    created_at?: string;
  }>
): Promise<ChatMessage[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const messagesToInsert = messages.map((msg) => ({
    conversation_id: conversationId,
    user_id: user.id,
    role: msg.role,
    content: msg.content,
    created_at: msg.created_at || new Date().toISOString(),
  }));

  const { data, error } = await supabase
    .from('chat_messages')
    .insert(messagesToInsert)
    .select();

  if (error) {
    console.error('[ChatPersistence] Batch insert error:', error);
    return [];
  }

  return data || [];
};

/**
 * Delete all conversations (clear history)
 */
export const clearAllConversations = async (): Promise<boolean> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('chat_conversations')
    .delete()
    .eq('user_id', user.id);

  if (error) {
    console.error('[ChatPersistence] Clear conversations error:', error);
    return false;
  }

  console.log('[ChatPersistence] Cleared all conversations for user');
  return true;
};
