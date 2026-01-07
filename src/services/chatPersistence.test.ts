import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createConversation,
  getConversations,
  getConversation,
  updateConversation,
  deleteConversation,
  archiveConversation,
  togglePinConversation,
  addMessage,
  getMessages,
  getConversationWithMessages,
  getChatSettings,
  updateChatSettings,
  saveVoiceTranscript,
  saveConversationExport,
  type ChatConversation,
  type ChatMessage,
  type VoiceTranscript,
  type ChatSettings,
} from './chatPersistence';
import { api } from './api';

// Mock the api module
vi.mock('./api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock storage service
vi.mock('./storage', () => ({
  uploadImage: vi.fn(),
  getPublicUrl: vi.fn(),
}));

describe('Chat Persistence Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createConversation', () => {
    it('should create a new conversation', async () => {
      const mockConversation: ChatConversation = {
        id: 'conv-123',
        userId: 'user-456',
        title: 'New Design Chat',
        mode: 'design',
        isArchived: false,
        isPinned: false,
        metadata: {},
        createdAt: '2026-01-07T00:00:00Z',
        updatedAt: '2026-01-07T00:00:00Z',
        lastMessageAt: '2026-01-07T00:00:00Z',
      };

      vi.mocked(api.post).mockResolvedValue({ conversation: mockConversation });

      const result = await createConversation('design', 'New Design Chat');

      expect(api.post).toHaveBeenCalledWith('/api/chat/conversations', {
        mode: 'design',
        title: 'New Design Chat',
      });
      expect(result).toEqual(mockConversation);
    });

    it('should create conversation with default mode', async () => {
      const mockConversation: ChatConversation = {
        id: 'conv-123',
        userId: 'user-456',
        title: 'Chat',
        mode: 'design',
        isArchived: false,
        isPinned: false,
        metadata: {},
        createdAt: '2026-01-07T00:00:00Z',
        updatedAt: '2026-01-07T00:00:00Z',
        lastMessageAt: '2026-01-07T00:00:00Z',
      };

      vi.mocked(api.post).mockResolvedValue({ conversation: mockConversation });

      const result = await createConversation();

      expect(api.post).toHaveBeenCalledWith('/api/chat/conversations', {
        mode: 'design',
        title: undefined,
      });
      expect(result).toEqual(mockConversation);
    });

    it('should return null on error', async () => {
      vi.mocked(api.post).mockRejectedValue(new Error('Network error'));

      const result = await createConversation('design');

      expect(result).toBeNull();
    });
  });

  describe('getConversations', () => {
    it('should fetch all conversations', async () => {
      const mockConversations: ChatConversation[] = [
        {
          id: 'conv-1',
          userId: 'user-1',
          title: 'Chat 1',
          mode: 'design',
          isArchived: false,
          isPinned: false,
          metadata: {},
          createdAt: '2026-01-07T00:00:00Z',
          updatedAt: '2026-01-07T00:00:00Z',
          lastMessageAt: '2026-01-07T00:00:00Z',
        },
        {
          id: 'conv-2',
          userId: 'user-1',
          title: 'Chat 2',
          mode: 'voice',
          isArchived: false,
          isPinned: true,
          metadata: {},
          createdAt: '2026-01-06T00:00:00Z',
          updatedAt: '2026-01-06T00:00:00Z',
          lastMessageAt: '2026-01-06T00:00:00Z',
        },
      ];

      vi.mocked(api.get).mockResolvedValue({ conversations: mockConversations });

      const result = await getConversations();

      expect(api.get).toHaveBeenCalledWith('/api/chat/conversations?');
      expect(result).toEqual(mockConversations);
    });

    it('should fetch conversations with filters', async () => {
      const mockConversations: ChatConversation[] = [];
      vi.mocked(api.get).mockResolvedValue({ conversations: mockConversations });

      await getConversations({ mode: 'voice', includeArchived: true, limit: 10 });

      expect(api.get).toHaveBeenCalledWith('/api/chat/conversations?mode=voice&archived=true&limit=10');
    });

    it('should return empty array on error', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Database error'));

      const result = await getConversations();

      expect(result).toEqual([]);
    });
  });

  describe('getConversation', () => {
    it('should fetch a single conversation by id', async () => {
      const mockConversation: ChatConversation = {
        id: 'conv-123',
        userId: 'user-456',
        title: 'My Chat',
        mode: 'design',
        isArchived: false,
        isPinned: false,
        metadata: { tags: ['important'] },
        createdAt: '2026-01-07T00:00:00Z',
        updatedAt: '2026-01-07T00:00:00Z',
        lastMessageAt: '2026-01-07T00:00:00Z',
      };

      vi.mocked(api.get).mockResolvedValue({ conversation: mockConversation });

      const result = await getConversation('conv-123');

      expect(api.get).toHaveBeenCalledWith('/api/chat/conversations/conv-123');
      expect(result).toEqual(mockConversation);
    });

    it('should return null on error', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Not found'));

      const result = await getConversation('invalid-id');

      expect(result).toBeNull();
    });
  });

  describe('updateConversation', () => {
    it('should update conversation properties', async () => {
      const mockUpdatedConversation: ChatConversation = {
        id: 'conv-123',
        userId: 'user-456',
        title: 'Updated Title',
        mode: 'design',
        isArchived: false,
        isPinned: true,
        metadata: {},
        createdAt: '2026-01-07T00:00:00Z',
        updatedAt: '2026-01-07T01:00:00Z',
        lastMessageAt: '2026-01-07T01:00:00Z',
      };

      vi.mocked(api.patch).mockResolvedValue({ conversation: mockUpdatedConversation });

      const result = await updateConversation('conv-123', { title: 'Updated Title', isPinned: true });

      expect(api.patch).toHaveBeenCalledWith('/api/chat/conversations/conv-123', {
        title: 'Updated Title',
        isPinned: true,
      });
      expect(result).toEqual(mockUpdatedConversation);
    });

    it('should return null on error', async () => {
      vi.mocked(api.patch).mockRejectedValue(new Error('Update failed'));

      const result = await updateConversation('conv-123', { title: 'New' });

      expect(result).toBeNull();
    });
  });

  describe('deleteConversation', () => {
    it('should delete a conversation', async () => {
      vi.mocked(api.delete).mockResolvedValue({});

      const result = await deleteConversation('conv-123');

      expect(api.delete).toHaveBeenCalledWith('/api/chat/conversations/conv-123');
      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      vi.mocked(api.delete).mockRejectedValue(new Error('Delete failed'));

      const result = await deleteConversation('conv-123');

      expect(result).toBe(false);
    });
  });

  describe('archiveConversation', () => {
    it('should archive a conversation', async () => {
      const mockArchivedConversation: ChatConversation = {
        id: 'conv-123',
        userId: 'user-456',
        title: 'Archived Chat',
        mode: 'design',
        isArchived: true,
        isPinned: false,
        metadata: {},
        createdAt: '2026-01-07T00:00:00Z',
        updatedAt: '2026-01-07T01:00:00Z',
        lastMessageAt: '2026-01-07T01:00:00Z',
      };

      vi.mocked(api.patch).mockResolvedValue({ conversation: mockArchivedConversation });

      const result = await archiveConversation('conv-123');

      expect(api.patch).toHaveBeenCalledWith('/api/chat/conversations/conv-123', { isArchived: true });
      expect(result?.isArchived).toBe(true);
    });
  });

  describe('togglePinConversation', () => {
    it('should toggle pin status from unpinned to pinned', async () => {
      const unpinnedConversation: ChatConversation = {
        id: 'conv-123',
        userId: 'user-456',
        title: 'Chat',
        mode: 'design',
        isArchived: false,
        isPinned: false,
        metadata: {},
        createdAt: '2026-01-07T00:00:00Z',
        updatedAt: '2026-01-07T00:00:00Z',
        lastMessageAt: '2026-01-07T00:00:00Z',
      };

      const pinnedConversation: ChatConversation = { ...unpinnedConversation, isPinned: true };

      vi.mocked(api.get).mockResolvedValue({ conversation: unpinnedConversation });
      vi.mocked(api.patch).mockResolvedValue({ conversation: pinnedConversation });

      const result = await togglePinConversation('conv-123');

      expect(api.get).toHaveBeenCalledWith('/api/chat/conversations/conv-123');
      expect(api.patch).toHaveBeenCalledWith('/api/chat/conversations/conv-123', { isPinned: true });
      expect(result).toBe(true);
    });

    it('should return false when conversation not found', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Not found'));

      const result = await togglePinConversation('invalid-id');

      expect(result).toBe(false);
    });
  });

  describe('addMessage', () => {
    it('should add a message to a conversation', async () => {
      const mockMessage: ChatMessage = {
        id: 'msg-123',
        conversationId: 'conv-456',
        userId: 'user-789',
        role: 'user',
        content: 'Hello, AI!',
        createdAt: '2026-01-07T00:00:00Z',
      };

      vi.mocked(api.post).mockResolvedValue({ message: mockMessage });

      const result = await addMessage('conv-456', {
        role: 'user',
        content: 'Hello, AI!',
      });

      expect(api.post).toHaveBeenCalledWith('/api/chat/conversations/conv-456/messages', {
        role: 'user',
        content: 'Hello, AI!',
      });
      expect(result).toEqual(mockMessage);
    });

    it('should return null on error', async () => {
      vi.mocked(api.post).mockRejectedValue(new Error('Add message failed'));

      const result = await addMessage('conv-456', { role: 'user', content: 'Test' });

      expect(result).toBeNull();
    });
  });

  describe('getMessages', () => {
    it('should fetch messages for a conversation', async () => {
      const mockMessages: ChatMessage[] = [
        {
          id: 'msg-1',
          conversationId: 'conv-123',
          userId: 'user-456',
          role: 'user',
          content: 'First message',
          createdAt: '2026-01-07T00:00:00Z',
        },
        {
          id: 'msg-2',
          conversationId: 'conv-123',
          userId: 'user-456',
          role: 'assistant',
          content: 'AI response',
          modelUsed: 'gemini-3-pro-preview',
          tokensUsed: 150,
          createdAt: '2026-01-07T00:01:00Z',
        },
      ];

      vi.mocked(api.get).mockResolvedValue({ messages: mockMessages });

      const result = await getMessages('conv-123');

      expect(api.get).toHaveBeenCalledWith('/api/chat/conversations/conv-123/messages');
      expect(result).toEqual(mockMessages);
    });

    it('should return empty array on error', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Fetch failed'));

      const result = await getMessages('conv-123');

      expect(result).toEqual([]);
    });
  });

  describe('getConversationWithMessages', () => {
    it('should fetch conversation and its messages', async () => {
      const mockConversation: ChatConversation = {
        id: 'conv-123',
        userId: 'user-456',
        title: 'Chat with Messages',
        mode: 'design',
        isArchived: false,
        isPinned: false,
        metadata: {},
        createdAt: '2026-01-07T00:00:00Z',
        updatedAt: '2026-01-07T00:00:00Z',
        lastMessageAt: '2026-01-07T00:00:00Z',
      };

      const mockMessages: ChatMessage[] = [
        {
          id: 'msg-1',
          conversationId: 'conv-123',
          userId: 'user-456',
          role: 'user',
          content: 'Test message',
          createdAt: '2026-01-07T00:00:00Z',
        },
      ];

      vi.mocked(api.get)
        .mockResolvedValueOnce({ conversation: mockConversation })
        .mockResolvedValueOnce({ messages: mockMessages });

      const result = await getConversationWithMessages('conv-123');

      expect(result).toEqual({
        conversation: mockConversation,
        messages: mockMessages,
      });
    });

    it('should return null when conversation not found', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Not found'));

      const result = await getConversationWithMessages('invalid-id');

      expect(result).toBeNull();
    });
  });

  describe('getChatSettings', () => {
    it('should fetch chat settings from user preferences', async () => {
      const mockPreferences = {
        preferences: {
          chat_settings: {
            auto_save: true,
            save_images: true,
            default_mode: 'voice',
            voice_provider: 'openai',
            auto_approve_actions: false,
          },
        },
      };

      vi.mocked(api.get).mockResolvedValue(mockPreferences);

      const result = await getChatSettings();

      expect(api.get).toHaveBeenCalledWith('/api/user/preferences');
      expect(result).toEqual(mockPreferences.preferences.chat_settings);
    });

    it('should return default settings when preferences not found', async () => {
      vi.mocked(api.get).mockResolvedValue({ preferences: {} });

      const result = await getChatSettings();

      expect(result).toEqual({ auto_save: true, default_mode: 'design' });
    });

    it('should return null on error', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Fetch failed'));

      const result = await getChatSettings();

      expect(result).toBeNull();
    });
  });

  describe('updateChatSettings', () => {
    it('should update chat settings in user preferences', async () => {
      const settingsUpdate: Partial<ChatSettings> = {
        auto_save: false,
        voice_provider: 'gemini',
      };

      vi.mocked(api.patch).mockResolvedValue({});

      const result = await updateChatSettings(settingsUpdate);

      expect(api.patch).toHaveBeenCalledWith('/api/user/preferences', {
        chat_settings: settingsUpdate,
      });
      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      vi.mocked(api.patch).mockRejectedValue(new Error('Update failed'));

      const result = await updateChatSettings({ auto_save: false });

      expect(result).toBe(false);
    });
  });

  describe('saveVoiceTranscript', () => {
    it('should save voice transcript', async () => {
      const mockTranscript: VoiceTranscript = {
        id: 'trans-123',
        userId: 'user-456',
        conversationId: 'conv-789',
        role: 'user',
        content: 'Create a banner with blue background',
        audioDurationMs: 3500,
        provider: 'openai',
        createdAt: '2026-01-07T00:00:00Z',
      };

      vi.mocked(api.post).mockResolvedValue({ data: mockTranscript });

      const result = await saveVoiceTranscript({
        role: 'user',
        content: 'Create a banner with blue background',
        audioDurationMs: 3500,
        provider: 'openai',
      });

      expect(api.post).toHaveBeenCalledWith('/api/chat/transcripts', expect.any(Object));
      expect(result).toEqual(mockTranscript);
    });

    it('should return null on error', async () => {
      vi.mocked(api.post).mockRejectedValue(new Error('Save failed'));

      const result = await saveVoiceTranscript({ role: 'user', content: 'Test' });

      expect(result).toBeNull();
    });
  });

  describe('saveConversationExport', () => {
    it('should export conversation with messages', async () => {
      const mockConversation: ChatConversation = {
        id: 'conv-123',
        userId: 'user-456',
        title: 'Export Test',
        mode: 'design',
        isArchived: false,
        isPinned: false,
        metadata: {},
        createdAt: '2026-01-07T00:00:00Z',
        updatedAt: '2026-01-07T00:00:00Z',
        lastMessageAt: '2026-01-07T00:00:00Z',
      };

      const mockMessages: ChatMessage[] = [
        {
          id: 'msg-1',
          conversationId: 'conv-123',
          userId: 'user-456',
          role: 'user',
          content: 'Test',
          createdAt: '2026-01-07T00:00:00Z',
        },
      ];

      vi.mocked(api.get)
        .mockResolvedValueOnce({ conversation: mockConversation })
        .mockResolvedValueOnce({ messages: mockMessages });

      const { uploadImage, getPublicUrl } = await import('./storage');
      vi.mocked(uploadImage).mockResolvedValue({
        data: { path: 'exports/conversation_conv-123.json' },
        error: null,
      });
      vi.mocked(getPublicUrl).mockResolvedValue({
        data: { publicUrl: 'https://storage.example.com/exports/conversation_conv-123.json' },
        error: null,
      });

      const result = await saveConversationExport('conv-123');

      expect(uploadImage).toHaveBeenCalled();
      expect(getPublicUrl).toHaveBeenCalledWith('exports/conversation_conv-123.json', 'chat-exports');
      expect(result).toBe('https://storage.example.com/exports/conversation_conv-123.json');
    });

    it('should return null when conversation not found', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Not found'));

      const result = await saveConversationExport('invalid-id');

      expect(result).toBeNull();
    });

    it('should return null when upload fails', async () => {
      const mockConversation: ChatConversation = {
        id: 'conv-123',
        userId: 'user-456',
        title: 'Export Test',
        mode: 'design',
        isArchived: false,
        isPinned: false,
        metadata: {},
        createdAt: '2026-01-07T00:00:00Z',
        updatedAt: '2026-01-07T00:00:00Z',
        lastMessageAt: '2026-01-07T00:00:00Z',
      };

      vi.mocked(api.get)
        .mockResolvedValueOnce({ conversation: mockConversation })
        .mockResolvedValueOnce({ messages: [] });

      const { uploadImage } = await import('./storage');
      vi.mocked(uploadImage).mockResolvedValue({ data: null, error: 'Upload failed' });

      const result = await saveConversationExport('conv-123');

      expect(result).toBeNull();
    });
  });
});
