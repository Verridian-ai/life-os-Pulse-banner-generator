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

    it('should return consistent costs across multiple calls with memoized data', () => {
      // Test multiple different models to ensure cache works for all
      const models = [
        MODELS.textBasic,
        MODELS.textThinking,
        MODELS.imageGen,
        MODELS.openrouter.gpt52,
        MODELS.openrouter.minimaxM2,
      ];

      // Get costs for all models (populates cache)
      const firstPassCosts = models.map((modelId) => estimateCost('text', modelId));

      // Get costs again (should use cached metadata)
      const secondPassCosts = models.map((modelId) => estimateCost('text', modelId));

      // Third pass to be thorough
      const thirdPassCosts = models.map((modelId) => estimateCost('text', modelId));

      // All passes should return identical results
      expect(secondPassCosts).toEqual(firstPassCosts);
      expect(thirdPassCosts).toEqual(firstPassCosts);
    });

    it('should work correctly after cache invalidation', () => {
      // Get initial cost with fresh cache
      const costBefore = estimateCost('text', MODELS.textBasic);
      expect(typeof costBefore).toBe('number');

      // Clear cache
      clearModelMetadataCache();

      // Get cost again (should recreate metadata but return same value)
      const costAfter = estimateCost('text', MODELS.textBasic);
      expect(costAfter).toBe(costBefore);

      // Clear again and test with different model
      clearModelMetadataCache();
      const gptCost = estimateCost('text', MODELS.openrouter.gpt52);
      expect(typeof gptCost).toBe('number');
      expect(gptCost).toBeGreaterThanOrEqual(0);
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

    it('should return consistent results across multiple capability queries with memoized data', () => {
      // Test multiple capabilities to ensure cache works for all
      const capabilities: Array<'text' | 'vision' | 'thinking' | 'image_gen' | 'image_upscale'> = [
        'text',
        'vision',
        'thinking',
        'image_gen',
        'image_upscale',
      ];

      // First pass - populates cache
      const firstPassResults = capabilities.map((cap) => filterModelsByCapability(cap));

      // Second pass - should use cached metadata
      const secondPassResults = capabilities.map((cap) => filterModelsByCapability(cap));

      // Third pass - verify consistency
      const thirdPassResults = capabilities.map((cap) => filterModelsByCapability(cap));

      // All passes should return identical results
      expect(secondPassResults).toEqual(firstPassResults);
      expect(thirdPassResults).toEqual(firstPassResults);

      // Verify each result set has the correct capability
      firstPassResults.forEach((models, index) => {
        const capability = capabilities[index];
        expect(models.length).toBeGreaterThan(0);
        models.forEach((model) => {
          expect(model.capabilities).toContain(capability);
        });
      });
    });

    it('should work correctly after cache invalidation', () => {
      // Get models with fresh cache
      const modelsBefore = filterModelsByCapability('text');
      expect(modelsBefore.length).toBeGreaterThan(0);
      const countBefore = modelsBefore.length;

      // Clear cache
      clearModelMetadataCache();

      // Get models again (should recreate metadata but return same results)
      const modelsAfter = filterModelsByCapability('text');
      expect(modelsAfter.length).toBe(countBefore);
      expect(modelsAfter).toEqual(modelsBefore);

      // Clear again and test with different capability
      clearModelMetadataCache();
      const visionModels = filterModelsByCapability('vision');
      expect(visionModels.length).toBeGreaterThan(0);
      visionModels.forEach((model) => {
        expect(model.capabilities).toContain('vision');
      });
    });

    it('should return same array structure with memoized data', () => {
      // First call
      const firstCall = filterModelsByCapability('text');
      const firstModelIds = firstCall.map((m) => m.id);

      // Second call with cached metadata
      const secondCall = filterModelsByCapability('text');
      const secondModelIds = secondCall.map((m) => m.id);

      // Third call
      const thirdCall = filterModelsByCapability('text');
      const thirdModelIds = thirdCall.map((m) => m.id);

      // Model IDs should be identical across calls
      expect(secondModelIds).toEqual(firstModelIds);
      expect(thirdModelIds).toEqual(firstModelIds);

      // Verify structure of returned models
      firstCall.forEach((model) => {
        expect(model.id).toBeDefined();
        expect(model.capabilities).toBeDefined();
        expect(Array.isArray(model.capabilities)).toBe(true);
      });
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

    it('should return consistent results across multiple calls with memoized data', () => {
      // Test with valid preferred models
      const testCases = [
        { taskType: 'text' as const, preferredModel: MODELS.textBasic },
        { taskType: 'reasoning' as const, preferredModel: MODELS.textThinking },
        { taskType: 'vision' as const, preferredModel: MODELS.textBasic },
        { taskType: 'image_gen' as const, preferredModel: MODELS.imageGen },
        { taskType: 'coding' as const, preferredModel: MODELS.openrouter.minimaxM2 },
      ];

      // First pass - populates cache
      const firstPassResults = testCases.map(({ taskType, preferredModel }) =>
        getModelWithFallback(taskType, preferredModel)
      );

      // Second pass - should use cached metadata
      const secondPassResults = testCases.map(({ taskType, preferredModel }) =>
        getModelWithFallback(taskType, preferredModel)
      );

      // Third pass - verify consistency
      const thirdPassResults = testCases.map(({ taskType, preferredModel }) =>
        getModelWithFallback(taskType, preferredModel)
      );

      // All passes should return identical results
      expect(secondPassResults).toEqual(firstPassResults);
      expect(thirdPassResults).toEqual(firstPassResults);

      // Verify expected results
      testCases.forEach(({ preferredModel }, index) => {
        expect(firstPassResults[index]).toBe(preferredModel);
      });
    });

    it('should handle fallback correctly with memoized data', () => {
      // First attempt with invalid model (populates cache)
      const fallback1 = getModelWithFallback('text', 'invalid-model-1');
      expect(fallback1).toBe(MODELS.textBasic);

      // Second attempt with different invalid model (uses cached metadata)
      const fallback2 = getModelWithFallback('text', 'invalid-model-2');
      expect(fallback2).toBe(MODELS.textBasic);

      // Third attempt with valid model (uses cached metadata)
      const valid = getModelWithFallback('text', MODELS.openrouter.gpt52);
      expect(valid).toBe(MODELS.openrouter.gpt52);

      // Fourth attempt back to invalid (uses cached metadata)
      const fallback3 = getModelWithFallback('text', 'invalid-model-3');
      expect(fallback3).toBe(MODELS.textBasic);
    });

    it('should work correctly after cache invalidation', () => {
      // Get model with fresh cache
      const modelBefore = getModelWithFallback('text', MODELS.textBasic);
      expect(modelBefore).toBe(MODELS.textBasic);

      // Clear cache
      clearModelMetadataCache();

      // Get model again (should recreate metadata but return same result)
      const modelAfter = getModelWithFallback('text', MODELS.textBasic);
      expect(modelAfter).toBe(MODELS.textBasic);

      // Clear again and test with fallback scenario
      clearModelMetadataCache();
      const fallbackModel = getModelWithFallback('reasoning', 'non-existent');
      expect(fallbackModel).toBe(MODELS.textThinking);
    });

    it('should handle auto-selection correctly with memoized data', () => {
      // Test auto-selection without preferred model
      const taskTypes: Array<'text' | 'reasoning' | 'vision' | 'coding' | 'image_gen'> = [
        'text',
        'reasoning',
        'vision',
        'coding',
        'image_gen',
      ];

      // First pass - populates cache
      const firstPass = taskTypes.map((taskType) => getModelWithFallback(taskType));

      // Second pass - uses cached metadata
      const secondPass = taskTypes.map((taskType) => getModelWithFallback(taskType));

      // Third pass
      const thirdPass = taskTypes.map((taskType) => getModelWithFallback(taskType));

      // All passes should return identical results
      expect(secondPass).toEqual(firstPass);
      expect(thirdPass).toEqual(firstPass);

      // Verify all results are valid model IDs
      firstPass.forEach((modelId) => {
        expect(typeof modelId).toBe('string');
        expect(modelId.length).toBeGreaterThan(0);
      });
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
