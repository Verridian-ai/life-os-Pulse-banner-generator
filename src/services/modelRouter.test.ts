import { describe, it, expect, beforeEach } from 'vitest';
import {
  getModelMetadata,
  clearModelMetadataCache,
  selectModelForTask,
  estimateCost,
  filterModelsByCapability,
  getModelWithFallback,
} from './modelRouter';
import { MODELS } from '../constants';

describe('ModelRouter Service', () => {
  beforeEach(() => {
    // Clear cache before each test to ensure isolation
    clearModelMetadataCache();
  });

  describe('getModelMetadata memoization', () => {
    it('should return the same object reference on multiple calls', () => {
      // First call creates the object
      const firstCall = getModelMetadata();

      // Second call should return the exact same reference
      const secondCall = getModelMetadata();

      // Third call should also return the same reference
      const thirdCall = getModelMetadata();

      // Use toBe for reference equality (not toEqual which checks deep equality)
      expect(secondCall).toBe(firstCall);
      expect(thirdCall).toBe(firstCall);
    });

    it('should cache metadata and prevent object recreation', () => {
      // Get initial metadata
      const metadata1 = getModelMetadata();

      // Modify a property to verify it's the same object
      const initialModelId = MODELS.textBasic;
      const initialQualityScore = metadata1[initialModelId].qualityScore;

      // Get metadata again
      const metadata2 = getModelMetadata();

      // Should be the same reference
      expect(metadata2).toBe(metadata1);
      expect(metadata2[initialModelId].qualityScore).toBe(initialQualityScore);
    });

    it('should recreate object after cache invalidation', () => {
      // First call creates and caches the object
      const beforeClear = getModelMetadata();

      // Clear the cache
      clearModelMetadataCache();

      // After clearing, next call should create a new object
      const afterClear = getModelMetadata();

      // Should be different object references
      expect(afterClear).not.toBe(beforeClear);

      // But should have the same content
      expect(afterClear).toEqual(beforeClear);
    });

    it('should contain all required model IDs in metadata', () => {
      const metadata = getModelMetadata();

      // Verify basic Gemini models
      expect(metadata[MODELS.textBasic]).toBeDefined();
      expect(metadata[MODELS.textThinking]).toBeDefined();
      expect(metadata[MODELS.imageGen]).toBeDefined();

      // Verify OpenRouter models
      expect(metadata[MODELS.openrouter.claude45Sonnet]).toBeDefined();
      expect(metadata[MODELS.openrouter.minimaxM2]).toBeDefined();
      expect(metadata[MODELS.openrouter.gpt52]).toBeDefined();
      expect(metadata[MODELS.openrouter.gpt52Pro]).toBeDefined();
      expect(metadata[MODELS.openrouter.gemini3DeepThink]).toBeDefined();

      // Verify Replicate models
      expect(metadata['nightmareai/real-esrgan']).toBeDefined();
      expect(metadata['recraft-ai/recraft-crisp-upscale']).toBeDefined();
      expect(metadata['fermatresearch/magic-image-refiner']).toBeDefined();
      expect(metadata['cjwbw/rembg']).toBeDefined();
      expect(metadata['sczhou/codeformer']).toBeDefined();
      expect(metadata['tencentarc/gfpgan']).toBeDefined();
    });

    it('should have correct metadata structure for each model', () => {
      const metadata = getModelMetadata();
      const sampleModel = metadata[MODELS.textBasic];

      // Verify required fields exist
      expect(sampleModel.id).toBeDefined();
      expect(sampleModel.provider).toBeDefined();
      expect(sampleModel.name).toBeDefined();
      expect(sampleModel.capabilities).toBeDefined();
      expect(sampleModel.costPerCall).toBeDefined();
      expect(sampleModel.avgResponseTime).toBeDefined();
      expect(sampleModel.qualityScore).toBeDefined();

      // Verify types
      expect(typeof sampleModel.id).toBe('string');
      expect(typeof sampleModel.provider).toBe('string');
      expect(typeof sampleModel.name).toBe('string');
      expect(Array.isArray(sampleModel.capabilities)).toBe(true);
      expect(typeof sampleModel.costPerCall).toBe('number');
      expect(typeof sampleModel.avgResponseTime).toBe('number');
      expect(typeof sampleModel.qualityScore).toBe('number');
    });
  });

  describe('selectModelForTask', () => {
    it('should return manual override when provided', () => {
      const manualModel = MODELS.openrouter.gpt52;
      const result = selectModelForTask('text', true, manualModel);
      expect(result).toBe(manualModel);
    });

    it('should return default model when auto-select is disabled', () => {
      const result = selectModelForTask('text', false, null);
      expect(result).toBe(MODELS.textBasic);
    });

    it('should select appropriate model for reasoning tasks', () => {
      const result = selectModelForTask('reasoning', true, null);
      expect(result).toBe(MODELS.textThinking);
    });

    it('should select appropriate model for vision tasks', () => {
      const result = selectModelForTask('vision', true, null);
      expect(result).toBe(MODELS.textBasic);
    });

    it('should select appropriate model for coding tasks', () => {
      const result = selectModelForTask('coding', true, null);
      expect(result).toBe(MODELS.openrouter.minimaxM2);
    });

    it('should select appropriate model for image generation', () => {
      const result = selectModelForTask('image_gen', true, null);
      expect(result).toBe(MODELS.imageGen);
    });

    it('should select appropriate model for image editing', () => {
      const result = selectModelForTask('image_edit', true, null);
      expect(result).toBe(MODELS.imageEdit);
    });
  });

  describe('estimateCost', () => {
    it('should return correct cost for specified model', () => {
      const cost = estimateCost('text', MODELS.textBasic);
      expect(typeof cost).toBe('number');
      expect(cost).toBeGreaterThanOrEqual(0);
    });

    it('should return cost for auto-selected model', () => {
      const cost = estimateCost('image_gen');
      expect(typeof cost).toBe('number');
      expect(cost).toBeGreaterThanOrEqual(0);
    });

    it('should return fallback cost for unknown model', () => {
      const cost = estimateCost('text', 'unknown-model-id');
      expect(cost).toBe(0.001);
    });

    it('should use cached metadata for cost lookup', () => {
      // First call to populate cache
      const cost1 = estimateCost('text', MODELS.textBasic);

      // Second call should use cached metadata
      const cost2 = estimateCost('text', MODELS.textBasic);

      expect(cost2).toBe(cost1);
    });
  });

  describe('filterModelsByCapability', () => {
    it('should filter models by text capability', () => {
      const models = filterModelsByCapability('text');
      expect(models.length).toBeGreaterThan(0);
      models.forEach((model) => {
        expect(model.capabilities).toContain('text');
      });
    });

    it('should filter models by vision capability', () => {
      const models = filterModelsByCapability('vision');
      expect(models.length).toBeGreaterThan(0);
      models.forEach((model) => {
        expect(model.capabilities).toContain('vision');
      });
    });

    it('should filter models by thinking capability', () => {
      const models = filterModelsByCapability('thinking');
      expect(models.length).toBeGreaterThan(0);
      models.forEach((model) => {
        expect(model.capabilities).toContain('thinking');
      });
    });

    it('should filter models by image_gen capability', () => {
      const models = filterModelsByCapability('image_gen');
      expect(models.length).toBeGreaterThan(0);
      models.forEach((model) => {
        expect(model.capabilities).toContain('image_gen');
      });
    });

    it('should filter models by image_upscale capability', () => {
      const models = filterModelsByCapability('image_upscale');
      expect(models.length).toBeGreaterThan(0);
      models.forEach((model) => {
        expect(model.capabilities).toContain('image_upscale');
      });
    });

    it('should filter models by background_removal capability', () => {
      const models = filterModelsByCapability('background_removal');
      expect(models.length).toBeGreaterThan(0);
      models.forEach((model) => {
        expect(model.capabilities).toContain('background_removal');
      });
    });

    it('should use cached metadata for filtering', () => {
      // First call to populate cache
      const models1 = filterModelsByCapability('text');

      // Second call should use cached metadata
      const models2 = filterModelsByCapability('text');

      expect(models2).toEqual(models1);
    });
  });

  describe('getModelWithFallback', () => {
    it('should return preferred model when it exists', () => {
      const preferredModel = MODELS.openrouter.gpt52;
      const result = getModelWithFallback('text', preferredModel);
      expect(result).toBe(preferredModel);
    });

    it('should fallback to auto-selection for unknown preferred model', () => {
      const result = getModelWithFallback('text', 'non-existent-model');
      expect(result).toBe(MODELS.textBasic);
    });

    it('should use auto-selection when no preferred model provided', () => {
      const result = getModelWithFallback('reasoning');
      expect(result).toBe(MODELS.textThinking);
    });

    it('should use cached metadata for model lookup', () => {
      // First call to populate cache
      const result1 = getModelWithFallback('text', MODELS.textBasic);

      // Second call should use cached metadata
      const result2 = getModelWithFallback('text', MODELS.textBasic);

      expect(result2).toBe(result1);
    });
  });

  describe('cache invalidation function', () => {
    it('should properly reset cache to null', () => {
      // Populate cache
      const beforeClear = getModelMetadata();
      expect(beforeClear).toBeDefined();

      // Clear cache
      clearModelMetadataCache();

      // Next call should create a new object
      const afterClear = getModelMetadata();
      expect(afterClear).toBeDefined();

      // Should be different references
      expect(afterClear).not.toBe(beforeClear);
    });

    it('should allow multiple cache invalidations', () => {
      const first = getModelMetadata();
      clearModelMetadataCache();

      const second = getModelMetadata();
      clearModelMetadataCache();

      const third = getModelMetadata();

      expect(second).not.toBe(first);
      expect(third).not.toBe(second);
      expect(third).not.toBe(first);
    });

    it('should not break functionality after cache clear', () => {
      // Use functions with cache
      const cost1 = estimateCost('text', MODELS.textBasic);

      // Clear cache
      clearModelMetadataCache();

      // Functions should still work
      const cost2 = estimateCost('text', MODELS.textBasic);
      expect(cost2).toBe(cost1);

      const models = filterModelsByCapability('text');
      expect(models.length).toBeGreaterThan(0);
    });
  });
});
