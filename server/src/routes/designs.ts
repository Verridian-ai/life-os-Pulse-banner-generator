import { Hono } from 'hono';
import { db } from '../db';
import { designs } from '../db/schema';
import { eq, and, desc, like, sql } from 'drizzle-orm';
import { authMiddleware } from '../lib/auth';

export const designRouter = new Hono();

// Apply auth middleware to all routes
designRouter.use('*', authMiddleware);

// GET ALL DESIGNS FOR USER
designRouter.get('/', async (c) => {
    const user = c.get('user');
    const { search, tags, isPublic, limit, offset } = c.req.query();

    const conditions = [eq(designs.userId, user.id)];

    if (search) {
        conditions.push(like(designs.title, `%${search}%`));
    }

    if (isPublic !== undefined) {
        conditions.push(eq(designs.isPublic, isPublic === 'true'));
    }

    try {
        const query = db.select()
            .from(designs)
            .where(and(...conditions))
            .orderBy(desc(designs.updatedAt))
            .limit(parseInt(limit || '50'))
            .offset(parseInt(offset || '0'));

        const userDesigns = await query;

        // Filter by tags if provided (post-query filtering for array contains)
        let filteredDesigns = userDesigns;
        if (tags) {
            const tagList = tags.split(',').map(t => t.trim().toLowerCase());
            filteredDesigns = userDesigns.filter(d =>
                d.tags?.some(tag => tagList.includes(tag.toLowerCase()))
            );
        }

        return c.json({ designs: filteredDesigns });
    } catch (error) {
        console.error('Fetch Designs Error:', error);
        return c.json({ error: 'Failed to fetch designs' }, 500);
    }
});

// GET SINGLE DESIGN
designRouter.get('/:id', async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');

    try {
        const [design] = await db.select()
            .from(designs)
            .where(and(eq(designs.id, id), eq(designs.userId, user.id)))
            .limit(1);

        if (!design) {
            return c.json({ error: 'Design not found' }, 404);
        }

        return c.json({ design });
    } catch (error) {
        console.error('Fetch Design Error:', error);
        return c.json({ error: 'Failed to fetch design' }, 500);
    }
});

// CREATE DESIGN
designRouter.post('/', async (c) => {
    const user = c.get('user');
    const body = await c.req.json();

    try {
        const [design] = await db.insert(designs).values({
            userId: user.id,
            title: body.title || 'Untitled Design',
            description: body.description,
            thumbnailUrl: body.thumbnail_url,
            designUrl: body.design_url,
            canvasData: body.canvas_data,
            width: body.width || 1920,
            height: body.height || 568,
            tags: body.tags || [],
            isPublic: body.is_public || false,
        }).returning();

        return c.json({ design });
    } catch (error) {
        console.error('Create Design Error:', error);
        return c.json({ error: 'Failed to create design' }, 500);
    }
});

// UPDATE DESIGN
designRouter.patch('/:id', async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    const body = await c.req.json();

    try {
        // Verify ownership
        const [existing] = await db.select()
            .from(designs)
            .where(and(eq(designs.id, id), eq(designs.userId, user.id)))
            .limit(1);

        if (!existing) {
            return c.json({ error: 'Design not found' }, 404);
        }

        const updateData: Record<string, unknown> = { updatedAt: new Date() };

        if (body.title !== undefined) updateData.title = body.title;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.thumbnail_url !== undefined) updateData.thumbnailUrl = body.thumbnail_url;
        if (body.design_url !== undefined) updateData.designUrl = body.design_url;
        if (body.canvas_data !== undefined) updateData.canvasData = body.canvas_data;
        if (body.width !== undefined) updateData.width = body.width;
        if (body.height !== undefined) updateData.height = body.height;
        if (body.tags !== undefined) updateData.tags = body.tags;
        if (body.is_public !== undefined) updateData.isPublic = body.is_public;

        const [updated] = await db.update(designs)
            .set(updateData)
            .where(eq(designs.id, id))
            .returning();

        return c.json({ design: updated });
    } catch (error) {
        console.error('Update Design Error:', error);
        return c.json({ error: 'Failed to update design' }, 500);
    }
});

// DELETE DESIGN
designRouter.delete('/:id', async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');

    try {
        await db.delete(designs)
            .where(and(eq(designs.id, id), eq(designs.userId, user.id)));

        return c.json({ success: true });
    } catch (error) {
        console.error('Delete Design Error:', error);
        return c.json({ error: 'Failed to delete design' }, 500);
    }
});

// TOGGLE PUBLIC
designRouter.post('/:id/toggle-public', async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');

    try {
        const [existing] = await db.select()
            .from(designs)
            .where(and(eq(designs.id, id), eq(designs.userId, user.id)))
            .limit(1);

        if (!existing) {
            return c.json({ error: 'Design not found' }, 404);
        }

        const [updated] = await db.update(designs)
            .set({ isPublic: !existing.isPublic, updatedAt: new Date() })
            .where(eq(designs.id, id))
            .returning();

        return c.json({ success: true, isPublic: updated.isPublic });
    } catch (error) {
        console.error('Toggle Public Error:', error);
        return c.json({ error: 'Failed to toggle public status' }, 500);
    }
});

// INCREMENT VIEW COUNT (for public designs)
designRouter.post('/:id/view', async (c) => {
    const id = c.req.param('id');

    try {
        const [updated] = await db.update(designs)
            .set({ viewCount: sql`${designs.viewCount} + 1` })
            .where(eq(designs.id, id))
            .returning();

        if (!updated) {
            return c.json({ error: 'Design not found' }, 404);
        }

        return c.json({ success: true, viewCount: updated.viewCount });
    } catch (error) {
        console.error('Increment View Error:', error);
        return c.json({ error: 'Failed to increment view count' }, 500);
    }
});
