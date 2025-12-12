import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchOpenRouterModels,
  getLatestModels,
  filterModelsByCapability,
  sortModelsByCost,
  sortModelsByContext,
  getModelById,
  searchModels,
  getTopModels,
  formatModelPricing,
  clearModelCache,
  getCachedModels
} from './openrouter';

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

// Mock fetch
global.fetch = vi.fn();

describe('OpenRouter Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  const mockModels = [
    {
      id: 'openai/gpt-4',
      name: 'GPT-4',
      pricing: { prompt: '0.00003', completion: '0.00006' },
      context_length: 8192,
      architecture: { modality: 'text' }
    },
    {
      id: 'anthropic/claude-3-opus',
      name: 'Claude 3 Opus',
      pricing: { prompt: '0.000015', completion: '0.000075' },
      context_length: 200000,
      architecture: { modality: 'text+image' }
    },
    {
      id: 'google/gemini-pro-vision',
      name: 'Gemini Pro Vision',
      pricing: { prompt: '0.00025', completion: '0.0005' },
      context_length: 32768,
      architecture: { modality: 'multimodal' }
    }
  ];

  describe('fetchOpenRouterModels', () => {
    it('should fetch models from API', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockModels })
      } as Response);

      const models = await fetchOpenRouterModels('test-api-key');

      expect(models).toEqual(mockModels);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/models',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key'
          })
        })
      );
    });

    it('should use cached models if available and fresh', async () => {
      const cachedData = {
        models: mockModels,
        timestamp: Date.now()
      };
      localStorageMock.setItem('openrouter_models_cache', JSON.stringify(cachedData));

      const models = await fetchOpenRouterModels('test-api-key');

      expect(models).toEqual(mockModels);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should fetch fresh data if cache is expired', async () => {
      const cachedData = {
        models: mockModels,
        timestamp: Date.now() - 1000 * 60 * 61 // 61 minutes ago
      };
      localStorageMock.setItem('openrouter_models_cache', JSON.stringify(cachedData));

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockModels })
      } as Response);

      await fetchOpenRouterModels('test-api-key');

      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized'
      } as Response);

      const models = await fetchOpenRouterModels('invalid-key');

      expect(models).toEqual([]);
    });

    it('should return cached data on API error if available', async () => {
      const cachedData = {
        models: mockModels,
        timestamp: Date.now() - 1000 * 60 * 90 // Expired but available
      };
      localStorageMock.setItem('openrouter_models_cache', JSON.stringify(cachedData));

      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      const models = await fetchOpenRouterModels('test-api-key');

      expect(models).toEqual(mockModels);
    });
  });

  describe('getLatestModels', () => {
    it('should return list of featured models', () => {
      const models = getLatestModels();

      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThan(0);
      expect(models[0]).toContain('/');
    });
  });

  describe('filterModelsByCapability', () => {
    it('should filter vision models', () => {
      const filtered = filterModelsByCapability(mockModels, 'vision');

      expect(filtered).toHaveLength(2);
      expect(filtered.some(m => m.id.includes('claude'))).toBe(true);
    });

    it('should filter text-only models', () => {
      const filtered = filterModelsByCapability(mockModels, 'text');

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toContain('gpt-4');
    });

    it('should filter multimodal models', () => {
      const filtered = filterModelsByCapability(mockModels, 'multimodal');

      expect(filtered.length).toBeGreaterThan(0);
    });
  });

  describe('sortModelsByCost', () => {
    it('should sort models by cost (cheapest first)', () => {
      const sorted = sortModelsByCost(mockModels);

      expect(sorted[0].id).toContain('gpt-4');
      const cost0 = parseFloat(sorted[0].pricing.prompt) + parseFloat(sorted[0].pricing.completion);
      const cost1 = parseFloat(sorted[1].pricing.prompt) + parseFloat(sorted[1].pricing.completion);
      expect(cost0).toBeLessThanOrEqual(cost1);
    });

    it('should not mutate original array', () => {
      const original = [...mockModels];
      sortModelsByCost(mockModels);

      expect(mockModels).toEqual(original);
    });
  });

  describe('sortModelsByContext', () => {
    it('should sort models by context length (largest first)', () => {
      const sorted = sortModelsByContext(mockModels);

      expect(sorted[0].id).toContain('claude');
      expect(sorted[0].context_length).toBeGreaterThanOrEqual(sorted[1].context_length);
    });

    it('should not mutate original array', () => {
      const original = [...mockModels];
      sortModelsByContext(mockModels);

      expect(mockModels).toEqual(original);
    });
  });

  describe('getModelById', () => {
    it('should find model by ID', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockModels })
      } as Response);

      const model = await getModelById('openai/gpt-4', 'test-api-key');

      expect(model).not.toBeNull();
      expect(model?.id).toBe('openai/gpt-4');
    });

    it('should return null for non-existent model', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockModels })
      } as Response);

      const model = await getModelById('non-existent/model', 'test-api-key');

      expect(model).toBeNull();
    });
  });

  describe('searchModels', () => {
    it('should search models by ID', () => {
      const results = searchModels(mockModels, 'gpt');

      expect(results).toHaveLength(1);
      expect(results[0].id).toContain('gpt');
    });

    it('should search models by name', () => {
      const results = searchModels(mockModels, 'Claude');

      expect(results).toHaveLength(1);
      expect(results[0].name).toContain('Claude');
    });

    it('should be case insensitive', () => {
      const results = searchModels(mockModels, 'GEMINI');

      expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty array for no matches', () => {
      const results = searchModels(mockModels, 'nonexistent');

      expect(results).toHaveLength(0);
    });
  });

  describe('getTopModels', () => {
    it('should return default number of top models', () => {
      const models = getTopModels();

      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBe(10);
    });

    it('should return specified number of models', () => {
      const models = getTopModels(5);

      expect(models).toHaveLength(5);
    });

    it('should include popular models', () => {
      const models = getTopModels();

      expect(models.some(m => m.includes('glm'))).toBe(true);
    });
  });

  describe('formatModelPricing', () => {
    it('should format pricing correctly', () => {
      const formatted = formatModelPricing(mockModels[0]);

      expect(formatted).toContain('$');
      expect(formatted).toContain('per 1M tokens');
      expect(formatted).toMatch(/\d+\.\d{2}/);
    });

    it('should show prompt and completion costs', () => {
      const formatted = formatModelPricing(mockModels[0]);
      const parts = formatted.split('/');

      expect(parts).toHaveLength(2);
    });
  });

  describe('clearModelCache', () => {
    it('should remove cache from localStorage', () => {
      localStorageMock.setItem('openrouter_models_cache', 'test');

      clearModelCache();

      expect(localStorageMock.getItem('openrouter_models_cache')).toBeNull();
    });
  });

  describe('getCachedModels', () => {
    it('should return cached models', () => {
      const cachedData = {
        models: mockModels,
        timestamp: Date.now()
      };
      localStorageMock.setItem('openrouter_models_cache', JSON.stringify(cachedData));

      const models = getCachedModels();

      expect(models).toEqual(mockModels);
    });

    it('should return null if no cache', () => {
      const models = getCachedModels();

      expect(models).toBeNull();
    });

    it('should return null for corrupted cache', () => {
      localStorageMock.setItem('openrouter_models_cache', 'invalid json');

      const models = getCachedModels();

      expect(models).toBeNull();
    });
  });
});
