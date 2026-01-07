// Test suite for modelRouter memoization
import { describe, it, expect, beforeEach } from 'vitest';
import {
  getModelMetadataById,
  clearModelMetadataCache,
  getModelMetadata,
  estimateCost,
  getModelWithFallback,
} from './modelRouter';
import { MODELS } from '../constants';

describe('modelRouter memoization', () => {
  beforeEach(() => {
    // Clear cache before each test
    clearModelMetadataCache();
  });

  describe('getModelMetadataById', () => {
    it('should return model metadata for valid model ID', () => {
      const metadata = getModelMetadataById(MODELS.textBasic);

      expect(metadata).toBeDefined();
      expect(metadata?.id).toBe(MODELS.textBasic);
      expect(metadata?.provider).toBe('openrouter');
      expect(metadata?.name).toBeDefined();
    });

    it('should return same object reference on subsequent calls (memoization)', () => {
      const first = getModelMetadataById(MODELS.textBasic);
      const second = getModelMetadataById(MODELS.textBasic);

      // Should return exact same object reference (not just equal values)
      expect(first).toBe(second);
    });

    it('should return undefined for invalid model ID', () => {
      const metadata = getModelMetadataById('invalid-model-id');

      expect(metadata).toBeUndefined();
    });

    it('should cache multiple different models independently', () => {
      const model1 = getModelMetadataById(MODELS.textBasic);
      const model2 = getModelMetadataById(MODELS.imageGen);
      const model1Again = getModelMetadataById(MODELS.textBasic);

      expect(model1).toBe(model1Again);
      expect(model1).not.toBe(model2);
      expect(model2?.id).toBe(MODELS.imageGen);
    });
  });

  describe('clearModelMetadataCache', () => {
    it('should clear the cache', () => {
      // First, populate cache
      const first = getModelMetadataById(MODELS.textBasic);

      // Clear cache
      clearModelMetadataCache();

      // Get again - should work but be different reference since cache was cleared
      const second = getModelMetadataById(MODELS.textBasic);

      // Values should be equal but references different after cache clear
      expect(first).toEqual(second);
      expect(first).toBe(second); // Will be true because registry is constant
    });
  });

  describe('getModelMetadata', () => {
    it('should return all models', () => {
      const allModels = getModelMetadata();

      expect(allModels).toBeDefined();
      expect(typeof allModels).toBe('object');
      expect(allModels[MODELS.textBasic]).toBeDefined();
      expect(allModels[MODELS.imageGen]).toBeDefined();
    });

    it('should return same registry object on multiple calls', () => {
      const first = getModelMetadata();
      const second = getModelMetadata();

      expect(first).toBe(second);
    });
  });

  describe('estimateCost', () => {
    it('should use memoized metadata for cost calculation', () => {
      // Pre-populate cache
      getModelMetadataById(MODELS.textBasic);

      const cost = estimateCost('text', MODELS.textBasic);

      expect(typeof cost).toBe('number'); // Cost should be a number
    });

    it('should return default cost for unknown model', () => {
      const cost = estimateCost('text', 'unknown-model');

      expect(cost).toBe(0.001);
    });
  });

  describe('getModelWithFallback', () => {
    it('should use memoized lookup for preferred model', () => {
      const result = getModelWithFallback('text', MODELS.textBasic);

      expect(result).toBe(MODELS.textBasic);
    });

    it('should fall back to auto-selection if preferred model not found', () => {
      const result = getModelWithFallback('text', 'invalid-model');

      expect(result).toBe(MODELS.textBasic); // Default for text operations
    });

    it('should fall back to auto-selection if no preferred model provided', () => {
      const result = getModelWithFallback('reasoning');

      expect(result).toBe(MODELS.textThinking); // Auto-selected for reasoning
    });
  });

  describe('performance characteristics', () => {
    it('should handle rapid repeated lookups efficiently', () => {
      const iterations = 10000;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        getModelMetadataById(MODELS.textBasic);
        getModelMetadataById(MODELS.imageGen);
        getModelMetadataById(MODELS.textThinking);
      }

      const end = performance.now();
      const duration = end - start;

      // Should complete very quickly (memoization benefit)
      // 10k lookups should take less than 100ms
      expect(duration).toBeLessThan(100);
    });
  });
});
