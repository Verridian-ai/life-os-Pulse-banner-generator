import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateDesignChatResponse, generateAgentResponse, generateThinkingResponse, generateSearchResponse, generatePromptFromRefImages } from './chatService';
import { api } from './api';
import { MODELS, DESIGN_SYSTEM_INSTRUCTION } from '../constants';
import { PROFILE_ZONE_CONSTRAINT } from './llm-types';

import { Mock } from 'vitest';

// Mock api module
vi.mock('./api', () => ({
    api: {
        post: vi.fn(),
    },
}));

const mockPost = api.post as Mock;

describe('chatService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('generateDesignChatResponse', () => {
        it('should call api.post with correct parameters', async () => {
            const mockResponse = { text: 'Design suggestion' };
            mockPost.mockResolvedValue(mockResponse);

            const prompt = 'Add a logo';
            const result = await generateDesignChatResponse(prompt);

            expect(api.post).toHaveBeenCalledWith('/api/ai/chat', expect.objectContaining({
                messages: expect.arrayContaining([
                    expect.objectContaining({ role: 'system', content: [{ type: 'text', text: DESIGN_SYSTEM_INSTRUCTION + PROFILE_ZONE_CONSTRAINT }] }),
                    expect.objectContaining({ role: 'user', content: [{ type: 'text', text: prompt }] }),
                ]),
                model: MODELS.openrouter.glm47,
                provider: 'openrouter',
            }));
            expect(result).toEqual({ text: 'Design suggestion', groundingMetadata: null });
        });

        it('should handle history and images correctly', async () => {
            mockPost.mockResolvedValue({ text: 'Response' });

            const history = [
                { role: 'user', parts: [{ text: 'Old message' }] },
                { role: 'model', parts: [{ text: 'Old response' }] },
            ];
            const images = ['img1_base64'];
            const prompt = 'New prompt';

            await generateDesignChatResponse(prompt, images, history);

            const lastCall = mockPost.mock.calls[0][1];
            expect(lastCall.messages).toHaveLength(4); // system + (history * 2) + new user
            expect(lastCall.messages[lastCall.messages.length - 1].content).toEqual([
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: 'img1_base64' } },
            ]);
        });
    });

    describe('generateAgentResponse', () => {
        it('should call api.post with voice agent parameters', async () => {
            mockPost.mockResolvedValue({ text: 'Voice response' });

            const transcript = 'Make it blue';
            const screenshot = 'screenshot_base64';
            const result = await generateAgentResponse(transcript, screenshot);

            expect(api.post).toHaveBeenCalledWith('/api/ai/chat', expect.objectContaining({
                messages: expect.arrayContaining([
                    expect.objectContaining({ role: 'system' }),
                    expect.objectContaining({
                        role: 'user', content: expect.arrayContaining([
                            { type: 'text', text: transcript },
                            { type: 'image_url', image_url: { url: screenshot } },
                        ])
                    }),
                ]),
                model: MODELS.openrouter.glm47,
            }));
            expect(result).toEqual({ text: 'Voice response' });
        });
    });

    describe('generateThinkingResponse', () => {
        it('should call api.post with thinking system prompt', async () => {
            mockPost.mockResolvedValue({ text: 'Reasoning...' });

            const prompt = 'Why design matters?';
            const result = await generateThinkingResponse(prompt);

            expect(api.post).toHaveBeenCalledWith('/api/ai/chat', expect.objectContaining({
                messages: [
                    { role: 'system', content: 'You are a deep thinking assistant.' },
                    { role: 'user', content: prompt },
                ],
                model: MODELS.openrouter.glm47,
            }));
            expect(result.text).toBe('Reasoning...');
        });
    });

    describe('generateSearchResponse', () => {
        it('should use Perplexity model for search', async () => {
            mockPost.mockResolvedValue({ text: 'Search results' });

            const prompt = 'Current design trends 2026';
            const result = await generateSearchResponse(prompt);

            expect(api.post).toHaveBeenCalledWith('/api/ai/chat', expect.objectContaining({
                model: MODELS.openrouter.sonarDeepResearch,
                messages: expect.arrayContaining([
                    expect.objectContaining({
                        role: 'system', content: expect.arrayContaining([
                            expect.objectContaining({ text: expect.stringContaining('Trend Researcher') })
                        ])
                    })
                ])
            }));
            expect(result.text).toBe('Search results');
        });
    });

    describe('generatePromptFromRefImages', () => {
        it('should analyze reference images to create a prompt', async () => {
            mockPost.mockResolvedValue({ text: 'A futuristic banner prompt' });

            const images = ['ref1', 'ref2'];
            const hint = 'neon style';
            const result = await generatePromptFromRefImages(images, hint);

            expect(api.post).toHaveBeenCalledWith('/api/ai/chat', expect.objectContaining({
                messages: [{
                    role: 'user',
                    content: [
                        { type: 'text', text: expect.stringContaining(hint) },
                        { type: 'image_url', image_url: { url: 'ref1' } },
                        { type: 'image_url', image_url: { url: 'ref2' } },
                    ]
                }]
            }));
            expect(result).toBe('A futuristic banner prompt');
        });
    });
});
