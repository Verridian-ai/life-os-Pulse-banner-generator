import { describe, it, expect, vi } from 'vitest';
import {
  classifyError,
  getUserFriendlyMessage,
  handleError,
  retry,
  fetchWithTimeout
} from './errorHandler';

describe('Error Handler', () => {
  describe('classifyError', () => {
    it('should classify network errors', () => {
      const error = new Error('Failed to fetch');
      const type = classifyError(error);
      expect(type).toBe('network');
    });

    it('should classify timeout errors', () => {
      const error = new Error('timeout of 5000ms exceeded');
      const type = classifyError(error);
      expect(type).toBe('timeout');
    });

    it('should classify API errors', () => {
      const error = new Error('API key invalid');
      const type = classifyError(error);
      expect(type).toBe('api_key');
    });

    it('should classify rate limit errors', () => {
      const error = new Error('Rate limit exceeded');
      const type = classifyError(error);
      expect(type).toBe('rate_limit');
    });

    it('should classify quota errors', () => {
      const error = new Error('Quota exceeded');
      const type = classifyError(error);
      expect(type).toBe('quota');
    });

    it('should classify unknown errors', () => {
      const error = new Error('Some random error');
      const type = classifyError(error);
      expect(type).toBe('unknown');
    });
  });

  describe('getUserFriendlyMessage', () => {
    it('should provide friendly network error message', () => {
      const error = new Error('Failed to fetch');
      const message = getUserFriendlyMessage(error);
      expect(message).toContain('network');
    });

    it('should provide friendly timeout message', () => {
      const error = new Error('timeout exceeded');
      const message = getUserFriendlyMessage(error);
      expect(message).toContain('timeout');
    });

    it('should provide friendly API key error message', () => {
      const error = new Error('Invalid API key');
      const message = getUserFriendlyMessage(error);
      expect(message).toContain('API key');
    });
  });

  describe('handleError', () => {
    it('should log error and return message', () => {
      const error = new Error('Test error');
      const message = handleError(error, 'TestComponent');
      expect(message).toBeDefined();
      expect(typeof message).toBe('string');
    });

    it('should handle non-Error objects', () => {
      const error = 'String error';
      const message = handleError(error, 'TestComponent');
      expect(message).toBeDefined();
    });
  });

  describe('retry', () => {
    it('should succeed on first try', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      const result = await retry(fn, { maxAttempts: 3, delay: 100 });
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');

      const result = await retry(fn, { maxAttempts: 3, delay: 10 });
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retries', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('fail'));

      await expect(retry(fn, { maxAttempts: 3, delay: 10 })).rejects.toThrow('fail');
      expect(fn).toHaveBeenCalledTimes(3);
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
      global.fetch = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 10000))
      );

      await expect(
        fetchWithTimeout('https://api.example.com/test', {}, 100)
      ).rejects.toThrow('timeout');
    });
  });
});
