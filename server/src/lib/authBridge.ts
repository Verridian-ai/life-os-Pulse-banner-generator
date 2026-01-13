/**
 * Auth Bridge - Dual Authentication System
 *
 * Provides seamless integration between Lucia (legacy) and WorkOS (new) auth.
 * Supports running both systems in parallel during migration.
 *
 * Migration phases:
 * Phase A: Deploy WorkOS alongside Lucia (both active)
 * Phase B: New users go through WorkOS by default
 * Phase C: Migrate existing users with script
 * Phase D: Deprecate Lucia (keep for 30 days)
 */

import { lucia } from './auth';
import {
    WORKOS_ENABLED,
    authenticateWithCode,
    getSsoProfile,
    authenticateWithMagicLink,
    createWorkosUser,
    type OAuthProvider,
} from './workos';
import { db } from '../db';
import { users, workosSessions, workosAuthAttempts, profiles } from '../db/schema';
import { eq } from 'drizzle-orm';
import { generateIdFromEntropySize } from 'lucia';
import type { Context } from 'hono';

// Auth provider types
export type AuthProvider = 'password' | 'google' | 'github' | 'microsoft' | 'sso' | 'magic_link';

// Unified user type
export interface AuthUser {
    id: string;
    email: string;
    emailVerified: boolean;
    authProvider: AuthProvider;
    workosUserId?: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
}

// Auth result type
export interface AuthResult {
    success: boolean;
    user?: AuthUser;
    session?: {
        id: string;
        expiresAt: Date;
    };
    error?: string;
    isNewUser?: boolean;
}

/**
 * Get current user from request context
 * Supports both Lucia sessions and WorkOS sessions
 */
export async function getCurrentUser(c: Context): Promise<AuthUser | null> {
    // First, try Lucia session (cookie-based)
    const sessionId = lucia.readSessionCookie(c.req.header('Cookie') ?? '');
    if (sessionId) {
        const { user, session } = await lucia.validateSession(sessionId);
        if (session && user) {
            // Fetch full user data
            const dbUser = await db.select()
                .from(users)
                .where(eq(users.id, user.id))
                .limit(1);

            if (dbUser[0]) {
                return {
                    id: dbUser[0].id,
                    email: dbUser[0].email,
                    emailVerified: dbUser[0].emailVerified ?? false,
                    authProvider: (dbUser[0].authProvider as AuthProvider) ?? 'password',
                    workosUserId: dbUser[0].workosUserId ?? undefined,
                };
            }
        }
    }

    // Try WorkOS session (Bearer token)
    const authHeader = c.req.header('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        const workosSession = await db.select()
            .from(workosSessions)
            .where(eq(workosSessions.accessToken, token))
            .limit(1);

        if (workosSession[0] && new Date(workosSession[0].expiresAt) > new Date()) {
            const dbUser = await db.select()
                .from(users)
                .where(eq(users.id, workosSession[0].userId))
                .limit(1);

            if (dbUser[0]) {
                return {
                    id: dbUser[0].id,
                    email: dbUser[0].email,
                    emailVerified: dbUser[0].emailVerified ?? false,
                    authProvider: (dbUser[0].authProvider as AuthProvider) ?? 'password',
                    workosUserId: dbUser[0].workosUserId ?? undefined,
                };
            }
        }
    }

    return null;
}

/**
 * Handle OAuth callback from WorkOS
 */
export async function handleOAuthCallback(
    code: string,
    provider: OAuthProvider,
    ipAddress?: string,
    userAgent?: string
): Promise<AuthResult> {
    if (!WORKOS_ENABLED) {
        return { success: false, error: 'WorkOS is not configured' };
    }

    try {
        // Exchange code for user info
        const authResult = await authenticateWithCode(code);
        const workosUser = authResult.user;

        // Map OAuth provider to our auth provider
        const authProvider = mapOAuthProvider(provider);

        // Log auth attempt
        await logAuthAttempt(workosUser.email, authProvider, provider, true, ipAddress, userAgent);

        // Check if user exists by WorkOS ID
        let dbUser = await db.select()
            .from(users)
            .where(eq(users.workosUserId, workosUser.id))
            .limit(1);

        // If not found by WorkOS ID, try email
        if (!dbUser[0]) {
            dbUser = await db.select()
                .from(users)
                .where(eq(users.email, workosUser.email))
                .limit(1);
        }

        let isNewUser = false;
        let userId: string;

        if (dbUser[0]) {
            // Existing user - update WorkOS ID if needed
            userId = dbUser[0].id;
            if (!dbUser[0].workosUserId) {
                await db.update(users)
                    .set({
                        workosUserId: workosUser.id,
                        emailVerified: workosUser.emailVerified,
                        authProvider,
                        updatedAt: new Date(),
                    })
                    .where(eq(users.id, userId));
            }
        } else {
            // New user - create account
            isNewUser = true;
            userId = generateIdFromEntropySize(10);

            await db.insert(users).values({
                id: userId,
                email: workosUser.email,
                workosUserId: workosUser.id,
                emailVerified: workosUser.emailVerified,
                authProvider,
            });

            // Create profile
            await db.insert(profiles).values({
                id: userId,
                email: workosUser.email,
                firstName: workosUser.firstName ?? undefined,
                lastName: workosUser.lastName ?? undefined,
                avatarUrl: workosUser.profilePictureUrl ?? undefined,
            });
        }

        // Create Lucia session for compatibility
        const session = await lucia.createSession(userId, {});
        // Session cookie created for future cookie-based auth implementation
        void lucia.createSessionCookie(session.id);

        // Also create WorkOS session record
        await db.insert(workosSessions).values({
            userId,
            workosSessionId: session.id, // Use Lucia session ID for now
            authProvider,
            ipAddress,
            userAgent,
            expiresAt: session.expiresAt,
        });

        return {
            success: true,
            user: {
                id: userId,
                email: workosUser.email,
                emailVerified: workosUser.emailVerified,
                authProvider,
                workosUserId: workosUser.id,
                firstName: workosUser.firstName ?? undefined,
                lastName: workosUser.lastName ?? undefined,
                avatarUrl: workosUser.profilePictureUrl ?? undefined,
            },
            session: {
                id: session.id,
                expiresAt: session.expiresAt,
            },
            isNewUser,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'OAuth authentication failed';
        console.error('[AuthBridge] OAuth callback error:', error);

        // Log failed attempt
        await logAuthAttempt('unknown', mapOAuthProvider(provider), provider, false, ipAddress, userAgent, errorMessage);

        return { success: false, error: errorMessage };
    }
}

/**
 * Handle SSO callback from WorkOS
 */
export async function handleSsoCallback(
    code: string,
    ipAddress?: string,
    userAgent?: string
): Promise<AuthResult> {
    if (!WORKOS_ENABLED) {
        return { success: false, error: 'WorkOS is not configured' };
    }

    try {
        // Exchange code for profile
        const { profile, accessToken } = await getSsoProfile(code);

        // Log auth attempt
        await logAuthAttempt(profile.email, 'sso', undefined, true, ipAddress, userAgent);

        // Check if user exists
        const dbUser = await db.select()
            .from(users)
            .where(eq(users.email, profile.email))
            .limit(1);

        let isNewUser = false;
        let userId: string;

        if (dbUser[0]) {
            userId = dbUser[0].id;
            // Update to SSO auth
            await db.update(users)
                .set({
                    emailVerified: true, // SSO implies verified
                    authProvider: 'sso',
                    updatedAt: new Date(),
                })
                .where(eq(users.id, userId));
        } else {
            // New user from SSO
            isNewUser = true;
            userId = generateIdFromEntropySize(10);

            await db.insert(users).values({
                id: userId,
                email: profile.email,
                emailVerified: true,
                authProvider: 'sso',
            });

            // Create profile
            await db.insert(profiles).values({
                id: userId,
                email: profile.email,
                firstName: profile.firstName ?? undefined,
                lastName: profile.lastName ?? undefined,
            });
        }

        // Create Lucia session
        const session = await lucia.createSession(userId, {});

        // Create WorkOS session with access token
        await db.insert(workosSessions).values({
            userId,
            workosSessionId: profile.id,
            accessToken,
            authProvider: 'sso',
            ipAddress,
            userAgent,
            expiresAt: session.expiresAt,
        });

        return {
            success: true,
            user: {
                id: userId,
                email: profile.email,
                emailVerified: true,
                authProvider: 'sso',
                firstName: profile.firstName ?? undefined,
                lastName: profile.lastName ?? undefined,
            },
            session: {
                id: session.id,
                expiresAt: session.expiresAt,
            },
            isNewUser,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'SSO authentication failed';
        console.error('[AuthBridge] SSO callback error:', error);

        await logAuthAttempt('unknown', 'sso', undefined, false, ipAddress, userAgent, errorMessage);

        return { success: false, error: errorMessage };
    }
}

/**
 * Handle Magic Link authentication
 */
export async function handleMagicLinkAuth(
    code: string,
    email: string,
    ipAddress?: string,
    userAgent?: string
): Promise<AuthResult> {
    if (!WORKOS_ENABLED) {
        return { success: false, error: 'WorkOS is not configured' };
    }

    try {
        // Verify magic link code
        const authResult = await authenticateWithMagicLink(code, email);
        const workosUser = authResult.user;

        // Log auth attempt
        await logAuthAttempt(email, 'magic_link', undefined, true, ipAddress, userAgent);

        // Check if user exists
        const dbUser = await db.select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        let isNewUser = false;
        let userId: string;

        if (dbUser[0]) {
            userId = dbUser[0].id;
            // Update WorkOS ID and verify email
            await db.update(users)
                .set({
                    workosUserId: workosUser.id,
                    emailVerified: true,
                    updatedAt: new Date(),
                })
                .where(eq(users.id, userId));
        } else {
            // New user
            isNewUser = true;
            userId = generateIdFromEntropySize(10);

            await db.insert(users).values({
                id: userId,
                email,
                workosUserId: workosUser.id,
                emailVerified: true,
                authProvider: 'magic_link',
            });

            // Create profile
            await db.insert(profiles).values({
                id: userId,
                email,
            });
        }

        // Create session
        const session = await lucia.createSession(userId, {});

        await db.insert(workosSessions).values({
            userId,
            workosSessionId: session.id,
            authProvider: 'magic_link',
            ipAddress,
            userAgent,
            expiresAt: session.expiresAt,
        });

        return {
            success: true,
            user: {
                id: userId,
                email,
                emailVerified: true,
                authProvider: 'magic_link',
                workosUserId: workosUser.id,
            },
            session: {
                id: session.id,
                expiresAt: session.expiresAt,
            },
            isNewUser,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Magic link authentication failed';
        console.error('[AuthBridge] Magic link error:', error);

        await logAuthAttempt(email, 'magic_link', undefined, false, ipAddress, userAgent, errorMessage);

        return { success: false, error: errorMessage };
    }
}

/**
 * Link existing Lucia user to WorkOS
 */
export async function linkUserToWorkos(userId: string): Promise<{ success: boolean; workosUserId?: string; error?: string }> {
    if (!WORKOS_ENABLED) {
        return { success: false, error: 'WorkOS is not configured' };
    }

    try {
        const dbUser = await db.select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        if (!dbUser[0]) {
            return { success: false, error: 'User not found' };
        }

        if (dbUser[0].workosUserId) {
            return { success: true, workosUserId: dbUser[0].workosUserId };
        }

        // Create WorkOS user
        const workosUser = await createWorkosUser({
            email: dbUser[0].email,
            emailVerified: dbUser[0].emailVerified ?? false,
        });

        // Update local user
        await db.update(users)
            .set({
                workosUserId: workosUser.id,
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId));

        return { success: true, workosUserId: workosUser.id };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to link user to WorkOS';
        console.error('[AuthBridge] Link user error:', error);
        return { success: false, error: errorMessage };
    }
}

/**
 * Logout user from all systems
 */
export async function logout(sessionId: string): Promise<void> {
    // Invalidate Lucia session
    await lucia.invalidateSession(sessionId);

    // Also cleanup WorkOS session if exists
    await db.delete(workosSessions)
        .where(eq(workosSessions.workosSessionId, sessionId));
}

/**
 * Log authentication attempt for security auditing
 */
async function logAuthAttempt(
    email: string,
    authMethod: AuthProvider,
    provider?: string,
    success: boolean = true,
    ipAddress?: string,
    userAgent?: string,
    failureReason?: string
): Promise<void> {
    try {
        await db.insert(workosAuthAttempts).values({
            email,
            authMethod,
            provider,
            success,
            failureReason,
            ipAddress,
            userAgent,
        });
    } catch (error) {
        console.error('[AuthBridge] Failed to log auth attempt:', error);
    }
}

/**
 * Map OAuth provider to auth provider
 */
function mapOAuthProvider(provider: OAuthProvider): AuthProvider {
    switch (provider) {
        case 'GoogleOAuth':
            return 'google';
        case 'GitHubOAuth':
            return 'github';
        case 'MicrosoftOAuth':
            return 'microsoft';
        default:
            return 'password';
    }
}

/**
 * Check if user should use WorkOS
 */
export function shouldUseWorkos(_email: string): boolean {
    // During migration, you can use this to route specific domains to WorkOS
    // For now, return true if WorkOS is enabled
    // Future: Add domain-based routing logic using _email
    return WORKOS_ENABLED;
}

export { WORKOS_ENABLED };
