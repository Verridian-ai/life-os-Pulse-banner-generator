import { Hono } from 'hono';
import { db } from '../db';
import {
    users,
    profiles,
    adminUsers,
    adminAuditLog,
    agentConfigs,
    agentSkills,
    agentMcpConnections,
    agentContextDocs,
    agentRuntimeState,
    userCreditAccounts,
    creditTiers,
    creditTransactions,
    llmTraces,
    apiMetrics,
    dailyStats,
} from '../db/schema';
import { eq, desc, sql, like, or, and, count } from 'drizzle-orm';
import { adminMiddleware, requirePermission, getAdminContext } from '../lib/adminAuth';

export const adminRouter = new Hono();

// Apply admin middleware to all routes
adminRouter.use('*', adminMiddleware);

// ============================================================================
// Admin Status & Dashboard
// ============================================================================

/**
 * GET /api/admin/check
 * Check if current user is an admin
 */
adminRouter.get('/check', async (c) => {
    const admin = getAdminContext(c);
    return c.json({
        isAdmin: true,
        role: admin?.role,
        permissions: admin?.permissions,
    });
});

/**
 * GET /api/admin/dashboard
 * Get dashboard overview stats
 */
adminRouter.get('/dashboard', async (c) => {
    try {
        // Get user count
        const [userCount] = await db
            .select({ count: count() })
            .from(users);

        // Get admin count
        const [adminCount] = await db
            .select({ count: count() })
            .from(adminUsers);

        // Get agent count
        const [agentCount] = await db
            .select({ count: count() })
            .from(agentConfigs);

        // Get today's stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [todayStats] = await db
            .select()
            .from(dailyStats)
            .where(sql`DATE(${dailyStats.date}) = ${today.toISOString().split('T')[0]}`)
            .limit(1);

        return c.json({
            users: {
                total: userCount?.count || 0,
                admins: adminCount?.count || 0,
            },
            agents: {
                total: agentCount?.count || 0,
            },
            today: todayStats || {
                totalRequests: 0,
                totalLlmCalls: 0,
                totalTokens: 0,
                uniqueUsers: 0,
                errorCount: 0,
            },
        });
    } catch (error) {
        console.error('[Admin] Dashboard error:', error);
        return c.json({ error: 'Failed to load dashboard' }, 500);
    }
});

// ============================================================================
// User Management
// ============================================================================

/**
 * GET /api/admin/users
 * List all users with pagination and search
 */
adminRouter.get('/users', requirePermission('user_management'), async (c) => {
    try {
        const page = parseInt(c.req.query('page') || '1');
        const limit = parseInt(c.req.query('limit') || '20');
        const search = c.req.query('search') || '';
        const offset = (page - 1) * limit;

        // Build search condition
        const searchCondition = search
            ? or(
                like(users.email, `%${search}%`),
                like(profiles.fullName, `%${search}%`),
                like(profiles.username, `%${search}%`)
            )
            : undefined;

        // Get total count
        const [totalResult] = await db
            .select({ count: count() })
            .from(users)
            .leftJoin(profiles, eq(users.id, profiles.id))
            .where(searchCondition);

        // Get users with profiles and credit info
        const userList = await db
            .select({
                id: users.id,
                email: users.email,
                createdAt: users.createdAt,
                profile: {
                    fullName: profiles.fullName,
                    username: profiles.username,
                    avatarUrl: profiles.avatarUrl,
                    imagesGenerated: profiles.imagesGenerated,
                },
                credits: {
                    balance: userCreditAccounts.creditBalance,
                    tierId: userCreditAccounts.tierId,
                },
            })
            .from(users)
            .leftJoin(profiles, eq(users.id, profiles.id))
            .leftJoin(userCreditAccounts, eq(users.id, userCreditAccounts.userId))
            .where(searchCondition)
            .orderBy(desc(users.createdAt))
            .limit(limit)
            .offset(offset);

        return c.json({
            users: userList,
            pagination: {
                page,
                limit,
                total: totalResult?.count || 0,
                totalPages: Math.ceil((totalResult?.count || 0) / limit),
            },
        });
    } catch (error) {
        console.error('[Admin] List users error:', error);
        return c.json({ error: 'Failed to list users' }, 500);
    }
});

/**
 * GET /api/admin/users/:id
 * Get detailed user information
 */
adminRouter.get('/users/:id', requirePermission('user_management'), async (c) => {
    try {
        const userId = c.req.param('id');

        const [user] = await db
            .select({
                id: users.id,
                email: users.email,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
                failedLoginAttempts: users.failedLoginAttempts,
                lockedUntil: users.lockedUntil,
            })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        if (!user) {
            return c.json({ error: 'User not found' }, 404);
        }

        // Get profile
        const [profile] = await db
            .select()
            .from(profiles)
            .where(eq(profiles.id, userId))
            .limit(1);

        // Get credit account
        const [creditAccount] = await db
            .select()
            .from(userCreditAccounts)
            .where(eq(userCreditAccounts.userId, userId))
            .limit(1);

        // Get admin status
        const [adminStatus] = await db
            .select()
            .from(adminUsers)
            .where(eq(adminUsers.userId, userId))
            .limit(1);

        // Get recent credit transactions
        const recentTransactions = await db
            .select()
            .from(creditTransactions)
            .where(eq(creditTransactions.userId, userId))
            .orderBy(desc(creditTransactions.createdAt))
            .limit(10);

        return c.json({
            user,
            profile,
            creditAccount,
            isAdmin: !!adminStatus,
            adminRole: adminStatus?.role,
            recentTransactions,
        });
    } catch (error) {
        console.error('[Admin] Get user error:', error);
        return c.json({ error: 'Failed to get user' }, 500);
    }
});

/**
 * PATCH /api/admin/users/:id
 * Update user profile
 */
adminRouter.patch('/users/:id', requirePermission('user_management'), async (c) => {
    try {
        const userId = c.req.param('id');
        const body = await c.req.json();
        const admin = getAdminContext(c);

        // Update profile
        const [updated] = await db
            .update(profiles)
            .set({
                fullName: body.fullName,
                username: body.username,
                updatedAt: new Date(),
            })
            .where(eq(profiles.id, userId))
            .returning();

        // Log audit
        await db.insert(adminAuditLog).values({
            adminUserId: admin!.adminId,
            action: 'user.update',
            resource: 'user',
            resourceId: userId,
            details: body,
            status: 'success',
        });

        return c.json({ success: true, profile: updated });
    } catch (error) {
        console.error('[Admin] Update user error:', error);
        return c.json({ error: 'Failed to update user' }, 500);
    }
});

/**
 * POST /api/admin/users/:id/grant-admin
 * Grant admin privileges to a user
 */
adminRouter.post('/users/:id/grant-admin', requirePermission('user_management'), async (c) => {
    try {
        const userId = c.req.param('id');
        const body = await c.req.json();
        const admin = getAdminContext(c);

        // Only super_admin can grant admin
        if (admin?.role !== 'super_admin') {
            return c.json({ error: 'Only super admins can grant admin privileges' }, 403);
        }

        // Check if already admin
        const [existing] = await db
            .select()
            .from(adminUsers)
            .where(eq(adminUsers.userId, userId))
            .limit(1);

        if (existing) {
            return c.json({ error: 'User is already an admin' }, 400);
        }

        // Grant admin
        const [newAdmin] = await db
            .insert(adminUsers)
            .values({
                userId,
                role: body.role || 'admin',
                permissions: body.permissions || {},
                createdBy: admin.adminId,
            })
            .returning();

        // Log audit
        await db.insert(adminAuditLog).values({
            adminUserId: admin.adminId,
            action: 'admin.grant',
            resource: 'admin_user',
            resourceId: userId,
            details: { role: body.role },
            status: 'success',
        });

        return c.json({ success: true, admin: newAdmin });
    } catch (error) {
        console.error('[Admin] Grant admin error:', error);
        return c.json({ error: 'Failed to grant admin privileges' }, 500);
    }
});

/**
 * DELETE /api/admin/users/:id/revoke-admin
 * Revoke admin privileges
 */
adminRouter.delete('/users/:id/revoke-admin', requirePermission('user_management'), async (c) => {
    try {
        const userId = c.req.param('id');
        const admin = getAdminContext(c);

        if (admin?.role !== 'super_admin') {
            return c.json({ error: 'Only super admins can revoke admin privileges' }, 403);
        }

        // Prevent self-revoke
        const [targetAdmin] = await db
            .select()
            .from(adminUsers)
            .where(eq(adminUsers.userId, userId))
            .limit(1);

        if (targetAdmin?.id === admin.adminId) {
            return c.json({ error: 'Cannot revoke your own admin privileges' }, 400);
        }

        await db
            .delete(adminUsers)
            .where(eq(adminUsers.userId, userId));

        // Log audit
        await db.insert(adminAuditLog).values({
            adminUserId: admin.adminId,
            action: 'admin.revoke',
            resource: 'admin_user',
            resourceId: userId,
            status: 'success',
        });

        return c.json({ success: true });
    } catch (error) {
        console.error('[Admin] Revoke admin error:', error);
        return c.json({ error: 'Failed to revoke admin privileges' }, 500);
    }
});

/**
 * POST /api/admin/users/:id/add-credits
 * Add credits to user account
 */
adminRouter.post('/users/:id/add-credits', requirePermission('user_management'), async (c) => {
    try {
        const userId = c.req.param('id');
        const { amount, description } = await c.req.json();
        const admin = getAdminContext(c);

        if (!amount || amount <= 0) {
            return c.json({ error: 'Invalid credit amount' }, 400);
        }

        // Get current balance
        const [account] = await db
            .select()
            .from(userCreditAccounts)
            .where(eq(userCreditAccounts.userId, userId))
            .limit(1);

        if (!account) {
            return c.json({ error: 'User credit account not found' }, 404);
        }

        const newBalance = account.creditBalance + amount;

        // Update balance
        await db
            .update(userCreditAccounts)
            .set({
                creditBalance: newBalance,
                lifetimeCreditsGranted: (account.lifetimeCreditsGranted || 0) + amount,
                updatedAt: new Date(),
            })
            .where(eq(userCreditAccounts.userId, userId));

        // Record transaction
        await db.insert(creditTransactions).values({
            userId,
            amount,
            type: 'bonus',
            description: description || 'Admin credit grant',
            balanceAfter: newBalance,
            metadata: { grantedBy: admin?.adminId },
        });

        // Log audit
        await db.insert(adminAuditLog).values({
            adminUserId: admin!.adminId,
            action: 'credits.add',
            resource: 'user',
            resourceId: userId,
            details: { amount, description },
            status: 'success',
        });

        return c.json({ success: true, newBalance });
    } catch (error) {
        console.error('[Admin] Add credits error:', error);
        return c.json({ error: 'Failed to add credits' }, 500);
    }
});

// ============================================================================
// Agent Configuration
// ============================================================================

/**
 * GET /api/admin/agents
 * List all agent configurations
 */
adminRouter.get('/agents', requirePermission('agent_configuration'), async (c) => {
    try {
        const agents = await db
            .select()
            .from(agentConfigs)
            .orderBy(agentConfigs.name);

        // Get runtime state for each agent
        const agentsWithState = await Promise.all(
            agents.map(async (agent) => {
                const [runtime] = await db
                    .select()
                    .from(agentRuntimeState)
                    .where(eq(agentRuntimeState.agentId, agent.agentId))
                    .limit(1);

                const skills = await db
                    .select()
                    .from(agentSkills)
                    .where(eq(agentSkills.agentId, agent.agentId));

                const mcpConnections = await db
                    .select()
                    .from(agentMcpConnections)
                    .where(eq(agentMcpConnections.agentId, agent.agentId));

                return {
                    ...agent,
                    runtime: runtime || null,
                    skillCount: skills.length,
                    mcpConnectionCount: mcpConnections.length,
                };
            })
        );

        return c.json({ agents: agentsWithState });
    } catch (error) {
        console.error('[Admin] List agents error:', error);
        return c.json({ error: 'Failed to list agents' }, 500);
    }
});

/**
 * GET /api/admin/agents/:id
 * Get detailed agent configuration
 */
adminRouter.get('/agents/:id', requirePermission('agent_configuration'), async (c) => {
    try {
        const agentId = c.req.param('id');

        const [agent] = await db
            .select()
            .from(agentConfigs)
            .where(eq(agentConfigs.agentId, agentId))
            .limit(1);

        if (!agent) {
            return c.json({ error: 'Agent not found' }, 404);
        }

        // Get related data
        const skills = await db
            .select()
            .from(agentSkills)
            .where(eq(agentSkills.agentId, agentId));

        const mcpConnections = await db
            .select()
            .from(agentMcpConnections)
            .where(eq(agentMcpConnections.agentId, agentId));

        const contextDocs = await db
            .select()
            .from(agentContextDocs)
            .where(eq(agentContextDocs.agentId, agentId));

        const [runtime] = await db
            .select()
            .from(agentRuntimeState)
            .where(eq(agentRuntimeState.agentId, agentId))
            .limit(1);

        return c.json({
            agent,
            skills,
            mcpConnections,
            contextDocs,
            runtime,
        });
    } catch (error) {
        console.error('[Admin] Get agent error:', error);
        return c.json({ error: 'Failed to get agent' }, 500);
    }
});

/**
 * PATCH /api/admin/agents/:id
 * Update agent configuration
 */
adminRouter.patch('/agents/:id', requirePermission('agent_configuration'), async (c) => {
    try {
        const agentId = c.req.param('id');
        const body = await c.req.json();
        const admin = getAdminContext(c);

        // Get current config for audit
        const [current] = await db
            .select()
            .from(agentConfigs)
            .where(eq(agentConfigs.agentId, agentId))
            .limit(1);

        if (!current) {
            return c.json({ error: 'Agent not found' }, 404);
        }

        // Update config
        const [updated] = await db
            .update(agentConfigs)
            .set({
                name: body.name ?? current.name,
                systemPrompt: body.systemPrompt ?? current.systemPrompt,
                model: body.model ?? current.model,
                provider: body.provider ?? current.provider,
                capabilities: body.capabilities ?? current.capabilities,
                parameters: body.parameters ?? current.parameters,
                enabled: body.enabled ?? current.enabled,
                version: (current.version || 1) + 1,
                updatedAt: new Date(),
            })
            .where(eq(agentConfigs.agentId, agentId))
            .returning();

        // Log audit
        await db.insert(adminAuditLog).values({
            adminUserId: admin!.adminId,
            action: 'agent.update',
            resource: 'agent',
            resourceId: agentId,
            details: {
                changes: body,
                previousVersion: current.version,
                newVersion: updated.version,
            },
            status: 'success',
        });

        return c.json({ success: true, agent: updated });
    } catch (error) {
        console.error('[Admin] Update agent error:', error);
        return c.json({ error: 'Failed to update agent' }, 500);
    }
});

// ============================================================================
// Observability
// ============================================================================

/**
 * GET /api/admin/observability/traces
 * List LLM traces
 */
adminRouter.get('/observability/traces', requirePermission('audit_log_access'), async (c) => {
    try {
        const limit = parseInt(c.req.query('limit') || '50');
        const offset = parseInt(c.req.query('offset') || '0');

        const traces = await db
            .select()
            .from(llmTraces)
            .orderBy(desc(llmTraces.createdAt))
            .limit(limit)
            .offset(offset);

        const [totalResult] = await db
            .select({ count: count() })
            .from(llmTraces);

        return c.json({
            traces,
            total: totalResult?.count || 0,
        });
    } catch (error) {
        console.error('[Admin] List traces error:', error);
        return c.json({ error: 'Failed to list traces' }, 500);
    }
});

/**
 * GET /api/admin/observability/metrics
 * Get API metrics summary
 */
adminRouter.get('/observability/metrics', requirePermission('audit_log_access'), async (c) => {
    try {
        // Get metrics from last 24 hours
        const yesterday = new Date();
        yesterday.setHours(yesterday.getHours() - 24);

        const metrics = await db
            .select({
                endpoint: apiMetrics.endpoint,
                method: apiMetrics.method,
                avgLatency: sql<number>`AVG(${apiMetrics.latencyMs})`,
                requestCount: count(),
            })
            .from(apiMetrics)
            .where(sql`${apiMetrics.createdAt} > ${yesterday}`)
            .groupBy(apiMetrics.endpoint, apiMetrics.method)
            .orderBy(desc(sql`COUNT(*)`));

        return c.json({ metrics });
    } catch (error) {
        console.error('[Admin] Get metrics error:', error);
        return c.json({ error: 'Failed to get metrics' }, 500);
    }
});

/**
 * GET /api/admin/observability/stats
 * Get daily stats
 */
adminRouter.get('/observability/stats', requirePermission('audit_log_access'), async (c) => {
    try {
        const days = parseInt(c.req.query('days') || '7');

        const stats = await db
            .select()
            .from(dailyStats)
            .orderBy(desc(dailyStats.date))
            .limit(days);

        return c.json({ stats });
    } catch (error) {
        console.error('[Admin] Get stats error:', error);
        return c.json({ error: 'Failed to get stats' }, 500);
    }
});

// ============================================================================
// Audit Logs
// ============================================================================

/**
 * GET /api/admin/audit-logs
 * List admin audit logs
 */
adminRouter.get('/audit-logs', requirePermission('audit_log_access'), async (c) => {
    try {
        const limit = parseInt(c.req.query('limit') || '50');
        const offset = parseInt(c.req.query('offset') || '0');

        const logs = await db
            .select()
            .from(adminAuditLog)
            .orderBy(desc(adminAuditLog.createdAt))
            .limit(limit)
            .offset(offset);

        const [totalResult] = await db
            .select({ count: count() })
            .from(adminAuditLog);

        return c.json({
            logs,
            total: totalResult?.count || 0,
        });
    } catch (error) {
        console.error('[Admin] List audit logs error:', error);
        return c.json({ error: 'Failed to list audit logs' }, 500);
    }
});
