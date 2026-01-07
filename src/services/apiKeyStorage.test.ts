import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getUserAPIKeys,
  getVoiceAPIKey,
  saveUserAPIKeys,
  deleteUserAPIKeys,
  migrateLocalStorageToNeon,
  type UserAPIKeys,
} from './apiKeyStorage';
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

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('API Key Storage Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getUserAPIKeys', () => {
    it('should return masked API keys from backend', async () => {
      const mockResponse = {
        apiKeys: {
          geminiApiKey: '****1234',
          openaiApiKey: '****5678',
          openrouterApiKey: '****9012',
          replicateApiKey: '****3456',
          llmProvider: 'openrouter',
          llmModel: 'google/gemini-3-pro-preview',
          llmImageModel: 'google/gemini-3-pro-image-preview',
          llmMagicEditModel: 'minimax/minimax-m2-plus',
          llmUpscaleModel: 'stability-ai/esrgan',
          hasGeminiKey: true,
          hasOpenaiKey: true,
          hasOpenrouterKey: true,
          hasReplicateKey: true,
        },
        hasProductKeys: true,
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await getUserAPIKeys();

      expect(api.get).toHaveBeenCalledWith('/api/user/api-keys');
      expect(result).toEqual({
        gemini_api_key: '****1234',
        openai_api_key: '****5678',
        openrouter_api_key: '****9012',
        replicate_api_key: '****3456',
        llm_provider: 'openrouter',
        llm_model: 'google/gemini-3-pro-preview',
        llm_image_model: 'google/gemini-3-pro-image-preview',
        llm_magic_edit_model: 'minimax/minimax-m2-plus',
        llm_upscale_model: 'stability-ai/esrgan',
        hasGeminiKey: true,
        hasOpenaiKey: true,
        hasOpenrouterKey: true,
        hasReplicateKey: true,
        hasProductKeys: true,
      });
    });

    it('should return fallback keys when no API keys found', async () => {
      vi.mocked(api.get).mockResolvedValue({ apiKeys: null, hasProductKeys: false });

      const result = await getUserAPIKeys();

      // When apiKeys is null but response exists, it still maps all fields with defaults
      expect(result).toEqual({
        gemini_api_key: undefined,
        openai_api_key: undefined,
        openrouter_api_key: undefined,
        replicate_api_key: undefined,
        llm_provider: 'openrouter',
        llm_model: undefined,
        llm_image_model: undefined,
        llm_magic_edit_model: undefined,
        llm_upscale_model: undefined,
        hasGeminiKey: false,
        hasOpenaiKey: false,
        hasOpenrouterKey: false,
        hasReplicateKey: false,
        hasProductKeys: false,
      });
    });

    it('should return fallback keys on error', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Network error'));

      const result = await getUserAPIKeys();

      expect(result).toEqual({
        llm_provider: 'openrouter',
      });
    });

    it('should handle partial API keys response', async () => {
      const mockResponse = {
        apiKeys: {
          geminiApiKey: '****1234',
          hasGeminiKey: true,
          llmProvider: 'gemini',
        },
        hasProductKeys: false,
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await getUserAPIKeys();

      expect(result.gemini_api_key).toBe('****1234');
      expect(result.openai_api_key).toBeUndefined();
      expect(result.hasGeminiKey).toBe(true);
      expect(result.hasOpenaiKey).toBe(false);
    });
  });

  describe('getVoiceAPIKey', () => {
    it('should return actual voice API key', async () => {
      const mockResponse = {
        voiceKey: 'sk-actual-openai-key-12345',
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await getVoiceAPIKey();

      expect(api.get).toHaveBeenCalledWith('/api/user/voice-key');
      expect(result).toEqual({ voiceKey: 'sk-actual-openai-key-12345' });
    });

    it('should return error when voice key not found', async () => {
      const mockResponse = {
        error: 'Voice key not configured',
        requiresKey: true,
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await getVoiceAPIKey();

      expect(result).toEqual({
        error: 'Voice key not configured',
        requiresKey: true,
      });
    });

    it('should handle API errors gracefully', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Network timeout'));

      const result = await getVoiceAPIKey();

      expect(result).toEqual({ error: 'Network timeout' });
    });
  });

  describe('saveUserAPIKeys', () => {
    it('should save API keys to backend', async () => {
      const keysToSave: UserAPIKeys = {
        gemini_api_key: 'sk-gemini-test-key',
        openai_api_key: 'sk-openai-test-key',
        openrouter_api_key: 'sk-openrouter-test-key',
        replicate_api_key: 'r8_replicate_test_key',
        llm_provider: 'openrouter',
        llm_model: 'google/gemini-3-pro-preview',
        llm_image_model: 'google/gemini-3-pro-image-preview',
        llm_magic_edit_model: 'minimax/minimax-m2-plus',
        llm_upscale_model: 'stability-ai/esrgan',
      };

      vi.mocked(api.post).mockResolvedValue({ success: true });

      const result = await saveUserAPIKeys(keysToSave);

      expect(api.post).toHaveBeenCalledWith('/api/user/api-keys', {
        geminiApiKey: 'sk-gemini-test-key',
        openaiApiKey: 'sk-openai-test-key',
        openrouterApiKey: 'sk-openrouter-test-key',
        replicateApiKey: 'r8_replicate_test_key',
        llmProvider: 'openrouter',
        llmModel: 'google/gemini-3-pro-preview',
        llmImageModel: 'google/gemini-3-pro-image-preview',
        llmMagicEditModel: 'minimax/minimax-m2-plus',
        llmUpscaleModel: 'stability-ai/esrgan',
      });
      expect(result).toEqual({ success: true });
    });

    it('should handle save errors', async () => {
      const keysToSave: UserAPIKeys = {
        gemini_api_key: 'sk-test',
        llm_provider: 'gemini',
      };

      vi.mocked(api.post).mockResolvedValue({ success: false, error: 'Database error' });

      const result = await saveUserAPIKeys(keysToSave);

      expect(result).toEqual({ success: false, error: 'Database error' });
    });

    it('should handle network errors during save', async () => {
      const keysToSave: UserAPIKeys = {
        gemini_api_key: 'sk-test',
        llm_provider: 'gemini',
      };

      vi.mocked(api.post).mockRejectedValue(new Error('Connection refused'));

      const result = await saveUserAPIKeys(keysToSave);

      expect(result).toEqual({ success: false, error: 'Connection refused' });
    });

    it('should save partial keys successfully', async () => {
      const keysToSave: UserAPIKeys = {
        openai_api_key: 'sk-openai-only',
      };

      vi.mocked(api.post).mockResolvedValue({ success: true });

      const result = await saveUserAPIKeys(keysToSave);

      expect(api.post).toHaveBeenCalledWith('/api/user/api-keys', {
        geminiApiKey: undefined,
        openaiApiKey: 'sk-openai-only',
        openrouterApiKey: undefined,
        replicateApiKey: undefined,
        llmProvider: undefined,
        llmModel: undefined,
        llmImageModel: undefined,
        llmMagicEditModel: undefined,
        llmUpscaleModel: undefined,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('deleteUserAPIKeys', () => {
    it('should delete all user API keys from backend', async () => {
      vi.mocked(api.delete).mockResolvedValue({ success: true });

      const result = await deleteUserAPIKeys();

      expect(api.delete).toHaveBeenCalledWith('/api/user/api-keys');
      expect(result).toEqual({ success: true });
    });

    it('should handle delete errors', async () => {
      vi.mocked(api.delete).mockResolvedValue({ success: false, error: 'Permission denied' });

      const result = await deleteUserAPIKeys();

      expect(result).toEqual({ success: false, error: 'Permission denied' });
    });

    it('should handle network errors during delete', async () => {
      vi.mocked(api.delete).mockRejectedValue(new Error('Request timeout'));

      const result = await deleteUserAPIKeys();

      expect(result).toEqual({ success: false, error: 'Request timeout' });
    });
  });

  describe('migrateLocalStorageToNeon', () => {
    it('should migrate localStorage keys to Neon database', async () => {
      localStorageMock.setItem('gemini_api_key', 'sk-gemini-old');
      localStorageMock.setItem('openai_api_key', 'sk-openai-old');
      localStorageMock.setItem('openrouter_api_key', 'sk-openrouter-old');
      localStorageMock.setItem('replicate_api_key', 'r8_replicate_old');
      localStorageMock.setItem('llm_provider', 'openrouter');
      localStorageMock.setItem('llm_model', 'google/gemini-3-pro-preview');

      vi.mocked(api.post).mockResolvedValue({ success: true });

      await migrateLocalStorageToNeon();

      expect(api.post).toHaveBeenCalledWith('/api/user/api-keys', {
        geminiApiKey: 'sk-gemini-old',
        openaiApiKey: 'sk-openai-old',
        openrouterApiKey: 'sk-openrouter-old',
        replicateApiKey: 'r8_replicate_old',
        llmProvider: 'openrouter',
        llmModel: 'google/gemini-3-pro-preview',
        llmImageModel: undefined,
        llmMagicEditModel: undefined,
        llmUpscaleModel: undefined,
      });

      // Verify localStorage cleanup
      expect(localStorageMock.getItem('gemini_api_key')).toBeNull();
      expect(localStorageMock.getItem('openai_api_key')).toBeNull();
      expect(localStorageMock.getItem('openrouter_api_key')).toBeNull();
      expect(localStorageMock.getItem('replicate_api_key')).toBeNull();
      expect(localStorageMock.getItem('llm_provider')).toBeNull();
      expect(localStorageMock.getItem('llm_model')).toBeNull();
    });

    it('should not attempt migration when no localStorage keys exist', async () => {
      await migrateLocalStorageToNeon();

      expect(api.post).not.toHaveBeenCalled();
    });

    it('should migrate only existing localStorage keys', async () => {
      localStorageMock.setItem('gemini_api_key', 'sk-gemini-only');
      localStorageMock.setItem('llm_provider', 'gemini');

      vi.mocked(api.post).mockResolvedValue({ success: true });

      await migrateLocalStorageToNeon();

      expect(api.post).toHaveBeenCalledWith('/api/user/api-keys', expect.objectContaining({
        geminiApiKey: 'sk-gemini-only',
        llmProvider: 'gemini',
      }));
    });

    it('should handle migration failures gracefully', async () => {
      localStorageMock.setItem('gemini_api_key', 'sk-test');

      vi.mocked(api.post).mockResolvedValue({ success: false, error: 'Migration failed' });

      // Should not throw
      await expect(migrateLocalStorageToNeon()).resolves.toBeUndefined();
    });
  });
});
