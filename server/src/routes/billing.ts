/**
 * Billing Routes
 *
 * Handles Stripe checkout, subscriptions, invoices, and customer portal.
 */

import { Hono } from 'hono';
import type { Context } from 'hono';
import { authMiddleware } from '../lib/auth';
import { isStripeEnabled, TIER_PRICES, STRIPE_PRICES, getCreditsForTier } from '../lib/stripe';
import { StripeService } from '../services/stripeService';
import { db } from '../db';
import { users, userCreditAccounts } from '../db/schema';
import { eq } from 'drizzle-orm';

type Env = {
    Variables: {
        user: { id: string; email: string };
    };
};

export const billingRouter = new Hono<Env>();

// Auth middleware for all billing routes
billingRouter.use('*', authMiddleware);

/**
 * GET /api/billing/status
 * Check if billing is enabled
 */
billingRouter.get('/status', async (c: Context) => {
    return c.json({
        enabled: isStripeEnabled(),
        tiers: {
            free: {
                price: TIER_PRICES.free,
                credits: getCreditsForTier('free'),
                priceId: STRIPE_PRICES.free,
            },
            basic: {
                price: TIER_PRICES.basic,
                credits: getCreditsForTier('basic'),
                priceId: STRIPE_PRICES.basic,
            },
            premium: {
                price: TIER_PRICES.premium,
                credits: getCreditsForTier('premium'),
                priceId: STRIPE_PRICES.premium,
            },
        },
    });
});

/**
 * GET /api/billing/subscription
 * Get current subscription status
 */
billingRouter.get('/subscription', async (c: Context<Env>) => {
    try {
        const user = c.get('user');

        if (!isStripeEnabled()) {
            return c.json({
                subscription: null,
                message: 'Billing is not configured',
            });
        }

        const subscription = await StripeService.getSubscription(user.id);

        // Get credit balance
        const [creditAccount] = await db
            .select()
            .from(userCreditAccounts)
            .where(eq(userCreditAccounts.userId, user.id))
            .limit(1);

        return c.json({
            subscription,
            credits: {
                balance: creditAccount?.creditBalance || 0,
                tier: creditAccount?.tierId || 'free',
            },
        });
    } catch (error) {
        console.error('[Billing] Get subscription error:', error);
        return c.json({ error: 'Failed to get subscription' }, 500);
    }
});

/**
 * POST /api/billing/checkout
 * Create a checkout session
 */
billingRouter.post('/checkout', async (c: Context<Env>) => {
    try {
        const user = c.get('user');
        const body = await c.req.json<{ tier: 'basic' | 'premium'; successUrl?: string; cancelUrl?: string }>();

        if (!isStripeEnabled()) {
            return c.json({ error: 'Billing is not configured' }, 400);
        }

        const { tier, successUrl, cancelUrl } = body;

        if (!tier || !['basic', 'premium'].includes(tier)) {
            return c.json({ error: 'Invalid tier. Must be "basic" or "premium"' }, 400);
        }

        // Get user details
        const [userRecord] = await db
            .select()
            .from(users)
            .where(eq(users.id, user.id))
            .limit(1);

        if (!userRecord) {
            return c.json({ error: 'User not found' }, 404);
        }

        // Create checkout session
        const baseUrl = process.env.VITE_APP_URL || 'http://localhost:5173';
        const result = await StripeService.createCheckoutSession(
            user.id,
            userRecord.email,
            tier,
            successUrl || `${baseUrl}/settings?billing=success`,
            cancelUrl || `${baseUrl}/settings?billing=cancelled`,
            undefined // name
        );

        return c.json(result);
    } catch (error) {
        console.error('[Billing] Create checkout error:', error);
        return c.json({ error: 'Failed to create checkout session' }, 500);
    }
});

/**
 * POST /api/billing/portal
 * Create a customer portal session
 */
billingRouter.post('/portal', async (c: Context<Env>) => {
    try {
        const user = c.get('user');
        const body = await c.req.json<{ returnUrl?: string }>();

        if (!isStripeEnabled()) {
            return c.json({ error: 'Billing is not configured' }, 400);
        }

        const baseUrl = process.env.VITE_APP_URL || 'http://localhost:5173';
        const returnUrl = body.returnUrl || `${baseUrl}/settings`;

        const result = await StripeService.createPortalSession(user.id, returnUrl);

        return c.json(result);
    } catch (error) {
        console.error('[Billing] Create portal error:', error);
        const message = error instanceof Error ? error.message : 'Failed to create portal session';
        return c.json({ error: message }, 500);
    }
});

/**
 * GET /api/billing/invoices
 * Get invoice history
 */
billingRouter.get('/invoices', async (c: Context<Env>) => {
    try {
        const user = c.get('user');

        if (!isStripeEnabled()) {
            return c.json({ invoices: [] });
        }

        const limit = parseInt(c.req.query('limit') || '10');
        const invoices = await StripeService.getInvoices(user.id, limit);

        return c.json({
            invoices: invoices.map((inv) => ({
                id: inv.id,
                stripeInvoiceId: inv.stripeInvoiceId,
                status: inv.status,
                amountDue: inv.amountDue,
                amountPaid: inv.amountPaid,
                currency: inv.currency,
                pdfUrl: inv.invoicePdfUrl,
                hostedUrl: inv.hostedInvoiceUrl,
                periodStart: inv.periodStart,
                periodEnd: inv.periodEnd,
                paidAt: inv.paidAt,
                createdAt: inv.createdAt,
            })),
        });
    } catch (error) {
        console.error('[Billing] Get invoices error:', error);
        return c.json({ error: 'Failed to get invoices' }, 500);
    }
});

/**
 * POST /api/billing/cancel
 * Cancel subscription at period end
 */
billingRouter.post('/cancel', async (c: Context<Env>) => {
    try {
        const user = c.get('user');

        if (!isStripeEnabled()) {
            return c.json({ error: 'Billing is not configured' }, 400);
        }

        await StripeService.cancelSubscription(user.id);

        return c.json({
            success: true,
            message: 'Subscription will be cancelled at the end of the current billing period',
        });
    } catch (error) {
        console.error('[Billing] Cancel subscription error:', error);
        const message = error instanceof Error ? error.message : 'Failed to cancel subscription';
        return c.json({ error: message }, 500);
    }
});

/**
 * POST /api/billing/resume
 * Resume a cancelled subscription
 */
billingRouter.post('/resume', async (c: Context<Env>) => {
    try {
        const user = c.get('user');

        if (!isStripeEnabled()) {
            return c.json({ error: 'Billing is not configured' }, 400);
        }

        await StripeService.resumeSubscription(user.id);

        return c.json({
            success: true,
            message: 'Subscription resumed',
        });
    } catch (error) {
        console.error('[Billing] Resume subscription error:', error);
        const message = error instanceof Error ? error.message : 'Failed to resume subscription';
        return c.json({ error: message }, 500);
    }
});
