/**
 * WorkOS SDK Initialization
 *
 * Provides enterprise authentication capabilities:
 * - OAuth (Google, GitHub, Microsoft)
 * - SSO (SAML, OIDC)
 * - Magic Link (passwordless)
 * - SCIM Directory Sync
 * - User Management
 */

import { WorkOS } from '@workos-inc/node';

// Environment validation
const WORKOS_API_KEY = process.env.WORKOS_API_KEY || process.env.VITE_WORK_OS_API_KEY;
const WORKOS_CLIENT_ID = process.env.WORKOS_CLIENT_ID;
const WORKOS_ORG_ID = process.env.WORKOS_ORG_ID || 'org_01KETHAB24WTQT83FRYBETZGPW';

if (!WORKOS_API_KEY) {
    console.warn('[WorkOS] WARNING: WORKOS_API_KEY not configured. WorkOS features will be disabled.');
}

// Initialize WorkOS SDK
export const workos = new WorkOS(WORKOS_API_KEY || '', {
    // Enable debug logging in development
    ...(process.env.NODE_ENV === 'development' && { logLevel: 'debug' }),
});

// Feature flag for WorkOS
export const WORKOS_ENABLED = !!WORKOS_API_KEY;

// Configuration constants
export const workosConfig = {
    clientId: WORKOS_CLIENT_ID || '',
    orgId: WORKOS_ORG_ID,
    redirectUri: process.env.WORKOS_REDIRECT_URI || 'http://localhost:5173/api/auth/callback',
    cookiePassword: process.env.WORKOS_COOKIE_PASSWORD || 'development-cookie-password-min-32-chars',
    webhookSecret: process.env.WORKOS_WEBHOOK_SECRET || '',
};

// OAuth Provider types
export type OAuthProvider = 'GoogleOAuth' | 'GitHubOAuth' | 'MicrosoftOAuth';

// OAuth state management
export interface OAuthState {
    provider: OAuthProvider;
    returnTo?: string;
    csrfToken: string;
}

/**
 * Generate OAuth authorization URL for a specific provider
 */
export function getOAuthAuthorizationUrl(
    provider: OAuthProvider,
    state: string,
    redirectUri?: string
): string {
    if (!WORKOS_ENABLED) {
        throw new Error('WorkOS is not configured');
    }

    return workos.userManagement.getAuthorizationUrl({
        provider,
        redirectUri: redirectUri || workosConfig.redirectUri,
        state,
        clientId: workosConfig.clientId,
    });
}

/**
 * Generate SSO authorization URL for enterprise login
 */
export function getSsoAuthorizationUrl(
    connectionId: string,
    state: string,
    redirectUri?: string
): string {
    if (!WORKOS_ENABLED) {
        throw new Error('WorkOS is not configured');
    }

    return workos.sso.getAuthorizationUrl({
        connection: connectionId,
        redirectUri: redirectUri || workosConfig.redirectUri,
        state,
        clientId: workosConfig.clientId,
    });
}

/**
 * Generate SSO authorization URL by organization
 */
export function getSsoAuthorizationUrlByOrg(
    organizationId: string,
    state: string,
    redirectUri?: string
): string {
    if (!WORKOS_ENABLED) {
        throw new Error('WorkOS is not configured');
    }

    return workos.sso.getAuthorizationUrl({
        organization: organizationId,
        redirectUri: redirectUri || workosConfig.redirectUri,
        state,
        clientId: workosConfig.clientId,
    });
}

/**
 * Exchange OAuth code for user profile
 */
export async function authenticateWithCode(code: string) {
    if (!WORKOS_ENABLED) {
        throw new Error('WorkOS is not configured');
    }

    const response = await workos.userManagement.authenticateWithCode({
        code,
        clientId: workosConfig.clientId,
    });

    return response;
}

/**
 * Exchange SSO code for profile
 */
export async function getSsoProfile(code: string) {
    if (!WORKOS_ENABLED) {
        throw new Error('WorkOS is not configured');
    }

    const profile = await workos.sso.getProfileAndToken({
        code,
        clientId: workosConfig.clientId,
    });

    return profile;
}

/**
 * Send magic link to email
 */
export async function sendMagicLink(email: string, redirectUri?: string) {
    if (!WORKOS_ENABLED) {
        throw new Error('WorkOS is not configured');
    }

    const response = await workos.userManagement.sendMagicAuthCode({
        email,
        redirectUri: redirectUri || workosConfig.redirectUri,
    });

    return response;
}

/**
 * Authenticate with magic link code
 */
export async function authenticateWithMagicLink(code: string, email: string) {
    if (!WORKOS_ENABLED) {
        throw new Error('WorkOS is not configured');
    }

    const response = await workos.userManagement.authenticateWithMagicAuth({
        code,
        email,
        clientId: workosConfig.clientId,
    });

    return response;
}

/**
 * Get WorkOS user by ID
 */
export async function getWorkosUser(userId: string) {
    if (!WORKOS_ENABLED) {
        throw new Error('WorkOS is not configured');
    }

    return workos.userManagement.getUser(userId);
}

/**
 * Create WorkOS user
 */
export async function createWorkosUser(params: {
    email: string;
    firstName?: string;
    lastName?: string;
    emailVerified?: boolean;
}) {
    if (!WORKOS_ENABLED) {
        throw new Error('WorkOS is not configured');
    }

    return workos.userManagement.createUser({
        email: params.email,
        firstName: params.firstName,
        lastName: params.lastName,
        emailVerified: params.emailVerified ?? false,
    });
}

/**
 * Send email verification
 */
export async function sendEmailVerification(userId: string) {
    if (!WORKOS_ENABLED) {
        throw new Error('WorkOS is not configured');
    }

    return workos.userManagement.sendVerificationEmail({
        userId,
    });
}

/**
 * Verify email with code
 */
export async function verifyEmail(userId: string, code: string) {
    if (!WORKOS_ENABLED) {
        throw new Error('WorkOS is not configured');
    }

    return workos.userManagement.verifyEmail({
        userId,
        code,
    });
}

/**
 * List organization SSO connections
 */
export async function listSsoConnections(organizationId?: string) {
    if (!WORKOS_ENABLED) {
        throw new Error('WorkOS is not configured');
    }

    return workos.sso.listConnections({
        organizationId: organizationId || workosConfig.orgId,
    });
}

/**
 * Get directory sync users
 */
export async function listDirectoryUsers(directoryId: string) {
    if (!WORKOS_ENABLED) {
        throw new Error('WorkOS is not configured');
    }

    return workos.directorySync.listUsers({
        directory: directoryId,
    });
}

/**
 * Get directory sync groups
 */
export async function listDirectoryGroups(directoryId: string) {
    if (!WORKOS_ENABLED) {
        throw new Error('WorkOS is not configured');
    }

    return workos.directorySync.listGroups({
        directory: directoryId,
    });
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
    payload: string,
    signature: string,
    secret?: string
): boolean {
    if (!WORKOS_ENABLED) {
        return false;
    }

    try {
        workos.webhooks.verifyHeader({
            payload,
            sigHeader: signature,
            secret: secret || workosConfig.webhookSecret,
        });
        return true;
    } catch {
        return false;
    }
}

/**
 * Generate CSRF token for OAuth state
 */
export function generateCsrfToken(): string {
    return crypto.randomUUID();
}

/**
 * Create OAuth state with CSRF protection
 */
export function createOAuthState(provider: OAuthProvider, returnTo?: string): string {
    const state: OAuthState = {
        provider,
        returnTo,
        csrfToken: generateCsrfToken(),
    };
    return Buffer.from(JSON.stringify(state)).toString('base64url');
}

/**
 * Parse OAuth state and validate CSRF
 */
export function parseOAuthState(stateString: string): OAuthState | null {
    try {
        const decoded = Buffer.from(stateString, 'base64url').toString('utf-8');
        return JSON.parse(decoded) as OAuthState;
    } catch {
        return null;
    }
}

console.log(`[WorkOS] Initialized. Enabled: ${WORKOS_ENABLED}`);

export default workos;
