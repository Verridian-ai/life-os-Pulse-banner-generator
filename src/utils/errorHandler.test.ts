import { describe, it, expect, vi } from 'vitest';
import { classifyError, getUserFriendlyMessage, withRetry } from './errorHandler';

describe('Error Handler', () => {
  describe('classifyError', () => {
    it('should classify network errors', () => {
      const error = new Error('Failed to fetch');
      const classified = classifyError(error);
      expect(classified.type).toBe('fetch');
      expect(classified.retryable).toBe(true);
    });

    it('should classify timeout errors', () => {
      const error = new Error('timeout of 5000ms exceeded');
      const classified = classifyError(error);
      expect(classified.type).toBe('timeout');
      expect(classified.retryable).toBe(true);
    });

    it('should classify API errors', () => {
      const error = new Error('API key invalid');
      const classified = classifyError(error);
      expect(classified.type).toBe('api');
      expect(classified.retryable).toBe(false);
    });
  });

  describe('getUserFriendlyMessage', () => {
    it('should provide friendly network error message', () => {
      const error = new Error('Failed to fetch');
      const message = getUserFriendlyMessage(error);
      // The actual message returned is 'Network connection failed...'
      expect(message).toContain('Network connection failed');
    });
  });

  describe('withRetry', () => {
    it('should succeed on first try', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      const result = await withRetry(fn, { maxRetries: 3, baseDelay: 10 });
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure (retryable error)', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Failed to fetch'))
        .mockRejectedValueOnce(new Error('Failed to fetch'))
        .mockResolvedValue('success');

      const result = await withRetry(fn, { maxRetries: 3, baseDelay: 10 });
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retries', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Failed to fetch'));

      await expect(withRetry(fn, { maxRetries: 3, baseDelay: 10 })).rejects.toThrow();
      expect(fn).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });

    it('should not retry on non-retryable error', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Invalid API key'));

      await expect(withRetry(fn, { maxRetries: 3, baseDelay: 10 })).rejects.toThrow();
      expect(fn).toHaveBeenCalledTimes(1); // Should give up immediately
    });
  });
});
