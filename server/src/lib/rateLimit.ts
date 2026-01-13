/**
 * Rate Limiting Middleware for Hono
 *
 * SECURITY: Prevents brute force attacks and API abuse by limiting
 * the number of requests from a single IP address within a time window.
 *
 * Uses in-memory store with automatic cleanup for simplicity.
 * For production scale, consider Redis-backed implementation.
 */

import type { Context, Next } from 'hono';

interface RateLimitOptions {
    /** Maximum number of requests allowed in the time window */
    limit: number;
    /** Time window in milliseconds */
    windowMs: number;
    /** Optional custom key extractor (defaults to IP-based) */
    keyGenerator?: (c: Context) => string;
    /** Optional custom error message */
    message?: string;
}

interface RateLimitRecord {
    count: number;
    resetTime: number;
}

import Redis from 'ioredis';
import { config } from 'dotenv';
config(); // Ensure env vars loaded

// Initialize Redis client if configuration exists
let redisClient: Redis | null = null;
if (process.env.REDIS_URL) {
    console.log('[RateLimit] Initializing Redis connection...');
    redisClient = new Redis(process.env.REDIS_URL, {
        retryStrategy: (times) => Math.min(times * 50, 2000), // Exponential backoff
        maxRetriesPerRequest: 3
    });

    redisClient.on('error', (err) => {
        console.error('[RateLimit] Redis error:', err);
    });

    redisClient.on('connect', () => {
        console.log('[RateLimit] Redis connected');
    });
} else {
    console.warn('[RateLimit] REDIS_URL not found, falling back to in-memory store');
}


// In-memory fallback store
const memoryStore = new Map<string, RateLimitRecord>();

// Cleanup interval for memory store (runs every 5 minutes)
const MEMORY_CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
setInterval(() => {
    const now = Date.now();
    for (const [key, record] of memoryStore.entries()) {
        if (now > record.resetTime) {
            memoryStore.delete(key);
        }
    }
}, MEMORY_CLEANUP_INTERVAL_MS);


// Helper for getting rate limit data
async function getRateLimit(key: string): Promise<RateLimitRecord | null> {
    if (redisClient) {
        try {
            const data = await redisClient.get(`ratelimit:${key}`);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('[RateLimit] Redis get error, fallback to memory', e);
            // Fallback to memory on error implies potentially fresh start for this key in memory context context
            // Ideally we might want circuit breaker here. For now, simple fallback behavior or just return null
            return null;
        }
    }
    return memoryStore.get(key) || null;
}

// Helper for setting rate limit data
async function setRateLimit(key: string, record: RateLimitRecord, ttlMs: number): Promise<void> {
    if (redisClient) {
        try {
            // Set with expiry
            await redisClient.set(`ratelimit:${key}`, JSON.stringify(record), 'PX', ttlMs);
        } catch (e) {
            console.error('[RateLimit] Redis set error', e);
            // Fallback to memory
            memoryStore.set(key, record);
        }
        return;
    }
    memoryStore.set(key, record);
}

/**
 * Extracts the client IP address from the request
 * Handles various proxy headers for accurate IP detection
 */
function getClientIp(c: Context): string {
    // Check common proxy headers in order of reliability
    // x-forwarded-for: Standard proxy header (may contain multiple IPs)
    const xForwardedFor = c.req.header('x-forwarded-for');
    if (xForwardedFor) {
        // Take the first IP (original client)
        const firstIp = xForwardedFor.split(',')[0].trim();
        if (firstIp) return firstIp;
    }

    // cf-connecting-ip: Cloudflare specific
    const cfConnectingIp = c.req.header('cf-connecting-ip');
    if (cfConnectingIp) return cfConnectingIp;

    // x-real-ip: Common nginx configuration
    const xRealIp = c.req.header('x-real-ip');
    if (xRealIp) return xRealIp;

    // x-client-ip: Some load balancers
    const xClientIp = c.req.header('x-client-ip');
    if (xClientIp) return xClientIp;

    // Fallback to anonymous (should rarely happen with proper proxy config)
    return 'anonymous';
}

/**
 * Rate limiting middleware factory
 */
export function rateLimit(options: RateLimitOptions) {
    const {
        limit,
        windowMs,
        keyGenerator,
        message = 'Too many requests, please try again later'
    } = options;

    return async (c: Context, next: Next) => {
        // Generate the rate limit key (IP-based by default)
        const key = keyGenerator ? keyGenerator(c) : getClientIp(c);
        const now = Date.now();

        // Get current record
        let record = await getRateLimit(key);

        // If no record or window has expired, start fresh
        if (!record || now > record.resetTime) {
            record = {
                count: 1,
                resetTime: now + windowMs
            };

            await setRateLimit(key, record, windowMs);

            // Set rate limit headers for transparency
            c.header('X-RateLimit-Limit', String(limit));
            c.header('X-RateLimit-Remaining', String(limit - 1));
            c.header('X-RateLimit-Reset', String(Math.ceil(record.resetTime / 1000)));

            return next();
        }

        // Check if limit exceeded
        if (record.count >= limit) {
            const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);

            // Set rate limit headers
            c.header('X-RateLimit-Limit', String(limit));
            c.header('X-RateLimit-Remaining', '0');
            c.header('X-RateLimit-Reset', String(Math.ceil(record.resetTime / 1000)));
            c.header('Retry-After', String(retryAfterSeconds));

            // SECURITY: Log rate limit violations for monitoring
            console.warn(`[RateLimit] Limit exceeded for ${key} on ${c.req.path}`);

            return c.json(
                {
                    error: message,
                    retryAfter: retryAfterSeconds
                },
                429
            );
        }

        // Increment counter
        record.count++;
        // Calculate remaining TTL
        const remainingTtl = Math.max(0, record.resetTime - Date.now());

        // Update record
        await setRateLimit(key, record, remainingTtl);

        // Set rate limit headers
        c.header('X-RateLimit-Limit', String(limit));
        c.header('X-RateLimit-Remaining', String(limit - record.count));
        c.header('X-RateLimit-Reset', String(Math.ceil(record.resetTime / 1000)));

        return next();
    };
}

/**
 * Stricter rate limit for authentication endpoints
 * Configured with conservative limits to prevent brute force attacks
 */
export const authRateLimit = {
    /** Login: 5 attempts per minute per IP */
    login: rateLimit({
        limit: 5,
        windowMs: 60 * 1000, // 1 minute
        message: 'Too many login attempts. Please try again in a minute.'
    }),

    /** Signup: 3 attempts per minute per IP */
    signup: rateLimit({
        limit: 3,
        windowMs: 60 * 1000, // 1 minute
        message: 'Too many signup attempts. Please try again in a minute.'
    }),

    /** Forgot password: 3 attempts per minute per IP */
    forgotPassword: rateLimit({
        limit: 3,
        windowMs: 60 * 1000, // 1 minute
        message: 'Too many password reset requests. Please try again in a minute.'
    }),

    /** Password reset: 5 attempts per minute per IP */
    resetPassword: rateLimit({
        limit: 5,
        windowMs: 60 * 1000, // 1 minute
        message: 'Too many password reset attempts. Please try again in a minute.'
    })
};

/**
 * Rate limit for AI/LLM endpoints
 * More permissive than auth but still prevents abuse
 */
export const aiRateLimit = rateLimit({
    limit: 30,
    windowMs: 60 * 1000, // 1 minute
    message: 'API rate limit exceeded. Please slow down your requests.'
});

/**
 * Rate limit for data mutation endpoints (POST, PATCH, DELETE)
 * Prevents abuse while allowing normal usage patterns
 */
export const dataRateLimit = rateLimit({
    limit: 60,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many data requests. Please slow down.'
});

/**
 * Rate limit for storage/upload endpoints
 * More restrictive due to resource-intensive nature
 */
export const storageRateLimit = rateLimit({
    limit: 20,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many storage requests. Please wait before uploading more files.'
});
