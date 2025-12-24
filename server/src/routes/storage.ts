import { Hono } from 'hono';
import { generateUploadSignedUrl, generateReadSignedUrl, deleteFile, getFileMetadata } from '../lib/gcs';
import { lucia } from '../lib/auth';
import { db } from '../db';
import { userPreferences } from '../db/schema';
import { eq, sql } from 'drizzle-orm';

export const storageRouter = new Hono();

// Middleware-like helper for extracting user
const getUser = async (c: any) => {
    const sessionId = lucia.readSessionCookie(c.req.header('Cookie') ?? '');
    if (!sessionId) return null;
    const { user } = await lucia.validateSession(sessionId);
    return user;
};

// Generate Signed Upload URL
storageRouter.post('/upload-url', async (c) => {
    const user = await getUser(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const { filename, contentType } = await c.req.json();

    if (!filename || !contentType) {
        return c.json({ error: 'Missing filename or contentType' }, 400);
    }

    try {
        const { url, filePath } = await generateUploadSignedUrl(user.id, filename, contentType);
        return c.json({ url, filePath });
    } catch (error) {
        console.error('Storage Error:', error);
        return c.json({ error: 'Failed to generate upload URL' }, 500);
    }
});

// Get Signed Read URL
storageRouter.post('/read-url', async (c) => {
    const user = await getUser(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const { filePath } = await c.req.json();

    // Security check: Ensure user is accessing their own folder
    if (!filePath.startsWith(`${user.id}/`)) {
        return c.json({ error: 'Access denied to this file' }, 403);
    }

    try {
        const url = await generateReadSignedUrl(filePath);
        return c.json({ url });
    } catch (error) {
        console.error('Storage Read Error:', error);
        return c.json({ error: 'Failed to generate read URL' }, 500);
    }
});

// Confirm Upload (Optional hook to update storage usage)
storageRouter.post('/confirm-upload', async (c) => {
    const user = await getUser(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const { filePath } = await c.req.json();

    // Security check
    if (!filePath.startsWith(`${user.id}/`)) {
        return c.json({ error: 'Forbidden' }, 403);
    }

    try {
        const metadata = await getFileMetadata(filePath);
        // Fix: metadata.size can be string or number. Ensure string for parseInt.
        const size = parseInt(String(metadata.size || '0'), 10);

        // Update usage in DB
        await db.update(userPreferences)
            .set({
                storageUsedBytes: sql`${userPreferences.storageUsedBytes} + ${size}`,
                lastSyncAt: new Date()
            })
            .where(eq(userPreferences.userId, user.id));

        return c.json({ success: true, size });
    } catch (error) {
        console.error('Confirm Upload Error:', error);
        return c.json({ error: 'Failed to confirm upload' }, 500);
    }
});

// Delete File
storageRouter.post('/delete', async (c) => {
    const user = await getUser(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const { filePath } = await c.req.json();

    // Security check
    if (!filePath.startsWith(`${user.id}/`)) {
        return c.json({ error: 'Access denied' }, 403);
    }

    try {
        // Prepare to decrement usage
        let size = 0;
        try {
            const metadata = await getFileMetadata(filePath);
            size = parseInt(String(metadata.size || '0'), 10);
        } catch (e) {
            console.warn('Could not get metadata for delete size calculation', e);
        }

        await deleteFile(filePath);

        if (size > 0) {
            await db.update(userPreferences)
                .set({
                    storageUsedBytes: sql`${userPreferences.storageUsedBytes} - ${size}`
                })
                .where(eq(userPreferences.userId, user.id));
        }

        return c.json({ success: true });
    } catch (error) {
        console.error('Delete Error:', error);
        return c.json({ error: 'Failed to delete file' }, 500);
    }
});


