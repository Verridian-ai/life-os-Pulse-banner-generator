import { MODELS } from '../constants';
import type { ModelMetadata } from '../types/ai';
import { modelPreferencesStorage, modelMetricsStorage } from './storageManager'; // Updated import

export type OperationType = 'text' | 'vision' | 'reasoning' | 'image_gen' | 'image_edit' | 'coding';

// ... (existing code)

/**
 * Track model performance metric
 */
export const trackModelPerformance = (metric: Omit<import('../types/ai').PerformanceMetric, 'timestamp'> & { timestamp?: number }) => {
  try {
    const fullMetric: import('../types/ai').PerformanceMetric = {
      timestamp: Date.now(),
      ...metric,
    };

    // Get existing metrics
    // We use a specific key 'performance_log' within the model metrics namespace
    const EXISTING_KEY = 'performance_log';
    const logs = modelMetricsStorage.get<import('../types/ai').PerformanceMetric[]>(EXISTING_KEY) || [];
    const updated = [...logs, fullMetric].slice(-1000); // Keep last 1000
    modelMetricsStorage.set(EXISTING_KEY, updated);

    // Dispatch event for hooks to react
    window.dispatchEvent(new Event('model-metric-tracked'));
  } catch (e) {
    console.error('Failed to track model performance:', e);
  }
};

/**
 * Select the best model for a given operation type
 * Supports both automatic selection and manual override
 */
export const selectModelForTask = (
  operation: OperationType,
  autoSelect: boolean = true,
  manualOverride: string | null = null,
): string => {
  // If manual override specified, use it
  if (manualOverride) {
    return manualOverride;
  }

  // If auto-select disabled, use default model
  if (!autoSelect) {
    return MODELS.textBasic;
  }

  // Intelligent auto-selection based on operation type
  switch (operation) {
    case 'reasoning':
      // Use Gemini 2.0 Flash Thinking for complex reasoning
      return MODELS.textThinking;

    case 'vision':
      // Use Gemini 3.0 Pro for image understanding
      return MODELS.textBasic;

    case 'coding':
      // Use MiniMax M2 optimized for coding
      return MODELS.openrouter.minimaxM2;

    case 'text':
      // Use Gemini 3.0 Pro for text generation
      return MODELS.textBasic;

    case 'image_gen':
      // Use Gemini 3 Pro Image
      return MODELS.imageGen;

    case 'image_edit':
      // Use Gemini 2.5 Flash Image
      return MODELS.imageEdit;

    default:
      return MODELS.textBasic;
  }
};

/**
 * Model metadata registry - computed once and cached
 * Contains all available models with their capabilities and characteristics
 */
const MODEL_METADATA_REGISTRY: Record<string, ModelMetadata> = {
  [MODELS.textBasic]: {
    id: MODELS.textBasic,
    provider: 'openrouter',
    name: 'Gemini 3.0 Pro',
    capabilities: ['text', 'vision'],
    costPerCall: 0,
    avgResponseTime: 500,
    qualityScore: 90,
    contextWindow: 1000000,
  },
  [MODELS.textThinking]: {
    id: MODELS.textThinking,
    provider: 'openrouter',
    name: 'Gemini 3 Pro',
    capabilities: ['text', 'vision', 'thinking'],
    costPerCall: 0,
    avgResponseTime: 2000,
    qualityScore: 98,
    contextWindow: 1000000,
  },
  [MODELS.imageGen]: {
    id: MODELS.imageGen,
    provider: 'gemini',
    name: 'Gemini 3 Pro Image (Nano Banana Pro)',
    capabilities: ['image_gen'],
    costPerCall: 0.24, // 4K image
    avgResponseTime: 8000,
    qualityScore: 96,
  },
  [MODELS.openrouter.claude45Sonnet]: {
    id: MODELS.openrouter.claude45Sonnet,
    provider: 'openrouter',
    name: 'Claude 4.5 Sonnet',
    capabilities: ['text', 'vision', 'thinking'],
    costPerCall: 0.003,
    avgResponseTime: 1200,
    qualityScore: 94,
    contextWindow: 200000,
  },
  [MODELS.openrouter.minimaxM2]: {
    id: MODELS.openrouter.minimaxM2,
    provider: 'openrouter',
    name: 'MiniMax M2 Plus',
    capabilities: ['text', 'vision'],
    costPerCall: 0.002,
    avgResponseTime: 900,
    qualityScore: 88,
  },
  [MODELS.openrouter.gpt52]: {
    id: MODELS.openrouter.gpt52,
    provider: 'openrouter',
    name: 'GPT-5.2',
    capabilities: ['text', 'vision', 'thinking'],
    costPerCall: 0.015,
    avgResponseTime: 2000,
    qualityScore: 97,
    contextWindow: 128000,
  },
  [MODELS.openrouter.gpt52Pro]: {
    id: MODELS.openrouter.gpt52Pro,
    provider: 'openrouter',
    name: 'GPT-5.2 Pro',
    capabilities: ['text', 'vision', 'thinking'],
    costPerCall: 0.03,
    avgResponseTime: 2500,
    qualityScore: 99,
    contextWindow: 128000,
  },
  [MODELS.openrouter.gemini3DeepThink]: {
    id: MODELS.openrouter.gemini3DeepThink,
    provider: 'openrouter',
    name: 'Gemini 3 Deep Think',
    capabilities: ['text', 'thinking'],
    costPerCall: 0.02,
    avgResponseTime: 3000,
    qualityScore: 98,
    contextWindow: 1000000,
  },

  // Replicate Models - Image Enhancement
  'nightmareai/real-esrgan': {
    id: 'nightmareai/real-esrgan',
    provider: 'replicate',
    name: 'Real-ESRGAN (Fast Upscale)',
    capabilities: ['image_upscale'],
    costPerCall: 0.0025,
    avgResponseTime: 5000,
    qualityScore: 85,
  },
  'recraft-ai/recraft-crisp-upscale': {
    id: 'recraft-ai/recraft-crisp-upscale',
    provider: 'replicate',
    name: 'Recraft Crisp (Balanced Upscale)',
    capabilities: ['image_upscale'],
    costPerCall: 0.01,
    avgResponseTime: 10000,
    qualityScore: 92,
  },
  'fermatresearch/magic-image-refiner': {
    id: 'fermatresearch/magic-image-refiner',
    provider: 'replicate',
    name: 'Magic Refiner (Best Upscale)',
    capabilities: ['image_upscale'],
    costPerCall: 0.12,
    avgResponseTime: 15000,
    qualityScore: 96,
  },
  'cjwbw/rembg': {
    id: 'cjwbw/rembg',
    provider: 'replicate',
    name: 'Background Removal',
    capabilities: ['background_removal'],
    costPerCall: 0.002,
    avgResponseTime: 3000,
    qualityScore: 90,
  },
  'sczhou/codeformer': {
    id: 'sczhou/codeformer',
    provider: 'replicate',
    name: 'CodeFormer (Restoration)',
    capabilities: ['image_restoration'],
    costPerCall: 0.01,
    avgResponseTime: 10000,
    qualityScore: 88,
  },
  'tencentarc/gfpgan': {
    id: 'tencentarc/gfpgan',
    provider: 'replicate',
    name: 'GFPGAN (Face Enhancement)',
    capabilities: ['face_enhancement'],
    costPerCall: 0.008,
    avgResponseTime: 8000,
    qualityScore: 90,
  },
};

/**
 * Memoization cache for individual model metadata lookups
 * Maps model ID to ModelMetadata to prevent redundant object access
 */
const modelMetadataCache = new Map<string, ModelMetadata>();

/**
 * Get metadata for a specific model by ID (memoized)
 * @param modelId - The unique identifier of the model
 * @returns ModelMetadata object or undefined if model not found
 */
export function getModelMetadataById(modelId: string): ModelMetadata | undefined {
  // Check cache first
  if (modelMetadataCache.has(modelId)) {
    return modelMetadataCache.get(modelId);
  }

  // Lookup in registry
  const metadata = MODEL_METADATA_REGISTRY[modelId];

  // Cache result (even if undefined, to avoid repeated lookups)
  if (metadata) {
    modelMetadataCache.set(modelId, metadata);
  }

  return metadata;
}

/**
 * Get all model metadata (for display and comparison)
 * Returns the complete registry without additional processing
 */
export const getModelMetadata = (): Record<string, ModelMetadata> => {
  return MODEL_METADATA_REGISTRY;
};

/**
 * Clear the model metadata cache
 * Call this when the models list changes or during testing
 */
export function clearModelMetadataCache(): void {
  modelMetadataCache.clear();
}

/**
 * Get cost estimate for an operation
 */
export const estimateCost = (operation: OperationType, modelId?: string): number => {
  const model = modelId || selectModelForTask(operation);
  const metadata = getModelMetadataById(model);
  return metadata?.costPerCall || 0.001;
};

/**
 * Compare models by capability
 */
export const filterModelsByCapability = (
  capability:
    | 'text'
    | 'vision'
    | 'thinking'
    | 'image_gen'
    | 'image_edit'
    | 'image_upscale'
    | 'background_removal'
    | 'image_restoration'
    | 'face_enhancement',
): ModelMetadata[] => {
  const allModels = getModelMetadata();
  return Object.values(allModels).filter((model) => model.capabilities.includes(capability));
};

/**
 * Get recommended model with fallbacks
 */
export const getModelWithFallback = (operation: OperationType, preferredModel?: string): string => {
  // Try preferred model first
  if (preferredModel) {
    const metadata = getModelMetadataById(preferredModel);
    if (metadata) return preferredModel;
  }

  // Fall back to auto-selection
  return selectModelForTask(operation, true, null);
};

/**
 * Cache model selection preferences
 */
export const cacheModelSelection = (operation: OperationType, modelId: string) => {
  modelPreferencesStorage.set(operation, modelId);
};

/**
 * Get cached model selection
 */
export const getCachedModelSelection = (operation: OperationType): string | null => {
  return modelPreferencesStorage.get<string>(operation);
};

// Interface for real-world stats compatible with useModelMetrics
export interface ModelRealtimeMetrics {
  byModel: Record<
    string,
    {
      avgTime: number;
      successRate: number;
      calls: number;
    }
  >;
}

export interface ModelComparisonResult {
  modelId: string;
  score: number;
  ranking: number;
  reason: string;
  metrics: {
    avgTime: number | null;
    successRate: number | null;
    cost: number;
  };
}

/**
 * Compare and rank models based on theoretical metadata and real usage stats
 */
export const compareModelPerformance = (
  candidateModels: string[],
  realWorldStats: ModelRealtimeMetrics | null,
  criteria: 'speed' | 'quality' | 'cost' | 'balanced' = 'balanced',
): ModelComparisonResult[] => {
  const results = candidateModels.map((modelId) => {
    const metadata = getModelMetadataById(modelId);
    const realStats = realWorldStats?.byModel[modelId];

    // Defaults (Theoretical)
    let avgTime = metadata?.avgResponseTime || 2000;
    let quality = metadata?.qualityScore || 80;
    const cost = metadata?.costPerCall || 0.001;
    let successRate = 100;

    // Merge Real-world stats if available (and statistically significant, e.g., > 3 calls)
    if (realStats && realStats.calls > 3) {
      // Blend 70% real, 30% theoretical for time
      avgTime = realStats.avgTime * 0.7 + avgTime * 0.3;
      // Use real success rate
      successRate = realStats.successRate;
    }

    // Normalization factors (approximate)
    const normalizedTime = Math.max(0, 1 - avgTime / 10000); // Higher is better (faster)
    const normalizedQuality = quality / 100;
    const normalizedCost = Math.max(0, 1 - cost * 50); // Higher is cheaper (assuming max usually < $0.02)
    const normalizedSuccess = successRate / 100;

    // Calculate Score
    let score = 0;
    let reason = '';

    switch (criteria) {
      case 'speed':
        score = normalizedTime * 0.6 + normalizedSuccess * 0.3 + normalizedCost * 0.1;
        break;
      case 'quality':
        score = normalizedQuality * 0.7 + normalizedSuccess * 0.3;
        break;
      case 'cost':
        score = normalizedCost * 0.8 + normalizedSuccess * 0.2;
        break;
      case 'balanced':
      default:
        score =
          normalizedQuality * 0.4 + normalizedTime * 0.3 + normalizedCost * 0.2 + normalizedSuccess * 0.1;
        break;
    }

    // Determine primary reason
    if (criteria === 'balanced') {
      if (normalizedTime > 0.8) reason = 'Fastest';
      else if (normalizedQuality > 0.95) reason = 'Best Quality';
      else if (normalizedCost > 0.95) reason = 'Best Value';
      else reason = 'Reliable';
    } else if (criteria === 'speed') reason = 'Speed Optimized';
    else if (criteria === 'quality') reason = 'Quality Authorized';

    return {
      modelId,
      score,
      ranking: 0, // Assigned after sort
      reason,
      metrics: {
        avgTime: realStats?.avgTime || null,
        successRate: realStats?.successRate || null,
        cost,
      },
    };
  });

  // Sort by score descending
  return results
    .sort((a, b) => b.score - a.score)
    .map((res, index) => ({
      ...res,
      ranking: index + 1,
    }));
};



