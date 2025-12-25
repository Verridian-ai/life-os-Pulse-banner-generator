import { Hono } from 'hono';
import { db } from '../db';
import { images } from '../db/schema';
import { eq, and, desc, like, or } from 'drizzle-orm';
import { authMiddleware } from '../lib/auth';

export const imageRouter = new Hono();

// APPLY AUTH MIDDLEWARE TO ALL ROUTES
imageRouter.use('*', authMiddleware);

// GET ALL IMAGES FOR USER
imageRouter.get('/', async (c) => {
    const user = c.get('user');
    const { search, type, favorites, limit, offset } = c.req.query();

    const conditions = [eq(images.userId, user.id)];

    if (search) {
        conditions.push(like(images.prompt, `%${search}%`));
    }

    if (type && type !== 'All Types') {
        conditions.push(eq(images.generationType, type.toLowerCase()));
    }

    if (favorites === 'true') {
        conditions.push(eq(images.isFavorite, true));
    }

    try {
        const userImages = await db.select()
            .from(images)
            .where(and(...conditions))
            .orderBy(desc(images.createdAt))
            .limit(parseInt(limit || '50'))
            .offset(parseInt(offset || '0'));

        const imagesWithUrls = userImages.map((img) => {
            if (img.storageUrl && !img.storageUrl.startsWith('http') && !img.storageUrl.startsWith('data:')) {
                // Use backend proxy to serve image (bypasses failed Signed URL generation on Cloud Run)
                // We append a timestamp to bust cache if needed, but usually not needed for immutable files
                return { ...img, storageUrl: `/api/images/serve?path=${encodeURIComponent(img.storageUrl)}` };
            }
            return img;
        });

        return c.json({ images: imagesWithUrls });
    } catch (error) {
        console.error('Fetch Images Error:', error);
        return c.json({ error: 'Failed to fetch images' }, 500);
    }
});

// SERVE IMAGE PROXY (Bypasses Signed URL issues)
imageRouter.get('/serve', async (c) => {
    const user = c.get('user');
    const path = c.req.query('path');

    if (!path) return c.text('Path required', 400);

    // Security Check: Ensure user can only access their own files
    // The path is expected to be "userId/filename"
    if (!path.startsWith(`${user.id}/`)) {
        console.warn(`Unauthorized access attempt by ${user.id} to ${path}`);
        return c.text('Unauthorized', 403);
    }

    try {
        const { getStorageClient } = await import('../lib/gcs');
        // We need to export getStorageClient or access bucket differently. 
        // Actually, gcs.ts doesn't export the bucket directly, but it has helper functions.
        // Let's add a verify/stream helper in gcs.ts or just allow raw access?
        // Better: let's modify gcs.ts to export a "getReadStream" function.

        // TEMPORARY FIX: We'll modify gcs.ts first to export a stream function.
        // For now, let's assume we will add 'getFileStream' to '../lib/gcs'
        const { getFileStream } = await import('../lib/gcs');

        const { stream, contentType } = await getFileStream(path);

        c.header('Content-Type', contentType || 'image/png');
        c.header('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

        return c.body(stream as any);

    } catch (error) {
        console.error('Serve Image Error:', error);
        return c.text('Image not found', 404);
    }
});

// PERSIST IMAGE FROM URL (Server-Side)
imageRouter.post('/persist', async (c) => {
    const user = c.get('user');
    const data = await c.req.json();
    const { url, prompt, model_used, quality, generation_type, tags, width, height, file_name } = data;

    if (!url) return c.json({ error: 'URL is required' }, 400);

    try {
        const { uploadFileFromUrl } = await import('../lib/gcs');
        const { userPreferences } = await import('../db/schema');
        const { sql } = await import('drizzle-orm');

        // Generate a unique filename if not provided
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileName = file_name ? `${uniqueSuffix}-${file_name}` : `${uniqueSuffix}.png`;

        // 1. Upload to GCS from backend (avoids CORS issues)
        const { path, size } = await uploadFileFromUrl(user.id, url, fileName);

        // 2. Create DB Image Record
        const [newImage] = await db.insert(images).values({
            userId: user.id,
            storageUrl: path, // stored as "userId/filename"
            fileName: fileName,
            prompt: prompt,
            modelUsed: model_used,
            quality: quality,
            generationType: generation_type || 'generate',
            tags: tags || [],
            fileSizeBytes: size,
            width: width,
            height: height
        }).returning();

        // 3. Update Storage Usage
        // Note: usage tracking is "best effort", doesn't block image creation
        try {
            await db.update(userPreferences)
                .set({
                    storageUsedBytes: sql`${userPreferences.storageUsedBytes} + ${size}`,
                    lastSyncAt: new Date()
                })
                .where(eq(userPreferences.userId, user.id));
        } catch (e) {
            console.warn('Failed to update storage usage', e);
        }

        return c.json({ image: newImage });

    } catch (error) {
        console.error('Persist Image Error:', error);
        return c.json({ error: 'Failed to persist image' }, 500);
    }
});

// SAVE NEW IMAGE
imageRouter.post('/', async (c) => {
    const user = c.get('user');
    const data = await c.req.json();

    try {
        const [newImage] = await db.insert(images).values({
            userId: user.id,
            storageUrl: data.storage_url,
            fileName: data.file_name,
            prompt: data.prompt,
            modelUsed: data.model_used,
            quality: data.quality,
            generationType: data.generation_type || 'generate',
            tags: data.tags || [],
            fileSizeBytes: data.file_size_bytes,
            width: data.width,
            height: data.height
        }).returning();

        return c.json({ image: newImage });
    } catch (error) {
        console.error('Save Image Error:', error);
        return c.json({ error: 'Failed to save image' }, 500);
    }
});

// TOGGLE FAVORITE
imageRouter.post('/:id/toggle-favorite', async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');

    try {
        const existing = await db.select().from(images)
            .where(and(eq(images.id, id), eq(images.userId, user.id)))
            .limit(1);

        if (existing.length === 0) return c.json({ error: 'Image not found' }, 404);

        const [updated] = await db.update(images)
            .set({ isFavorite: !existing[0].isFavorite })
            .where(eq(images.id, id))
            .returning();

        return c.json({ success: true, isFavorite: updated.isFavorite });
    } catch (error) {
        return c.json({ error: 'Failed to toggle favorite' }, 500);
    }
});

// DELETE IMAGE
imageRouter.delete('/:id', async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');

    try {
        await db.delete(images).where(and(eq(images.id, id), eq(images.userId, user.id)));
        return c.json({ success: true });
    } catch (error) {
        return c.json({ error: 'Failed to delete image' }, 500);
    }
});
