/**
 * Simple cache for AI responses to prevent duplicate expensive calls
 * Stores results in localStorage with a TTL
 */

const CACHE_PREFIX = 'nanobanna_ai_cache_';
const DEFAULT_TTL = 1000 * 60 * 60; // 1 hour

export const aiCache = {
  get: (key: string): string | null => {
    try {
      const cached = localStorage.getItem(CACHE_PREFIX + key);
      if (!cached) return null;
      
      const { value, expiresAt } = JSON.parse(cached);
      if (Date.now() > expiresAt) {
        localStorage.removeItem(CACHE_PREFIX + key);
        return null;
      }
      
      return value;
    } catch {
      return null;
    }
  },

  set: (key: string, value: string, ttl: number = DEFAULT_TTL) => {
    try {
      const data = {
        value,
        expiresAt: Date.now() + ttl
      };
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(data));
    } catch {
      // If storage is full, clear old cache items
      aiCache.clearExpired();
    }
  },

  clearExpired: () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const { expiresAt } = JSON.parse(cached);
            if (Date.now() > expiresAt) localStorage.removeItem(key);
          }
        } catch {
          // Ignore errors during cache cleanup
        }
      }
    });
  }
};
