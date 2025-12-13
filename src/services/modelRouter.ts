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
      // Use GPT-5.2 or Gemini 3 Pro for complex reasoning
      return MODELS.openrouter.gpt52;

    case 'vision':
      // Use Claude 4.5 Sonnet for image understanding
      return MODELS.openrouter.claude45Sonnet;

    case 'coding':
      // Use MiniMax M2 optimized for coding
      return MODELS.openrouter.minimaxM2;

    case 'text':
      // Use GPT-5.2 for text generation
      return MODELS.openrouter.gpt52;

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
      provider: 'gemini',
      name: 'Gemini 2.5 Flash',
      capabilities: ['text', 'vision'],
      costPerCall: 0.001,
      avgResponseTime: 800,
      qualityScore: 85,
      contextWindow: 1000000,
    },
    [MODELS.textThinking]: {
      id: MODELS.textThinking,
      provider: 'gemini',
      name: 'Gemini 3 Pro Preview',
      capabilities: ['text', 'vision', 'thinking'],
      costPerCall: 0.02,
      avgResponseTime: 3000,
      qualityScore: 98,
      contextWindow: 1000000,
    },
    [MODELS.imageGen]: {
      id: MODELS.imageGen,
      provider: 'gemini',
      name: 'Gemini 3 Pro Image',
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
  capability: 'text' | 'vision' | 'thinking' | 'image_gen' | 'image_edit',
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
