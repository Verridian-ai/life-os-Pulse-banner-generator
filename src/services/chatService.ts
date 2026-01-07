import { MODELS, DESIGN_SYSTEM_INSTRUCTION } from '../constants';
import { Part } from '../types';
import { api } from './api';
import {
    ChatMessage,
    OpenRouterContentItem,
    PROFILE_ZONE_CONSTRAINT
} from './llm-types';

import { validatePrompt, validateChatHistory } from '../utils/inputValidation';

export const generateDesignChatResponse = async (
    rawPrompt: string,
    images: string[] = [],
    history: { role: string; parts: Part[] }[] = [],
) => {
    const prompt = validatePrompt(rawPrompt);
    validateChatHistory(history);

    // Construct messages on client to maintain state control, but send to server for execution
    const messages: ChatMessage[] = history.map((h) => ({
        role: h.role === 'model' ? 'assistant' : 'user',
        content: h.parts.map(p => p.text ? { type: 'text', text: p.text } : { type: 'image_url', image_url: { url: p.inlineData ? `data:${p.inlineData.mimeType};base64,${p.inlineData.data}` : '' } }).filter(Boolean) as OpenRouterContentItem[]
    }));

    const currentContent: OpenRouterContentItem[] = [{ type: 'text', text: prompt }];
    images.forEach(img => currentContent.push({ type: 'image_url', image_url: { url: img } }));
    messages.push({ role: 'user', content: currentContent });

    const systemContent: OpenRouterContentItem[] = [{ type: 'text', text: DESIGN_SYSTEM_INSTRUCTION + PROFILE_ZONE_CONSTRAINT }];
    messages.unshift({ role: 'system', content: systemContent });

    // Call Backend API
    const response = await api.post<{ text: string }>('/api/ai/chat', {
        messages,
        model: MODELS.openrouter.glm47, // Updated to user requested model
        provider: 'openrouter'
    });

    return { text: response.text, groundingMetadata: null };
};

export const generateAgentResponse = async (
    rawUserTranscript: string,
    currentScreenshot: string | null,
    history: { role: string; parts: Part[] }[] = [],
) => {
    const userTranscript = validatePrompt(rawUserTranscript);
    validateChatHistory(history);

    const messages: ChatMessage[] = history.map(h => ({ role: h.role === 'model' ? 'assistant' : 'user', content: h.parts?.[0]?.text || '' }));

    const content: OpenRouterContentItem[] = [{ type: 'text', text: userTranscript }];
    if (currentScreenshot) content.push({ type: 'image_url', image_url: { url: currentScreenshot } });

    messages.push({ role: 'user', content });
    messages.unshift({ role: 'system', content: "You are Nano, an expert design partner. You are helpful, enthusiastic, and concise." });

    const response = await api.post<{ text: string }>('/api/ai/chat', {
        messages,
        model: MODELS.openrouter.glm47,
        provider: 'openrouter'
    });

    return { text: response.text };
};

export const generateThinkingResponse = async (rawPrompt: string) => {
    const prompt = validatePrompt(rawPrompt);
    const messages = [{ role: 'system', content: 'You are a deep thinking assistant.' }, { role: 'user', content: prompt }];

    const response = await api.post<{ text: string }>('/api/ai/chat', {
        messages,
        model: MODELS.openrouter.glm47,
        provider: 'openrouter'
    });

    return { text: response.text, groundingMetadata: null };
};

export const generateSearchResponse = async (rawPrompt: string, history: { role: string; parts: Part[] }[] = []) => {
    const prompt = validatePrompt(rawPrompt);
    validateChatHistory(history);

    // Construct messages for Perplexity (Online Model)
    // Perplexity works best with standard OpenAI-like message format
    const messages: ChatMessage[] = history.map((h) => ({
        role: h.role === 'model' ? 'assistant' : 'user',
        content: h.parts.map(p => p.text ? { type: 'text', text: p.text } : null).filter(Boolean) as OpenRouterContentItem[]
    }));

    // Add current prompt
    messages.push({ role: 'user', content: [{ type: 'text', text: prompt }] });

    // Add system instruction for search behavior
    messages.unshift({
        role: 'system',
        content: [{ type: 'text', text: "You are an expert Trend Researcher for LinkedIn branding. Search the web for the latest trends, data, and visual styles. Be specific, cite sources if possible, and focus on actionable insights for banner design." }]
    });

    // Call Backend API with Perplexity Model
    const response = await api.post<{ text: string }>('/api/ai/chat', {
        messages,
        model: MODELS.openrouter.sonarDeepResearch,
        provider: 'openrouter'
    });

    return { text: response.text, groundingMetadata: null };
};

export const generatePromptFromRefImages = async (images: string[], rawUserHint: string) => {
    const userHint = validatePrompt(rawUserHint);
    const content: OpenRouterContentItem[] = [{ type: 'text', text: `Analyze these reference images. Hint: ${userHint}. Return a prompt.` }];
    images.forEach(img => content.push({ type: 'image_url', image_url: { url: img } }));

    const response = await api.post<{ text: string }>('/api/ai/chat', {
        messages: [{ role: 'user', content }],
        model: MODELS.openrouter.glm47,
        provider: 'openrouter'
    });
    return response.text;
};
