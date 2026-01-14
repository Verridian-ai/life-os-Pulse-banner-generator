/**
 * Centralized Storage Manager Service
 * Unifies localStorage access with namespaces, TTL, auto-cleanup, and quota monitoring.
 */

interface StorageItem<T> {
  value: T;
  expiresAt: number; // 0 means no expiration
  timestamp: number; // Created/Updated at
}

export class StorageManager {
  private namespace: string;
  private defaultTtl: number;

  constructor(namespace: string, defaultTtl: number = 0) {
    this.namespace = namespace;
    this.defaultTtl = defaultTtl;
  }

  /**
   * Get the full namespaced key
   */
  private getKey(key: string): string {
    return `${this.namespace}${key}`;
  }

  /**
   * Save a value to storage
   * @param key Short key (without namespace)
   * @param value Value to store
   * @param ttl Optional specific TTL in ms (overrides default)
   */
  set<T>(key: string, value: T, ttl: number = this.defaultTtl): boolean {
    try {
      const item: StorageItem<T> = {
        value,
        expiresAt: ttl > 0 ? Date.now() + ttl : 0,
        timestamp: Date.now(),
      };
      localStorage.setItem(this.getKey(key), JSON.stringify(item));
      return true;
    } catch {
      console.warn(`[StorageManager] Quota exceeded for ${this.namespace}, clearing expired items`);
      this.clearExpiredGlobal(); // Try to clear expired items from ALL namespaces to make space

      try {
        // Retry
        const item: StorageItem<T> = {
          value,
          expiresAt: ttl > 0 ? Date.now() + ttl : 0,
          timestamp: Date.now(),
        };
        localStorage.setItem(this.getKey(key), JSON.stringify(item));
        return true;
      } catch (retryError) {
        console.error(`[StorageManager] Failed to set ${key} after cleanup`, retryError);
        return false;
      }
    }
  }

  /**
   * Get a value from storage
   * @param key Short key (without namespace)
   */
  get<T>(key: string): T | null {
    try {
      const fullKey = this.getKey(key);
      const raw = localStorage.getItem(fullKey);

      if (!raw) return null;

      const item: StorageItem<T> = JSON.parse(raw);

      // Check expiration
      if (item.expiresAt > 0 && Date.now() > item.expiresAt) {
        localStorage.removeItem(fullKey);
        return null;
      }

      return item.value;
    } catch (e) {
      console.error(`[StorageManager] Parse error for ${key}`, e);
      return null;
    }
  }

  /**
   * Remove an item
   */
  remove(key: string): void {
    localStorage.removeItem(this.getKey(key));
  }

  /**
   * Clear all items in this namespace
   */
  clear(): void {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(this.namespace)) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Clear expired items in this namespace
   */
  clearExpired(): void {
    Object.keys(localStorage).forEach((key) => {
      if (!key.startsWith(this.namespace)) return;

      this.checkAndRemoveExpired(key);
    });
  }

  /**
   * Helper to clean global storage (static)
   * Useful when quota is hit
   */
  private clearExpiredGlobal(): void {
    Object.keys(localStorage).forEach((key) => {
      this.checkAndRemoveExpired(key);
    });
  }

  private checkAndRemoveExpired(key: string) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        // We loosely attempt to parse any JSON.
        // If it fits our schema and is expired, we delete it.
        const item = JSON.parse(raw);
        if (item && typeof item === 'object' && 'expiresAt' in item) {
          if (item.expiresAt > 0 && Date.now() > item.expiresAt) {
            localStorage.removeItem(key);
          }
        }
      }
    } catch {
      // Not our format or not JSON, ignore
    }
  }

  /**
   * Get all keys in this namespace (with namespace prefix removed)
   */
  getAllKeys(): string[] {
    const keys: string[] = [];
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(this.namespace)) {
        keys.push(key.slice(this.namespace.length));
      }
    });
    return keys;
  }

  /**
   * Get storage usage in characters for this namespace
   */
  getUsage(): number {
    let total = 0;
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(this.namespace)) {
        total += localStorage.getItem(key)?.length || 0;
      }
    });
    return total;
  }

  /**
   * Get or create a hash index for fast similarity lookups
   * Index structure: { [hashHex: string]: string[] }
   */
  getHashIndex(): Map<string, string[]> {
    const indexKey = '__hash_index__';
    try {
      const raw = localStorage.getItem(this.getKey(indexKey));
      if (raw) {
        const parsed = JSON.parse(raw);
        return new Map(Object.entries(parsed));
      }
    } catch {
      // Index corrupted, will rebuild
    }
    return new Map();
  }

  /**
   * Save hash index to storage
   */
  saveHashIndex(index: Map<string, string[]>): void {
    const indexKey = '__hash_index__';
    try {
      const obj = Object.fromEntries(index);
      localStorage.setItem(this.getKey(indexKey), JSON.stringify(obj));
    } catch {
      console.warn('[StorageManager] Failed to save hash index');
    }
  }

  /**
   * Add entry to hash index
   */
  addToHashIndex(hashHex: string, cacheKey: string): void {
    const index = this.getHashIndex();
    const existing = index.get(hashHex) || [];
    if (!existing.includes(cacheKey)) {
      existing.push(cacheKey);
      index.set(hashHex, existing);
      this.saveHashIndex(index);
    }
  }

  /**
   * Remove entry from hash index
   */
  removeFromHashIndex(hashHex: string, cacheKey: string): void {
    const index = this.getHashIndex();
    const existing = index.get(hashHex);
    if (existing) {
      const filtered = existing.filter((k) => k !== cacheKey);
      if (filtered.length > 0) {
        index.set(hashHex, filtered);
      } else {
        index.delete(hashHex);
      }
      this.saveHashIndex(index);
    }
  }
}

// Export instances for common services
export const aiCacheStorage = new StorageManager('nanobanna_ai_cache_', 1000 * 60 * 60); // 1 hour
// Note: Error metrics were using 'error_metrics' key directly. We migrate to 'nanobanna_error_metrics_'
export const errorMetricsStorage = new StorageManager('nanobanna_error_metrics_');
export const modelPreferencesStorage = new StorageManager('nanobanna_model_pref_');
export const modelMetricsStorage = new StorageManager(
  'nanobanna_model_metrics_',
  1000 * 60 * 60 * 24 * 7,
); // 7 days retention
export const onboardingStorage = new StorageManager('nanobanna_onboarding_');
export const promptHistoryStorage = new StorageManager('nanobanna_prompt_history_', 0); // Permanent storage
export const snapshotStorage = new StorageManager('nanobanna_snapshots_', 0); // Permanent storage
