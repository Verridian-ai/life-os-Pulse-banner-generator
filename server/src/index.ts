import tracer from 'dd-trace';

// Initialize Datadog Tracer with LLM Observability enabled
// MUST be the very first import and logic
tracer.init({
    logInjection: true,
    llmobs: {
        enabled: true,
    },
});

import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import * as dotenv from 'dotenv'
import { getCookie } from 'hono/cookie';
import { authRouter } from './routes/auth';
import { userRouter } from './routes/user';
import { storageRouter } from './routes/storage';
import { chatRouter } from './routes/chat';
import { aiRouter } from './routes/ai';
import { imageRouter } from './routes/images';
import { replicateRouter } from './routes/replicate';
import { lucia } from './lib/auth';
import { serveStatic } from '@hono/node-server/serve-static'

dotenv.config()

const app = new Hono()

// Configure CORS for local development and production
app.use('*', cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://192.168.0.235:5173', 'http://100.96.1.165:5173', 'https://life-os-banner.verridian.ai', 'https://life-osbanner.verridian.ai'],
    credentials: true,
}));

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
    } catch (e) {
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
app.route('/api/storage', storageRouter);
app.route('/api/chat', chatRouter);
app.route('/api/ai', aiRouter);
app.route('/api/images', imageRouter);
app.route('/api/replicate', replicateRouter);

// Serve Static Frontend (FALLBACK)
app.use('/*', serveStatic({ root: './public' }))
app.get('*', serveStatic({ path: './public/index.html' }))

const port = Number(process.env.PORT) || 3000
console.log(`Server is running on port ${port}`)

serve({
    fetch: app.fetch,
    port
})
