import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { uploadImage, getPublicUrl, deleteImage } from './storage';
import { api } from './api';

// Mock the api module
vi.mock('./api', () => ({
  api: {
    post: vi.fn(),
  },
}));

describe('storage service', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe('uploadImage', () => {
    const mockFile = new File(['test content'], 'test.png', { type: 'image/png' });
    const mockUserId = 'user-123';

    it('successfully uploads an image', async () => {
      const mockSignedUrl = 'https://storage.example.com/signed-upload';
      const mockFilePath = 'users/user-123/images/test.png';

      vi.mocked(api.post)
        .mockResolvedValueOnce({ url: mockSignedUrl, filePath: mockFilePath })
        .mockResolvedValueOnce({});

      global.fetch = vi.fn().mockResolvedValue({ ok: true });

      const result = await uploadImage(mockUserId, mockFile);

      expect(api.post).toHaveBeenCalledWith('/api/storage/upload-url', {
        filename: 'test.png',
        contentType: 'image/png',
        sizeBytes: mockFile.size,
      });

      expect(fetch).toHaveBeenCalledWith(mockSignedUrl, {
        method: 'PUT',
        body: mockFile,
        headers: { 'Content-Type': 'image/png' },
      });

      expect(api.post).toHaveBeenCalledWith('/api/storage/confirm-upload', {
        filePath: mockFilePath,
      });

      expect(result).toEqual({
        data: { path: mockFilePath, fullPath: mockFilePath },
        error: null,
      });
    });

    it('returns error when getting signed URL fails', async () => {
      const mockError = new Error('Failed to get signed URL');
      vi.mocked(api.post).mockRejectedValue(mockError);

      const result = await uploadImage(mockUserId, mockFile);

      expect(result.data).toBeNull();
      expect(result.error).toBe(mockError);
    });

    it('returns error when upload to storage fails', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        url: 'https://storage.example.com/signed-upload',
        filePath: 'path/to/file',
      });

      global.fetch = vi.fn().mockResolvedValue({ ok: false });

      const result = await uploadImage(mockUserId, mockFile);

      expect(result.data).toBeNull();
      expect(result.error).toBeInstanceOf(Error);
      expect((result.error as Error).message).toBe('Failed to upload to storage');
    });

    it('returns error when confirm upload fails', async () => {
      const mockError = new Error('Confirm failed');
      vi.mocked(api.post)
        .mockResolvedValueOnce({
          url: 'https://storage.example.com/signed-upload',
          filePath: 'path/to/file',
        })
        .mockRejectedValueOnce(mockError);

      global.fetch = vi.fn().mockResolvedValue({ ok: true });

      const result = await uploadImage(mockUserId, mockFile);

      expect(result.data).toBeNull();
      expect(result.error).toBe(mockError);
    });
  });

  describe('getPublicUrl', () => {
    const mockPath = 'users/user-123/images/test.png';

    it('returns signed URL for private data', async () => {
      const mockSignedUrl = 'https://storage.example.com/signed-read?token=abc123';
      vi.mocked(api.post).mockResolvedValue({ url: mockSignedUrl });

      const result = await getPublicUrl(mockPath);

      expect(api.post).toHaveBeenCalledWith('/api/storage/read-url', { filePath: mockPath });
      expect(result).toEqual({ data: { publicUrl: mockSignedUrl } });
    });

    it('returns empty URL on error', async () => {
      vi.mocked(api.post).mockRejectedValue(new Error('API error'));

      const result = await getPublicUrl(mockPath);

      expect(result).toEqual({ data: { publicUrl: '' } });
    });
  });

  describe('deleteImage', () => {
    const mockPath = 'users/user-123/images/test.png';

    it('successfully deletes an image', async () => {
      vi.mocked(api.post).mockResolvedValue({});

      const result = await deleteImage(mockPath);

      expect(api.post).toHaveBeenCalledWith('/api/storage/delete', { filePath: mockPath });
      expect(result).toEqual({ data: {}, error: null });
    });

    it('returns error when delete fails', async () => {
      const mockError = new Error('Delete failed');
      vi.mocked(api.post).mockRejectedValue(mockError);

      const result = await deleteImage(mockPath);

      expect(result.data).toBeNull();
      expect(result.error).toBe(mockError);
    });
  });
});
