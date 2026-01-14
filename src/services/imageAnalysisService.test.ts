import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeImageForPrompts, analyzeCanvasAndSuggest } from './imageAnalysisService';
import { api } from './api';
import { MODELS } from '../constants';

import { Mock } from 'vitest';

vi.mock('./api', () => ({
  api: {
    post: vi.fn(),
  },
}));

const mockPost = api.post as Mock;

describe('imageAnalysisService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('analyzeImageForPrompts', () => {
    it('should return parsed JSON suggestions', async () => {
      const mockJson = { magicEdit: ['prompt1'], generation: ['prompt2'] };
      mockPost.mockResolvedValue({ text: JSON.stringify(mockJson) });

      const result = await analyzeImageForPrompts('base64');

      expect(api.post).toHaveBeenCalledWith(
        '/api/ai/chat',
        expect.objectContaining({
          model: MODELS.openrouter.glm47,
        }),
      );
      expect(result).toEqual(mockJson);
    });

    it('should handle markdown JSON blocks', async () => {
      const mockJson = { magicEdit: ['a'], generation: ['b'] };
      mockPost.mockResolvedValue({ text: '```json\n' + JSON.stringify(mockJson) + '\n```' });

      const result = await analyzeImageForPrompts('base64');
      expect(result).toEqual(mockJson);
    });

    it('should return empty arrays on parse fail', async () => {
      mockPost.mockResolvedValue({ text: 'Invalid JSON' });
      const result = await analyzeImageForPrompts('base64');
      expect(result).toEqual({ magicEdit: [], generation: [] });
    });
  });

  describe('analyzeCanvasAndSuggest', () => {
    it('should return suggestions and reasoning', async () => {
      const mockJson = { suggestions: ['Fix font'], reasoning: 'Too small' };
      mockPost.mockResolvedValue({ text: JSON.stringify(mockJson) });

      const result = await analyzeCanvasAndSuggest('base64');
      expect(result).toEqual(mockJson);
    });

    it('should return fallback on parse fail', async () => {
      mockPost.mockResolvedValue({ text: 'Error' });
      const result = await analyzeCanvasAndSuggest('base64');
      expect(result.suggestions).toEqual([]);
      expect(result.reasoning).toBe('Analysis failed');
    });
  });
});
