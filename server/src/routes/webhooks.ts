/**
 * Webhook Handlers
 *
 * Handles incoming webhooks from:
 * - WorkOS (SCIM directory sync, SSO events)
 * - Stripe (billing events) - to be added in Phase 4
 */

import { Hono } from 'hono';
import { db } from '../db';
import {
    users,
    profiles,
    workosWebhookEvents,
    workosOrganizations,
    workosSsoConnections,
    userCreditAccounts,
} from '../db/schema';
import { eq } from 'drizzle-orm';
import { generateIdFromEntropySize } from 'lucia';
import { verifyWebhookSignature, workosConfig } from '../lib/workos';

export const webhooksRouter = new Hono();

// ============================================================================
// WORKOS WEBHOOKS
// ============================================================================

webhooksRouter.post('/workos', async (c) => {
    // Get raw body for signature verification
    const rawBody = await c.req.text();
    const signature = c.req.header('workos-signature') || '';

    // Verify webhook signature
    if (workosConfig.webhookSecret && !verifyWebhookSignature(rawBody, signature)) {
        console.error('[Webhook] Invalid WorkOS webhook signature');
        return c.json({ error: 'Invalid signature' }, 401);
    }

    let payload: WorkOSWebhookEvent;
    try {
        payload = JSON.parse(rawBody);
    } catch {
        return c.json({ error: 'Invalid JSON' }, 400);
    }

    // Store event for idempotency and debugging
    const eventExists = await db.select()
        .from(workosWebhookEvents)
        .where(eq(workosWebhookEvents.eventId, payload.id))
        .limit(1);

    if (eventExists.length > 0) {
        // Already processed, return success
        return c.json({ success: true, message: 'Event already processed' });
    }

    // Store event
    await db.insert(workosWebhookEvents).values({
        eventId: payload.id,
        eventType: payload.event,
        payload: payload.data,
        processed: false,
    });

    try {
        // Handle different event types
        switch (payload.event) {
            // User Management Events
            case 'user.created':
                await handleUserCreated(payload.data);
                break;
            case 'user.updated':
                await handleUserUpdated(payload.data);
                break;
            case 'user.deleted':
                await handleUserDeleted(payload.data);
                break;

            // Directory Sync Events
            case 'dsync.user.created':
                await handleDsyncUserCreated(payload.data);
                break;
            case 'dsync.user.updated':
                await handleDsyncUserUpdated(payload.data);
                break;
            case 'dsync.user.deleted':
                await handleDsyncUserDeleted(payload.data);
                break;
            case 'dsync.group.created':
            case 'dsync.group.updated':
            case 'dsync.group.deleted':
                // Group events - handle if needed
                console.log(`[Webhook] Group event: ${payload.event}`);
                break;

            // SSO Connection Events
            case 'connection.activated':
                await handleConnectionActivated(payload.data);
                break;
            case 'connection.deactivated':
                await handleConnectionDeactivated(payload.data);
                break;

            // Organization Events
            case 'organization.created':
            case 'organization.updated':
                await handleOrganizationEvent(payload.event, payload.data);
                break;

            default:
                console.log(`[Webhook] Unhandled WorkOS event: ${payload.event}`);
        }

        // Mark as processed
        await db.update(workosWebhookEvents)
            .set({
                processed: true,
                processedAt: new Date(),
            })
            .where(eq(workosWebhookEvents.eventId, payload.id));

        return c.json({ success: true });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[Webhook] Error processing ${payload.event}:`, error);

        // Store error
        await db.update(workosWebhookEvents)
            .set({
                error: errorMessage,
            })
            .where(eq(workosWebhookEvents.eventId, payload.id));

        return c.json({ error: 'Processing failed' }, 500);
    }
});

// ============================================================================
// WORKOS EVENT HANDLERS
// ============================================================================

interface WorkOSUser {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    email_verified: boolean;
    profile_picture_url?: string;
}

interface WorkOSDirectoryUser {
    id: string;
    idp_id: string;
    directory_id: string;
    organization_id?: string;
    first_name: string;
    last_name: string;
    emails: Array<{ primary: boolean; value: string }>;
    state: string;
    raw_attributes: Record<string, unknown>;
}

interface WorkOSConnection {
    id: string;
    organization_id: string;
    name: string;
    connection_type: string;
    state: string;
    domains: Array<{ domain: string }>;
}

interface WorkOSOrganization {
    id: string;
    name: string;
    domains: Array<{ domain: string }>;
    allow_profiles_outside_organization: boolean;
}

interface WorkOSWebhookEvent {
    id: string;
    event: string;
    data: unknown;
    created_at: string;
}

async function handleUserCreated(data: unknown): Promise<void> {
    const userData = data as WorkOSUser;
    console.log(`[Webhook] User created: ${userData.email}`);

    // Check if user already exists
    const existing = await db.select()
        .from(users)
        .where(eq(users.email, userData.email))
        .limit(1);

    if (existing.length > 0) {
        // Update with WorkOS ID
        await db.update(users)
            .set({
                workosUserId: userData.id,
                emailVerified: userData.email_verified,
                updatedAt: new Date(),
            })
            .where(eq(users.email, userData.email));
    } else {
        // Create new user
        const userId = generateIdFromEntropySize(10);

        await db.insert(users).values({
            id: userId,
            email: userData.email,
            workosUserId: userData.id,
            emailVerified: userData.email_verified,
            authProvider: 'sso',
        });

        await db.insert(profiles).values({
            id: userId,
            email: userData.email,
            firstName: userData.first_name,
            lastName: userData.last_name,
            avatarUrl: userData.profile_picture_url,
        });

        // Initialize credit account
        await db.insert(userCreditAccounts).values({
            userId,
            tierId: 'free',
            creditBalance: 100,
            lifetimeCreditsGranted: 100,
            lifetimeCreditsUsed: 0,
        });
    }
}

async function handleUserUpdated(data: unknown): Promise<void> {
    const userData = data as WorkOSUser;
    console.log(`[Webhook] User updated: ${userData.email}`);

    const existing = await db.select()
        .from(users)
        .where(eq(users.workosUserId, userData.id))
        .limit(1);

    if (existing.length > 0) {
        // Update user
        await db.update(users)
            .set({
                email: userData.email,
                emailVerified: userData.email_verified,
                updatedAt: new Date(),
            })
            .where(eq(users.workosUserId, userData.id));

        // Update profile
        await db.update(profiles)
            .set({
                email: userData.email,
                firstName: userData.first_name,
                lastName: userData.last_name,
                avatarUrl: userData.profile_picture_url,
                updatedAt: new Date(),
            })
            .where(eq(profiles.id, existing[0].id));
    }
}

async function handleUserDeleted(data: unknown): Promise<void> {
    const userData = data as WorkOSUser;
    console.log(`[Webhook] User deleted: ${userData.id}`);

    // We don't delete users, just mark for review
    // In production, you might want to deactivate the account
    await db.update(users)
        .set({
            workosUserId: null, // Unlink from WorkOS
            updatedAt: new Date(),
        })
        .where(eq(users.workosUserId, userData.id));
}

async function handleDsyncUserCreated(data: unknown): Promise<void> {
    const dsyncUser = data as WorkOSDirectoryUser;
    const primaryEmail = dsyncUser.emails.find(e => e.primary)?.value || dsyncUser.emails[0]?.value;

    if (!primaryEmail) {
        console.error('[Webhook] DSYNC user has no email:', dsyncUser.id);
        return;
    }

    console.log(`[Webhook] DSYNC user created: ${primaryEmail}`);

    // Check if user exists
    const existing = await db.select()
        .from(users)
        .where(eq(users.email, primaryEmail))
        .limit(1);

    if (existing.length > 0) {
        // Update existing user
        await db.update(users)
            .set({
                emailVerified: true,
                authProvider: 'sso',
                updatedAt: new Date(),
            })
            .where(eq(users.email, primaryEmail));

        await db.update(profiles)
            .set({
                firstName: dsyncUser.first_name,
                lastName: dsyncUser.last_name,
                updatedAt: new Date(),
            })
            .where(eq(profiles.id, existing[0].id));
    } else {
        // Create new user from SCIM
        const userId = generateIdFromEntropySize(10);

        await db.insert(users).values({
            id: userId,
            email: primaryEmail,
            emailVerified: true,
            authProvider: 'sso',
        });

        await db.insert(profiles).values({
            id: userId,
            email: primaryEmail,
            firstName: dsyncUser.first_name,
            lastName: dsyncUser.last_name,
        });

        await db.insert(userCreditAccounts).values({
            userId,
            tierId: 'free',
            creditBalance: 100,
            lifetimeCreditsGranted: 100,
            lifetimeCreditsUsed: 0,
        });
    }
}

async function handleDsyncUserUpdated(data: unknown): Promise<void> {
    const dsyncUser = data as WorkOSDirectoryUser;
    const primaryEmail = dsyncUser.emails.find(e => e.primary)?.value || dsyncUser.emails[0]?.value;

    if (!primaryEmail) return;

    console.log(`[Webhook] DSYNC user updated: ${primaryEmail}`);

    const existing = await db.select()
        .from(users)
        .where(eq(users.email, primaryEmail))
        .limit(1);

    if (existing.length > 0) {
        await db.update(profiles)
            .set({
                firstName: dsyncUser.first_name,
                lastName: dsyncUser.last_name,
                updatedAt: new Date(),
            })
            .where(eq(profiles.id, existing[0].id));
    }
}

async function handleDsyncUserDeleted(data: unknown): Promise<void> {
    const dsyncUser = data as WorkOSDirectoryUser;
    const primaryEmail = dsyncUser.emails.find(e => e.primary)?.value || dsyncUser.emails[0]?.value;

    if (!primaryEmail) return;

    console.log(`[Webhook] DSYNC user deleted: ${primaryEmail}`);

    // Deactivate user (don't delete data)
    // In production, you might want to revoke sessions
}

async function handleConnectionActivated(data: unknown): Promise<void> {
    const connection = data as WorkOSConnection;
    console.log(`[Webhook] SSO connection activated: ${connection.name}`);

    // Upsert connection
    const existing = await db.select()
        .from(workosSsoConnections)
        .where(eq(workosSsoConnections.workosConnectionId, connection.id))
        .limit(1);

    if (existing.length > 0) {
        await db.update(workosSsoConnections)
            .set({
                state: 'active',
                name: connection.name,
                domains: connection.domains.map(d => d.domain),
                updatedAt: new Date(),
            })
            .where(eq(workosSsoConnections.workosConnectionId, connection.id));
    } else {
        await db.insert(workosSsoConnections).values({
            workosConnectionId: connection.id,
            workosOrgId: connection.organization_id,
            name: connection.name,
            connectionType: connection.connection_type,
            state: 'active',
            domains: connection.domains.map(d => d.domain),
        });
    }
}

async function handleConnectionDeactivated(data: unknown): Promise<void> {
    const connection = data as WorkOSConnection;
    console.log(`[Webhook] SSO connection deactivated: ${connection.name}`);

    await db.update(workosSsoConnections)
        .set({
            state: 'inactive',
            updatedAt: new Date(),
        })
        .where(eq(workosSsoConnections.workosConnectionId, connection.id));
}

async function handleOrganizationEvent(event: string, data: unknown): Promise<void> {
    const org = data as WorkOSOrganization;
    console.log(`[Webhook] Organization ${event}: ${org.name}`);

    // Upsert organization
    const existing = await db.select()
        .from(workosOrganizations)
        .where(eq(workosOrganizations.workosOrgId, org.id))
        .limit(1);

    if (existing.length > 0) {
        await db.update(workosOrganizations)
            .set({
                name: org.name,
                domains: org.domains.map(d => d.domain),
                allowProfilesOutsideOrg: org.allow_profiles_outside_organization,
                updatedAt: new Date(),
            })
            .where(eq(workosOrganizations.workosOrgId, org.id));
    } else {
        await db.insert(workosOrganizations).values({
            workosOrgId: org.id,
            name: org.name,
            domains: org.domains.map(d => d.domain),
            allowProfilesOutsideOrg: org.allow_profiles_outside_organization,
        });
    }
}

// ============================================================================
// STRIPE WEBHOOKS
// ============================================================================

import { getStripe, getWebhookSecret, isStripeEnabled, type Stripe } from '../lib/stripe';
import { StripeService } from '../services/stripeService';

webhooksRouter.post('/stripe', async (c) => {
    if (!isStripeEnabled()) {
        return c.json({ error: 'Stripe is not configured' }, 501);
    }

    const stripe = getStripe();
    const webhookSecret = getWebhookSecret();

    if (!stripe || !webhookSecret) {
        console.error('[Webhook] Stripe client or webhook secret not configured');
        return c.json({ error: 'Stripe not properly configured' }, 500);
    }

    // Get raw body for signature verification
    const rawBody = await c.req.text();
    const signature = c.req.header('stripe-signature') || '';

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Webhook] Stripe signature verification failed:', message);
        return c.json({ error: 'Invalid signature' }, 401);
    }

    // Check if event was already processed (idempotency)
    const isNewEvent = await StripeService.recordWebhookEvent(event.id, event.type, event.data.object);

    if (!isNewEvent) {
        // Already processed
        return c.json({ received: true, message: 'Event already processed' });
    }

    try {
        // Handle different event types
        switch (event.type) {
            case 'checkout.session.completed':
                await StripeService.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
                break;

            case 'invoice.paid':
                await StripeService.handleInvoicePaid(event.data.object as Stripe.Invoice);
                break;

            case 'invoice.payment_failed':
                await StripeService.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
                break;

            case 'customer.subscription.updated':
                await StripeService.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
                break;

            case 'customer.subscription.deleted':
                await StripeService.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
                break;

            default:
                console.log(`[Webhook] Unhandled Stripe event: ${event.type}`);
        }

        // Mark event as processed
        await StripeService.markEventProcessed(event.id);

        return c.json({ received: true });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[Webhook] Error processing ${event.type}:`, error);

        // Store error
        await StripeService.markEventProcessed(event.id, errorMessage);

        return c.json({ error: 'Processing failed' }, 500);
    }
});
