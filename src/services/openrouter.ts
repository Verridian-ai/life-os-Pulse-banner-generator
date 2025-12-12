// OpenRouter Service - Fetch and manage OpenRouter models

interface OpenRouterModel {
  id: string;
  name: string;
  pricing: {
    prompt: string;
    completion: string;
  };
  context_length: number;
  architecture?: {
    modality?: string;
    tokenizer?: string;
  };
  top_provider?: {
    context_length: number;
    max_completion_tokens?: number;
  };
}

interface OpenRouterResponse {
  data: OpenRouterModel[];
}

const MODEL_CACHE_KEY = 'openrouter_models_cache';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

/**
 * Fetch all available models from OpenRouter API
 */
export const fetchOpenRouterModels = async (apiKey: string): Promise<OpenRouterModel[]> => {
  // Check cache first
  const cached = localStorage.getItem(MODEL_CACHE_KEY);
  if (cached) {
    try {
      const { models, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return models;
      }
    } catch (error) {
      // Invalid cache, continue to fetch
    }
  }

  // Fetch from API
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'NanoBanna Pro',
      },
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API Error: ${response.statusText}`);
    }

    const data: OpenRouterResponse = await response.json();
    const models = data.data;

    // Cache results
    localStorage.setItem(MODEL_CACHE_KEY, JSON.stringify({
      models,
      timestamp: Date.now(),
    }));

    return models;
  } catch (error) {
    console.error('Failed to fetch OpenRouter models:', error);
    // Return cached data if available, even if expired
    if (cached) {
      try {
        const { models } = JSON.parse(cached);
        return models;
      } catch {
        // Ignore parse errors for corrupted cache
      }
    }
    return [];
  }
};

/**
 * Get the latest featured models for Nanobanna Pro
 */
export const getLatestModels = () => {
  return [
    'zhipu/glm-4.6-plus',
    'minimax/minimax-m2-plus',
    'openai/gpt-5.1',
    'openai/gpt-5-mini',
    'anthropic/claude-3.7-sonnet',
  ];
};

/**
 * Filter models by capability (vision, reasoning, etc.)
 */
export const filterModelsByCapability = (
  models: OpenRouterModel[],
  capability: 'vision' | 'text' | 'multimodal'
): OpenRouterModel[] => {
  return models.filter(model => {
    const modality = model.architecture?.modality?.toLowerCase() || '';

    switch (capability) {
      case 'vision':
      case 'multimodal':
        return modality.includes('image') || modality.includes('multimodal');
      case 'text':
        return modality.includes('text') || !modality;
      default:
        return true;
    }
  });
};

/**
 * Sort models by cost (cheapest first)
 */
export const sortModelsByCost = (models: OpenRouterModel[]): OpenRouterModel[] => {
  return [...models].sort((a, b) => {
    const costA = parseFloat(a.pricing.prompt) + parseFloat(a.pricing.completion);
    const costB = parseFloat(b.pricing.prompt) + parseFloat(b.pricing.completion);
    return costA - costB;
  });
};

/**
 * Sort models by context window (largest first)
 */
export const sortModelsByContext = (models: OpenRouterModel[]): OpenRouterModel[] => {
  return [...models].sort((a, b) => b.context_length - a.context_length);
};

/**
 * Get model by ID
 */
export const getModelById = async (
  modelId: string,
  apiKey: string
): Promise<OpenRouterModel | null> => {
  const models = await fetchOpenRouterModels(apiKey);
  return models.find(m => m.id === modelId) || null;
};

/**
 * Search models by name or provider
 */
export const searchModels = (
  models: OpenRouterModel[],
  query: string
): OpenRouterModel[] => {
  const lowerQuery = query.toLowerCase();
  return models.filter(model =>
    model.id.toLowerCase().includes(lowerQuery) ||
    model.name.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Get top models by usage (from rankings)
 */
export const getTopModels = (count: number = 10): string[] => {
  // Based on OpenRouter rankings as of December 2025
  return [
    'zhipu/glm-4.6-plus', // 13.1% traffic
    'minimax/minimax-m2-plus', // 3.3% traffic
    'openai/gpt-5.1',
    'openai/gpt-5-mini',
    'anthropic/claude-3.7-sonnet',
    'google/gemini-3-pro-preview',
    'meta/llama-4-scout',
    'meta/llama-4-maverick',
    'deepseek/deepseek-v3',
    'microsoft/phi-4',
  ].slice(0, count);
};

/**
 * Format model pricing for display
 */
export const formatModelPricing = (model: OpenRouterModel): string => {
  const promptCost = (parseFloat(model.pricing.prompt) * 1000000).toFixed(2);
  const completionCost = (parseFloat(model.pricing.completion) * 1000000).toFixed(2);
  return `$${promptCost}/$${completionCost} per 1M tokens`;
};

/**
 * Clear model cache (force refresh on next fetch)
 */
export const clearModelCache = (): void => {
  localStorage.removeItem(MODEL_CACHE_KEY);
};

/**
 * Get cached models without API call
 */
export const getCachedModels = (): OpenRouterModel[] | null => {
  const cached = localStorage.getItem(MODEL_CACHE_KEY);
  if (!cached) return null;

  try {
    const { models } = JSON.parse(cached);
    return models;
  } catch (error) {
    return null;
  }
};
