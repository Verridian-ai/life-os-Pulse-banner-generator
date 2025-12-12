import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ActionExecutor } from './actionExecutor';
import type { ToolCall } from './actionExecutor';

// Mock services
vi.mock('./llm', () => ({
  generateImage: vi.fn()
}));

vi.mock('./replicate', () => ({
  getReplicateService: vi.fn(() => ({
    upscale: vi.fn(),
    removeBg: vi.fn(),
    restore: vi.fn(),
    faceEnhance: vi.fn()
  }))
}));

import { generateImage } from './llm';
import { getReplicateService } from './replicate';

describe('ActionExecutor', () => {
  let onUpdate: ReturnType<typeof vi.fn>;
  let executor: ActionExecutor;

  beforeEach(() => {
    vi.clearAllMocks();
    onUpdate = vi.fn();
    executor = new ActionExecutor(onUpdate);
  });

  describe('initialization', () => {
    it('should create executor with callback', () => {
      expect(executor).toBeDefined();
    });

    it('should create executor in preview mode', () => {
      const previewExecutor = new ActionExecutor(onUpdate, true);
      expect(previewExecutor).toBeDefined();
    });
  });

  describe('setPreviewMode', () => {
    it('should toggle preview mode', () => {
      executor.setPreviewMode(true);
      executor.setPreviewMode(false);

      // No error should be thrown
      expect(true).toBe(true);
    });
  });

  describe('executeToolCall - generate_background', () => {
    const toolCall: ToolCall = {
      name: 'generate_background',
      args: {
        prompt: 'A beautiful sunset',
        quality: '2K'
      }
    };

    it('should generate background successfully', async () => {
      (generateImage as any).mockResolvedValueOnce('https://example.com/image.png');

      const result = await executor.executeToolCall(toolCall);

      expect(result.success).toBe(true);
      expect(result.result).toBe('https://example.com/image.png');
      expect(onUpdate).toHaveBeenCalledWith('https://example.com/image.png', 'background');
    });

    it('should handle generation errors', async () => {
      (generateImage as any).mockRejectedValueOnce(new Error('Generation failed'));

      const result = await executor.executeToolCall(toolCall);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Generation failed');
    });

    it('should return preview in preview mode', async () => {
      executor.setPreviewMode(true);
      (generateImage as any).mockResolvedValueOnce('https://example.com/image.png');

      const result = await executor.executeToolCall(toolCall);

      expect(result.success).toBe(true);
      expect(result.preview).toBe('https://example.com/image.png');
      expect(onUpdate).not.toHaveBeenCalled();
    });

    it('should handle null image generation', async () => {
      (generateImage as any).mockResolvedValueOnce(null);

      const result = await executor.executeToolCall(toolCall);

      expect(result.success).toBe(false);
      expect(result.error).toContain('null');
    });

    it('should use default quality if not specified', async () => {
      (generateImage as any).mockResolvedValueOnce('https://example.com/image.png');

      await executor.executeToolCall({
        name: 'generate_background',
        args: { prompt: 'Test' }
      });

      expect(generateImage).toHaveBeenCalledWith('Test', [], '2K');
    });
  });

  describe('executeToolCall - magic_edit', () => {
    it('should return error for magic_edit', async () => {
      const toolCall: ToolCall = {
        name: 'magic_edit',
        args: {
          base_image: 'https://example.com/base.png',
          prompt: 'Edit this'
        }
      };

      const result = await executor.executeToolCall(toolCall);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Studio tab');
    });
  });

  describe('executeToolCall - remove_background', () => {
    it('should return not implemented error', async () => {
      const toolCall: ToolCall = {
        name: 'remove_background',
        args: {
          image_url: 'https://example.com/image.png'
        }
      };

      const result = await executor.executeToolCall(toolCall);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not yet implemented');
    });
  });

  describe('executeToolCall - upscale_image', () => {
    const toolCall: ToolCall = {
      name: 'upscale_image',
      args: {
        image_url: 'https://example.com/image.png',
        mode: 'balanced'
      }
    };

    it('should upscale image successfully', async () => {
      const mockService = {
        upscale: vi.fn().mockResolvedValue('https://example.com/upscaled.png')
      };
      (getReplicateService as any).mockReturnValueOnce(mockService);

      const result = await executor.executeToolCall(toolCall);

      expect(result.success).toBe(true);
      expect(result.result).toBe('https://example.com/upscaled.png');
      expect(onUpdate).toHaveBeenCalledWith('https://example.com/upscaled.png', 'background');
    });

    it('should handle upscale errors', async () => {
      const mockService = {
        upscale: vi.fn().mockRejectedValue(new Error('Upscale failed'))
      };
      (getReplicateService as any).mockReturnValueOnce(mockService);

      const result = await executor.executeToolCall(toolCall);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Upscale failed');
    });

    it('should use default mode if not specified', async () => {
      const mockService = {
        upscale: vi.fn().mockResolvedValue('https://example.com/upscaled.png')
      };
      (getReplicateService as any).mockReturnValueOnce(mockService);

      await executor.executeToolCall({
        name: 'upscale_image',
        args: { image_url: 'https://example.com/image.png' }
      });

      expect(mockService.upscale).toHaveBeenCalledWith(
        'https://example.com/image.png',
        'balanced'
      );
    });
  });

  describe('executeToolCall - restore_image', () => {
    it('should restore image successfully', async () => {
      const mockService = {
        restore: vi.fn().mockResolvedValue('https://example.com/restored.png')
      };
      (getReplicateService as any).mockReturnValueOnce(mockService);

      const result = await executor.executeToolCall({
        name: 'restore_image',
        args: { image_url: 'https://example.com/image.png' }
      });

      expect(result.success).toBe(true);
      expect(result.result).toBe('https://example.com/restored.png');
    });

    it('should handle restore errors', async () => {
      const mockService = {
        restore: vi.fn().mockRejectedValue(new Error('Restore failed'))
      };
      (getReplicateService as any).mockReturnValueOnce(mockService);

      const result = await executor.executeToolCall({
        name: 'restore_image',
        args: { image_url: 'https://example.com/image.png' }
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Restore failed');
    });
  });

  describe('executeToolCall - enhance_face', () => {
    it('should enhance face successfully', async () => {
      const mockService = {
        faceEnhance: vi.fn().mockResolvedValue('https://example.com/enhanced.png')
      };
      (getReplicateService as any).mockReturnValueOnce(mockService);

      const result = await executor.executeToolCall({
        name: 'enhance_face',
        args: { image_url: 'https://example.com/image.png' }
      });

      expect(result.success).toBe(true);
      expect(result.result).toBe('https://example.com/enhanced.png');
      expect(onUpdate).toHaveBeenCalledWith('https://example.com/enhanced.png', 'profile');
    });

    it('should handle face enhance errors', async () => {
      const mockService = {
        faceEnhance: vi.fn().mockRejectedValue(new Error('Enhance failed'))
      };
      (getReplicateService as any).mockReturnValueOnce(mockService);

      const result = await executor.executeToolCall({
        name: 'enhance_face',
        args: { image_url: 'https://example.com/image.png' }
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Enhance failed');
    });
  });

  describe('executeToolCall - unknown tool', () => {
    it('should handle unknown tool', async () => {
      const result = await executor.executeToolCall({
        name: 'unknown_tool',
        args: {}
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown tool');
    });
  });

  describe('applyPreview', () => {
    it('should apply preview to background', () => {
      executor.applyPreview('https://example.com/preview.png', 'background');

      expect(onUpdate).toHaveBeenCalledWith('https://example.com/preview.png', 'background');
    });

    it('should apply preview to profile', () => {
      executor.applyPreview('https://example.com/preview.png', 'profile');

      expect(onUpdate).toHaveBeenCalledWith('https://example.com/preview.png', 'profile');
    });

    it('should use default type if not specified', () => {
      executor.applyPreview('https://example.com/preview.png');

      expect(onUpdate).toHaveBeenCalledWith('https://example.com/preview.png', 'background');
    });
  });
});
