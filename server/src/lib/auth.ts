import { Lucia } from 'lucia';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { db } from '../db';
import { sessions, users } from '../db/schema';

// Create adapter instance
const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

// Initialize Lucia
export const lucia = new Lucia(adapter, {
    sessionCookie: {
        attributes: {
            // set to `true` when using HTTPS
            secure: process.env.NODE_ENV === 'production'
        }
    },
    getUserAttributes: (attributes) => {
        return {
            email: attributes.email,
            gravatar: attributes.avatarUrl // We can map extended attributes here
        };
    }
});

// IMPORTANT: Declare Module for Type Safety
declare module 'lucia' {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: DatabaseUserAttributes;
    }
}

interface DatabaseUserAttributes {
    email: string;
    avatarUrl?: string;
}

import { createMiddleware } from 'hono/factory';

export const authMiddleware = createMiddleware(async (c, next) => {
    const user = c.get('user');
    if (!user) {
        return c.json({ error: 'Unauthorized' }, 401);
    }
    await next();
});
