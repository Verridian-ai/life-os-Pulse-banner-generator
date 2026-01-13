import tracer from 'dd-trace';

// Initialize Datadog Tracer with LLM Observability enabled
// MUST be the very first import and logic
tracer.init({
    logInjection: true,
    llmobs: {
        // enabled: true, // Removed: 'enabled' is not a valid property in LLMObsEnableOptions
        // LLM Observability is enabled by the presence of this object or DD_LLMOBS_ENABLED=true env var
    },
});

import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { csrf } from 'hono/csrf'
import { getCookie } from 'hono/cookie';
import { serveStatic } from '@hono/node-server/serve-static'
import { config } from 'dotenv'

import { authRouter } from './routes/auth';
import { userRouter } from './routes/user';
import { storageRouter } from './routes/storage';
import { chatRouter } from './routes/chat';
import { aiRouter } from './routes/ai';
import { imageRouter } from './routes/images';
import { promptRouter } from './routes/prompts';
import { replicateRouter } from './routes/replicate';
import { adminRouter } from './routes/admin';
import { designRouter } from './routes/designs';
import { sharingRouter } from './routes/sharing';
import { brandRouter } from './routes/brands';
import { cogneeRouter } from './routes/cognee';
import { webhooksRouter } from './routes/webhooks';
import { billingRouter } from './routes/billing';
import { lucia } from './lib/auth';
import type { HonoEnv } from './types';

config()

const app = new Hono<HonoEnv>()

// Configure CORS for local development and production
app.use('*', cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:3000',
        'http://localhost:3030',
        'http://localhost:3033',
        'http://localhost:8888',
        // Production domains
        'https://life-os-verridian.ai',
        'http://life-os-verridian.ai',
        'https://www.life-os-verridian.ai',
        'https://life-os-banner.verridian.ai',
        'https://nanobanna-pro-237245874937.us-central1.run.app',
        'https://nanobanna.verridian.ai',
    ],
    credentials: true,
}));

// SECURITY: CSRF protection (exclude webhooks which use signature verification)
app.use('*', async (c, next) => {
    // Skip CSRF for webhooks - they use signature verification instead
    if (c.req.path.startsWith('/api/webhooks')) {
        return next();
    }
    return csrf()(c, next);
});

// SECURITY: High-impact Security Headers (HSTS, CSP, X-Content-Type-Options)
app.use('*', async (c, next) => {
    // 1. Strict-Transport-Security (HSTS)
    // Enforce HTTPS for 2 years, include subdomains, allow preload list
    c.header('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

    // 2. X-Content-Type-Options
    // Prevent MIME-sniffing
    c.header('X-Content-Type-Options', 'nosniff');

    // 3. X-Frame-Options
    // Prevent clickjacking
    c.header('X-Frame-Options', 'SAMEORIGIN');

    // 4. Referrer-Policy
    // protext user privacy
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin');

    // 5. Content-Security-Policy (CSP)
    // Whitelist allowed sources to prevent XSS and data injection
    const csp = [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: blob: https://*.replicate.delivery https://replicate.delivery https://*.googleusercontent.com https://*.githubusercontent.com",
        "font-src 'self' data: https://fonts.gstatic.com",
        "connect-src 'self' https://api.openai.com wss://api.openai.com https://api.replicate.com https://*.replicate.delivery https://openrouter.ai https://*.openrouter.ai https://*.googleapis.com",
        "media-src 'self' data: blob:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'self'",
        "upgrade-insecure-requests"
    ].join('; ');

    c.header('Content-Security-Policy', csp);

    await next();
});

// Middleware to populate user in context
app.use('*', async (c, next) => {
    const sessionId = getCookie(c, lucia.sessionCookieName);

    if (!sessionId) {
        c.set('user', null);
        return next();
    }
    try {
        const { session, user } = await lucia.validateSession(sessionId);
        if (session && session.fresh) {
            c.header('Set-Cookie', lucia.createSessionCookie(session.id).serialize(), { append: true });
        }
        if (!session) {
            c.header('Set-Cookie', lucia.createBlankSessionCookie().serialize(), { append: true });
        }
        c.set('user', user);
        c.set('session', session);
    } catch {
        c.set('user', null);
    }
    await next();
});

app.get('/health', (c) => {
    return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount Routes (API FIRST)
app.route('/api/auth', authRouter);
app.route('/api/user', userRouter);
app.route('/api/admin', adminRouter);
app.route('/api/storage', storageRouter);
app.route('/api/chat', chatRouter);
app.route('/api/ai', aiRouter);
app.route('/api/images', imageRouter);
app.route('/api/prompts', promptRouter);
app.route('/api/replicate', replicateRouter);
app.route('/api/designs', designRouter);
app.route('/api/sharing', sharingRouter);
app.route('/api/brands', brandRouter);
app.route('/api/cognee', cogneeRouter);
app.route('/api/billing', billingRouter);
app.route('/api/webhooks', webhooksRouter);

// Serve Static Frontend (FALLBACK)
app.use('/*', serveStatic({ root: './public' }))
app.get('*', serveStatic({ path: './public/index.html' }))

// Use 8888 for local dev to avoid conflicts, production uses PORT env var (8080)
const port = Number(process.env.PORT) || 8888
console.log(`Server is running on port ${port}`)

serve({
    fetch: app.fetch,
    port
})