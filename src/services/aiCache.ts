import { aiCacheStorage } from './storageManager';
import { calculateSimilarity, standardizeString } from '../utils/stringUtils';

const DEFAULT_TTL = 1000 * 60 * 60; // 1 hour
const SIMILARITY_THRESHOLD = 0.9; // 90% similarity required for cache hit

export const aiCache = {
  get: (key: string): string | null => {
    return aiCacheStorage.get<string>(key);
  },

  /**
   * Fuzzy get - looks for a cached prompt that is very similar to the requested one
   * @param key The prompt to search for
   * @returns The cached response if a similar enough prompt is found
   */
  getSimilar: (key: string): string | null => {
    // 1. Check exact match first (fastest)
    const exact = aiCacheStorage.get<string>(key);
    if (exact) return exact;

    // 2. Normalize input
    const normalizedKey = standardizeString(key);

    // 3. Search for similar keys
    const allKeys = aiCacheStorage.getAllKeys();

    // Find best match
    let bestMatchKey: string | null = null;
    let bestScore = 0;

    for (const storedKey of allKeys) {
      const normalizedStored = standardizeString(storedKey);
      const score = calculateSimilarity(normalizedKey, normalizedStored);

      if (score > bestScore) {
        bestScore = score;
        bestMatchKey = storedKey;
      }
    }

    if (bestMatchKey && bestScore >= SIMILARITY_THRESHOLD) {
      console.log(`[AI Cache] Fuzzy hit: "${key}" matched "${bestMatchKey}" (${(bestScore * 100).toFixed(1)}%)`);
      return aiCacheStorage.get<string>(bestMatchKey);
    }

    return null;
  },

  set: (key: string, value: string, ttl: number = DEFAULT_TTL) => {
    aiCacheStorage.set(key, value, ttl);
  },

  clearExpired: () => {
    aiCacheStorage.clearExpired();
  },

  clear: () => {
    aiCacheStorage.clear();
  }
};

