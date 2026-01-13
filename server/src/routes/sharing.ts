import { Hono } from 'hono';
import { db } from '../db';
import { sharedLinks, designs, comments } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authMiddleware } from '../lib/auth';
import { randomUUID } from 'crypto';

export const sharingRouter = new Hono();

// PUBLIC ROUTES (no auth required)

// GET DESIGN BY SHARED TOKEN (public access)
sharingRouter.get('/public/:token', async (c) => {
    const token = c.req.param('token');

    try {
        const [link] = await db.select()
            .from(sharedLinks)
            .where(eq(sharedLinks.token, token))
            .limit(1);

        if (!link) {
            return c.json({ error: 'Shared link not found or expired' }, 404);
        }

        // Check expiration
        if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
            return c.json({ error: 'This shared link has expired' }, 410);
        }

        // Get the design
        const [design] = await db.select()
            .from(designs)
            .where(eq(designs.id, link.designId))
            .limit(1);

        if (!design) {
            return c.json({ error: 'Design not found' }, 404);
        }

        return c.json({
            design,
            canComment: link.canComment,
            expiresAt: link.expiresAt,
        });
    } catch (error) {
        console.error('Get Shared Design Error:', error);
        return c.json({ error: 'Failed to fetch shared design' }, 500);
    }
});

// GET COMMENTS FOR SHARED DESIGN (public access)
sharingRouter.get('/public/:token/comments', async (c) => {
    const token = c.req.param('token');

    try {
        const [link] = await db.select()
            .from(sharedLinks)
            .where(eq(sharedLinks.token, token))
            .limit(1);

        if (!link) {
            return c.json({ error: 'Shared link not found' }, 404);
        }

        const designComments = await db.select()
            .from(comments)
            .where(eq(comments.designId, link.designId))
            .orderBy(desc(comments.createdAt));

        return c.json({ comments: designComments });
    } catch (error) {
        console.error('Get Comments Error:', error);
        return c.json({ error: 'Failed to fetch comments' }, 500);
    }
});

// ADD COMMENT TO SHARED DESIGN (public access if canComment)
sharingRouter.post('/public/:token/comments', async (c) => {
    const token = c.req.param('token');
    const body = await c.req.json();

    try {
        const [link] = await db.select()
            .from(sharedLinks)
            .where(eq(sharedLinks.token, token))
            .limit(1);

        if (!link) {
            return c.json({ error: 'Shared link not found' }, 404);
        }

        if (!link.canComment) {
            return c.json({ error: 'Commenting is disabled for this shared link' }, 403);
        }

        // Check expiration
        if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
            return c.json({ error: 'This shared link has expired' }, 410);
        }

        const [comment] = await db.insert(comments).values({
            designId: link.designId,
            authorName: body.author_name || 'Anonymous',
            content: body.content,
            x: body.x,
            y: body.y,
        }).returning();

        return c.json({ comment });
    } catch (error) {
        console.error('Add Comment Error:', error);
        return c.json({ error: 'Failed to add comment' }, 500);
    }
});

// AUTHENTICATED ROUTES
sharingRouter.use('/my-shares/*', authMiddleware);
sharingRouter.use('/share', authMiddleware);

// CREATE SHARED LINK
sharingRouter.post('/share', async (c) => {
    const user = c.get('user');
    const body = await c.req.json();

    if (!body.design_id) {
        return c.json({ error: 'design_id is required' }, 400);
    }

    try {
        // Verify user owns the design
        const [design] = await db.select()
            .from(designs)
            .where(and(eq(designs.id, body.design_id), eq(designs.userId, user.id)))
            .limit(1);

        if (!design) {
            return c.json({ error: 'Design not found or you do not have permission' }, 404);
        }

        // Generate unique token
        const token = randomUUID();

        // Calculate expiration if specified (in hours)
        let expiresAt = null;
        if (body.expires_in_hours) {
            expiresAt = new Date(Date.now() + body.expires_in_hours * 60 * 60 * 1000);
        }

        const [link] = await db.insert(sharedLinks).values({
            designId: body.design_id,
            token,
            expiresAt,
            canComment: body.can_comment ?? true,
        }).returning();

        // Return the full share URL
        const baseUrl = process.env.PUBLIC_URL || 'https://nanobanna.verridian.ai';
        const shareUrl = `${baseUrl}/shared/${token}`;

        return c.json({
            link,
            shareUrl,
        });
    } catch (error) {
        console.error('Create Share Link Error:', error);
        return c.json({ error: 'Failed to create share link' }, 500);
    }
});

// GET MY SHARED LINKS
sharingRouter.get('/my-shares', async (c) => {
    const user = c.get('user');

    try {
        // Get all designs owned by user
        const userDesigns = await db.select({ id: designs.id })
            .from(designs)
            .where(eq(designs.userId, user.id));

        const designIds = userDesigns.map(d => d.id);

        if (designIds.length === 0) {
            return c.json({ shares: [] });
        }

        // Get all shared links for those designs
        const shares = await db.select()
            .from(sharedLinks)
            .orderBy(desc(sharedLinks.createdAt));

        // Filter to only links for user's designs
        const userShares = shares.filter(s => designIds.includes(s.designId));

        return c.json({ shares: userShares });
    } catch (error) {
        console.error('Get My Shares Error:', error);
        return c.json({ error: 'Failed to fetch shares' }, 500);
    }
});

// REVOKE SHARED LINK
sharingRouter.delete('/my-shares/:id', async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');

    try {
        // Get the share link
        const [link] = await db.select()
            .from(sharedLinks)
            .where(eq(sharedLinks.id, id))
            .limit(1);

        if (!link) {
            return c.json({ error: 'Share link not found' }, 404);
        }

        // Verify user owns the design
        const [design] = await db.select()
            .from(designs)
            .where(and(eq(designs.id, link.designId), eq(designs.userId, user.id)))
            .limit(1);

        if (!design) {
            return c.json({ error: 'You do not have permission to revoke this link' }, 403);
        }

        await db.delete(sharedLinks).where(eq(sharedLinks.id, id));

        return c.json({ success: true });
    } catch (error) {
        console.error('Revoke Share Error:', error);
        return c.json({ error: 'Failed to revoke share link' }, 500);
    }
});
