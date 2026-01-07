import { createMiddleware } from 'hono/factory';
import { db } from '../db';
import { adminUsers } from '../db/schema';
import { eq } from 'drizzle-orm';

export type AdminRole = 'super_admin' | 'admin';

export type AdminPermissions = {
    user_management: boolean;
    agent_configuration: boolean;
    audit_log_access: boolean;
    system_settings: boolean;
    observability_config: boolean;
};

export type AdminContext = {
    adminId: string;
    role: AdminRole;
    permissions: AdminPermissions;
};

/**
 * Middleware that checks if the current user is an admin
 * Sets admin context with role and permissions
 */
export const adminMiddleware = createMiddleware(async (c, next) => {
    const user = c.get('user');

    if (!user) {
        return c.json({ error: 'Unauthorized - Authentication required' }, 401);
    }

    // Check if user is in admin_users table
    const [admin] = await db
        .select()
        .from(adminUsers)
        .where(eq(adminUsers.userId, user.id))
        .limit(1);

    if (!admin) {
        return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    // Set admin context
    const adminContext: AdminContext = {
        adminId: admin.id,
        role: admin.role as AdminRole,
        permissions: (admin.permissions as AdminPermissions) || {
            user_management: true,
            agent_configuration: true,
            audit_log_access: true,
            system_settings: true,
            observability_config: false,
        },
    };

    c.set('admin', adminContext);
    await next();
});

/**
 * Middleware factory that checks for specific permission
 */
export const requirePermission = (permission: keyof AdminPermissions) => {
    return createMiddleware(async (c, next) => {
        const admin = c.get('admin') as AdminContext | undefined;

        if (!admin) {
            return c.json({ error: 'Admin context not found' }, 500);
        }

        // Super admins have all permissions
        if (admin.role === 'super_admin') {
            await next();
            return;
        }

        // Check specific permission
        if (!admin.permissions[permission]) {
            return c.json({
                error: `Forbidden - Missing permission: ${permission}`
            }, 403);
        }

        await next();
    });
};

/**
 * Helper to get admin context from request
 */
export const getAdminContext = (c: any): AdminContext | null => {
    return c.get('admin') || null;
};
