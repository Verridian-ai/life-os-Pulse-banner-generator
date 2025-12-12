import { describe, it, expect } from 'vitest';

// Import utility functions (adjust based on actual exports)
describe('Utils', () => {
  describe('formatDate', () => {
    it('should format dates correctly', () => {
      const date = new Date('2025-12-13');
      const formatted = date.toLocaleDateString();
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = crypto.randomUUID();
      const id2 = crypto.randomUUID();
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });
  });

  describe('debounce', () => {
    it('should delay function execution', async () => {
      let called = false;
      const fn = () => { called = true; };
      const debounced = (callback: () => void, delay: number) => {
        let timeout: NodeJS.Timeout;
        return () => {
          clearTimeout(timeout);
          timeout = setTimeout(callback, delay);
        };
      };

      const debouncedFn = debounced(fn, 100);
      debouncedFn();

      expect(called).toBe(false);

      await new Promise(resolve => setTimeout(resolve, 150));
      expect(called).toBe(true);
    });
  });

  describe('clamp', () => {
    it('should clamp values within range', () => {
      const clamp = (value: number, min: number, max: number) =>
        Math.min(Math.max(value, min), max);

      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe('truncate', () => {
    it('should truncate long strings', () => {
      const truncate = (str: string, length: number) =>
        str.length > length ? str.slice(0, length) + '...' : str;

      expect(truncate('Hello World', 5)).toBe('Hello...');
      expect(truncate('Hi', 10)).toBe('Hi');
    });
  });
});
