/**
 * Langfuse Tracer Service
 *
 * Provides LLM observability with tracing, cost attribution, and deep linking.
 * Replaces Datadog tracing with Langfuse for AI-specific observability.
 *
 * Features:
 * - Automatic trace creation for all LLM calls
 * - Cost attribution using model cost registry
 * - User attribution for per-user analytics
 * - Deep links to individual traces
 * - Token usage tracking
 */

import { Langfuse, LangfuseTraceClient } from 'langfuse';
import {
    getModelPricing,
    calculateTokenCost,
    calculateImageCost,
} from '../config/modelCosts';

// Environment configuration
const LANGFUSE_PUBLIC_KEY = process.env.LANGFUSE_PUBLIC_KEY;
const LANGFUSE_SECRET_KEY = process.env.LANGFUSE_SECRET_KEY;
const LANGFUSE_HOST = process.env.LANGFUSE_HOST || 'http://localhost:3001';

// Singleton Langfuse client
let langfuseClient: Langfuse | null = null;

/**
 * Get or create the Langfuse client singleton
 */
export function getLangfuse(): Langfuse | null {
    if (!LANGFUSE_PUBLIC_KEY || !LANGFUSE_SECRET_KEY) {
        console.warn('[LangfuseTracer] Missing credentials, tracing disabled');
        return null;
    }

    if (!langfuseClient) {
        langfuseClient = new Langfuse({
            publicKey: LANGFUSE_PUBLIC_KEY,
            secretKey: LANGFUSE_SECRET_KEY,
            baseUrl: LANGFUSE_HOST,
            flushAt: 5, // Flush after 5 events
            flushInterval: 1000, // Or every 1 second
        });

        console.log('[LangfuseTracer] Client initialized:', LANGFUSE_HOST);
    }

    return langfuseClient;
}

/**
 * Check if Langfuse tracing is enabled
 */
export function isLangfuseEnabled(): boolean {
    return !!(LANGFUSE_PUBLIC_KEY && LANGFUSE_SECRET_KEY);
}

/**
 * Trace options for LLM calls
 */
export interface TraceOptions {
    userId?: string;
    sessionId?: string;
    operationName: string;
    model: string;
    provider: 'openrouter' | 'replicate' | 'openai' | string;
    input?: string | unknown[];
    metadata?: Record<string, unknown>;
    tags?: string[];
}

/**
 * Result from a traced LLM call
 */
export interface TracedResult<T> {
    result: T;
    traceId: string | null;
    generationId: string | null;
    deepLink: string | null;
    costUsd: number;
}

/**
 * Create a new trace for an operation
 */
export function createTrace(options: {
    name: string;
    userId?: string;
    sessionId?: string;
    metadata?: Record<string, unknown>;
    tags?: string[];
}): LangfuseTraceClient | null {
    const langfuse = getLangfuse();
    if (!langfuse) return null;

    return langfuse.trace({
        name: options.name,
        userId: options.userId,
        sessionId: options.sessionId,
        metadata: options.metadata,
        tags: options.tags,
    });
}

/**
 * Generate a deep link to a trace in the Langfuse UI
 */
export function getTraceDeepLink(traceId: string): string {
    return `${LANGFUSE_HOST}/trace/${traceId}`;
}

/**
 * Trace an LLM chat/text generation call
 *
 * @param options Trace configuration
 * @param apiCall The async function that makes the API call
 * @returns Traced result with trace ID, cost, and deep link
 */
export async function traceLLMGeneration<T>(
    options: TraceOptions,
    apiCall: () => Promise<T>
): Promise<TracedResult<T>> {
    const langfuse = getLangfuse();

    // If Langfuse is not available, just execute the call
    if (!langfuse) {
        const result = await apiCall();
        return {
            result,
            traceId: null,
            generationId: null,
            deepLink: null,
            costUsd: 0
        };
    }

    // Create trace
    const trace = langfuse.trace({
        name: options.operationName,
        userId: options.userId,
        sessionId: options.sessionId,
        metadata: {
            ...options.metadata,
            provider: options.provider,
        },
        tags: options.tags,
    });

    // Create generation span
    const generation = trace.generation({
        name: options.operationName,
        model: options.model,
        input: options.input,
        metadata: {
            provider: options.provider,
        },
    });

    const startTime = Date.now();

    try {
        // Execute the API call
        const result = await apiCall();

        const endTime = Date.now();
        const latencyMs = endTime - startTime;

        // Extract output for logging
        const output = typeof result === 'string' ? result : JSON.stringify(result);

        // Try to extract token usage from response
        let inputTokens = 0;
        let outputTokens = 0;
        let costUsd = 0;

        const pricing = getModelPricing(options.model);

        if (pricing.type === 'token') {
            // Estimate tokens if not provided (rough estimate: 4 chars = 1 token)
            const inputText = typeof options.input === 'string'
                ? options.input
                : JSON.stringify(options.input);
            inputTokens = Math.ceil(inputText.length / 4);
            outputTokens = Math.ceil(output.length / 4);

            // Check if result has usage info (OpenRouter returns this)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (typeof result === 'object' && result !== null && (result as any).usage) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const usage = (result as any).usage;
                inputTokens = usage.prompt_tokens || inputTokens;
                outputTokens = usage.completion_tokens || outputTokens;
            }

            costUsd = calculateTokenCost(options.model, inputTokens, outputTokens);
        } else if (pricing.type === 'image') {
            // Image generation - count images in result
            let imageCount = 1;
            if (Array.isArray(result)) {
                imageCount = result.length;
            }
            costUsd = calculateImageCost(options.model, imageCount);
        }

        // Complete the generation with success
        generation.end({
            output,
            level: 'DEFAULT',
            statusMessage: 'success',
            usage: {
                promptTokens: inputTokens,
                completionTokens: outputTokens,
                totalTokens: inputTokens + outputTokens,
            },
            metadata: {
                latencyMs,
                costUsd,
                provider: options.provider,
            },
        });

        // Update trace with cost
        trace.update({
            metadata: {
                ...options.metadata,
                provider: options.provider,
                costUsd,
                latencyMs,
            },
        });

        return {
            result,
            traceId: trace.id,
            generationId: generation.id,
            deepLink: getTraceDeepLink(trace.id),
            costUsd,
        };

    } catch (error) {
        const endTime = Date.now();
        const latencyMs = endTime - startTime;

        // Complete the generation with error
        generation.end({
            output: error instanceof Error ? error.message : 'Unknown error',
            level: 'ERROR',
            statusMessage: error instanceof Error ? error.message : 'Unknown error',
            metadata: {
                latencyMs,
                provider: options.provider,
                error: true,
            },
        });

        // Re-throw the error
        throw error;
    }
}

/**
 * Trace an image generation/processing call
 */
export async function traceImageOperation<T>(
    options: Omit<TraceOptions, 'input'> & { prompt?: string },
    apiCall: () => Promise<T>
): Promise<TracedResult<T>> {
    return traceLLMGeneration(
        {
            ...options,
            input: options.prompt,
        },
        apiCall
    );
}

/**
 * Add a score to a trace (for evaluation)
 */
export function scoreTrace(
    traceId: string,
    name: string,
    value: number,
    comment?: string
): void {
    const langfuse = getLangfuse();
    if (!langfuse) return;

    langfuse.score({
        traceId,
        name,
        value,
        comment,
    });
}

/**
 * Flush all pending events to Langfuse
 * Call this before process exit or on request completion
 */
export async function flushLangfuse(): Promise<void> {
    const langfuse = getLangfuse();
    if (langfuse) {
        await langfuse.flushAsync();
    }
}

/**
 * Shutdown the Langfuse client
 * Call this on process termination
 */
export async function shutdownLangfuse(): Promise<void> {
    if (langfuseClient) {
        await langfuseClient.shutdownAsync();
        langfuseClient = null;
    }
}

// Register shutdown hook
process.on('SIGTERM', async () => {
    console.log('[LangfuseTracer] Shutting down...');
    await shutdownLangfuse();
});

process.on('SIGINT', async () => {
    console.log('[LangfuseTracer] Shutting down...');
    await shutdownLangfuse();
});

/**
 * Helper to create a simple wrapper for existing traceLLMCall usage
 * This maintains backward compatibility with the Datadog tracer interface
 */
export async function traceLLMCall<T>(
    model: string,
    provider: string,
    prompt: string | unknown[],
    operationName: string,
    apiCall: () => Promise<T>,
    userId?: string
): Promise<T> {
    const result = await traceLLMGeneration(
        {
            model,
            provider,
            input: prompt,
            operationName,
            userId,
        },
        apiCall
    );

    return result.result;
}

/**
 * Export the trace wrapper for external use (preserves trace metadata)
 */
export async function traceWithMetadata<T>(
    model: string,
    provider: string,
    prompt: string | unknown[],
    operationName: string,
    apiCall: () => Promise<T>,
    options?: {
        userId?: string;
        sessionId?: string;
        metadata?: Record<string, unknown>;
        tags?: string[];
    }
): Promise<TracedResult<T>> {
    return traceLLMGeneration(
        {
            model,
            provider,
            input: prompt,
            operationName,
            userId: options?.userId,
            sessionId: options?.sessionId,
            metadata: options?.metadata,
            tags: options?.tags,
        },
        apiCall
    );
}
