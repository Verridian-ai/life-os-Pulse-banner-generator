import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReplicateService, ReplicateError, getReplicateService } from './replicate';

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Replicate Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  const mockPredictionStarted = {
    id: 'pred_123',
    status: 'starting',
    output: null
  };

  const mockPredictionSucceeded = {
    id: 'pred_123',
    status: 'succeeded',
    output: 'https://example.com/output.png'
  };

  const mockPredictionFailed = {
    id: 'pred_123',
    status: 'failed',
    error: 'Processing failed'
  };

  describe('ReplicateError', () => {
    it('should create error with message', () => {
      const error = new ReplicateError('Test error');

      expect(error.message).toBe('Test error');
      expect(error.name).toBe('ReplicateError');
    });

    it('should include prediction ID', () => {
      const error = new ReplicateError('Test error', 'pred_123');

      expect(error.predictionId).toBe('pred_123');
    });

    it('should include status', () => {
      const error = new ReplicateError('Test error', 'pred_123', 'failed');

      expect(error.status).toBe('failed');
    });
  });

  describe('ReplicateService initialization', () => {
    it('should create service with API key', () => {
      const service = new ReplicateService('test-key');

      expect(service).toBeDefined();
    });

    it('should create service with progress callback', () => {
      const onProgress = vi.fn();
      const service = new ReplicateService('test-key', onProgress);

      expect(service).toBeDefined();
    });
  });

  describe('upscale', () => {
    it('should upscale image successfully', async () => {
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPredictionStarted
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPredictionSucceeded
        } as Response);

      const service = new ReplicateService('test-key');
      const result = await service.upscale('https://example.com/input.png', 'balanced');

      expect(result).toBe('https://example.com/output.png');
    });

    it('should handle upscale with different quality settings', async () => {
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPredictionStarted
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPredictionSucceeded
        } as Response);

      const service = new ReplicateService('test-key');
      const result = await service.upscale('https://example.com/input.png', 'fast');

      expect(result).toBeDefined();
    });

    it('should throw error without API key', async () => {
      const service = new ReplicateService('');

      await expect(service.upscale('https://example.com/input.png'))
        .rejects.toThrow('API key not found');
    });
  });

  describe('removeBg', () => {
    it('should remove background successfully', async () => {
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPredictionStarted
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPredictionSucceeded
        } as Response);

      const service = new ReplicateService('test-key');
      const result = await service.removeBg('https://example.com/input.png');

      expect(result).toBe('https://example.com/output.png');
    });
  });

  describe('inpaint', () => {
    it('should inpaint image with prompt', async () => {
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPredictionStarted
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPredictionSucceeded
        } as Response);

      const service = new ReplicateService('test-key');
      const result = await service.inpaint(
        'https://example.com/input.png',
        'Add a sunset background'
      );

      expect(result).toBeDefined();
    });

    it('should inpaint with mask', async () => {
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPredictionStarted
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPredictionSucceeded
        } as Response);

      const service = new ReplicateService('test-key');
      const result = await service.inpaint(
        'https://example.com/input.png',
        'Fill masked area',
        'https://example.com/mask.png'
      );

      expect(result).toBeDefined();
    });

    it('should support different models', async () => {
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPredictionStarted
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPredictionSucceeded
        } as Response);

      const service = new ReplicateService('test-key');
      const result = await service.inpaint(
        'https://example.com/input.png',
        'Test prompt',
        undefined,
        'ideogram'
      );

      expect(result).toBeDefined();
    });
  });

  describe('outpaint', () => {
    it('should outpaint image in specified direction', async () => {
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPredictionStarted
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPredictionSucceeded
        } as Response);

      const service = new ReplicateService('test-key');
      const result = await service.outpaint(
        'https://example.com/input.png',
        'Extend landscape',
        'right'
      );

      expect(result).toBeDefined();
    });
  });

  describe('restore', () => {
    it('should restore degraded image', async () => {
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPredictionStarted
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPredictionSucceeded
        } as Response);

      const service = new ReplicateService('test-key');
      const result = await service.restore('https://example.com/input.png');

      expect(result).toBeDefined();
    });
  });

  describe('faceEnhance', () => {
    it('should enhance faces in image', async () => {
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPredictionStarted
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPredictionSucceeded
        } as Response);

      const service = new ReplicateService('test-key');
      const result = await service.faceEnhance('https://example.com/input.png');

      expect(result).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle API errors', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ detail: 'Invalid API key' })
      } as Response);

      const service = new ReplicateService('invalid-key');

      await expect(service.upscale('https://example.com/input.png'))
        .rejects.toThrow('Replicate API Error');
    });

    it('should handle failed predictions', async () => {
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPredictionStarted
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPredictionFailed
        } as Response);

      const service = new ReplicateService('test-key');

      await expect(service.upscale('https://example.com/input.png'))
        .rejects.toThrow('Prediction failed');
    });

    it('should handle prediction with no output', async () => {
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPredictionStarted
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ...mockPredictionSucceeded, output: null })
        } as Response);

      const service = new ReplicateService('test-key');

      await expect(service.upscale('https://example.com/input.png'))
        .rejects.toThrow('no output returned');
    });
  });

  describe('progress callback', () => {
    it('should call progress callback during processing', async () => {
      const onProgress = vi.fn();

      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPredictionStarted
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ...mockPredictionStarted, status: 'processing' })
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPredictionSucceeded
        } as Response);

      const service = new ReplicateService('test-key', onProgress);
      await service.upscale('https://example.com/input.png');

      expect(onProgress).toHaveBeenCalled();
    });
  });

  describe('cancelPrediction', () => {
    it('should cancel running prediction', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true
      } as Response);

      const service = new ReplicateService('test-key');
      await service.cancelPrediction('pred_123');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/cancel'),
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('should handle cancel errors gracefully', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false
      } as Response);

      const service = new ReplicateService('test-key');

      // Should not throw
      await expect(service.cancelPrediction('pred_123')).resolves.not.toThrow();
    });
  });

  describe('getPredictionStatus', () => {
    it('should fetch prediction status', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPredictionStarted
      } as Response);

      const service = new ReplicateService('test-key');
      const status = await service.getPredictionStatus('pred_123');

      expect(status.id).toBe('pred_123');
      expect(status.status).toBe('starting');
    });

    it('should handle fetch errors', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false
      } as Response);

      const service = new ReplicateService('test-key');

      await expect(service.getPredictionStatus('pred_123'))
        .rejects.toThrow('Failed to fetch prediction status');
    });
  });

  describe('getReplicateService', () => {
    it('should create service from localStorage', () => {
      localStorageMock.setItem('replicate_api_key', 'test-key');

      const service = getReplicateService();

      expect(service).toBeDefined();
    });

    it('should create service with progress callback', () => {
      const onProgress = vi.fn();

      const service = getReplicateService(onProgress);

      expect(service).toBeDefined();
    });
  });
});
