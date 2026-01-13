import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { testOpenRouterKey, testReplicateKey, validateKeyFormat } from './apiKeyValidator';

describe('apiKeyValidator', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe('validateKeyFormat', () => {
    describe('openrouter provider', () => {
      it('returns invalid when key is empty', () => {
        const result = validateKeyFormat('openrouter', '');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('API key is required');
      });

      it('returns invalid when key does not start with sk-or-', () => {
        const result = validateKeyFormat('openrouter', 'invalid-key-format');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('OpenRouter keys should start with sk-or-');
      });

      it('returns invalid when key is too short', () => {
        const result = validateKeyFormat('openrouter', 'sk-or-short');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Key appears too short');
      });

      it('returns valid for properly formatted key', () => {
        const result = validateKeyFormat('openrouter', 'sk-or-v1-abcdefghij123456789012345');
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    describe('replicate provider', () => {
      it('returns invalid when key is empty', () => {
        const result = validateKeyFormat('replicate', '');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('API key is required');
      });

      it('returns invalid when key does not start with r8_', () => {
        const result = validateKeyFormat('replicate', 'invalid-key-format');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Replicate keys should start with r8_');
      });

      it('returns invalid when key is too short', () => {
        const result = validateKeyFormat('replicate', 'r8_short');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Key appears too short');
      });

      it('returns valid for properly formatted key', () => {
        const result = validateKeyFormat('replicate', 'r8_abcdefghij123456789012345');
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });
  });

  describe('testOpenRouterKey', () => {
    it('returns invalid when key is empty', async () => {
      const result = await testOpenRouterKey('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('API key is required');
    });

    it('returns invalid when key format is wrong', async () => {
      const result = await testOpenRouterKey('invalid-key');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid key format (should start with sk-or-)');
    });

    it('returns valid with model count when API call succeeds', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: Array(150).fill({}) }),
      });

      const result = await testOpenRouterKey('sk-or-v1-test123456789012345');
      expect(result.valid).toBe(true);
      expect(result.modelCount).toBe(150);
    });

    it('returns invalid for 401 response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
      });

      const result = await testOpenRouterKey('sk-or-v1-test123456789012345');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid API key or unauthorized');
    });

    it('returns invalid for 403 response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
      });

      const result = await testOpenRouterKey('sk-or-v1-test123456789012345');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid API key or unauthorized');
    });

    it('returns API error for other status codes', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await testOpenRouterKey('sk-or-v1-test123456789012345');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('API error: 500');
    });

    it('returns connection error on fetch failure', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await testOpenRouterKey('sk-or-v1-test123456789012345');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Connection failed: Network error');
    });

    it('handles non-Error rejection', async () => {
      global.fetch = vi.fn().mockRejectedValue('Unknown failure');

      const result = await testOpenRouterKey('sk-or-v1-test123456789012345');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Connection failed: Unknown error');
    });
  });

  describe('testReplicateKey', () => {
    it('returns invalid when key is empty', async () => {
      const result = await testReplicateKey('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('API key is required');
    });

    it('returns invalid when key format is wrong', async () => {
      const result = await testReplicateKey('invalid-key');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid key format (should start with r8_)');
    });

    it('returns valid when API call succeeds', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
      });

      const result = await testReplicateKey('r8_test123456789012345');
      expect(result.valid).toBe(true);
    });

    it('returns invalid for 401 response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
      });

      const result = await testReplicateKey('r8_test123456789012345');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid API key or unauthorized');
    });

    it('returns invalid for 403 response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
      });

      const result = await testReplicateKey('r8_test123456789012345');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid API key or unauthorized');
    });

    it('returns API error for other status codes', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await testReplicateKey('r8_test123456789012345');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('API error: 500');
    });

    it('returns connection error on fetch failure', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await testReplicateKey('r8_test123456789012345');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Connection failed: Network error');
    });

    it('handles non-Error rejection', async () => {
      global.fetch = vi.fn().mockRejectedValue('Unknown failure');

      const result = await testReplicateKey('r8_test123456789012345');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Connection failed: Unknown error');
    });
  });
});
