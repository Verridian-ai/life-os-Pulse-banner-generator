import { aiCacheStorage } from './storageManager';
import {
  calculateSimilarity,
  standardizeString,
  computeSimHash,
  hammingDistance,
  bigintToString,
  stringToBigint
} from '../utils/stringUtils';

const DEFAULT_TTL = 1000 * 60 * 60; // 1 hour
const SIMILARITY_THRESHOLD = 0.9; // 90% similarity required for cache hit
const HAMMING_THRESHOLD = 12; // Max 12 bits different (~81% similar) for candidate selection

export const aiCache = {
  get: (key: string): string | null => {
    return aiCacheStorage.get<string>(key);
  },

  /**
   * Fuzzy get with LSH optimization
   * Uses SimHash for O(1) candidate selection, Levenshtein for verification
   */
  getSimilar: (key: string): string | null => {
    // 1. Check exact match first (fastest)
    const exact = aiCacheStorage.get<string>(key);
    if (exact) return exact;

    // 2. Normalize input and compute hash
    const normalizedKey = standardizeString(key);
    const keyHash = computeSimHash(normalizedKey);

    // 3. Load hash index and find candidates
    const hashIndex = aiCacheStorage.getHashIndex();
    const candidates: Array<{ key: string; hammingDist: number }> = [];

    for (const [hashHex, keys] of hashIndex) {
      const storedHash = stringToBigint(hashHex);
      const dist = hammingDistance(keyHash, storedHash);

      if (dist <= HAMMING_THRESHOLD) {
        for (const k of keys) {
          // Verify key still exists in cache
          if (aiCacheStorage.get<string>(k) !== null) {
            candidates.push({ key: k, hammingDist: dist });
          }
        }
      }
    }

    // 4. Sort candidates by hamming distance (closest first)
    candidates.sort((a, b) => a.hammingDist - b.hammingDist);

    // 5. Verify top candidates with Levenshtein (limited to top 5)
    let bestMatchKey: string | null = null;
    let bestScore = 0;

    for (const candidate of candidates.slice(0, 5)) {
      const normalizedStored = standardizeString(candidate.key);
      const score = calculateSimilarity(normalizedKey, normalizedStored);

      if (score > bestScore) {
        bestScore = score;
        bestMatchKey = candidate.key;
      }

      // Early exit if we find a great match
      if (score >= 0.95) break;
    }

    if (bestMatchKey && bestScore >= SIMILARITY_THRESHOLD) {
      console.log(`[AI Cache] LSH hit: "${key.slice(0, 50)}..." matched (${(bestScore * 100).toFixed(1)}%)`);
      return aiCacheStorage.get<string>(bestMatchKey);
    }

    return null;
  },

  set: (key: string, value: string, ttl: number = DEFAULT_TTL): void => {
    // Store the value
    aiCacheStorage.set(key, value, ttl);

    // Update hash index
    const normalizedKey = standardizeString(key);
    const keyHash = computeSimHash(normalizedKey);
    const keyHashHex = bigintToString(keyHash);
    aiCacheStorage.addToHashIndex(keyHashHex, key);
  },

  clearExpired: (): void => {
    aiCacheStorage.clearExpired();
    // Note: Index cleanup happens lazily during getSimilar
  },

  clear: (): void => {
    aiCacheStorage.clear();
  }
};

