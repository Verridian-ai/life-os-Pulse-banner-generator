import { describe, it, expect, vi, beforeEach } from 'vitest';
import { enhancePrompt } from './promptService';
import { api } from './api';

import { Mock } from 'vitest';

vi.mock('./api', () => ({
    api: {
        post: vi.fn(),
    },
}));

const mockPost = api.post as Mock;

describe('promptService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('enhancePrompt', () => {
        it('should call api.post with prompt and context', async () => {
            const mockResponse = { enhancedPrompt: 'A detailed prompt', originalPrompt: 'Simple prompt' };
            mockPost.mockResolvedValue(mockResponse);

            const prompt = 'Simple prompt';
            const context = { industry: 'tech', style: 'minimalist' };
            const result = await enhancePrompt(prompt, context);

            expect(api.post).toHaveBeenCalledWith('/api/ai/prompt/enhance', {
                prompt,
                context
            });
            expect(result).toEqual(mockResponse);
        });

        it('should log enhancement process', async () => {
            const consoleSpy = vi.spyOn(console, 'log');
            mockPost.mockResolvedValue({ enhancedPrompt: '...', originalPrompt: '...' });

            await enhancePrompt('test prompt');

            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[Prompt Enhance]'));
        });
    });
});
