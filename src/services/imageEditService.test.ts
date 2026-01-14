import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  editImage,
  removeBackground,
  upscaleImage,
  outpaintImage,
  restoreImage,
} from './imageEditService';
import { api } from './api';
import { MODELS } from '../constants';

import { Mock } from 'vitest';

vi.mock('./api', () => ({
  api: {
    post: vi.fn(),
  },
}));

const mockPost = api.post as Mock;

vi.mock('./apiKeyStorage', () => ({
  getUserAPIKeys: vi
    .fn()
    .mockResolvedValue({ replicate_api_key: 'test', openrouter_api_key: 'test' }),
}));

describe('imageEditService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('editImage', () => {
    it('should attempt OpenRouter first', async () => {
      mockPost.mockResolvedValueOnce({ url: 'edit_url' });

      const result = await editImage('base64', 'modify this');

      expect(api.post).toHaveBeenCalledWith(
        '/api/ai/image/edit',
        expect.objectContaining({
          prompt: 'modify this',
          provider: 'openrouter',
          model: MODELS.imageEdit,
        }),
      );
      expect(result).toBe('edit_url');
    });

    it('should fallback to Replicate if OpenRouter fails', async () => {
      mockPost
        .mockRejectedValueOnce(new Error('OpenRouter fail'))
        .mockResolvedValueOnce({ url: 'replicate_edit_url' });

      const result = await editImage('base64', 'modify this');

      expect(api.post).toHaveBeenCalledTimes(2);
      expect(api.post).toHaveBeenLastCalledWith(
        '/api/ai/image/edit',
        expect.objectContaining({
          provider: 'replicate',
        }),
      );
      expect(result).toBe('replicate_edit_url');
    });
  });

  describe('removeBackground', () => {
    it('should call remove-bg endpoint', async () => {
      mockPost.mockResolvedValue({ url: 'nobg_url' });
      const result = await removeBackground('img');
      expect(api.post).toHaveBeenCalledWith(
        '/api/ai/image/remove-bg',
        expect.objectContaining({ image: 'img' }),
      );
      expect(result).toBe('nobg_url');
    });
  });

  describe('upscaleImage', () => {
    it('should call upscale endpoint with default scale', async () => {
      mockPost.mockResolvedValue({ url: 'big_url' });
      const result = await upscaleImage('img');
      expect(api.post).toHaveBeenCalledWith(
        '/api/ai/image/upscale',
        expect.objectContaining({ scale: 2 }),
      );
      expect(result).toBe('big_url');
    });
  });

  describe('outpaintImage', () => {
    it('should call outpaint endpoint with direction', async () => {
      mockPost.mockResolvedValue({ url: 'wide_url' });
      const result = await outpaintImage('img', 'extend', 'right');
      expect(api.post).toHaveBeenCalledWith(
        '/api/ai/image/outpaint',
        expect.objectContaining({ direction: 'right' }),
      );
      expect(result).toBe('wide_url');
    });
  });

  describe('restoreImage', () => {
    it('should call restore endpoint with fidelity', async () => {
      mockPost.mockResolvedValue({ url: 'clean_url' });
      const result = await restoreImage('img', 0.8);
      expect(api.post).toHaveBeenCalledWith(
        '/api/ai/image/restore',
        expect.objectContaining({ fidelity: 0.8 }),
      );
      expect(result).toBe('clean_url');
    });
  });
});
