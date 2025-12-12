
import { GoogleGenAI } from "@google/genai";
import { MODELS, DESIGN_SYSTEM_INSTRUCTION } from "../constants";
import { Part } from "../types";
import type { ImageEditTurn, BrandProfile } from "../types/ai";
import { uploadImage } from "./supabase";
import { createImage } from "./database";
import { retry, fetchWithTimeout, classifyError, getUserFriendlyMessage } from "../utils/errorHandler";

// Types
type LLMProvider = 'gemini' | 'openrouter';

const getSettings = () => {
    const provider = (localStorage.getItem('llm_provider') as LLMProvider) || 'gemini';

    // Hardcoded API keys for testing (TODO: Remove before production)
    const HARDCODED_GEMINI_KEY = 'AIzaSyBSeZLyOLZed0RQj4DByKDnv3PVnVZfbNM';
    const HARDCODED_OPENROUTER_KEY = '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';
    const HARDCODED_REPLICATE_KEY = ''; // No valid key - user must provide one

    const geminiKey = localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || HARDCODED_GEMINI_KEY;
    const openRouterKey = localStorage.getItem('openrouter_api_key') || import.meta.env.VITE_OPENROUTER_API_KEY || HARDCODED_OPENROUTER_KEY;
    const replicateKey = localStorage.getItem('replicate_api_key') || import.meta.env.VITE_REPLICATE_API_KEY || HARDCODED_REPLICATE_KEY;

    console.log('[Settings] Replicate Key from localStorage:', localStorage.getItem('replicate_api_key') ? 'Found' : 'Not found');
    console.log('[Settings] Replicate Key from env:', import.meta.env.VITE_REPLICATE_API_KEY ? 'Found' : 'Not found');
    const stackKey = localStorage.getItem('stack_api_key') || import.meta.env.VITE_STACK_API_KEY || '';
    const model = localStorage.getItem('llm_model') || 'nano-banana-pro';
    const imageModel = localStorage.getItem('llm_image_model') || MODELS.imageGen;
    const upscaleModel = localStorage.getItem('llm_upscale_model') || 'nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73ab241b637189a1445ad';

    return { provider, geminiKey, openRouterKey, replicateKey, stackKey, model, imageModel, upscaleModel };
};

// --- Google Client ---
const getGoogleClient = (key: string) => {
    return new GoogleGenAI({ apiKey: key });
};

// --- OpenRouter Client (Fetch wrapper) ---
const callOpenRouter = async (
    apiKey: string,
    model: string,
    messages: { role: string; content: any }[]
) => {
    if (!apiKey) throw new Error("OpenRouter API Key not found");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": window.location.origin, // Required by OpenRouter
            "X-Title": "NanoBanna Pro", // Required by OpenRouter
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: model,
            messages: messages,
            // Typical parameters, can be adjusted
            temperature: 0.7,
            max_tokens: 4096,
        })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(`OpenRouter Error: ${err.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
};

// --- Replicate Client ---
const callReplicate = async (apiKey: string, version: string, input: any) => {
    console.log('[Replicate] Starting prediction with:', { version, hasApiKey: !!apiKey });

    if (!apiKey) {
        throw new Error("Replicate API Key not found. Please add it in Settings.");
    }

    try {
        // 1. Start Prediction
        const startResponse = await fetch("https://api.replicate.com/v1/predictions", {
            method: "POST",
            headers: {
                "Authorization": `Token ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ version, input })
        });

        console.log('[Replicate] Start response status:', startResponse.status);

        if (!startResponse.ok) {
            const errorText = await startResponse.text();
            console.error('[Replicate] API Error:', errorText);

            let parsedError;
            try {
                parsedError = JSON.parse(errorText);
            } catch {
                throw new Error(`Replicate API error (${startResponse.status}): ${errorText}`);
            }

            // Handle specific error types
            if (startResponse.status === 401) {
                throw new Error("Invalid Replicate API key. Please check your Settings.");
            } else if (startResponse.status === 402) {
                throw new Error("Replicate account has insufficient credits.");
            } else if (startResponse.status === 404) {
                throw new Error("Replicate model not found. Model may be outdated.");
            } else if (startResponse.status === 429) {
                throw new Error("Replicate rate limit exceeded. Please wait and try again.");
            }

            throw new Error(`Replicate Error: ${parsedError.detail || startResponse.statusText}`);
        }

        const startData = await startResponse.json();
        const predictionId = startData.id;
        console.log('[Replicate] Prediction started:', predictionId);

        // 2. Poll for Result
        let prediction = startData;
        let pollCount = 0;
        const maxPolls = 120; // 2 minutes max (120 seconds)

        while (prediction.status !== "succeeded" && prediction.status !== "failed" && prediction.status !== "canceled") {
            if (pollCount >= maxPolls) {
                throw new Error("Replicate prediction timed out after 2 minutes.");
            }

            await new Promise(r => setTimeout(r, 1000)); // Poll every 1s
            const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
                headers: {
                    "Authorization": `Token ${apiKey}`,
                    "Content-Type": "application/json",
                }
            });

            if (!pollResponse.ok) {
                console.error('[Replicate] Poll failed:', pollResponse.status);
                throw new Error(`Replicate polling failed: ${pollResponse.statusText}`);
            }

            prediction = await pollResponse.json();
            pollCount++;

            if (pollCount % 5 === 0) {
                console.log('[Replicate] Polling...', { status: prediction.status, pollCount });
            }
        }

        if (prediction.status === "succeeded") {
            console.log('[Replicate] ✅ Prediction succeeded');
            return prediction.output;
        } else {
            console.error('[Replicate] ❌ Prediction failed:', prediction.error);
            throw new Error(`Replicate Prediction Failed: ${prediction.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('[Replicate] Call failed:', error);
        throw error;
    }
};


// STRICT CONSTRAINT for all visual generation
const PROFILE_ZONE_CONSTRAINT = " IMPORTANT CONSTRAINT: Do NOT place any text, logos, or important visual elements in the bottom-left corner area (coordinates 0,0 to 568,264). This area is obscured by the user's profile picture. ALL TEXT MUST BE PLACED IN THE CENTER OR RIGHT SIDE.";

// Diagnostics
export const testGeminiConnection = async (): Promise<boolean> => {
    try {
        const { geminiKey } = getSettings();
        if (!geminiKey) return false;

        const ai = getGoogleClient(geminiKey);
        const result = await ai.models.generateContent({
            model: "google/gemini-2.0-flash-exp",
            contents: { parts: [{ text: "Test" }] }
        });
        // In new SDK, result is the response object directly or has .response. 
        // Checking documentation pattern: await client.models.generateContent(...) returns response
        return !!result.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (error) {
        console.error("Gemini Test Failed:", error);
        return false;
    }
};

// --- Unified Functions ---

export const generateDesignChatResponse = async (
    prompt: string,
    images: string[] = [], // base64 strings
    history: { role: string; parts: Part[] }[] = [],
    _isRetry: boolean = false
) => {
    const { provider, geminiKey, openRouterKey, model } = getSettings();

    console.log('[Chat] Starting chat with:', { provider, model, hasImages: images.length > 0, isRetry: _isRetry });

    // 1. OpenRouter Path
    if (provider === 'openrouter') {
        // Convert History to OpenAI format for OpenRouter
        const messages = history.map(h => {
            const content = h.parts.map(p => {
                if (p.text) return { type: "text", text: p.text };
                if (p.inlineData) return { type: "image_url", image_url: { url: `data:${p.inlineData.mimeType};base64,${p.inlineData.data}` } };
                return null;
            }).filter(Boolean);
            return { role: h.role === 'model' ? 'assistant' : 'user', content };
        });

        // Add current user message
        const currentContent: any[] = [{ type: "text", text: prompt }];
        images.forEach(img => {
            const mimeType = img.substring(img.indexOf(':') + 1, img.indexOf(';'));
            // Ensure base64 is clean
            const base64 = img; // Usually implies full data URI in this context based on app flow
            currentContent.push({ type: "image_url", image_url: { url: base64 } });
        });
        messages.push({ role: 'user', content: currentContent });

        // Add system instruction if supported (usually accepted as 'system' role)
        messages.unshift({ role: 'system', content: [{ type: 'text', text: DESIGN_SYSTEM_INSTRUCTION + PROFILE_ZONE_CONSTRAINT }] });

        const text = await callOpenRouter(openRouterKey, model, messages);
        return { text, groundingMetadata: null }; // OpenRouter generic doesn't return grounding usually
    }

    // 2. Google Gemini Path (Original Logic)
    // Use specific Thinking model for 'design' mode if using Gemini directly
    try {
        const ai = getGoogleClient(geminiKey);

        const currentParts: Part[] = [{ text: prompt }];
        images.forEach(img => {
            const base64Data = img.split(',')[1] || img;
            const mimeType = img.substring(img.indexOf(':') + 1, img.indexOf(';')) || 'image/png';
            currentParts.push({ inlineData: { mimeType, data: base64Data } });
        });

        const response = await ai.models.generateContent({
            model: MODELS.textThinking, // gemini-3-pro-preview
            contents: [
                ...history,
                { role: 'user', parts: currentParts }
            ],
            config: {
                systemInstruction: DESIGN_SYSTEM_INSTRUCTION + PROFILE_ZONE_CONSTRAINT,
                thinkingConfig: { thinkingBudget: 32768 },
            },
        });

        return {
            text: response.text || "I'm having trouble thinking of a response right now.",
            groundingMetadata: response.candidates?.[0]?.groundingMetadata
        };
    } catch (error) {
        console.error("Gemini Design Error:", error);

        // AUTO-FALLBACK: If Gemini fails, try OpenRouter
        if (!_isRetry && openRouterKey) {
            console.warn('[Chat] ⚠️ Gemini chat failed, falling back to OpenRouter');

            try {
                // Convert history to OpenAI format
                const messages = history.map(h => {
                    const content = h.parts.map(p => {
                        if (p.text) return { type: "text", text: p.text };
                        if (p.inlineData) return { type: "image_url", image_url: { url: `data:${p.inlineData.mimeType};base64,${p.inlineData.data}` } };
                        return null;
                    }).filter(Boolean);
                    return { role: h.role === 'model' ? 'assistant' : 'user', content };
                });

                const currentContent: any[] = [{ type: "text", text: prompt }];
                images.forEach(img => {
                    currentContent.push({ type: "image_url", image_url: { url: img } });
                });
                messages.push({ role: 'user', content: currentContent });
                messages.unshift({ role: 'system', content: [{ type: 'text', text: DESIGN_SYSTEM_INSTRUCTION + PROFILE_ZONE_CONSTRAINT }] });

                const fallbackModel = model || 'google/gemini-3-pro-preview';
                const text = await callOpenRouter(openRouterKey, fallbackModel, messages);

                console.log('[Chat] ✅ OpenRouter fallback successful!');
                return { text, groundingMetadata: null };
            } catch (fallbackError) {
                console.error('[Chat] ❌ OpenRouter fallback also failed:', fallbackError);
                throw error; // Throw original error
            }
        }

        throw error;
    }
};

// --- Agentic Capabilities ---

const AGENT_TOOLS = [
    {
        name: "generate_background",
        description: "Generates a new background image for the banner based on a text prompt.",
        parameters: {
            type: "OBJECT",
            properties: {
                prompt: { type: "STRING", description: "The visual description of the image to generate" },
                style: { type: "STRING", description: "The artistic style (e.g., 'photorealistic', 'cyberpunk', 'minimalist')" }
            },
            required: ["prompt"]
        }
    },
    {
        name: "magic_edit",
        description: "Edits the existing background image using a text instruction.",
        parameters: {
            type: "OBJECT",
            properties: {
                instruction: { type: "STRING", description: "The editing instruction (e.g., 'make it sunset', 'add a laptop')" }
            },
            required: ["instruction"]
        }
    },
    {
        name: "remove_background",
        description: "Removes the background from the current image, leaving only the main subject.",
        parameters: {
            type: "OBJECT",
            properties: {},
            required: []
        }
    },
    {
        name: "upscale_image",
        description: "Upscales the current image 2x to high resolution.",
        parameters: {
            type: "OBJECT",
            properties: {},
            required: []
        }
    }
];

export const generateAgentResponse = async (
    userTranscript: string,
    currentScreenshot: string | null, // Base64
    history: any[] = [],
    _isRetry: boolean = false
): Promise<{ text: string, toolCalls?: any[] }> => {
    const { geminiKey, openRouterKey, model } = getSettings();

    console.log('[Voice Agent] Starting with:', { hasGeminiKey: !!geminiKey, hasOpenRouterKey: !!openRouterKey, isRetry: _isRetry });

    if (!geminiKey && !openRouterKey) {
        return { text: "I need a Gemini or OpenRouter API Key to work. Please check your settings." };
    }

    try {
        const ai = getGoogleClient(geminiKey);

        const parts: any[] = [{ text: userTranscript }];
        if (currentScreenshot) {
            parts.push({ inlineData: { mimeType: 'image/png', data: currentScreenshot.split(',')[1] } });
        }

        // Using generateContent with tools config
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-exp",
            config: {
                systemInstruction: "You are Nano, an expert design partner. You are helpful, enthusiastic, and concise. You have access to tools to control the canvas. When a user asks to change the background or edit something, USE THE TOOLS. Do not just describe what you would do.",
                tools: [{ functionDeclarations: AGENT_TOOLS as any }]
            },
            contents: [
                ...history, // Previous history
                { role: 'user', parts: parts } // Current message
            ]
        });

        // Handle Tool Calls
        const candidates = (response as any).candidates;
        let text = "";
        try {
            if (typeof (response as any).text === 'function') {
                text = (response as any).text();
            } else {
                text = (response as any).text || "";
            }
        } catch (e) {
            text = "";
        }

        let functionCalls: any[] = [];
        if (candidates && candidates[0]?.content?.parts) {
            functionCalls = candidates[0].content.parts
                .filter((part: any) => part.functionCall)
                .map((part: any) => part.functionCall);
        }

        if (functionCalls.length > 0) {
            return { text: text, toolCalls: functionCalls };
        }

        return { text };

    } catch (error) {
        console.error("Agent Error:", error);

        // AUTO-FALLBACK: If Gemini fails, try OpenRouter
        if (!_isRetry && openRouterKey) {
            console.warn('[Voice Agent] ⚠️ Gemini agent failed, falling back to OpenRouter');

            try {
                const messages: any[] = [];

                // Convert history
                history.forEach((msg: any) => {
                    if (msg.role === 'user' || msg.role === 'assistant') {
                        const content: any[] = [];
                        if (msg.parts) {
                            msg.parts.forEach((part: any) => {
                                if (part.text) content.push({ type: 'text', text: part.text });
                                if (part.inlineData) {
                                    content.push({
                                        type: 'image_url',
                                        image_url: { url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` }
                                    });
                                }
                            });
                        }
                        messages.push({ role: msg.role, content });
                    }
                });

                // Add current message
                const currentContent: any[] = [{ type: 'text', text: userTranscript }];
                if (currentScreenshot) {
                    currentContent.push({
                        type: 'image_url',
                        image_url: { url: `data:image/png;base64,${currentScreenshot}` }
                    });
                }
                messages.push({ role: 'user', content: currentContent });

                // Add system instruction
                messages.unshift({
                    role: 'system',
                    content: "You are Nano, an expert design partner. You are helpful, enthusiastic, and concise. You help users create LinkedIn banners."
                });

                const fallbackModel = model || 'google/gemini-3-pro-preview';
                const text = await callOpenRouter(openRouterKey, fallbackModel, messages);

                console.log('[Voice Agent] ✅ OpenRouter fallback successful!');

                // Note: OpenRouter doesn't support tool calls in the same way, so return text only
                return { text, toolCalls: [] };
            } catch (fallbackError) {
                console.error('[Voice Agent] ❌ OpenRouter fallback also failed:', fallbackError);
                return { text: "I'm having trouble connecting. Please check your API keys." };
            }
        }

        return { text: "I'm having trouble connecting to my brain right now." };
    }
};

export const generateThinkingResponse = async (
    prompt: string,
    history: { role: string; parts: Part[] }[] = []
) => {
    // Currently 'Thinking' mode in chat interface calls this.
    // For OpenRouter, we just use standard chat completion.
    const { provider, geminiKey, openRouterKey, model } = getSettings();

    if (provider === 'openrouter') {
        // Re-use logic or simplify?
        // Simplification for text-only thinking
        const messages = history.map(h => ({
            role: h.role === 'model' ? 'assistant' : 'user',
            content: h.parts.map(p => p.text).join('\n')
        }));
        messages.push({ role: 'user', content: prompt });

        const text = await callOpenRouter(openRouterKey, model, messages as any);
        return { text, groundingMetadata: null };
    }

    // Gemini Path
    try {
        const ai = getGoogleClient(geminiKey);
        const response = await ai.models.generateContent({
            model: MODELS.textThinking,
            contents: [
                ...history,
                { role: 'user', parts: [{ text: prompt }] }
            ],
            config: {
                thinkingConfig: { thinkingBudget: 32768 },
            },
        });
        return {
            text: response.text || "No response generated.",
            groundingMetadata: response.candidates?.[0]?.groundingMetadata
        };
    } catch (error) {
        console.error("Gemini Thinking Error:", error);
        throw error;
    }
};

export const generateSearchResponse = async (
    prompt: string,
    history: { role: string; parts: Part[] }[] = []
) => {
    // OpenRouter doesn't inherently support Google Search grounding unless using specific perplexity models maybe.
    // We will Default to Gemini for Search if provider is 'openrouter' BUT warn/fallback?
    // OR we just perform a standard completion and Model might hallucinate or know facts.
    // Let's force Gemini logic for Search if possible, or just standard chat if OpenRouter selected.

    const { provider, geminiKey, openRouterKey, model } = getSettings();

    if (provider === 'openrouter') {
        // Just do standard chat
        const messages = history.map(h => ({
            role: h.role === 'model' ? 'assistant' : 'user',
            content: h.parts.map(p => p.text).join('\n')
        }));
        messages.push({ role: 'user', content: prompt });
        messages.unshift({ role: 'system', content: "You are a helpful assistant. Search the web if you can (simulation)." });

        const text = await callOpenRouter(openRouterKey, model, messages as any);
        return { text, groundingMetadata: null };
    }

    try {
        const ai = getGoogleClient(geminiKey);
        const response = await ai.models.generateContent({
            model: MODELS.textBasic,
            contents: [
                ...history,
                { role: 'user', parts: [{ text: prompt }] }
            ],
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        return {
            text: response.text || "No response generated.",
            groundingMetadata: response.candidates?.[0]?.groundingMetadata
        };
    } catch (error) {
        console.error("Gemini Search Error:", error);
        throw error;
    }
};

// ... (Other functions like generateImage and editImage likely remain Gemini-specific for now unless user has image models on OR)
// For now, we keep Image generation constrained to Gemini as it's specialized.
// We can expose the key setting though.

export const generatePromptFromRefImages = async (images: string[], userHint: string) => {
    // This uses 'thinking' model which is great for visual analysis.
    // Can switch to OpenRouter vision models (gpt-4o, claude-3)
    const { provider, geminiKey, openRouterKey, model } = getSettings();

    if (provider === 'openrouter') {
        const messages: any[] = [{
            role: 'user',
            content: [
                { type: 'text', text: `Analyze available reference images. Extract aesthetic. User hint: ${userHint}. Write a LinkedIn banner prompt.` }
            ]
        }];
        images.forEach(img => {
            messages[0].content.push({ type: "image_url", image_url: { url: img } });
        });

        return await callOpenRouter(openRouterKey, model, messages);
    }

    // Gemini
    try {
        const ai = getGoogleClient(geminiKey);
        const parts: Part[] = [];
        images.forEach(img => {
            const base64Data = img.split(',')[1] || img;
            const mimeType = img.substring(img.indexOf(':') + 1, img.indexOf(';')) || 'image/png';
            parts.push({ inlineData: { mimeType, data: base64Data } });
        });
        parts.push({
            text: `Analyze ... User's specific intent: "${userHint}" ... Return ONLY prompt.`
        });

        const response = await ai.models.generateContent({
            model: MODELS.textThinking,
            contents: [{ role: 'user', parts }],
            config: { thinkingConfig: { thinkingBudget: 1024 } }
        });

        return response.text || "";
    } catch (error) {
        console.error("Magic Prompt Error:", error);
        throw error;
    }
};


// Image Generation with Gemini 3 Pro Image (supports 14 refs, multi-turn, 4K)
export const generateImage = async (
    prompt: string,
    referenceImages: string[] = [], // Up to 14 reference images
    size: "1K" | "2K" | "4K" = "4K",
    editHistory: ImageEditTurn[] = [],
    _isRetry: boolean = false // Internal flag for fallback retry
) => {
    const { provider, geminiKey, openRouterKey, imageModel } = getSettings();
    let modelToUse = imageModel;

    // Auto-fallback: If using Nano Banana Pro and this is first attempt, try it
    // If model not found, we'll retry with Nano Banana automatically
    const isNanoBananaPro = modelToUse === 'gemini-3-pro-image-preview';
    const fallbackModel = 'gemini-2.5-flash-image'; // Nano Banana (publicly available)

    console.log('[Image Gen] Starting generation with:', {
        provider,
        model: modelToUse,
        size,
        refImagesCount: referenceImages.length,
        editHistoryCount: editHistory.length,
        hasApiKey: provider === 'gemini' ? !!geminiKey : !!openRouterKey,
        isRetry: _isRetry,
        willFallback: isNanoBananaPro && !_isRetry
    });

    if (provider === 'openrouter') {
        // OpenRouter Image Gen via Chat Completion
        try {
            const messages = [{
                role: 'user',
                content: `Generate a high-quality professional LinkedIn banner image. Dimensions strictly 16:9 ratio. Prompt: ${prompt} ${PROFILE_ZONE_CONSTRAINT}`
            }];

            const content = await callOpenRouter(openRouterKey, modelToUse, messages);

            // Extract URL from markdown or raw text
            const urlMatch = content.match(/\((https?:\/\/.*?)\)/) || content.match(/(https?:\/\/[^\s]+)/);
            if (urlMatch) {
                return urlMatch[1];
            }

            if (!content) throw new Error("OpenRouter returned empty response for image");
            console.warn("OpenRouter Image Response (Text):", content);
            return content;

        } catch (error) {
            console.error("OpenRouter Image Gen Error:", error);
            throw new Error(`OpenRouter image generation failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    // Gemini 3 Pro Image Path with multi-turn and multi-reference support
    if (!geminiKey) {
        throw new Error("Gemini API key not found. Please add your API key in Settings.");
    }

    const ai = getGoogleClient(geminiKey);

    try {
        // Build multi-turn conversation for iterative editing
        const contents: any[] = [];

        // Add edit history for multi-turn editing
        editHistory.forEach(turn => {
            const inputBase64 = turn.inputImage.includes(',') ? turn.inputImage.split(',')[1] : turn.inputImage;
            const outputBase64 = turn.outputImage.includes(',') ? turn.outputImage.split(',')[1] : turn.outputImage;

            contents.push({
                role: 'user',
                parts: [
                    { inlineData: { mimeType: 'image/png', data: inputBase64 } },
                    { text: turn.prompt }
                ]
            });
            contents.push({
                role: 'model',
                parts: [{ inlineData: { mimeType: 'image/png', data: outputBase64 } }]
            });
        });

        // Add current request with up to 14 reference images
        const currentParts: Part[] = [];

        // Add reference images (max 14) with improved MIME type detection
        referenceImages.slice(0, 14).forEach((img, index) => {
            try {
                let base64Data: string;
                let mimeType: string;

                if (img.startsWith('data:')) {
                    // Extract MIME type from data URI
                    const matches = img.match(/^data:([^;]+);base64,(.+)$/);
                    if (matches) {
                        mimeType = matches[1];
                        base64Data = matches[2];
                    } else {
                        console.warn(`[Image Gen] Invalid data URI format for ref image ${index}`);
                        base64Data = img.split(',')[1] || img;
                        mimeType = 'image/png';
                    }
                } else {
                    // Assume raw base64
                    base64Data = img;
                    mimeType = 'image/png';
                }

                currentParts.push({
                    inlineData: { mimeType, data: base64Data }
                });
                console.log(`[Image Gen] Added ref image ${index + 1}/${referenceImages.length} (${mimeType})`);
            } catch (err) {
                console.warn(`[Image Gen] Skipping invalid ref image ${index}:`, err);
            }
        });

        // Add text prompt
        const safePrompt = `Professional LinkedIn Banner, 1584x396 pixels ratio (approx 4:1 aspect), high quality. ${prompt} ${PROFILE_ZONE_CONSTRAINT}`;
        currentParts.push({ text: safePrompt });

        contents.push({ role: 'user', parts: currentParts });

        console.log(`[Image Gen] Calling Gemini API with model: ${modelToUse}, size: ${size}`);

        // Call Gemini API with the model from settings (NOT hardcoded MODELS.imageGen)
        const response = await ai.models.generateContent({
            model: modelToUse, // USE THE MODEL FROM SETTINGS!
            contents,
            config: {
                imageConfig: {
                    imageSize: size,
                    aspectRatio: "16:9",
                }
            }
        });

        console.log('[Image Gen] API response received, extracting image...');

        // Extract generated image with detailed logging
        const candidates = response.candidates || [];
        if (candidates.length === 0) {
            throw new Error("API returned no candidates. Response may have been blocked by safety filters.");
        }

        for (let i = 0; i < candidates.length; i++) {
            const candidate = candidates[i];
            const parts = candidate.content?.parts || [];

            for (let j = 0; j < parts.length; j++) {
                const part = parts[j];
                if (part.inlineData) {
                    console.log(`[Image Gen] ✓ Image found in candidate ${i}, part ${j}`);
                    const base64Image = `data:image/png;base64,${part.inlineData.data}`;

                    // Upload to Supabase Storage
                    try {
                        console.log('[Image Gen] Uploading to Supabase Storage...');
                        const fileName = `generated_${Date.now()}.png`;
                        const publicUrl = await uploadImage(base64Image, fileName);
                        console.log('[Image Gen] ✅ Saved to Supabase:', publicUrl);

                        // Save to database
                        try {
                            const saved = await createImage({
                                storage_url: publicUrl,
                                file_name: fileName,
                                prompt: prompt,
                                model_used: modelToUse,
                                quality: size,
                                generation_type: 'generate'
                            });

                            if (saved) {
                                console.log('[Image Gen] ✅ Saved to database and gallery');
                            } else {
                                console.warn('[Image Gen] ⚠️ Image generated but NOT saved to gallery');
                                console.warn('[Image Gen] 💡 Sign in to save images to your gallery!');
                            }
                        } catch (dbError) {
                            console.error('[Image Gen] Database save failed (non-fatal):', dbError);
                            console.warn('[Image Gen] 💡 To save images to gallery: 1) Sign in, 2) Run database schema in Supabase');
                            // Don't throw - image generation succeeded even if DB save failed
                        }

                        return publicUrl; // Return Supabase URL instead of base64
                    } catch (uploadError) {
                        console.error('[Image Gen] Supabase upload failed, returning base64:', uploadError);
                        return base64Image; // Fallback to base64 if upload fails
                    }
                }
            }
        }

        // If we get here, no image was found
        throw new Error(`No image data in API response. Candidates: ${candidates.length}, Response: ${JSON.stringify(response).slice(0, 200)}`);
    } catch (error) {
        console.error("[Image Gen] FAILED:", error);

        // Classify error for better handling
        const networkError = classifyError(error);
        console.log('[Image Gen] Error type:', networkError.type, '- Retryable:', networkError.retryable);

        // AUTO-FALLBACK CHAIN:
        // 1. Try Nano Banana Pro (gemini-3-pro-image-preview)
        // 2. If fails, try Nano Banana (gemini-2.5-flash-image)
        // 3. If both fail, try Replicate FLUX.1-schnell

        if (error instanceof Error && !_isRetry) {
            const shouldRetry = error.message.toLowerCase().includes('model') ||
                               error.message.toLowerCase().includes('not found') ||
                               error.message.toLowerCase().includes('404') ||
                               error.message.toLowerCase().includes('quota') ||
                               error.message.toLowerCase().includes('api key') ||
                               error.message.toLowerCase().includes('fetch') ||
                               error.message.toLowerCase().includes('failed to fetch') ||
                               error.message.toLowerCase().includes('network') ||
                               error.message.toLowerCase().includes('cors') ||
                               error.message.toLowerCase().includes('timeout');

            if (shouldRetry) {
                // First fallback: Nano Banana Pro → Nano Banana (Gemini)
                if (isNanoBananaPro) {
                    console.warn(`[Image Gen] ⚠️ Nano Banana Pro (${modelToUse}) not available`);
                    console.log(`[Image Gen] 🔄 Auto-fallback to Nano Banana (${fallbackModel})`);

                    localStorage.setItem('llm_image_model', fallbackModel);

                    try {
                        const result = await generateImage(prompt, referenceImages, size === '4K' ? '2K' : size, editHistory, true);
                        console.log('[Image Gen] ✅ Fallback to Nano Banana successful!');
                        return result;
                    } catch (retryError) {
                        console.error('[Image Gen] ❌ Nano Banana also failed:', retryError);
                        // Continue to Replicate fallback below
                    }
                }

                // Second fallback: All Gemini models → Replicate FLUX
                console.warn('[Image Gen] ⚠️ All Gemini models failed');
                console.log('[Image Gen] 🔄 Final fallback to Replicate FLUX.1-schnell');

                try {
                    const { replicateKey } = getSettings();
                    if (!replicateKey) {
                        throw new Error('Replicate API key not found. Please add it in Settings.');
                    }

                    // Use FLUX.1-schnell for fast, high-quality generation
                    const fluxVersion = 'black-forest-labs/flux-schnell';

                    console.log('[Image Gen] Calling Replicate FLUX.1-schnell...');

                    const fluxPrompt = `Professional LinkedIn banner, 1584x396 pixels, 16:9 aspect ratio. ${prompt}`;

                    const output = await callReplicate(replicateKey, fluxVersion, {
                        prompt: fluxPrompt,
                        width: 1584,
                        height: 396,
                        num_outputs: 1,
                        guidance_scale: 3.5,
                        num_inference_steps: 4,
                    });

                    const imageUrl = Array.isArray(output) ? output[0] : output;
                    console.log('[Image Gen] ✅ Replicate FLUX fallback successful!');
                    console.log('[Image Gen] 💡 Using Replicate as fallback. To use Gemini, check your API key and quota.');

                    // Mark that we're using Replicate fallback
                    localStorage.setItem('llm_image_fallback', 'replicate');

                    return imageUrl;
                } catch (replicateError) {
                    console.error('[Image Gen] ❌ Replicate fallback also failed:', replicateError);
                    localStorage.setItem('llm_image_model', modelToUse); // Restore original
                    throw new Error('All image generation providers failed. Please check your API keys and quotas.');
                }
            }
        }

        // Provide more helpful error messages
        if (error instanceof Error) {
            const friendlyMessage = getUserFriendlyMessage(error);

            if (error.message.includes('API key')) {
                throw new Error("Invalid Gemini API key. Please check your API key in Settings.");
            } else if (error.message.includes('quota')) {
                throw new Error("API quota exceeded. Please check your Gemini API usage.");
            } else if (error.message.includes('safety')) {
                throw new Error("Content blocked by safety filters. Try a different prompt.");
            } else if (error.message.includes('model')) {
                throw new Error(`Model '${modelToUse}' not found or not available. Try using '${fallbackModel}' instead.`);
            } else if (error.message.toLowerCase().includes('fetch') || error.message.toLowerCase().includes('failed to fetch')) {
                throw new Error(friendlyMessage + ' - All image generation services are currently unavailable.');
            } else if (error.message.toLowerCase().includes('cors')) {
                throw new Error(friendlyMessage + ' - Try switching to a different image model in Settings.');
            } else if (error.message.toLowerCase().includes('network') || error.message.toLowerCase().includes('timeout')) {
                throw new Error(friendlyMessage + ' - Please check your connection and try again.');
            }
        }

        throw error;
    }
};

export const editImage = async (base64Image: string, prompt: string) => {
    const { geminiKey } = getSettings();

    if (!geminiKey) {
        throw new Error("Gemini API key not found. Please add your API key in Settings.");
    }

    const ai = getGoogleClient(geminiKey);

    // Improved base64 extraction
    let base64Data: string;
    let mimeType: string;

    if (base64Image.startsWith('data:')) {
        const matches = base64Image.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
            mimeType = matches[1];
            base64Data = matches[2];
        } else {
            base64Data = base64Image.split(',')[1] || base64Image;
            mimeType = 'image/png';
        }
    } else {
        base64Data = base64Image;
        mimeType = 'image/png';
    }

    const safePrompt = `${prompt} ${PROFILE_ZONE_CONSTRAINT}`;

    console.log('[Image Edit] Starting edit with model:', MODELS.imageEdit);

    try {
        const response = await ai.models.generateContent({
            model: MODELS.imageEdit,
            contents: {
                parts: [
                    { inlineData: { mimeType, data: base64Data } },
                    { text: safePrompt },
                ],
            },
            config: { imageConfig: { aspectRatio: "16:9" } }
        });

        console.log('[Image Edit] API response received, extracting image...');

        const candidates = response.candidates || [];
        if (candidates.length === 0) {
            throw new Error("API returned no candidates. Response may have been blocked by safety filters.");
        }

        for (const part of candidates[0].content?.parts || []) {
            if (part.inlineData) {
                console.log('[Image Edit] ✓ Edited image extracted successfully');
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }

        throw new Error(`No edited image in API response. Candidates: ${candidates.length}`);
    } catch (error) {
        console.error("[Image Edit] FAILED:", error);

        // Provide more helpful error messages
        if (error instanceof Error) {
            if (error.message.includes('API key')) {
                throw new Error("Invalid Gemini API key. Please check your API key in Settings.");
            } else if (error.message.includes('quota')) {
                throw new Error("API quota exceeded. Please check your Gemini API usage.");
            } else if (error.message.includes('safety')) {
                throw new Error("Content blocked by safety filters. Try a different edit prompt.");
            }
        }

        throw error;
    }
};

export const analyzeImageForPrompts = async (base64Image: string): Promise<{ magicEdit: string[], generation: string[] }> => {
    const { geminiKey } = getSettings();
    try {
        const ai = getGoogleClient(geminiKey);
        const parts: Part[] = [
            { inlineData: { mimeType: 'image/png', data: base64Image.split(',')[1] } },
            {
                text: `Analyze this banner background image. 
            
            1. Suggest 3 "Magic Edit" prompts to enhance it (e.g., "Add a futuristic neon glow", "Change background to a sunset city").
            2. Suggest 3 "generation" prompts to create a NEW image with a similar style/vibe.
            
            Return JSON format:
            {
                "magicEdit": ["prompt 1", "prompt 2", "prompt 3"],
                "generation": ["prompt 1", "prompt 2", "prompt 3"]
            }`
            }
        ];

        const response = await ai.models.generateContent({
            model: MODELS.textThinking, // Gemini 2.0 Flash/Pro
            contents: [{ role: 'user', parts }],
            config: { responseMimeType: "application/json" }
        });

        const text = response.text || "{}";
        const json = JSON.parse(text);
        return {
            magicEdit: json.magicEdit || [],
            generation: json.generation || []
        };
    } catch (error) {
        console.error("Analysis Error:", error);
        return { magicEdit: [], generation: [] };
    }
};

export const removeBackground = async (imageBase64: string): Promise<string> => {
    const { replicateKey } = getSettings();
    if (!replicateKey) throw new Error("Missing Replicate API Key");

    const version = "cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003";
    const image = imageBase64.startsWith('data:') ? imageBase64 : `data:image/png;base64,${imageBase64}`;

    try {
        const output = await callReplicate(replicateKey, version, { image });
        return output as string;
    } catch (error) {
        console.error("Remove BG Failed:", error);
        throw error;
    }
};

export const upscaleImage = async (imageBase64: string, scale: number = 2): Promise<string> => {
    const { replicateKey, upscaleModel } = getSettings();
    if (!replicateKey) throw new Error("Missing Replicate API Key");

    // version is the part after colon
    const version = upscaleModel.includes(':') ? upscaleModel.split(':')[1] : upscaleModel;

    const image = imageBase64.startsWith('data:') ? imageBase64 : `data:image/png;base64,${imageBase64}`;

    try {
        const output = await callReplicate(replicateKey, version, { image, scale });
        return output as string;
    } catch (error) {
        console.error("Upscale Failed:", error);
        throw error;
    }
};

/**
 * Analyze canvas screenshot and suggest improvements using vision AI
 * Considers brand profile if available for personalized suggestions
 */
export const analyzeCanvasAndSuggest = async (
    canvasScreenshot: string,
    brandProfile: BrandProfile | null = null
): Promise<{ suggestions: string[]; reasoning: string }> => {
    const { geminiKey } = getSettings();
    if (!geminiKey) throw new Error("Gemini API Key required for canvas analysis");

    try {
        const ai = getGoogleClient(geminiKey);

        const base64Data = canvasScreenshot.split(',')[1] || canvasScreenshot;

        let brandContext = '';
        if (brandProfile) {
            const colors = brandProfile.colors.map(c => c.hex).join(', ');
            const styles = brandProfile.styleKeywords.join(', ');
            brandContext = `\nBrand Guidelines:
- Colors: ${colors}
- Style Keywords: ${styles}
- Industry: ${brandProfile.industry || 'General'}
- Target Audience: ${brandProfile.targetAudience || 'Professional'}`;
        }

        const parts: Part[] = [
            { inlineData: { mimeType: 'image/png', data: base64Data } },
            {
                text: `Analyze this LinkedIn banner design (1584x396px).${brandContext}

Provide 3 specific improvement suggestions to enhance:
1. Visual appeal and professional polish
2. LinkedIn engagement potential
3. Brand consistency (if brand profile provided)

Important: Remember the bottom-left corner (568x264px) is covered by profile picture.

Return JSON format:
{
  "suggestions": [
    "Specific improvement 1",
    "Specific improvement 2",
    "Specific improvement 3"
  ],
  "reasoning": "Brief explanation of why these improvements will enhance the design"
}`
            }
        ];

        const response = await ai.models.generateContent({
            model: MODELS.textThinking, // Use thinking model for better analysis
            contents: [{ role: 'user', parts }],
            config: {
                responseMimeType: "application/json",
                thinkingConfig: { thinkingBudget: 2048 }
            }
        });

        const result = JSON.parse(response.text || '{}');

        return {
            suggestions: result.suggestions || [],
            reasoning: result.reasoning || ''
        };
    } catch (error) {
        console.error("Canvas Analysis Error:", error);
        return {
            suggestions: [],
            reasoning: 'Failed to analyze canvas. Please try again.'
        };
    }
};
