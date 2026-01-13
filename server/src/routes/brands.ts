import { Hono } from 'hono';
import { db } from '../db';
import { brandProfiles } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authMiddleware } from '../lib/auth';

export const brandRouter = new Hono();

// Apply auth middleware to all routes
brandRouter.use('*', authMiddleware);

// GET ALL BRAND PROFILES FOR USER
brandRouter.get('/', async (c) => {
    const user = c.get('user');

    try {
        const profiles = await db.select()
            .from(brandProfiles)
            .where(eq(brandProfiles.userId, user.id))
            .orderBy(desc(brandProfiles.isDefault), desc(brandProfiles.updatedAt));

        return c.json({ profiles });
    } catch (error) {
        console.error('Fetch Brand Profiles Error:', error);
        return c.json({ error: 'Failed to fetch brand profiles' }, 500);
    }
});

// GET SINGLE BRAND PROFILE
brandRouter.get('/:id', async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');

    try {
        const [profile] = await db.select()
            .from(brandProfiles)
            .where(and(eq(brandProfiles.id, id), eq(brandProfiles.userId, user.id)))
            .limit(1);

        if (!profile) {
            return c.json({ error: 'Brand profile not found' }, 404);
        }

        return c.json({ profile });
    } catch (error) {
        console.error('Fetch Brand Profile Error:', error);
        return c.json({ error: 'Failed to fetch brand profile' }, 500);
    }
});

// CREATE BRAND PROFILE
brandRouter.post('/', async (c) => {
    const user = c.get('user');
    const body = await c.req.json();

    try {
        // If this is marked as default, unset other defaults first
        if (body.is_default) {
            await db.update(brandProfiles)
                .set({ isDefault: false })
                .where(eq(brandProfiles.userId, user.id));
        }

        const [profile] = await db.insert(brandProfiles).values({
            userId: user.id,
            teamId: body.team_id || null,
            name: body.name || 'My Brand',
            colors: body.colors || [],
            fonts: body.fonts || [],
            logoUrl: body.logo_url,
            styleKeywords: body.style_keywords || [],
            isDefault: body.is_default || false,
        }).returning();

        return c.json({ profile });
    } catch (error) {
        console.error('Create Brand Profile Error:', error);
        return c.json({ error: 'Failed to create brand profile' }, 500);
    }
});

// UPDATE BRAND PROFILE
brandRouter.patch('/:id', async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    const body = await c.req.json();

    try {
        // Verify ownership
        const [existing] = await db.select()
            .from(brandProfiles)
            .where(and(eq(brandProfiles.id, id), eq(brandProfiles.userId, user.id)))
            .limit(1);

        if (!existing) {
            return c.json({ error: 'Brand profile not found' }, 404);
        }

        const updateData: Record<string, unknown> = { updatedAt: new Date() };

        if (body.name !== undefined) updateData.name = body.name;
        if (body.colors !== undefined) updateData.colors = body.colors;
        if (body.fonts !== undefined) updateData.fonts = body.fonts;
        if (body.logo_url !== undefined) updateData.logoUrl = body.logo_url;
        if (body.style_keywords !== undefined) updateData.styleKeywords = body.style_keywords;

        // Handle default flag specially
        if (body.is_default !== undefined) {
            if (body.is_default && !existing.isDefault) {
                // Unset other defaults first
                await db.update(brandProfiles)
                    .set({ isDefault: false })
                    .where(eq(brandProfiles.userId, user.id));
            }
            updateData.isDefault = body.is_default;
        }

        const [updated] = await db.update(brandProfiles)
            .set(updateData)
            .where(eq(brandProfiles.id, id))
            .returning();

        return c.json({ profile: updated });
    } catch (error) {
        console.error('Update Brand Profile Error:', error);
        return c.json({ error: 'Failed to update brand profile' }, 500);
    }
});

// DELETE BRAND PROFILE
brandRouter.delete('/:id', async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');

    try {
        // Verify ownership
        const [existing] = await db.select()
            .from(brandProfiles)
            .where(and(eq(brandProfiles.id, id), eq(brandProfiles.userId, user.id)))
            .limit(1);

        if (!existing) {
            return c.json({ error: 'Brand profile not found' }, 404);
        }

        await db.delete(brandProfiles)
            .where(eq(brandProfiles.id, id));

        return c.json({ success: true });
    } catch (error) {
        console.error('Delete Brand Profile Error:', error);
        return c.json({ error: 'Failed to delete brand profile' }, 500);
    }
});

// SET AS DEFAULT
brandRouter.post('/:id/set-default', async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');

    try {
        // Verify ownership
        const [existing] = await db.select()
            .from(brandProfiles)
            .where(and(eq(brandProfiles.id, id), eq(brandProfiles.userId, user.id)))
            .limit(1);

        if (!existing) {
            return c.json({ error: 'Brand profile not found' }, 404);
        }

        // Unset all defaults first
        await db.update(brandProfiles)
            .set({ isDefault: false })
            .where(eq(brandProfiles.userId, user.id));

        // Set this one as default
        const [updated] = await db.update(brandProfiles)
            .set({ isDefault: true, updatedAt: new Date() })
            .where(eq(brandProfiles.id, id))
            .returning();

        return c.json({ success: true, profile: updated });
    } catch (error) {
        console.error('Set Default Error:', error);
        return c.json({ error: 'Failed to set default brand profile' }, 500);
    }
});

// GET DEFAULT BRAND PROFILE
brandRouter.get('/default', async (c) => {
    const user = c.get('user');

    try {
        const [profile] = await db.select()
            .from(brandProfiles)
            .where(and(eq(brandProfiles.userId, user.id), eq(brandProfiles.isDefault, true)))
            .limit(1);

        if (!profile) {
            // Return first profile if no default is set
            const [first] = await db.select()
                .from(brandProfiles)
                .where(eq(brandProfiles.userId, user.id))
                .limit(1);

            return c.json({ profile: first || null });
        }

        return c.json({ profile });
    } catch (error) {
        console.error('Get Default Brand Profile Error:', error);
        return c.json({ error: 'Failed to fetch default brand profile' }, 500);
    }
});
