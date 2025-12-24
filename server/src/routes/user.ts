import { Hono } from 'hono';
import { lucia } from '../lib/auth';
import { db } from '../db';
import { profiles, userPreferences, userApiKeys } from '../db/schema';
import { eq } from 'drizzle-orm';

export const userRouter = new Hono();

const getUser = async (c: any) => {
    const sessionId = lucia.readSessionCookie(c.req.header('Cookie') ?? '');
    if (!sessionId) return null;
    const { user } = await lucia.validateSession(sessionId);
    return user;
};

// Get Full User Profile
userRouter.get('/profile', async (c) => {
    const user = await getUser(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    // Fetch profile
    const profile = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1);

    // Fetch preferences
    const preferences = await db.select().from(userPreferences).where(eq(userPreferences.userId, user.id)).limit(1);

    // Create if missing (lazy init)
    let userProfile = profile[0];
    if (!userProfile) {
        [userProfile] = await db.insert(profiles).values({
            id: user.id,
            email: user.email, // Assuming user.email populated from auth
        }).returning();
    }

    let userPrefs = preferences[0];
    if (!userPrefs) {
        [userPrefs] = await db.insert(userPreferences).values({
            userId: user.id
        }).returning();
    }

    return c.json({ profile: userProfile, preferences: userPrefs });
});

// Update Profile
userRouter.patch('/profile', async (c) => {
    const user = await getUser(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const body = await c.req.json();

    // Filter allowed fields
    const { fullName, firstName, lastName, username, avatarUrl } = body;

    const [updated] = await db.update(profiles)
        .set({ fullName, firstName, lastName, username, avatarUrl, updatedAt: new Date() })
        .where(eq(profiles.id, user.id))
        .returning();

    return c.json({ profile: updated });
});

// Update Preferences
userRouter.patch('/preferences', async (c) => {
    const user = await getUser(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const body = await c.req.json();
    const { theme, language, chatSettings, notifications } = body;

    const [updated] = await db.update(userPreferences)
        .set({ theme, language, chatSettings: chatSettings, notifications: notifications })
        .where(eq(userPreferences.userId, user.id))
        .returning();

    return c.json({ preferences: updated });
});

// Helper to mask API keys (show only last 4 characters)
const maskKey = (key: string | null | undefined): string | null => {
    if (!key) return null;
    if (key.length <= 4) return '****';
    return `****${key.slice(-4)}`;
};

// Get API Keys (Securely - with masking)
userRouter.get('/api-keys', async (c) => {
    const user = await getUser(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const keys = await db.select().from(userApiKeys).where(eq(userApiKeys.userId, user.id)).limit(1);

    // Check if product (server) has API keys configured via environment variables
    // This tells the frontend that AI features will work even without user BYOK keys
    const hasProductKeys = !!(process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY);

    if (!keys[0]) {
        return c.json({ apiKeys: {}, hasProductKeys });
    }

    const dbKeys = keys[0];

    // SECURITY: Return masked keys for display, with hasKey boolean for UI state
    // Full keys are ONLY used server-side for API calls
    const maskedApiKeys = {
        geminiApiKey: maskKey(dbKeys.geminiApiKey),
        openaiApiKey: maskKey(dbKeys.openaiApiKey),
        openrouterApiKey: maskKey(dbKeys.openrouterApiKey),
        replicateApiKey: maskKey(dbKeys.replicateApiKey),
        // Non-sensitive preferences can be returned as-is
        llmProvider: dbKeys.llmProvider,
        voiceProvider: dbKeys.voiceProvider,
        llmModel: dbKeys.llmModel,
        llmImageModel: dbKeys.llmImageModel,
        llmMagicEditModel: dbKeys.llmMagicEditModel,
        llmUpscaleModel: dbKeys.llmUpscaleModel,
        // Boolean flags for UI to know if keys exist
        hasGeminiKey: !!dbKeys.geminiApiKey,
        hasOpenaiKey: !!dbKeys.openaiApiKey,
        hasOpenrouterKey: !!dbKeys.openrouterApiKey,
        hasReplicateKey: !!dbKeys.replicateApiKey,
    };

    return c.json({ apiKeys: maskedApiKeys, hasProductKeys });
});

// Update API Keys
userRouter.post('/api-keys', async (c) => {
    const user = await getUser(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const body = await c.req.json();
    const {
        geminiApiKey, openaiApiKey, openrouterApiKey, replicateApiKey,
        llmProvider, voiceProvider, llmModel, llmImageModel, llmMagicEditModel, llmUpscaleModel
    } = body;

    // Check if exists
    const existing = await db.select().from(userApiKeys).where(eq(userApiKeys.userId, user.id)).limit(1);

    let result;
    if (existing.length === 0) {
        const [inserted] = await db.insert(userApiKeys).values({
            userId: user.id,
            geminiApiKey, openaiApiKey, openrouterApiKey, replicateApiKey,
            llmProvider, voiceProvider, llmModel, llmImageModel, llmMagicEditModel, llmUpscaleModel
        }).returning();
        result = inserted;
    } else {
        const [updated] = await db.update(userApiKeys)
            .set({
                geminiApiKey, openaiApiKey, openrouterApiKey, replicateApiKey,
                llmProvider, voiceProvider, llmModel, llmImageModel, llmMagicEditModel, llmUpscaleModel,
                updatedAt: new Date()
            })
            .where(eq(userApiKeys.userId, user.id))
            .returning();
        result = updated;
    }

    // SECURITY: Only return success status, never return the full keys
    return c.json({ success: true });
});


