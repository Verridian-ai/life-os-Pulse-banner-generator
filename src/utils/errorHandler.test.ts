import { describe, it, expect, vi } from 'vitest';
import {
  classifyError,
  getUserFriendlyMessage,
  retry,
  fetchWithTimeout,
} from './errorHandler';

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
      expect(message).toContain('Connection failed');
    });
  });

  describe('retry', () => {
    it('should succeed on first try', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      const result = await retry(fn, { maxAttempts: 3, delay: 10 });
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure (retryable error)', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Failed to fetch'))
        .mockRejectedValueOnce(new Error('Failed to fetch'))
        .mockResolvedValue('success');

      const result = await retry(fn, { maxAttempts: 3, delay: 10 });
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retries', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Failed to fetch'));

      await expect(retry(fn, { maxAttempts: 3, delay: 10 })).rejects.toThrow();
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should not retry on non-retryable error', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Invalid API key'));

      await expect(retry(fn, { maxAttempts: 3, delay: 10 })).rejects.toThrow();
      expect(fn).toHaveBeenCalledTimes(1); // Should give up immediately
    });
  });

  describe('fetchWithTimeout', () => {
    it('should fetch successfully', async () => {
      const mockResponse = new Response('{"data": "test"}', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const response = await fetchWithTimeout('https://api.example.com/test', {}, 5000);
      expect(response.status).toBe(200);
    });

    it('should timeout on slow requests', async () => {
      global.fetch = vi.fn().mockImplementation((url, init) => {
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => resolve(new Response()), 1000);
          if (init?.signal) {
            init.signal.addEventListener('abort', () => {
              clearTimeout(timeout);
              const error = new Error('AbortError');
              error.name = 'AbortError';
              reject(error);
            });
          }
        });
      });

      await expect(fetchWithTimeout('https://api.example.com/test', {}, 50)).rejects.toThrow(
        'timeout',
      );
    });
  });
});
