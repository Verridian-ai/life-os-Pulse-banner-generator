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
    agentVersionHistory,
    agentCostBudgets,
    agentTestResults,
    userCreditAccounts,
    creditTransactions,
    apiMetrics,
    dailyStats,
    llmTraces,
} from '../db/schema';
import { eq, desc, sql, like, or, and, count } from 'drizzle-orm';
import { adminMiddleware, requirePermission, getAdminContext } from '../lib/adminAuth';
import { CogneeService } from '../services/cognee';
import { LangfuseService } from '../services/langfuse';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { basename } from 'path';

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
 * GET /api/admin/health
 * Get system health status for all services
 */
adminRouter.get('/health', async (c) => {
    const services: Record<string, { status: 'healthy' | 'degraded' | 'down'; latencyMs?: number; message?: string }> = {};

    // Check Database
    const dbStart = Date.now();
    try {
        await db.execute(sql`SELECT 1`);
        services.database = { status: 'healthy', latencyMs: Date.now() - dbStart };
    } catch {
        services.database = { status: 'down', message: 'Database connection failed' };
    }

    // Check Cognee
    if (CogneeService.isEnabled()) {
        try {
            const cogneeHealth = await CogneeService.getHealthStatus();
            services.cognee = {
                status: cogneeHealth.healthy ? 'healthy' : 'degraded',
                message: cogneeHealth.version ? `v${cogneeHealth.version}` : undefined,
            };
        } catch {
            services.cognee = { status: 'down', message: 'Cognee unreachable' };
        }
    } else {
        services.cognee = { status: 'down', message: 'Not configured' };
    }

    // Check Langfuse
    const langfuseEnabled = !!process.env.LANGFUSE_SECRET_KEY;
    if (langfuseEnabled) {
        try {
            // Simple ping to Langfuse
            const langfuseHost = process.env.LANGFUSE_HOST || 'https://cloud.langfuse.com';
            const startLf = Date.now();
            const response = await fetch(`${langfuseHost}/api/public/health`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(5000),
            });
            if (response.ok) {
                services.langfuse = { status: 'healthy', latencyMs: Date.now() - startLf };
            } else {
                services.langfuse = { status: 'degraded', message: `HTTP ${response.status}` };
            }
        } catch {
            services.langfuse = { status: 'down', message: 'Langfuse unreachable' };
        }
    } else {
        services.langfuse = { status: 'down', message: 'Not configured' };
    }

    // Check Stripe
    if (isStripeEnabled()) {
        try {
            const stripe = (await import('../lib/stripe')).getStripe();
            if (stripe) {
                const startStripe = Date.now();
                await stripe.balance.retrieve();
                services.stripe = { status: 'healthy', latencyMs: Date.now() - startStripe };
            } else {
                services.stripe = { status: 'down', message: 'Stripe client not initialized' };
            }
        } catch {
            services.stripe = { status: 'degraded', message: 'Stripe API error' };
        }
    } else {
        services.stripe = { status: 'down', message: 'Not configured' };
    }

    // Check WorkOS
    const workosEnabled = !!process.env.WORKOS_API_KEY;
    if (workosEnabled) {
        services.workos = { status: 'healthy', message: 'Configured' };
    } else {
        services.workos = { status: 'down', message: 'Not configured' };
    }

    // Overall status
    const allHealthy = Object.values(services).every(s => s.status === 'healthy');
    const anyDown = Object.values(services).some(s => s.status === 'down');

    return c.json({
        overall: allHealthy ? 'healthy' : anyDown ? 'degraded' : 'degraded',
        services,
        timestamp: new Date().toISOString(),
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

        // Save current config to version history before updating (Phase 8)
        const hasPromptChange = body.systemPrompt !== undefined && body.systemPrompt !== current.systemPrompt;
        const hasParamChange = body.parameters !== undefined;

        if (hasPromptChange || hasParamChange) {
            await db.insert(agentVersionHistory).values({
                agentId,
                version: current.version || 1,
                systemPrompt: current.systemPrompt,
                parameters: current.parameters,
                changedBy: admin?.adminId,
                changeReason: body.changeReason || 'Configuration update',
            });
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

/**
 * POST /api/admin/agents/:id/documents
 * Add context document to agent
 */
adminRouter.post('/agents/:id/documents', requirePermission('agent_configuration'), async (c) => {
    try {
        const agentId = c.req.param('id');
        const body = await c.req.json();
        const admin = getAdminContext(c);

        const [agent] = await db
            .select()
            .from(agentConfigs)
            .where(eq(agentConfigs.agentId, agentId))
            .limit(1);

        if (!agent) return c.json({ error: 'Agent not found' }, 404);

        // 1. Live Cognee Ingestion
        let cogneeDocId = body.cogneeDocId;
        if (body.filePath && existsSync(body.filePath)) {
            try {
                const fileContent = await readFile(body.filePath);
                const filename = basename(body.filePath);
                cogneeDocId = await CogneeService.addDocument(agentId, fileContent, filename);
            } catch (err) {
                console.warn('[Admin] Cognee ingestion failed:', err);
            }
        }

        const [doc] = await db
            .insert(agentContextDocs)
            .values({
                agentId,
                name: body.name,
                type: body.type || 'text',
                cogneeDocId,
                filePath: body.filePath,
                metadata: body.metadata || {},
            })
            .returning();

        await db.insert(adminAuditLog).values({
            adminUserId: admin!.adminId,
            action: 'agent.add_document',
            resource: 'agent',
            resourceId: agentId,
            details: { docId: doc.id, name: body.name },
            status: 'success',
        });

        return c.json({ success: true, document: doc });
    } catch (error) {
        console.error('[Admin] Add doc error:', error);
        return c.json({ error: 'Failed to add document' }, 500);
    }
});

/**
 * DELETE /api/admin/agents/:id/documents/:docId
 * Remove context document
 */
adminRouter.delete('/agents/:id/documents/:docId', requirePermission('agent_configuration'), async (c) => {
    try {
        const agentId = c.req.param('id');
        const docId = c.req.param('docId');
        const admin = getAdminContext(c);

        // 1. Get doc to find cogneeDocId
        const [docToDelete] = await db
            .select()
            .from(agentContextDocs)
            .where(and(eq(agentContextDocs.id, docId), eq(agentContextDocs.agentId, agentId)))
            .limit(1);

        if (docToDelete && docToDelete.cogneeDocId) {
            try {
                await CogneeService.removeDocument(docToDelete.cogneeDocId);
            } catch (err) {
                console.warn('[Admin] Cognee removal failed:', err);
            }
        }

        await db
            .delete(agentContextDocs)
            .where(and(eq(agentContextDocs.id, docId), eq(agentContextDocs.agentId, agentId)));

        await db.insert(adminAuditLog).values({
            adminUserId: admin!.adminId,
            action: 'agent.remove_document',
            resource: 'agent',
            resourceId: agentId,
            details: { docId },
            status: 'success',
        });

        return c.json({ success: true });
    } catch (error) {
        console.error('[Admin] Remove doc error:', error);
        return c.json({ error: 'Failed to remove document' }, 500);
    }
});

// ============================================================================
// Agent Testing (Phase 8)
// ============================================================================

/**
 * POST /api/admin/agents/:id/test
 * Run a test prompt against an agent
 */
adminRouter.post('/agents/:id/test', requirePermission('agent_configuration'), async (c) => {
    try {
        const agentId = c.req.param('id');
        const { prompt } = await c.req.json();
        const admin = getAdminContext(c);

        if (!prompt || typeof prompt !== 'string') {
            return c.json({ error: 'Prompt is required' }, 400);
        }

        // Get agent config
        const [agent] = await db
            .select()
            .from(agentConfigs)
            .where(eq(agentConfigs.agentId, agentId))
            .limit(1);

        if (!agent) {
            return c.json({ error: 'Agent not found' }, 404);
        }

        const startTime = Date.now();

        // In production, this would call the actual agent
        // For now, we simulate a response
        let output: string;
        let status: 'success' | 'error' = 'success';
        let errorMessage: string | undefined;
        let tokensUsed = 0;
        let costUsd = 0;

        try {
            // Simulated agent response - in production, integrate with actual agent service
            output = `[Test Response from ${agent.name}]\n\nBased on your prompt: "${prompt.slice(0, 100)}${prompt.length > 100 ? '...' : ''}"\n\nThis is a simulated response. In production, this would call the actual agent with the configured system prompt and parameters.`;
            tokensUsed = Math.floor(Math.random() * 500) + 100;
            costUsd = tokensUsed * 0.00002; // Approximate cost
        } catch (err) {
            status = 'error';
            output = '';
            errorMessage = err instanceof Error ? err.message : 'Unknown error';
        }

        const latencyMs = Date.now() - startTime;

        // Store test result
        const [testResult] = await db
            .insert(agentTestResults)
            .values({
                agentId,
                input: prompt,
                output,
                model: agent.model || 'default',
                tokensUsed,
                latencyMs,
                costUsd: costUsd.toString(),
                status,
                error: errorMessage,
                runBy: admin?.adminId,
            })
            .returning();

        // Log audit
        await db.insert(adminAuditLog).values({
            adminUserId: admin!.adminId,
            action: 'agent.test',
            resource: 'agent',
            resourceId: agentId,
            details: { prompt: prompt.slice(0, 200), status },
            status: 'success',
        });

        return c.json({
            success: true,
            result: {
                id: testResult.id,
                input: testResult.input,
                output: testResult.output,
                model: testResult.model,
                tokensUsed: testResult.tokensUsed,
                latencyMs: testResult.latencyMs,
                costUsd: parseFloat(testResult.costUsd?.toString() || '0'),
                status: testResult.status,
                error: testResult.error,
                createdAt: testResult.createdAt,
            },
        });
    } catch (error) {
        console.error('[Admin] Agent test error:', error);
        return c.json({ error: 'Failed to run agent test' }, 500);
    }
});

/**
 * GET /api/admin/agents/:id/test-results
 * Get test results history for an agent
 */
adminRouter.get('/agents/:id/test-results', requirePermission('agent_configuration'), async (c) => {
    try {
        const agentId = c.req.param('id');
        const limit = parseInt(c.req.query('limit') || '20');

        const results = await db
            .select()
            .from(agentTestResults)
            .where(eq(agentTestResults.agentId, agentId))
            .orderBy(desc(agentTestResults.createdAt))
            .limit(limit);

        return c.json({
            results: results.map((r) => ({
                ...r,
                costUsd: parseFloat(r.costUsd?.toString() || '0'),
            })),
        });
    } catch (error) {
        console.error('[Admin] Get test results error:', error);
        return c.json({ error: 'Failed to get test results' }, 500);
    }
});

// ============================================================================
// Agent Budget Management (Phase 8)
// ============================================================================

/**
 * GET /api/admin/agents/:id/budget
 * Get agent cost budget settings
 */
adminRouter.get('/agents/:id/budget', requirePermission('agent_configuration'), async (c) => {
    try {
        const agentId = c.req.param('id');

        const [budget] = await db
            .select()
            .from(agentCostBudgets)
            .where(eq(agentCostBudgets.agentId, agentId))
            .limit(1);

        if (!budget) {
            // Return default budget if not set
            return c.json({
                agentId,
                dailyLimitUsd: null,
                monthlyLimitUsd: null,
                alertThresholdPercent: 80,
                currentDailySpend: 0,
                currentMonthlySpend: 0,
                isOverBudget: false,
            });
        }

        const dailyLimit = parseFloat(budget.dailyLimitUsd?.toString() || '0') || null;
        const monthlyLimit = parseFloat(budget.monthlyLimitUsd?.toString() || '0') || null;
        const currentDailySpend = parseFloat(budget.currentDailySpend?.toString() || '0');
        const currentMonthlySpend = parseFloat(budget.currentMonthlySpend?.toString() || '0');

        const isOverBudget =
            (dailyLimit !== null && currentDailySpend >= dailyLimit) ||
            (monthlyLimit !== null && currentMonthlySpend >= monthlyLimit);

        return c.json({
            agentId,
            dailyLimitUsd: dailyLimit,
            monthlyLimitUsd: monthlyLimit,
            alertThresholdPercent: budget.alertThresholdPercent,
            currentDailySpend,
            currentMonthlySpend,
            isOverBudget,
        });
    } catch (error) {
        console.error('[Admin] Get agent budget error:', error);
        return c.json({ error: 'Failed to get agent budget' }, 500);
    }
});

/**
 * PATCH /api/admin/agents/:id/budget
 * Update agent cost budget settings
 */
adminRouter.patch('/agents/:id/budget', requirePermission('agent_configuration'), async (c) => {
    try {
        const agentId = c.req.param('id');
        const body = await c.req.json();
        const admin = getAdminContext(c);

        // Check if agent exists
        const [agent] = await db
            .select()
            .from(agentConfigs)
            .where(eq(agentConfigs.agentId, agentId))
            .limit(1);

        if (!agent) {
            return c.json({ error: 'Agent not found' }, 404);
        }

        // Check if budget exists
        const [existing] = await db
            .select()
            .from(agentCostBudgets)
            .where(eq(agentCostBudgets.agentId, agentId))
            .limit(1);

        const budgetData = {
            dailyLimitUsd: body.dailyLimitUsd?.toString() || null,
            monthlyLimitUsd: body.monthlyLimitUsd?.toString() || null,
            alertThresholdPercent: body.alertThresholdPercent || 80,
            updatedAt: new Date(),
        };

        let budget;
        if (existing) {
            [budget] = await db
                .update(agentCostBudgets)
                .set(budgetData)
                .where(eq(agentCostBudgets.agentId, agentId))
                .returning();
        } else {
            [budget] = await db
                .insert(agentCostBudgets)
                .values({
                    agentId,
                    ...budgetData,
                })
                .returning();
        }

        // Log audit
        await db.insert(adminAuditLog).values({
            adminUserId: admin!.adminId,
            action: 'agent.update_budget',
            resource: 'agent',
            resourceId: agentId,
            details: budgetData,
            status: 'success',
        });

        return c.json({
            success: true,
            budget: {
                agentId,
                dailyLimitUsd: parseFloat(budget.dailyLimitUsd?.toString() || '0') || null,
                monthlyLimitUsd: parseFloat(budget.monthlyLimitUsd?.toString() || '0') || null,
                alertThresholdPercent: budget.alertThresholdPercent,
            },
        });
    } catch (error) {
        console.error('[Admin] Update agent budget error:', error);
        return c.json({ error: 'Failed to update agent budget' }, 500);
    }
});

// ============================================================================
// Agent Version History (Phase 8)
// ============================================================================

/**
 * GET /api/admin/agents/:id/versions
 * Get version history for an agent
 */
adminRouter.get('/agents/:id/versions', requirePermission('agent_configuration'), async (c) => {
    try {
        const agentId = c.req.param('id');
        const limit = parseInt(c.req.query('limit') || '20');

        const versions = await db
            .select()
            .from(agentVersionHistory)
            .where(eq(agentVersionHistory.agentId, agentId))
            .orderBy(desc(agentVersionHistory.version))
            .limit(limit);

        // Also get current config as the latest version
        const [currentConfig] = await db
            .select()
            .from(agentConfigs)
            .where(eq(agentConfigs.agentId, agentId))
            .limit(1);

        // If no version history exists, return current config as version 1
        if (versions.length === 0 && currentConfig) {
            return c.json({
                versions: [
                    {
                        id: currentConfig.id,
                        agentId: currentConfig.agentId,
                        version: currentConfig.version || 1,
                        systemPrompt: currentConfig.systemPrompt,
                        parameters: currentConfig.parameters,
                        changedBy: null,
                        changeReason: 'Current version',
                        createdAt: currentConfig.updatedAt || currentConfig.createdAt,
                    },
                ],
            });
        }

        return c.json({ versions });
    } catch (error) {
        console.error('[Admin] Get agent versions error:', error);
        return c.json({ error: 'Failed to get version history' }, 500);
    }
});

/**
 * POST /api/admin/agents/:id/versions/:versionId/restore
 * Restore an agent to a previous version
 */
adminRouter.post('/agents/:id/versions/:versionId/restore', requirePermission('agent_configuration'), async (c) => {
    try {
        const agentId = c.req.param('id');
        const versionId = c.req.param('versionId');
        const admin = getAdminContext(c);

        // Get the version to restore
        const [versionToRestore] = await db
            .select()
            .from(agentVersionHistory)
            .where(eq(agentVersionHistory.id, versionId))
            .limit(1);

        if (!versionToRestore) {
            return c.json({ error: 'Version not found' }, 404);
        }

        if (versionToRestore.agentId !== agentId) {
            return c.json({ error: 'Version does not belong to this agent' }, 400);
        }

        // Get current config
        const [currentConfig] = await db
            .select()
            .from(agentConfigs)
            .where(eq(agentConfigs.agentId, agentId))
            .limit(1);

        if (!currentConfig) {
            return c.json({ error: 'Agent not found' }, 404);
        }

        // Save current config to version history before restoring
        await db.insert(agentVersionHistory).values({
            agentId,
            version: currentConfig.version || 1,
            systemPrompt: currentConfig.systemPrompt,
            parameters: currentConfig.parameters,
            changedBy: admin?.adminId,
            changeReason: `Replaced by restore to version ${versionToRestore.version}`,
        });

        // Update agent config with restored version
        const newVersion = (currentConfig.version || 1) + 1;
        const [updated] = await db
            .update(agentConfigs)
            .set({
                systemPrompt: versionToRestore.systemPrompt,
                parameters: versionToRestore.parameters,
                version: newVersion,
                updatedAt: new Date(),
            })
            .where(eq(agentConfigs.agentId, agentId))
            .returning();

        // Log audit
        await db.insert(adminAuditLog).values({
            adminUserId: admin!.adminId,
            action: 'agent.restore_version',
            resource: 'agent',
            resourceId: agentId,
            details: {
                restoredFromVersion: versionToRestore.version,
                newVersion,
            },
            status: 'success',
        });

        return c.json({
            success: true,
            agent: updated,
            message: `Restored to version ${versionToRestore.version}`,
        });
    } catch (error) {
        console.error('[Admin] Restore agent version error:', error);
        return c.json({ error: 'Failed to restore version' }, 500);
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
        const page = Math.floor(offset / limit) + 1;

        // Fetch Live Traces from Langfuse
        const langfuseResp = await LangfuseService.getTraces(limit, page);

        // Langfuse trace item type
        interface LangfuseTrace {
            id: string;
            name?: string;
            model?: string;
            status?: string;
            latency?: number;
            usage?: { total?: number; totalCost?: number };
            timestamp?: string;
            userId?: string;
            input?: unknown;
            output?: unknown;
        }

        // Map Langfuse shape to our UI shape
        const traces = langfuseResp.data.map((t: LangfuseTrace) => ({
            id: t.id,
            traceId: t.id,
            name: t.name,
            model: t.model,
            status: t.status || 'success',
            latencyMs: t.latency ? Math.round(t.latency * 1000) : 0,
            totalTokens: t.usage?.total || 0,
            costUsd: t.usage?.totalCost || 0,
            createdAt: t.timestamp,
            userId: t.userId,
            input: t.input,
            output: t.output
        }));

        return c.json({
            traces,
            total: langfuseResp.meta?.totalItems || 0,
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

/**
 * GET /api/admin/observability/costs
 * Get cost breakdown by model, user, and operation
 */
adminRouter.get('/observability/costs', requirePermission('audit_log_access'), async (c) => {
    try {
        const days = parseInt(c.req.query('days') || '7');
        const groupBy = c.req.query('groupBy') || 'model'; // model, user, operation
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        let breakdown;

        if (groupBy === 'model') {
            breakdown = await db
                .select({
                    key: llmTraces.model,
                    totalCost: sql<number>`COALESCE(SUM(CAST(${llmTraces.costUsd} AS NUMERIC)), 0)`,
                    callCount: count(),
                    avgCost: sql<number>`AVG(CAST(${llmTraces.costUsd} AS NUMERIC))`,
                    totalTokens: sql<number>`COALESCE(SUM(${llmTraces.totalTokens}), 0)`,
                })
                .from(llmTraces)
                .where(sql`${llmTraces.createdAt} > ${cutoffDate}`)
                .groupBy(llmTraces.model)
                .orderBy(sql`SUM(CAST(${llmTraces.costUsd} AS NUMERIC)) DESC`);
        } else if (groupBy === 'user') {
            breakdown = await db
                .select({
                    key: llmTraces.userId,
                    email: users.email,
                    totalCost: sql<number>`COALESCE(SUM(CAST(${llmTraces.costUsd} AS NUMERIC)), 0)`,
                    callCount: count(),
                    avgCost: sql<number>`AVG(CAST(${llmTraces.costUsd} AS NUMERIC))`,
                    totalTokens: sql<number>`COALESCE(SUM(${llmTraces.totalTokens}), 0)`,
                })
                .from(llmTraces)
                .leftJoin(users, eq(llmTraces.userId, users.id))
                .where(sql`${llmTraces.createdAt} > ${cutoffDate}`)
                .groupBy(llmTraces.userId, users.email)
                .orderBy(sql`SUM(CAST(${llmTraces.costUsd} AS NUMERIC)) DESC`);
        } else {
            // Group by operation
            breakdown = await db
                .select({
                    key: llmTraces.operation,
                    totalCost: sql<number>`COALESCE(SUM(CAST(${llmTraces.costUsd} AS NUMERIC)), 0)`,
                    callCount: count(),
                    avgCost: sql<number>`AVG(CAST(${llmTraces.costUsd} AS NUMERIC))`,
                    totalTokens: sql<number>`COALESCE(SUM(${llmTraces.totalTokens}), 0)`,
                })
                .from(llmTraces)
                .where(sql`${llmTraces.createdAt} > ${cutoffDate}`)
                .groupBy(llmTraces.operation)
                .orderBy(sql`SUM(CAST(${llmTraces.costUsd} AS NUMERIC)) DESC`);
        }

        // Calculate totals
        const [totals] = await db
            .select({
                totalCost: sql<number>`COALESCE(SUM(CAST(${llmTraces.costUsd} AS NUMERIC)), 0)`,
                totalCalls: count(),
                totalTokens: sql<number>`COALESCE(SUM(${llmTraces.totalTokens}), 0)`,
            })
            .from(llmTraces)
            .where(sql`${llmTraces.createdAt} > ${cutoffDate}`);

        return c.json({
            breakdown: breakdown.map((item) => ({
                key: item.key,
                email: 'email' in item ? item.email : undefined,
                totalCost: Number(item.totalCost) || 0,
                callCount: Number(item.callCount) || 0,
                avgCost: Number(item.avgCost) || 0,
                totalTokens: Number(item.totalTokens) || 0,
            })),
            totals: {
                totalCost: Number(totals?.totalCost) || 0,
                totalCalls: Number(totals?.totalCalls) || 0,
                totalTokens: Number(totals?.totalTokens) || 0,
            },
            groupBy,
            days,
        });
    } catch (error) {
        console.error('[Admin] Get costs error:', error);
        return c.json({ error: 'Failed to get cost breakdown' }, 500);
    }
});

/**
 * GET /api/admin/observability/traces/:id
 * Get single trace with deep link
 */
adminRouter.get('/observability/traces/:id', requirePermission('audit_log_access'), async (c) => {
    try {
        const traceId = c.req.param('id');
        const langfuseHost = process.env.LANGFUSE_HOST || 'http://localhost:3001';

        // Try to get from local database first
        const [localTrace] = await db
            .select()
            .from(llmTraces)
            .where(eq(llmTraces.traceId, traceId))
            .limit(1);

        // Generate Langfuse deep link
        const deepLink = `${langfuseHost}/trace/${traceId}`;

        if (localTrace) {
            return c.json({
                trace: {
                    ...localTrace,
                    deepLink,
                },
            });
        }

        // If not in local DB, it might only exist in Langfuse
        return c.json({
            trace: {
                traceId,
                deepLink,
                message: 'Trace exists in Langfuse. Click deep link to view details.',
            },
        });
    } catch (error) {
        console.error('[Admin] Get trace error:', error);
        return c.json({ error: 'Failed to get trace' }, 500);
    }
});

/**
 * GET /api/admin/observability/daily
 * Get daily metrics from Langfuse
 */
adminRouter.get('/observability/daily', requirePermission('audit_log_access'), async (c) => {
    try {
        const days = parseInt(c.req.query('days') || '7');

        // Fetch from Langfuse
        const langfuseData = await LangfuseService.getDailyMetrics(days);

        return c.json(langfuseData);
    } catch (error) {
        console.error('[Admin] Get daily metrics error:', error);
        return c.json({ error: 'Failed to get daily metrics' }, 500);
    }
});

// ============================================================================
// Model Performance
// ============================================================================

// Model metadata registry (mirroring frontend MODEL_METADATA_REGISTRY)
const MODEL_METADATA: Record<string, { name: string; provider: string; capabilities: string[] }> = {
    'google/gemini-3.0-pro': { name: 'Gemini 3.0 Pro', provider: 'openrouter', capabilities: ['text', 'vision'] },
    'google/gemini-3-pro': { name: 'Gemini 3 Pro', provider: 'openrouter', capabilities: ['text', 'vision', 'thinking'] },
    'gemini-3-pro-image-preview': { name: 'Gemini 3 Pro Image', provider: 'gemini', capabilities: ['image_gen'] },
    'anthropic/claude-4.5-sonnet': { name: 'Claude 4.5 Sonnet', provider: 'openrouter', capabilities: ['text', 'vision', 'thinking'] },
    'minimax/minimax-m2-plus': { name: 'MiniMax M2 Plus', provider: 'openrouter', capabilities: ['text', 'vision'] },
    'openai/gpt-5.2': { name: 'GPT-5.2', provider: 'openrouter', capabilities: ['text', 'vision', 'thinking'] },
    'openai/gpt-5.2-pro': { name: 'GPT-5.2 Pro', provider: 'openrouter', capabilities: ['text', 'vision', 'thinking'] },
    'google/gemini-3-deep-think': { name: 'Gemini 3 Deep Think', provider: 'openrouter', capabilities: ['text', 'thinking'] },
    'nightmareai/real-esrgan': { name: 'Real-ESRGAN', provider: 'replicate', capabilities: ['image_upscale'] },
    'recraft-ai/recraft-crisp-upscale': { name: 'Recraft Crisp', provider: 'replicate', capabilities: ['image_upscale'] },
    'fermatresearch/magic-image-refiner': { name: 'Magic Refiner', provider: 'replicate', capabilities: ['image_upscale'] },
    'cjwbw/rembg': { name: 'Background Removal', provider: 'replicate', capabilities: ['background_removal'] },
    'sczhou/codeformer': { name: 'CodeFormer', provider: 'replicate', capabilities: ['image_restoration'] },
    'tencentarc/gfpgan': { name: 'GFPGAN', provider: 'replicate', capabilities: ['face_enhancement'] },
};

/**
 * GET /api/admin/models
 * Get AI model performance metrics aggregated from llm_traces
 */
adminRouter.get('/models', requirePermission('observability_config'), async (c) => {
    try {
        const days = parseInt(c.req.query('days') || '7');
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        // Aggregate llm_traces by model
        const modelStats = await db
            .select({
                model: llmTraces.model,
                totalCalls: count(),
                successCount: sql<number>`SUM(CASE WHEN ${llmTraces.status} = 'success' OR ${llmTraces.status} IS NULL THEN 1 ELSE 0 END)`,
                errorCount: sql<number>`SUM(CASE WHEN ${llmTraces.status} = 'error' THEN 1 ELSE 0 END)`,
                avgLatencyMs: sql<number>`AVG(${llmTraces.latencyMs})`,
                totalTokens: sql<number>`COALESCE(SUM(${llmTraces.totalTokens}), 0)`,
                totalCostUsd: sql<number>`COALESCE(SUM(CAST(${llmTraces.costUsd} AS NUMERIC)), 0)`,
                lastUsedAt: sql<string>`MAX(${llmTraces.createdAt})`,
            })
            .from(llmTraces)
            .where(sql`${llmTraces.createdAt} > ${cutoffDate}`)
            .groupBy(llmTraces.model);

        // Enrich with metadata and calculate derived fields
        const models = modelStats.map((stat) => {
            const metadata = MODEL_METADATA[stat.model] || {
                name: stat.model,
                provider: 'unknown',
                capabilities: [],
            };

            const totalCalls = Number(stat.totalCalls) || 0;
            const successCount = Number(stat.successCount) || 0;
            const totalCostUsd = Number(stat.totalCostUsd) || 0;

            return {
                modelId: stat.model,
                modelName: metadata.name,
                provider: metadata.provider as 'gemini' | 'openrouter' | 'replicate',
                capabilities: metadata.capabilities,
                totalCalls,
                successCount,
                errorCount: Number(stat.errorCount) || 0,
                successRate: totalCalls > 0 ? (successCount / totalCalls) * 100 : 100,
                avgLatencyMs: Number(stat.avgLatencyMs) || 0,
                totalTokens: Number(stat.totalTokens) || 0,
                totalCostUsd,
                avgCostPerCall: totalCalls > 0 ? totalCostUsd / totalCalls : 0,
                lastUsedAt: stat.lastUsedAt,
            };
        });

        // Calculate summary
        const summary = {
            totalCalls: models.reduce((acc, m) => acc + m.totalCalls, 0),
            totalTokens: models.reduce((acc, m) => acc + m.totalTokens, 0),
            totalCostUsd: models.reduce((acc, m) => acc + m.totalCostUsd, 0),
            avgSuccessRate: models.length > 0
                ? models.reduce((acc, m) => acc + m.successRate, 0) / models.length
                : 100,
            avgLatencyMs: models.length > 0
                ? models.reduce((acc, m) => acc + m.avgLatencyMs, 0) / models.length
                : 0,
        };

        return c.json({ models, summary });
    } catch (error) {
        console.error('[Admin] Model performance error:', error);
        return c.json({ error: 'Failed to get model performance' }, 500);
    }
});

// ============================================================================
// Finance & Credits
// ============================================================================

/**
 * GET /api/admin/finance/stats
 * Get financial overview
 */
adminRouter.get('/finance/stats', requirePermission('financial_access'), async (c) => {
    try {
        const [stats] = await db
            .select({
                totalGranted: sql<number>`SUM(${userCreditAccounts.lifetimeCreditsGranted})`,
                totalUsed: sql<number>`SUM(${userCreditAccounts.lifetimeCreditsUsed})`,
                currentFloat: sql<number>`SUM(${userCreditAccounts.creditBalance})`,
            })
            .from(userCreditAccounts);

        const [txStats] = await db
            .select({
                last24hVolume: sql<number>`SUM(${creditTransactions.amount})`,
            })
            .from(creditTransactions)
            .where(sql`${creditTransactions.createdAt} > NOW() - INTERVAL '24 hours'`);

        return c.json({
            granted: stats?.totalGranted || 0,
            used: stats?.totalUsed || 0,
            float: stats?.currentFloat || 0,
            volume24h: txStats?.last24hVolume || 0,
        });

    } catch (error) {
        console.error('[Admin] Finance stats error:', error);
        return c.json({ error: 'Failed to get finance stats' }, 500);
    }
});

/**
 * GET /api/admin/finance/transactions
 * List global transactions
 */
adminRouter.get('/finance/transactions', requirePermission('financial_access'), async (c) => {
    try {
        const limit = parseInt(c.req.query('limit') || '50');
        const offset = parseInt(c.req.query('offset') || '0');

        const txs = await db
            .select({
                id: creditTransactions.id,
                userId: creditTransactions.userId,
                userEmail: users.email,
                amount: creditTransactions.amount,
                type: creditTransactions.type,
                description: creditTransactions.description,
                createdAt: creditTransactions.createdAt,
            })
            .from(creditTransactions)
            .leftJoin(users, eq(creditTransactions.userId, users.id))
            .orderBy(desc(creditTransactions.createdAt))
            .limit(limit)
            .offset(offset);

        return c.json({ transactions: txs });
    } catch (error) {
        console.error('[Admin] List finance txs error:', error);
        return c.json({ error: 'Failed to list transactions' }, 500);
    }
});

// ============================================================================
// Audit Logs
// ============================================================================

/**
 * GET /api/admin/audit-logs
 * List admin audit logs with optional filtering
 * Query params: action, resource, adminUserId, dateFrom, dateTo, limit, offset
 */
adminRouter.get('/audit-logs', requirePermission('audit_log_access'), async (c) => {
    try {
        const limit = parseInt(c.req.query('limit') || '50');
        const offset = parseInt(c.req.query('offset') || '0');
        const action = c.req.query('action') || '';
        const resource = c.req.query('resource') || '';
        const adminUserId = c.req.query('adminUserId') || '';
        const dateFrom = c.req.query('dateFrom') || '';
        const dateTo = c.req.query('dateTo') || '';

        // Build filter conditions
        const conditions = [];

        if (action) {
            conditions.push(like(adminAuditLog.action, `%${action}%`));
        }

        if (resource) {
            conditions.push(like(adminAuditLog.resource, `%${resource}%`));
        }

        if (adminUserId) {
            conditions.push(eq(adminAuditLog.adminUserId, adminUserId));
        }

        if (dateFrom) {
            const fromDate = new Date(dateFrom);
            conditions.push(sql`${adminAuditLog.createdAt} >= ${fromDate}`);
        }

        if (dateTo) {
            const toDate = new Date(dateTo);
            // Set to end of day
            toDate.setHours(23, 59, 59, 999);
            conditions.push(sql`${adminAuditLog.createdAt} <= ${toDate}`);
        }

        const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

        const logs = await db
            .select()
            .from(adminAuditLog)
            .where(whereCondition)
            .orderBy(desc(adminAuditLog.createdAt))
            .limit(limit)
            .offset(offset);

        const [totalResult] = await db
            .select({ count: count() })
            .from(adminAuditLog)
            .where(whereCondition);

        // Get distinct actions and resources for filter dropdowns
        const distinctActions = await db
            .selectDistinct({ action: adminAuditLog.action })
            .from(adminAuditLog);

        const distinctResources = await db
            .selectDistinct({ resource: adminAuditLog.resource })
            .from(adminAuditLog);

        return c.json({
            logs,
            total: totalResult?.count || 0,
            filters: {
                actions: distinctActions.map((a) => a.action).filter(Boolean),
                resources: distinctResources.map((r) => r.resource).filter(Boolean),
            },
        });
    } catch (error) {
        console.error('[Admin] List audit logs error:', error);
        return c.json({ error: 'Failed to list audit logs' }, 500);
    }
});

// ============================================================================
// Cognee RAG System
// ============================================================================

/**
 * GET /api/admin/cognee/health
 * Get Cognee service health status
 */
adminRouter.get('/cognee/health', requirePermission('observability_config'), async (c) => {
    try {
        if (!CogneeService.isEnabled()) {
            return c.json({
                enabled: false,
                healthy: false,
                message: 'Cognee is not configured. Set COGNEE_API_URL and COGNEE_API_KEY.',
            });
        }

        const status = await CogneeService.getHealthStatus();

        return c.json({
            enabled: true,
            ...status,
        });
    } catch (error) {
        console.error('[Admin] Cognee health check error:', error);
        return c.json({
            enabled: CogneeService.isEnabled(),
            healthy: false,
            error: 'Failed to check Cognee health',
        }, 500);
    }
});

/**
 * GET /api/admin/agents/:id/knowledge-stats
 * Get knowledge stats for an agent
 */
adminRouter.get('/agents/:id/knowledge-stats', requirePermission('agent_configuration'), async (c) => {
    try {
        const agentId = c.req.param('id');

        if (!CogneeService.isEnabled()) {
            return c.json({
                enabled: false,
                documentCount: 0,
                embeddingStatus: 'none',
                message: 'Cognee is not configured.',
            });
        }

        const stats = await CogneeService.getAgentStats(agentId);

        return c.json({
            enabled: true,
            ...stats,
        });
    } catch (error) {
        console.error('[Admin] Get agent knowledge stats error:', error);
        return c.json({ error: 'Failed to get knowledge stats' }, 500);
    }
});

/**
 * POST /api/admin/agents/:id/cognify
 * Trigger knowledge graph processing for an agent
 */
adminRouter.post('/agents/:id/cognify', requirePermission('agent_configuration'), async (c) => {
    try {
        const agentId = c.req.param('id');
        const adminUser = c.get('user');

        if (!CogneeService.isEnabled()) {
            return c.json({
                success: false,
                error: 'Cognee is not configured. Set COGNEE_API_URL and COGNEE_API_KEY.',
            }, 400);
        }

        // Check if agent exists
        const [existingAgent] = await db
            .select()
            .from(agentConfigs)
            .where(eq(agentConfigs.agentId, agentId))
            .limit(1);

        if (!existingAgent) {
            return c.json({ error: 'Agent not found' }, 404);
        }

        // Trigger cognify
        await CogneeService.cognify(agentId);

        // Log action
        await db.insert(adminAuditLog).values({
            adminUserId: adminUser.id,
            action: 'cognify_agent',
            resource: 'agent',
            resourceId: agentId,
            details: { agentName: existingAgent.name },
            ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || null,
            userAgent: c.req.header('user-agent') || null,
            status: 'success',
        });

        return c.json({
            success: true,
            message: `Knowledge graph processing started for agent: ${existingAgent.name}`,
        });
    } catch (error) {
        console.error('[Admin] Cognify agent error:', error);
        return c.json({ error: 'Failed to start knowledge graph processing' }, 500);
    }
});

// ============================================================================
// Billing Metrics (Stripe)
// ============================================================================

import { subscriptions, stripeCustomers, invoices } from '../db/schema';
import { isStripeEnabled } from '../lib/stripe';

/**
 * GET /api/admin/billing/metrics
 * Get billing metrics: MRR, subscriber counts, churn rate
 */
adminRouter.get('/billing/metrics', requirePermission('financial_access'), async (c) => {
    try {
        if (!isStripeEnabled()) {
            return c.json({
                enabled: false,
                message: 'Stripe is not configured',
            });
        }

        // Get active subscriptions by tier
        const tierCounts = await db
            .select({
                tier: subscriptions.tier,
                count: count(),
            })
            .from(subscriptions)
            .where(eq(subscriptions.status, 'active'))
            .groupBy(subscriptions.tier);

        // Calculate subscriber counts
        const subscribersByTier: Record<string, number> = {
            free: 0,
            basic: 0,
            premium: 0,
        };
        tierCounts.forEach((t) => {
            subscribersByTier[t.tier] = Number(t.count);
        });

        // Calculate MRR (Monthly Recurring Revenue)
        // Basic: $9.99/mo, Premium: $29.99/mo
        const mrr =
            subscribersByTier.basic * 9.99 +
            subscribersByTier.premium * 29.99;

        // Get total active subscribers
        const [activeCount] = await db
            .select({ count: count() })
            .from(subscriptions)
            .where(eq(subscriptions.status, 'active'));

        // Get cancelled subscriptions in last 30 days for churn calculation
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [cancelledCount] = await db
            .select({ count: count() })
            .from(subscriptions)
            .where(
                and(
                    eq(subscriptions.status, 'canceled'),
                    sql`${subscriptions.canceledAt} > ${thirtyDaysAgo}`
                )
            );

        // Get subscriptions that were active 30 days ago
        const [activeThirtyDaysAgo] = await db
            .select({ count: count() })
            .from(subscriptions)
            .where(sql`${subscriptions.createdAt} < ${thirtyDaysAgo}`);

        // Calculate churn rate
        const churnRate = (activeThirtyDaysAgo?.count || 0) > 0
            ? ((cancelledCount?.count || 0) / (activeThirtyDaysAgo?.count || 1)) * 100
            : 0;

        // Get new subscriptions in last 30 days
        const [newSubsCount] = await db
            .select({ count: count() })
            .from(subscriptions)
            .where(sql`${subscriptions.createdAt} > ${thirtyDaysAgo}`);

        // Get total revenue from invoices
        const [revenueStats] = await db
            .select({
                totalRevenue: sql<number>`COALESCE(SUM(${invoices.amountPaid}), 0)`,
                invoiceCount: count(),
            })
            .from(invoices)
            .where(eq(invoices.status, 'paid'));

        // Get revenue for last 30 days
        const [monthlyRevenue] = await db
            .select({
                amount: sql<number>`COALESCE(SUM(${invoices.amountPaid}), 0)`,
            })
            .from(invoices)
            .where(
                and(
                    eq(invoices.status, 'paid'),
                    sql`${invoices.paidAt} > ${thirtyDaysAgo}`
                )
            );

        // Get daily revenue for chart (last 30 days)
        const dailyRevenue = await db
            .select({
                date: sql<string>`DATE(${invoices.paidAt})`,
                revenue: sql<number>`COALESCE(SUM(${invoices.amountPaid}), 0)`,
                count: count(),
            })
            .from(invoices)
            .where(
                and(
                    eq(invoices.status, 'paid'),
                    sql`${invoices.paidAt} > ${thirtyDaysAgo}`
                )
            )
            .groupBy(sql`DATE(${invoices.paidAt})`)
            .orderBy(sql`DATE(${invoices.paidAt})`);

        return c.json({
            enabled: true,
            mrr: Math.round(mrr * 100) / 100,
            totalActiveSubscribers: activeCount?.count || 0,
            subscribersByTier,
            churnRate: Math.round(churnRate * 100) / 100,
            newSubscribersThisMonth: newSubsCount?.count || 0,
            cancelledThisMonth: cancelledCount?.count || 0,
            totalRevenue: (revenueStats?.totalRevenue || 0) / 100, // Convert cents to dollars
            monthlyRevenue: (monthlyRevenue?.amount || 0) / 100,
            invoiceCount: revenueStats?.invoiceCount || 0,
            dailyRevenue: dailyRevenue.map((d) => ({
                date: d.date,
                revenue: Number(d.revenue) / 100,
                count: Number(d.count),
            })),
        });
    } catch (error) {
        console.error('[Admin] Billing metrics error:', error);
        return c.json({ error: 'Failed to get billing metrics' }, 500);
    }
});

/**
 * GET /api/admin/billing/subscribers
 * List all subscribers with details
 */
adminRouter.get('/billing/subscribers', requirePermission('financial_access'), async (c) => {
    try {
        const limit = parseInt(c.req.query('limit') || '50');
        const offset = parseInt(c.req.query('offset') || '0');
        const tier = c.req.query('tier') || '';
        const status = c.req.query('status') || 'active';

        const conditions = [];
        if (status) {
            conditions.push(eq(subscriptions.status, status));
        }
        if (tier) {
            conditions.push(eq(subscriptions.tier, tier as 'free' | 'basic' | 'premium'));
        }

        const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

        const subscribers = await db
            .select({
                id: subscriptions.id,
                tier: subscriptions.tier,
                status: subscriptions.status,
                currentPeriodStart: subscriptions.currentPeriodStart,
                currentPeriodEnd: subscriptions.currentPeriodEnd,
                cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
                createdAt: subscriptions.createdAt,
                userId: stripeCustomers.userId,
                userEmail: users.email,
                userName: profiles.fullName,
            })
            .from(subscriptions)
            .innerJoin(stripeCustomers, eq(subscriptions.stripeCustomerId, stripeCustomers.stripeCustomerId))
            .innerJoin(users, eq(stripeCustomers.userId, users.id))
            .leftJoin(profiles, eq(users.id, profiles.id))
            .where(whereCondition)
            .orderBy(desc(subscriptions.createdAt))
            .limit(limit)
            .offset(offset);

        const [totalResult] = await db
            .select({ count: count() })
            .from(subscriptions)
            .where(whereCondition);

        return c.json({
            subscribers,
            total: totalResult?.count || 0,
        });
    } catch (error) {
        console.error('[Admin] List subscribers error:', error);
        return c.json({ error: 'Failed to list subscribers' }, 500);
    }
});
