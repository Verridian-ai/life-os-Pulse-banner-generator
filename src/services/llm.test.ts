import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateDesignChatResponse, generateImage } from './llm';
import { MODELS } from '../constants';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock fetch
const fetchMock = vi.fn();
global.fetch = fetchMock;

// Mock apiKeyStorage to avoid fetch interference
vi.mock('./apiKeyStorage', () => ({
  getUserAPIKeys: vi.fn().mockResolvedValue({
    hasReplicateKey: false,
    canGenerateImages: true,
    hasProductKeys: true,
  }),
}));

describe('LLM Service Routing', () => {
  beforeEach(() => {
    localStorageMock.clear();
    fetchMock.mockClear();

    // Default mock response for Backend Proxy (Chat)
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        text: 'Mocked Response',
      }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should route Chat calls to OpenRouter when configured', async () => {
    // Setup Settings
    localStorageMock.setItem('llm_provider', 'openrouter');
    localStorageMock.setItem('openrouter_api_key', 'sk-test-key');
    // The default model from constants or settings
    localStorageMock.setItem('llm_model', 'google/gemini-3-pro-preview');

    await generateDesignChatResponse('Hello');

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/ai/chat'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: expect.stringContaining('"provider":"openrouter"'),
      }),
    );
  });

  it('should route Image calls to OpenRouter with correct image model', async () => {
    // Setup Settings
    localStorageMock.setItem('llm_provider', 'openrouter');
    localStorageMock.setItem('openrouter_api_key', 'sk-test-key');

    // Mock response with an image URL from Proxy
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        url: 'https://example.com/image.png',
      }),
    });

    const result = await generateImage('A cool banner');

    // Should use the imageGen model constant
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/ai/image/generate'),
      expect.objectContaining({
        body: expect.stringContaining(`"model":"${MODELS.imageGen}"`),
      }),
    );

    expect(result).toBe('https://example.com/image.png');
  });
});
