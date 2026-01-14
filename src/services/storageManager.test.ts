import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StorageManager } from './storageManager';

describe('StorageManager', () => {
  let storage: StorageManager;
  const NAMESPACE = 'test_namespace_';

  beforeEach(() => {
    localStorage.clear();
    storage = new StorageManager(NAMESPACE);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should set and get values', () => {
    storage.set('key1', 'value1');
    expect(storage.get('key1')).toBe('value1');
    expect(localStorage.getItem(NAMESPACE + 'key1')).toContain('"value":"value1"');
  });

  it('should return null for non-existent keys', () => {
    expect(storage.get('nonexistent')).toBeNull();
  });

  it('should respect TTL', () => {
    storage.set('key_ttl', 'value', 1000); // 1 sec TTL
    expect(storage.get('key_ttl')).toBe('value');

    // Advance time
    vi.advanceTimersByTime(1500);

    expect(storage.get('key_ttl')).toBeNull();
    // Should be removed from localStorage after access attempt
    expect(localStorage.getItem(NAMESPACE + 'key_ttl')).toBeNull();
  });

  it('should clear all items in namespace', () => {
    storage.set('key1', 'value1');
    storage.set('key2', 'value2');
    localStorage.setItem('other_namespace_key', 'value3');

    storage.clear();

    expect(storage.get('key1')).toBeNull();
    expect(storage.get('key2')).toBeNull();
    expect(localStorage.getItem('other_namespace_key')).toBe('value3');
  });

  it('should clear expired items', () => {
    storage.set('valid', 'value', 2000);
    storage.set('expired', 'value', 500);

    vi.advanceTimersByTime(1000);

    storage.clearExpired();

    expect(storage.get('valid')).toBe('value');
    expect(localStorage.getItem(NAMESPACE + 'expired')).toBeNull();
  });
});
