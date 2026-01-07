import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateImage } from './imageGenerationService';
import { api } from './api';
import { aiCache } from './aiCache';
import { MODELS } from '../constants';

// Mocks
vi.mock('./api', () => ({
    api: {
        post: vi.fn()
    }
}));

vi.mock('./apiKeyStorage', () => ({
    getUserAPIKeys: vi.fn().mockResolvedValue({})
}));

vi.mock('./aiCache', () => ({
    aiCache: {
        get: vi.fn(),
        set: vi.fn()
    }
}));

vi.mock('./imageEditService', () => ({
    editImage: vi.fn()
}));

vi.mock('../utils/imageUtils', () => ({
    prepareForOutpainting: vi.fn(),
    resizeToCanvasDimensions: vi.fn().mockResolvedValue('resized-url')
}));

describe('generateImage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(aiCache.get).mockReturnValue(null);
    });

    it('should return cached URL if available', async () => {
        vi.mocked(aiCache.get).mockReturnValue('cached-url');
        
        const result = await generateImage('test prompt');
        expect(result).toBe('cached-url');
        expect(api.post).not.toHaveBeenCalled();
    });

    it('should call Nano Banana Pro (OpenRouter) first', async () => {
        const mockUrl = 'generated-url';
        vi.mocked(api.post).mockResolvedValueOnce({ url: mockUrl });

        const result = await generateImage('test prompt');
        
        expect(result).toBe(mockUrl);
        expect(api.post).toHaveBeenCalledWith(
            '/api/ai/image/generate',
            expect.objectContaining({
                provider: 'openrouter',
                model: MODELS.imageGen,
                prompt: expect.stringContaining('test prompt')
            })
        );
    });

    it('should fallback to Flux Schnell if Nano Banana Pro fails', async () => {
        const mockUrl = 'fallback-url';
        // First call fails
        vi.mocked(api.post)
            .mockRejectedValueOnce(new Error('Fail 1'))
            .mockResolvedValueOnce({ url: mockUrl }); // Second call succeeds

        const result = await generateImage('test prompt');

        expect(result).toBe(mockUrl);
        expect(api.post).toHaveBeenCalledTimes(2);
        expect(api.post).toHaveBeenNthCalledWith(2,
            '/api/ai/image/generate',
            expect.objectContaining({
                provider: 'replicate',
                model: 'black-forest-labs/flux-schnell'
            })
        );
    });
});