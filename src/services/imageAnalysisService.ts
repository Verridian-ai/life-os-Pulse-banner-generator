import { MODELS } from '../constants';
import { api } from './api';
import { ChatMessage, OpenRouterContentItem } from './llm-types';

export const analyzeImageForPrompts = async (base64Image: string) => {
    const content: OpenRouterContentItem[] = [
        { type: 'image_url', image_url: { url: base64Image.startsWith('data:') ? base64Image : `data:image/png;base64,${base64Image}` } },
        { type: 'text', text: 'Suggest 3 magic edit prompts and 3 generation prompts. Return JSON: { "magicEdit": [], "generation": [] }' }
    ];

    const response = await api.post<{ text: string }>('/api/ai/chat', {
        messages: [{ role: 'user', content: content }],
        model: MODELS.openrouter.glm47,
        provider: 'openrouter'
    });

    const text = response.text;
    try {
        const json = JSON.parse(text.replace(/```json|```/g, ''));
        return { magicEdit: json.magicEdit || [], generation: json.generation || [] };
    } catch (e) {
        console.error('[ImageAnalysis] Failed to parse magic edit prompts:', e);
        return { magicEdit: [], generation: [] };
    }
};

export const analyzeCanvasAndSuggest = async (canvasScreenshot: string, _brandProfile: unknown = null) => {
    const content: OpenRouterContentItem[] = [
        { type: 'image_url', image_url: { url: canvasScreenshot.startsWith('data:') ? canvasScreenshot : `data:image/png;base64,${canvasScreenshot}` } },
        { type: 'text', text: 'Analyze this LinkedIn banner. Suggest 3 improvements. Return JSON: { "suggestions": [], "reasoning": "" }' }
    ];

    const messages: ChatMessage[] = [
        { role: 'system', content: "You are Nano Banna Pro, an expert design AI." },
        { role: 'user', content: content }
    ];

    const response = await api.post<{ text: string }>('/api/ai/chat', {
        messages,
        model: MODELS.openrouter.glm47,
        provider: 'openrouter'
    });

    const text = response.text;
    try {
        const json = JSON.parse(text.replace(/```json|```/g, ''));
        return { suggestions: json.suggestions || [], reasoning: json.reasoning || '' };
    } catch (e) {
        console.error('[ImageAnalysis] Failed to parse suggestions:', e);
        return { suggestions: [], reasoning: 'Analysis failed' };
    }
};

export const compareImages = async (image1: string, image2: string) => {
    const content: OpenRouterContentItem[] = [
        { type: 'text', text: 'Compare these two images side-by-side. Analyze differences in composition, colors, brightness, and overall effectiveness for a LinkedIn banner. Return JSON: { "comparison": "detailed comparison text", "preference": "image 1 or image 2", "reasoning": "why" }' },
        { type: 'image_url', image_url: { url: image1.startsWith('data:') ? image1 : `data:image/png;base64,${image1}` } },
        { type: 'image_url', image_url: { url: image2.startsWith('data:') ? image2 : `data:image/png;base64,${image2}` } }
    ];

    const messages: ChatMessage[] = [
        { role: 'system', content: "You are Nano Banna Pro, an expert design AI. You compare visual designs." },
        { role: 'user', content: content }
    ];

    const response = await api.post<{ text: string }>('/api/ai/chat', {
        messages,
        model: MODELS.openrouter.glm47,
        provider: 'openrouter'
    });

    const text = response.text;
    try {
        const json = JSON.parse(text.replace(/```json|```/g, ''));
        return {
            comparison: json.comparison || 'Comparison failed',
            preference: json.preference || 'None',
            reasoning: json.reasoning || ''
        };
    } catch (e) {
        console.error('[ImageAnalysis] Failed to parse comparison result:', e);
        return { comparison: 'Failed to parse comparison result', preference: 'None', reasoning: '' };
    }
};
