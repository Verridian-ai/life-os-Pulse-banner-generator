
import { Hono } from 'hono';
import tracer from 'dd-trace';
import { authMiddleware } from '../lib/auth';
import { db } from '../db';
import { userApiKeys } from '../db/schema';
import { eq } from 'drizzle-orm';

export const aiRouter = new Hono();

// Helper to fetch user's API keys from database
// SECURITY: Keys are stored server-side only, never exposed to client
const getUserApiKeys = async (userId: string) => {
    const keys = await db.select().from(userApiKeys).where(eq(userApiKeys.userId, userId)).limit(1);
    return keys[0] || null;
};

// Helper for Datadog LLM Observability
// Helper for Datadog LLM Observability
const traceLLMCall = async (
    model: string,
    provider: string,
    prompt: string | unknown[],
    operationName: string,
    apiCall: () => Promise<string>
) => {
    return tracer.trace(operationName, { resource: provider }, async (span) => {
        span?.setTag('llm.model_name', model);
        span?.setTag('llm.provider', provider);

        // Set input prompt tag (handled differently for text vs array)
        const promptText = typeof prompt === 'string' ? prompt : JSON.stringify(prompt);
        span?.setTag('llm.input', promptText);

        try {
            const output = await apiCall();
            span?.setTag('llm.output', output);
            return output;
        } catch (error: unknown) {
            span?.setTag('error', error);
            throw error;
        }
    });
};

// --- OpenRouter Client ---
const callOpenRouter = async (apiKey: string, model: string, messages: unknown[]) => {
    if (!apiKey) throw new Error('OpenRouter API Key not configured on server');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://nanobanna-pro.verridian.ai', // Update with real origin
            'X-Title': 'NanoBanna Pro',
        },
        body: JSON.stringify({
            model: model,
            messages: messages,
            temperature: 0.7,
            max_tokens: 4096,
        }),
    });

    if (!response.ok) {
        const text = await response.text();
        try {
            const err = JSON.parse(text);
            throw new Error(`OpenRouter Error: ${err.error?.message || response.statusText}`);
        } catch (e) {
            throw new Error(`OpenRouter Error (${response.status}): ${text}`);
        }
    }

    const text = await response.text();
    try {
        const data = JSON.parse(text);
        return data.choices?.[0]?.message?.content || '';
    } catch (e) {
        console.error('OpenRouter Invalid JSON:', text);
        throw new Error('OpenRouter returned invalid JSON');
    }
};

// Full OpenRouter Client with tool support (returns complete response)
const callOpenRouterFull = async (apiKey: string, model: string, messages: unknown[], tools?: unknown[], tool_choice?: string) => {
    if (!apiKey) throw new Error('OpenRouter API Key not configured on server');

    const body: any = {
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 4096,
    };

    // Add tools if provided
    if (tools && tools.length > 0) {
        body.tools = tools;
        body.tool_choice = tool_choice || 'auto';
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://nanobanna-pro.verridian.ai',
            'X-Title': 'NanoBanna Pro',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const text = await response.text();
        try {
            const err = JSON.parse(text);
            throw new Error(`OpenRouter Error: ${err.error?.message || response.statusText}`);
        } catch (e) {
            throw new Error(`OpenRouter Error (${response.status}): ${text}`);
        }
    }

    const data = await response.json();
    return data; // Return full response for tool support
};

// --- Replicate Client ---
const callReplicate = async (apiKey: string, modelVersionOrName: string, input: Record<string, unknown>) => {
    if (!apiKey) throw new Error('Replicate API Key not configured on server');

    const baseUrl = 'https://api.replicate.com';
    let endpoint = '';
    let body: Record<string, unknown> = {};

    // Check if it's a specific version (owner/name:version)
    if (modelVersionOrName.includes(':')) {
        const [, version] = modelVersionOrName.split(':');
        endpoint = `${baseUrl}/v1/predictions`;
        body = { version, input };
    }
    // Check if it's just a named model (owner/name)
    else if (modelVersionOrName.includes('/')) {
        endpoint = `${baseUrl}/v1/models/${modelVersionOrName}/predictions`;
        body = { input };
    }
    // Assume it's a version hash only (legacy/direct usage)
    else {
        endpoint = `${baseUrl}/v1/predictions`;
        body = { version: modelVersionOrName, input };
    }

    const startResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Authorization': `Token ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!startResponse.ok) {
        const errorText = await startResponse.text();
        throw new Error(`Replicate Error (${startResponse.status}): ${errorText}`);
    }

    const startData = await startResponse.json();
    const predictionId = startData.id;

    let prediction = startData;
    let pollCount = 0;
    while (
        prediction.status !== 'succeeded' &&
        prediction.status !== 'failed' &&
        prediction.status !== 'canceled' &&
        pollCount < 180 // 180s timeout (3 mins) for cold starts
    ) {
        await new Promise((r) => setTimeout(r, 1000));
        const pollResponse = await fetch(`${baseUrl}/v1/predictions/${predictionId}`, {
            headers: { 'Authorization': `Token ${apiKey}` },
        });
        prediction = await pollResponse.json();
        pollCount++;
    }

    if (prediction.status === 'succeeded') return prediction.output;
    throw new Error(`Replicate Prediction Failed: ${prediction.status}`);
};

const callReplicateModel = async (apiKey: string, modelPath: string, input: any) => {
    const baseUrl = 'https://api.replicate.com';
    const endpoint = `${baseUrl}/v1/models/${modelPath}/predictions`;
    const body = { input };

    const startResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Authorization': `Token ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!startResponse.ok) {
        const errorText = await startResponse.text();
        throw new Error(`Replicate Model Error (${startResponse.status}): ${errorText}`);
    }

    const startData = await startResponse.json();
    const predictionId = startData.id;

    let prediction = startData;
    let pollCount = 0;
    while (
        prediction.status !== 'succeeded' &&
        prediction.status !== 'failed' &&
        prediction.status !== 'canceled' &&
        pollCount < 180
    ) {
        await new Promise((r) => setTimeout(r, 1000));
        const pollResponse = await fetch(`${baseUrl}/v1/predictions/${predictionId}`, {
            headers: { 'Authorization': `Token ${apiKey}` },
        });
        prediction = await pollResponse.json();
        pollCount++;
    }

    if (prediction.status === 'succeeded') return prediction.output;
    throw new Error(`Replicate Prediction Failed: ${prediction.status}`);
};


// --- Routes ---

// Helper to find closest supported aspect ratio for Flux on Replicate
const getFluxAspectRatio = (width: number, height: number): string => {
    const ratio = width / height;
    const supported = [
        { str: "1:1", val: 1 },
        { str: "16:9", val: 16 / 9 },
        { str: "21:9", val: 21 / 9 },
        { str: "3:2", val: 3 / 2 },
        { str: "2:3", val: 2 / 3 },
        { str: "4:5", val: 4 / 5 },
        { str: "5:4", val: 5 / 4 },
        { str: "9:16", val: 9 / 16 },
        { str: "9:21", val: 9 / 21 },
    ];
    // Find closest match
    return supported.reduce((prev, curr) =>
        Math.abs(curr.val - ratio) < Math.abs(prev.val - ratio) ? curr : prev
    ).str;
};

// Chat Route (supports tool calling when tools are provided)
aiRouter.post('/chat', authMiddleware, async (c) => {
    const { messages, model, tools, tool_choice } = await c.req.json();

    // SECURITY: Fetch API key from database, not from request body
    const user = c.get('user');
    const userKeys = user ? await getUserApiKeys(user.id) : null;
    const apiKey = userKeys?.openrouterApiKey || process.env.OPENROUTER_API_KEY || '';

    try {
        // If tools are provided, use full response format for tool support
        if (tools && tools.length > 0) {
            const response = await callOpenRouterFull(apiKey, model, messages, tools, tool_choice);
            return c.json(response); // Return full response for tool calls
        }

        // Simple chat without tools - return simplified format
        const response = await traceLLMCall(
            model,
            'openrouter',
            messages,
            'llm.chat_completion',
            () => callOpenRouter(apiKey, model, messages)
        );
        return c.json({ text: response });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return c.json({ error: msg }, 500);
    }
});

// Image Edit Route (Instruction-based editing)
aiRouter.post('/image/edit', authMiddleware, async (c) => {
    try {
        const { image, mask, prompt, provider, model } = await c.req.json();

        // SECURITY: Fetch API keys from database, not from request body
        const user = c.get('user');
        const userKeys = user ? await getUserApiKeys(user.id) : null;
        const replicateKey = userKeys?.replicateApiKey || process.env.REPLICATE_API_KEY || '';
        const openRouterKey = userKeys?.openrouterApiKey || process.env.OPENROUTER_API_KEY || '';

        // Helper to ensure data URI
        const ensureDataUri = (img: string) =>
            img.startsWith('http') || img.startsWith('data:')
                ? img
                : `data:image/png;base64,${img}`;

        let resultUrl = '';

        // 0. SPECIAL HANDLING: Flux Fill Pro (e.g. for Banner Resizing/Outpainting)
        if (model === 'black-forest-labs/flux-fill-pro' || (provider === 'replicate' && model?.includes('flux-fill'))) {
            try {
                // Prepare inputs specifically for Flux Fill Pro
                const fluxInput: any = {
                    image: ensureDataUri(image),
                    prompt: prompt,
                    output_format: "png",
                    safety_tolerance: 5 // Allow some standard creativity
                };

                // Add mask if provided (Crucial for outpainting)
                if (mask) {
                    fluxInput.mask = ensureDataUri(mask);
                }

                const output = await traceLLMCall(
                    'black-forest-labs/flux-fill-pro',
                    'replicate',
                    prompt,
                    'llm.image_edit_flux',
                    () => callReplicateModel(replicateKey, 'black-forest-labs/flux-fill-pro', fluxInput)
                );

                // Flux Fill Pro usually returns a string URL or object depending on API version but standard is output
                // Based on standard replicate output, it might be an array or string.
                if (Array.isArray(output)) {
                    resultUrl = output[0];
                } else if (typeof output === 'string') {
                    resultUrl = output;
                } else if (output && output.url) {
                    resultUrl = output.url; // Some pro models return { url: "..." }
                } else {
                    resultUrl = String(output);
                }

            } catch (error: unknown) {
                const msg = error instanceof Error ? error.message : 'Unknown error';
                console.error('[Image Edit] Flux Fill Pro failed:', msg);
                return c.json({ error: `Flux Fill Pro failed: ${msg}` }, 500);
            }
        }

        // 1. Try OpenRouter (if explicitly requested or default, AND not already handled)
        if (!resultUrl && (provider === 'openrouter' || (!provider && openRouterKey))) {
            try {
                // Construct multimodal message for editing
                const messages = [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: `You are an expert image editing agent. Your task is to modify the attached image based on this instruction: "${prompt}".\n\nCRITICAL: Return ONLY the https URL of the newly generated image. Do not output any markdown, explanations, or other text. Just the URL.` },
                            { type: 'image_url', image_url: { url: ensureDataUri(image) } }
                        ]
                    }
                ];

                const response = await traceLLMCall(
                    model || 'google/gemini-2.0-flash-exp:free', // Default to a vision-capable model
                    'openrouter',
                    prompt,
                    'llm.image_edit',
                    () => callOpenRouter(openRouterKey, model || 'google/gemini-2.0-flash-exp:free', messages as unknown[])
                );

                // Extract URL from response
                const urlMatch = response.match(/https?:\/\/[^\s)"]+/);
                if (urlMatch) {
                    resultUrl = urlMatch[0];
                } else {
                    console.warn('[Image Edit] No URL found in OpenRouter response:', response);
                }
            } catch (err) {
                console.warn('[Image Edit] OpenRouter failed, attempting fallback:', err);
            }
        }

        // 2. Fallback to Replicate (if OpenRouter failed or not selected)
        if (!resultUrl) {
            try {
                // Replicate fallback (InstructPix2Pix)
                // Using pinned version hash for verified stability (timbrooks/instruct-pix2pix)
                const instructVersion = '30c1d0b916a6f8efce20493f5d61ee27491ab2a60437c13c588468b9810ec23f';

                // Strict Schema Parameters
                const replicateInput = {
                    image: ensureDataUri(image),
                    prompt: prompt,
                    num_inference_steps: 50, // Balance speed/quality (Default 100 is slow, 20 is fast)
                    image_guidance_scale: 1.5, // Standard adherence to original structure
                    guidance_scale: 7.5, // Standard text adherence
                    scheduler: "K_EULER_ANCESTRAL"
                };

                const output = await traceLLMCall(
                    instructVersion,
                    'replicate',
                    prompt,
                    'llm.image_edit',
                    () => callReplicate(replicateKey, instructVersion, replicateInput)
                );

                if (Array.isArray(output)) {
                    resultUrl = output[0];
                } else {
                    resultUrl = output;
                }
            } catch (error: unknown) {
                const msg = error instanceof Error ? error.message : 'Unknown error';
                console.error('[Image Edit] Replicate fallback failed:', msg);
                // Return clear error to client
                return c.json({ error: `Image editing failed (Replicate): ${msg}` }, 500);
            }
        }

        if (!resultUrl) {
            return c.json({ error: "Image editing failed across all providers." }, 500);
        }

        return c.json({ url: resultUrl });
    } catch (e) {
        return c.json({ error: 'Server error during image edit' }, 500);
    }
});

// Image Gen Route (Proxy to Replicate only)
// NOTE: OpenRouter does NOT support image generation - it's a chat completions proxy.
// All image generation requests are routed to Replicate.
aiRouter.post('/image/generate', authMiddleware, async (c) => {
    const { prompt, model, provider, aspect_ratio, width, height } = await c.req.json();

    // SECURITY: Fetch API key from database, not from request body
    const user = c.get('user');
    const userKeys = user ? await getUserApiKeys(user.id) : null;
    const replicateKey = userKeys?.replicateApiKey || process.env.REPLICATE_API_KEY || '';

    try {
        // OpenRouter does NOT have an image generation endpoint
        // If explicitly requested, return a helpful error and suggest Replicate
        if (provider === 'openrouter') {
            console.warn('[Image Gen] OpenRouter does not support image generation. Falling back to Replicate.');
            // Don't fail - just fall through to Replicate
        }

        // All image generation goes through Replicate
        if (provider === 'replicate' || provider === 'openrouter' || !provider) {
            // Map frontend model names to Replicate IDs
            let modelId = model;
            // Fix known model ID mismatches
            if (model === 'black-forest-labs/flux-1-schnell') modelId = 'black-forest-labs/flux-schnell';
            if (model === 'stability-ai/stable-diffusion-3-large') modelId = 'stability-ai/stable-diffusion-3.5-large';
            // Flux Realism - using one of the Dev LoRAs or Base Dev
            if (model === 'flux-realism') modelId = 'black-forest-labs/flux-dev';

            // "Nano Banana Pro" mapping on Replicate
            if (model === 'google/nano-banana-pro') {
                modelId = 'google/imagen-3';
            }

            // Input payload normalization
            const input: Record<string, unknown> = { prompt };
            input.output_format = "png";
            input.disable_safety_checker = true;

            // Flux specific parameters
            if (modelId.includes('flux')) {
                input.go_fast = true;

                // Prioritize exact dimensions if provided via helper
                if (width && height) {
                    input.aspect_ratio = getFluxAspectRatio(width, height);
                } else if (aspect_ratio) {
                    input.aspect_ratio = aspect_ratio;
                } else {
                    input.aspect_ratio = "1:1";
                }
            }
            // Imagen Logic
            else if (modelId.includes('imagen') || modelId.includes('nano-banana')) {
                input.aspect_ratio = "16:9";
            }

            const output = await traceLLMCall(
                modelId,
                'replicate',
                prompt,
                'llm.image_generate',
                () => callReplicate(replicateKey, modelId, input)
            );

            // Replicate returns array for images usually
            let resultUrl = output;
            if (Array.isArray(output)) resultUrl = output[0];

            return c.json({ url: resultUrl });
        } else {
            throw new Error("Provider not supported for image generation");
        }
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return c.json({ error: msg }, 500);
    }
});

// Remove Background (Replicate rembg)
aiRouter.post('/image/remove-bg', authMiddleware, async (c) => {
    const { image, model } = await c.req.json();

    // SECURITY: Fetch API key from database, not from request body
    const user = c.get('user');
    const userKeys = user ? await getUserApiKeys(user.id) : null;
    const replicateKey = userKeys?.replicateApiKey || process.env.REPLICATE_API_KEY || '';

    // Default to pinned version if no model provided
    const modelToUse = model || 'cjwbw/rembg';

    try {
        const output = await traceLLMCall(
            modelToUse,
            'replicate',
            'remove_background',
            'llm.image_tool',
            () => callReplicate(replicateKey, modelToUse, { image })
        );
        let url = output;
        if (Array.isArray(output)) url = output[0];
        return c.json({ url });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return c.json({ error: msg }, 500);
    }
});

// Upscale (Multiple Models Supported)
aiRouter.post('/image/upscale', authMiddleware, async (c) => {
    const { image, scale, model } = await c.req.json();

    // SECURITY: Fetch API key from database, not from request body
    const user = c.get('user');
    const userKeys = user ? await getUserApiKeys(user.id) : null;
    const replicateKey = userKeys?.replicateApiKey || process.env.REPLICATE_API_KEY || '';

    // Default to Real-ESRGAN if no model provided
    const modelToUse = model || 'nightmareai/real-esrgan';
    const input: Record<string, any> = { image, scale: scale || 2 };

    // Real-ESRGAN specific flag
    if (modelToUse.includes('real-esrgan')) {
        input.face_enhance = true;
    }

    try {
        const output = await traceLLMCall(
            modelToUse,
            'replicate',
            'upscale',
            'llm.image_tool',
            () => callReplicate(replicateKey, modelToUse, input)
        );
        let url = output;
        if (Array.isArray(output)) url = output[0];
        return c.json({ url });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return c.json({ error: msg }, 500);
    }
});

// Outpaint (Stable Diffusion Outpainting)
aiRouter.post('/image/outpaint', authMiddleware, async (c) => {
    const { image, prompt, direction, model } = await c.req.json();

    // SECURITY: Fetch API key from database, not from request body
    const user = c.get('user');
    const userKeys = user ? await getUserApiKeys(user.id) : null;
    const replicateKey = userKeys?.replicateApiKey || process.env.REPLICATE_API_KEY || '';

    // Default to stability-ai/stable-diffusion-outpainting
    const modelToUse = model || 'stability-ai/stable-diffusion-outpainting';

    try {
        const output = await traceLLMCall(
            modelToUse,
            'replicate',
            'outpaint',
            'llm.image_tool',
            () => callReplicate(replicateKey, modelToUse, {
                image,
                prompt: prompt || "extend the image",
                direction: direction || "right"
            })
        );
        let url = output;
        if (Array.isArray(output)) url = output[0];
        return c.json({ url });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return c.json({ error: msg }, 500);
    }
});

// Restore (CodeFormer)
aiRouter.post('/image/restore', authMiddleware, async (c) => {
    const { image, fidelity } = await c.req.json();

    // SECURITY: Fetch API key from database, not from request body
    const user = c.get('user');
    const userKeys = user ? await getUserApiKeys(user.id) : null;
    const replicateKey = userKeys?.replicateApiKey || process.env.REPLICATE_API_KEY || '';

    const model = 'sczhou/codeformer';
    try {
        const output = await traceLLMCall(
            model,
            'replicate',
            'face_restoration',
            'llm.image_tool',
            () => callReplicate(replicateKey, model, { image, codeformer_fidelity: fidelity || 0.7 })
        );
        let url = output;
        if (Array.isArray(output)) url = output[0];
        return c.json({ url });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return c.json({ error: msg }, 500);
    }
});


