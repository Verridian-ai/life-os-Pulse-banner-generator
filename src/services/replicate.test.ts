import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReplicateService } from './replicate';
import { api } from './api';

// Mock api module
vi.mock('./api', () => ({
    api: {
        post: vi.fn()
    }
}));

describe('ReplicateService', () => {
    let service: ReplicateService;
    const apiKey = 'test-key';
    const onProgress = vi.fn();

    beforeEach(() => {
        service = new ReplicateService(apiKey, onProgress);
        vi.clearAllMocks();
    });

    it('should call generic endpoint correctly', async () => {
        const mockUrl = 'https://replicate.com/result.png';
        vi.mocked(api.post).mockResolvedValueOnce({ url: mockUrl });

        const result = await service.generateLayer('prompt', 100, 100);

        expect(result).toBe(mockUrl);
        expect(api.post).toHaveBeenCalledWith(
            '/api/replicate/generate-layer',
            { prompt: 'prompt', width: 100, height: 100, replicateKey: apiKey }
        );
        expect(onProgress).toHaveBeenCalledWith(10); // Start
        expect(onProgress).toHaveBeenCalledWith(100); // End
    });

    it('should handle errors', async () => {
        const errorMsg = 'API Error';
        vi.mocked(api.post).mockResolvedValueOnce({ error: errorMsg });

        await expect(service.faceEnhance('img-data')).rejects.toThrow(errorMsg);
        expect(onProgress).toHaveBeenCalledWith(0); // Error
    });
});