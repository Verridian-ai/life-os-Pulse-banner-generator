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

// In-memory store for rate limit tracking
// Key: IP address or custom key, Value: request count and reset time
const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup interval to prevent memory leaks (runs every 5 minutes)
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

// Periodic cleanup of expired entries
setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
        if (now > record.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}, CLEANUP_INTERVAL_MS);

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
 *
 * @param options - Configuration options for rate limiting
 * @returns Hono middleware function
 *
 * @example
 * // Limit login attempts to 5 per minute
 * authRouter.post('/login', rateLimit({ limit: 5, windowMs: 60000 }), handler);
 *
 * @example
 * // Apply global limit to all AI routes
 * aiRouter.use('*', rateLimit({ limit: 30, windowMs: 60000 }));
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

        // Get or initialize the rate limit record
        let record = rateLimitStore.get(key);

        // If no record or window has expired, start fresh
        if (!record || now > record.resetTime) {
            record = {
                count: 1,
                resetTime: now + windowMs
            };
            rateLimitStore.set(key, record);

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
