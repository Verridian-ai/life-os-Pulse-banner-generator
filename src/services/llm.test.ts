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

describe('LLM Service Routing', () => {
  beforeEach(() => {
    localStorageMock.clear();
    fetchMock.mockClear();

    // Default mock response for OpenRouter
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Mocked OpenRouter Response' } }],
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
      'https://openrouter.ai/api/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer sk-test-key',
          'X-Title': 'NanoBanna Pro',
        }),
        body: expect.stringContaining('"model":"google/gemini-3-pro-preview"'),
      }),
    );
  });

  it('should route Image calls to OpenRouter with correct image model', async () => {
    // Setup Settings
    localStorageMock.setItem('llm_provider', 'openrouter');
    localStorageMock.setItem('openrouter_api_key', 'sk-test-key');

    // Mock response with an image URL
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Here is your image: https://example.com/image.png' } }],
      }),
    });

    const result = await generateImage('A cool banner');

    // Should use the imageGen model constant
    expect(fetchMock).toHaveBeenCalledWith(
      'https://openrouter.ai/api/v1/chat/completions',
      expect.objectContaining({
        body: expect.stringContaining(`"model":"${MODELS.imageGen}"`),
      }),
    );

    expect(result).toBe('https://example.com/image.png');
  });
});
