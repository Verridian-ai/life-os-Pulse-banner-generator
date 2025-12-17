// Model Router - Intelligent model selection with hybrid auto/manual modes

import { MODELS } from '../constants';
import type { ModelMetadata } from '../types/ai';

export type OperationType = 'text' | 'vision' | 'reasoning' | 'image_gen' | 'image_edit' | 'coding';

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
 * Get model metadata for display and comparison
 */
export const getModelMetadata = (): Record<string, ModelMetadata> => {
  return {
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
};

/**
 * Get cost estimate for an operation
 */
export const estimateCost = (operation: OperationType, modelId?: string): number => {
  const model = modelId || selectModelForTask(operation);
  const metadata = getModelMetadata()[model];
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
    const metadata = getModelMetadata()[preferredModel];
    if (metadata) return preferredModel;
  }

  // Fall back to auto-selection
  return selectModelForTask(operation, true, null);
};

/**
 * Cache model selection preferences
 */
export const cacheModelSelection = (operation: OperationType, modelId: string) => {
  const key = `model_pref_${operation}`;
  localStorage.setItem(key, modelId);
};

/**
 * Get cached model selection
 */
export const getCachedModelSelection = (operation: OperationType): string | null => {
  const key = `model_pref_${operation}`;
  return localStorage.getItem(key);
};
