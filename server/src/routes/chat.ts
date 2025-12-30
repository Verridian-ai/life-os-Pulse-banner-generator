import { Hono } from 'hono';
import { db } from '../db';
import { chatConversations, chatMessages, voiceTranscripts } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { authMiddleware } from '../lib/auth'; // Assumptions on auth middleware
import { z } from 'zod';
import { getCookie } from 'hono/cookie';

const chatRouter = new Hono();

// Middleware to get user (mocking exact implementation, usually via context variable set by auth middleware)
// For now, I'll assume `c.get('user')` is populated or I'll parse the session cookie manually if needed.
// Relying on Lucia's established pattern.

chatRouter.get('/conversations', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const mode = c.req.query('mode');
    // Simple fetch
    const conversations = await db.select().from(chatConversations)
        .where(and(
            eq(chatConversations.userId, user.id),
            mode ? eq(chatConversations.mode, mode as any) : undefined
        ))
        .orderBy(desc(chatConversations.lastMessageAt));

    return c.json({ conversations });
});

chatRouter.post('/conversations', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const body = await c.req.json();
    const [conversation] = await db.insert(chatConversations).values({
        userId: user.id,
        title: body.title || 'New Conversation',
        mode: body.mode || 'design',
        metadata: body.metadata || {}
    }).returning();

    return c.json({ conversation });
});

chatRouter.get('/conversations/:id', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const id = c.req.param('id');
    const [conversation] = await db.select().from(chatConversations)
        .where(and(eq(chatConversations.id, id), eq(chatConversations.userId, user.id)));

    if (!conversation) return c.json({ error: 'Not found' }, 404);
    return c.json({ conversation });
});

chatRouter.patch('/conversations/:id', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const id = c.req.param('id');
    const body = await c.req.json();

    // First verify ownership
    const [existing] = await db.select().from(chatConversations)
        .where(and(eq(chatConversations.id, id), eq(chatConversations.userId, user.id)));
    if (!existing) return c.json({ error: 'Not found' }, 404);

    const [conversation] = await db.update(chatConversations)
        .set({ ...body, updatedAt: new Date() })
        .where(and(eq(chatConversations.id, id), eq(chatConversations.userId, user.id)))
        .returning();
    return c.json({ conversation });
});

chatRouter.delete('/conversations/:id', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const id = c.req.param('id');

    // First verify ownership
    const [existing] = await db.select().from(chatConversations)
        .where(and(eq(chatConversations.id, id), eq(chatConversations.userId, user.id)));
    if (!existing) return c.json({ error: 'Not found' }, 404);

    await db.delete(chatConversations)
        .where(and(eq(chatConversations.id, id), eq(chatConversations.userId, user.id)));
    return c.json({ success: true });
});

// Messages
chatRouter.get('/conversations/:id/messages', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const id = c.req.param('id');

    // First verify conversation ownership
    const [conversation] = await db.select().from(chatConversations)
        .where(and(eq(chatConversations.id, id), eq(chatConversations.userId, user.id)));
    if (!conversation) return c.json({ error: 'Not found' }, 404);

    const messages = await db.select().from(chatMessages)
        .where(eq(chatMessages.conversationId, id))
        .orderBy(desc(chatMessages.createdAt)); // Frontend might expect asc, but let's send desc for now or match query
    return c.json({ messages: messages.reverse() }); // Send in chronological order
});

chatRouter.post('/conversations/:id/messages', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const id = c.req.param('id');

    // First verify conversation ownership
    const [conversation] = await db.select().from(chatConversations)
        .where(and(eq(chatConversations.id, id), eq(chatConversations.userId, user.id)));
    if (!conversation) return c.json({ error: 'Not found' }, 404);

    const body = await c.req.json();

    const [message] = await db.insert(chatMessages).values({
        conversationId: id,
        userId: user.id,
        role: body.role,
        content: body.content,
        toolCalls: body.tool_calls,
        // ... map other fields
    }).returning();

    // Update last_message_at
    await db.update(chatConversations)
        .set({ lastMessageAt: new Date() })
        .where(and(eq(chatConversations.id, id), eq(chatConversations.userId, user.id)));

    return c.json({ message });
});

export { chatRouter };
