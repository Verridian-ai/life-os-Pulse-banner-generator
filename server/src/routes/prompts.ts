import { Hono } from 'hono';
import { db } from '../db';
import { promptLibrary } from '../db/schema';
import { eq, and, desc, like } from 'drizzle-orm';
import { authMiddleware } from '../lib/auth';

export const promptRouter = new Hono();

// Apply auth middleware
promptRouter.use('*', authMiddleware);

// GET ALL PROMPTS
promptRouter.get('/', async (c) => {
    const user = c.get('user');
    const { search, category, favorites } = c.req.query();

    const conditions = [eq(promptLibrary.userId, user.id)];

    if (search) {
        conditions.push(like(promptLibrary.prompt, `%${search}%`));
    }

    if (category && category !== 'all') {
        conditions.push(eq(promptLibrary.category, category));
    }

    if (favorites === 'true') {
        conditions.push(eq(promptLibrary.isFavorite, true));
    }

    try {
        const prompts = await db.select()
            .from(promptLibrary)
            .where(and(...conditions))
            .orderBy(desc(promptLibrary.createdAt));

        return c.json({ prompts });
    } catch {
        return c.json({ error: 'Failed to fetch prompts' }, 500);
    }
});

// CREATE PROMPT
promptRouter.post('/', async (c) => {
    const user = c.get('user');
    const body = await c.req.json();

    try {
        const [prompt] = await db.insert(promptLibrary).values({
            userId: user.id,
            prompt: body.prompt,
            title: body.title || 'Untitled Prompt',
            category: body.category || 'general',
            tags: body.tags || [],
            isFavorite: body.is_favorite || false,
            isPublic: body.is_public || false,
        }).returning();

        return c.json({ prompt });
    } catch {
        return c.json({ error: 'Failed to save prompt' }, 500);
    }
});

// TOGGLE FAVORITE
promptRouter.post('/:id/toggle-favorite', async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');

    try {
        const [existing] = await db.select().from(promptLibrary)
            .where(and(eq(promptLibrary.id, id), eq(promptLibrary.userId, user.id)))
            .limit(1);

        if (!existing) return c.json({ error: 'Prompt not found' }, 404);

        const [updated] = await db.update(promptLibrary)
            .set({ isFavorite: !existing.isFavorite, updatedAt: new Date() })
            .where(eq(promptLibrary.id, id))
            .returning();

        return c.json({ success: true, isFavorite: updated.isFavorite });
    } catch {
        return c.json({ error: 'Failed to toggle favorite' }, 500);
    }
});

// DELETE PROMPT
promptRouter.delete('/:id', async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');

    try {
        await db.delete(promptLibrary)
            .where(and(eq(promptLibrary.id, id), eq(promptLibrary.userId, user.id)));
        return c.json({ success: true });
    } catch {
        return c.json({ error: 'Failed to delete prompt' }, 500);
    }
});
