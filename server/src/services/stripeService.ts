/**
 * Stripe Billing Service
 *
 * Handles all billing operations: checkout, subscriptions, invoices, and webhooks.
 */

import {
    getStripe,
    STRIPE_PRICES,
    getTierFromPriceId,
    getCreditsForTier,
    mapSubscriptionStatus,
    type Stripe
} from '../lib/stripe';
import { db } from '../db';
import {
    stripeCustomers,
    stripeSubscriptions,
    stripeInvoices,
    stripeWebhookEvents,
    userCreditAccounts,
    creditTransactions,
    creditTiers,
} from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';

export type TierType = 'free' | 'basic' | 'premium';

export interface SubscriptionInfo {
    id: string;
    status: string;
    tier: TierType;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    trialEnd?: Date | null;
}

export interface CheckoutResult {
    sessionId: string;
    url: string;
}

export interface PortalResult {
    url: string;
}

/**
 * Stripe Billing Service
 */
export class StripeService {
    /**
     * Get or create a Stripe customer for a user
     */
    static async getOrCreateCustomer(userId: string, email: string, name?: string): Promise<string> {
        const stripe = getStripe();
        if (!stripe) {
            throw new Error('Stripe is not configured');
        }

        // Check if customer already exists
        const [existingCustomer] = await db
            .select()
            .from(stripeCustomers)
            .where(eq(stripeCustomers.userId, userId))
            .limit(1);

        if (existingCustomer) {
            return existingCustomer.stripeCustomerId;
        }

        // Create new Stripe customer
        const customer = await stripe.customers.create({
            email,
            name: name || undefined,
            metadata: {
                userId,
            },
        });

        // Save to database
        await db.insert(stripeCustomers).values({
            userId,
            stripeCustomerId: customer.id,
            email,
            name: name || null,
        });

        console.log('[Stripe] Created customer:', customer.id, 'for user:', userId);

        return customer.id;
    }

    /**
     * Create a checkout session for a subscription
     */
    static async createCheckoutSession(
        userId: string,
        email: string,
        tier: TierType,
        successUrl: string,
        cancelUrl: string,
        name?: string
    ): Promise<CheckoutResult> {
        const stripe = getStripe();
        if (!stripe) {
            throw new Error('Stripe is not configured');
        }

        // Get or create customer
        const customerId = await this.getOrCreateCustomer(userId, email, name);

        // Get price ID for tier
        const priceId = STRIPE_PRICES[tier];
        if (!priceId) {
            throw new Error(`Invalid tier: ${tier}`);
        }

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: successUrl,
            cancel_url: cancelUrl,
            subscription_data: {
                metadata: {
                    userId,
                    tier,
                },
            },
            allow_promotion_codes: true,
            billing_address_collection: 'auto',
        });

        console.log('[Stripe] Created checkout session:', session.id);

        return {
            sessionId: session.id,
            url: session.url || '',
        };
    }

    /**
     * Create a customer portal session
     */
    static async createPortalSession(userId: string, returnUrl: string): Promise<PortalResult> {
        const stripe = getStripe();
        if (!stripe) {
            throw new Error('Stripe is not configured');
        }

        // Get customer
        const [customer] = await db
            .select()
            .from(stripeCustomers)
            .where(eq(stripeCustomers.userId, userId))
            .limit(1);

        if (!customer) {
            throw new Error('No billing account found. Please subscribe first.');
        }

        // Create portal session
        const session = await stripe.billingPortal.sessions.create({
            customer: customer.stripeCustomerId,
            return_url: returnUrl,
        });

        console.log('[Stripe] Created portal session for customer:', customer.stripeCustomerId);

        return {
            url: session.url,
        };
    }

    /**
     * Get current subscription for a user
     */
    static async getSubscription(userId: string): Promise<SubscriptionInfo | null> {
        const [subscription] = await db
            .select()
            .from(stripeSubscriptions)
            .where(
                and(
                    eq(stripeSubscriptions.userId, userId),
                    sql`${stripeSubscriptions.status} IN ('active', 'trialing', 'past_due')`
                )
            )
            .limit(1);

        if (!subscription) {
            return null;
        }

        // Get tier from price ID
        const tier = getTierFromPriceId(subscription.priceId) || 'free';

        return {
            id: subscription.stripeSubscriptionId,
            status: subscription.status,
            tier,
            currentPeriodStart: subscription.currentPeriodStart,
            currentPeriodEnd: subscription.currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
            trialEnd: subscription.trialEnd,
        };
    }

    /**
     * Get invoices for a user
     */
    static async getInvoices(userId: string, limit = 10): Promise<typeof stripeInvoices.$inferSelect[]> {
        const invoices = await db
            .select()
            .from(stripeInvoices)
            .where(eq(stripeInvoices.userId, userId))
            .orderBy(sql`${stripeInvoices.createdAt} DESC`)
            .limit(limit);

        return invoices;
    }

    /**
     * Cancel subscription at period end
     */
    static async cancelSubscription(userId: string): Promise<void> {
        const stripe = getStripe();
        if (!stripe) {
            throw new Error('Stripe is not configured');
        }

        const subscription = await this.getSubscription(userId);
        if (!subscription) {
            throw new Error('No active subscription found');
        }

        // Cancel at period end
        await stripe.subscriptions.update(subscription.id, {
            cancel_at_period_end: true,
        });

        // Update local record
        await db
            .update(stripeSubscriptions)
            .set({
                cancelAtPeriodEnd: true,
                updatedAt: new Date(),
            })
            .where(eq(stripeSubscriptions.stripeSubscriptionId, subscription.id));

        console.log('[Stripe] Subscription cancelled at period end:', subscription.id);
    }

    /**
     * Resume a cancelled subscription
     */
    static async resumeSubscription(userId: string): Promise<void> {
        const stripe = getStripe();
        if (!stripe) {
            throw new Error('Stripe is not configured');
        }

        const subscription = await this.getSubscription(userId);
        if (!subscription) {
            throw new Error('No subscription found');
        }

        if (!subscription.cancelAtPeriodEnd) {
            throw new Error('Subscription is not cancelled');
        }

        // Resume subscription
        await stripe.subscriptions.update(subscription.id, {
            cancel_at_period_end: false,
        });

        // Update local record
        await db
            .update(stripeSubscriptions)
            .set({
                cancelAtPeriodEnd: false,
                updatedAt: new Date(),
            })
            .where(eq(stripeSubscriptions.stripeSubscriptionId, subscription.id));

        console.log('[Stripe] Subscription resumed:', subscription.id);
    }

    // =========================================================================
    // WEBHOOK HANDLERS
    // =========================================================================

    /**
     * Handle checkout.session.completed event
     */
    static async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
        if (session.mode !== 'subscription' || !session.subscription) {
            return;
        }

        const stripe = getStripe();
        if (!stripe) return;

        // Get the subscription
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

        // Extract tier from metadata or price
        const priceId = subscription.items.data[0]?.price.id || '';
        const tier = getTierFromPriceId(priceId) || 'free';
        const userId = subscription.metadata.userId || session.client_reference_id;

        if (!userId) {
            console.error('[Stripe] No userId in subscription metadata');
            return;
        }

        // Find or create the tier
        let [tierRecord] = await db
            .select()
            .from(creditTiers)
            .where(eq(creditTiers.id, tier))
            .limit(1);

        if (!tierRecord) {
            // Create tier if it doesn't exist
            const inserted = await db.insert(creditTiers).values({
                id: tier,
                name: tier.charAt(0).toUpperCase() + tier.slice(1),
                monthlyCredits: getCreditsForTier(tier),
                priceMonthly: tier === 'free' ? '0' : tier === 'basic' ? '9.99' : '29.99',
                stripePriceId: priceId,
            }).returning();
            tierRecord = inserted[0];
        }

        // Save subscription to database
        await db.insert(stripeSubscriptions).values({
            userId,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
            status: mapSubscriptionStatus(subscription.status),
            tierId: tier,
            priceId,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
            trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        }).onConflictDoUpdate({
            target: stripeSubscriptions.stripeSubscriptionId,
            set: {
                status: mapSubscriptionStatus(subscription.status),
                tierId: tier,
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                updatedAt: new Date(),
            },
        });

        // Update user's credit account with new tier
        await db
            .update(userCreditAccounts)
            .set({
                tierId: tier,
                updatedAt: new Date(),
            })
            .where(eq(userCreditAccounts.userId, userId));

        // Add initial credits
        const credits = getCreditsForTier(tier);
        await db.insert(creditTransactions).values({
            userId,
            amount: credits,
            type: 'subscription',
            description: `${tier.charAt(0).toUpperCase() + tier.slice(1)} plan subscription`,
        });

        await db
            .update(userCreditAccounts)
            .set({
                creditBalance: sql`${userCreditAccounts.creditBalance} + ${credits}`,
                lifetimeCreditsGranted: sql`${userCreditAccounts.lifetimeCreditsGranted} + ${credits}`,
                updatedAt: new Date(),
            })
            .where(eq(userCreditAccounts.userId, userId));

        console.log('[Stripe] Checkout completed for user:', userId, 'tier:', tier);
    }

    /**
     * Handle invoice.paid event
     */
    static async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
        if (!invoice.subscription) return;

        const stripe = getStripe();
        if (!stripe) return;

        // Get subscription
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const userId = subscription.metadata.userId;

        if (!userId) {
            console.error('[Stripe] No userId in subscription metadata');
            return;
        }

        // Save invoice
        await db.insert(stripeInvoices).values({
            userId,
            stripeInvoiceId: invoice.id,
            stripeSubscriptionId: invoice.subscription as string,
            stripeCustomerId: invoice.customer as string,
            status: invoice.status || 'paid',
            amountDue: invoice.amount_due,
            amountPaid: invoice.amount_paid,
            currency: invoice.currency,
            invoicePdfUrl: invoice.invoice_pdf || null,
            hostedInvoiceUrl: invoice.hosted_invoice_url || null,
            periodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : null,
            periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
            paidAt: invoice.status_transitions?.paid_at
                ? new Date(invoice.status_transitions.paid_at * 1000)
                : new Date(),
        }).onConflictDoUpdate({
            target: stripeInvoices.stripeInvoiceId,
            set: {
                status: invoice.status || 'paid',
                amountPaid: invoice.amount_paid,
                paidAt: new Date(),
                updatedAt: new Date(),
            },
        });

        // If this is a renewal (not the first invoice), add monthly credits
        const priceId = subscription.items.data[0]?.price.id || '';
        const tier = getTierFromPriceId(priceId) || 'free';

        // Check if user already has credits from checkout (first invoice)
        const isFirstInvoice = invoice.billing_reason === 'subscription_create';

        if (!isFirstInvoice) {
            const credits = getCreditsForTier(tier);

            await db.insert(creditTransactions).values({
                userId,
                amount: credits,
                type: 'subscription_renewal',
                description: `${tier.charAt(0).toUpperCase() + tier.slice(1)} plan renewal`,
            });

            await db
                .update(userCreditAccounts)
                .set({
                    creditBalance: sql`${userCreditAccounts.creditBalance} + ${credits}`,
                    lifetimeCreditsGranted: sql`${userCreditAccounts.lifetimeCreditsGranted} + ${credits}`,
                    updatedAt: new Date(),
                })
                .where(eq(userCreditAccounts.userId, userId));

            console.log('[Stripe] Invoice paid, added credits:', credits, 'to user:', userId);
        }
    }

    /**
     * Handle invoice.payment_failed event
     */
    static async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
        if (!invoice.subscription) return;

        const stripe = getStripe();
        if (!stripe) return;

        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const userId = subscription.metadata.userId;

        if (!userId) return;

        // Update subscription status
        await db
            .update(stripeSubscriptions)
            .set({
                status: 'past_due',
                updatedAt: new Date(),
            })
            .where(eq(stripeSubscriptions.stripeSubscriptionId, invoice.subscription as string));

        console.log('[Stripe] Payment failed for user:', userId);

        // TODO: Send dunning email notification
    }

    /**
     * Handle customer.subscription.deleted event
     */
    static async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
        const userId = subscription.metadata.userId;

        if (!userId) {
            console.error('[Stripe] No userId in subscription metadata');
            return;
        }

        // Update subscription status
        await db
            .update(stripeSubscriptions)
            .set({
                status: 'canceled',
                canceledAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(stripeSubscriptions.stripeSubscriptionId, subscription.id));

        // Downgrade to free tier
        await db
            .update(userCreditAccounts)
            .set({
                tierId: 'free',
                updatedAt: new Date(),
            })
            .where(eq(userCreditAccounts.userId, userId));

        console.log('[Stripe] Subscription deleted, downgraded user:', userId, 'to free tier');
    }

    /**
     * Handle customer.subscription.updated event
     */
    static async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
        const userId = subscription.metadata.userId;

        if (!userId) return;

        const priceId = subscription.items.data[0]?.price.id || '';
        const tier = getTierFromPriceId(priceId) || 'free';

        await db
            .update(stripeSubscriptions)
            .set({
                status: mapSubscriptionStatus(subscription.status),
                tierId: tier,
                priceId,
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
                updatedAt: new Date(),
            })
            .where(eq(stripeSubscriptions.stripeSubscriptionId, subscription.id));

        // Update user's tier
        await db
            .update(userCreditAccounts)
            .set({
                tierId: tier,
                updatedAt: new Date(),
            })
            .where(eq(userCreditAccounts.userId, userId));

        console.log('[Stripe] Subscription updated for user:', userId, 'new tier:', tier);
    }

    /**
     * Record a webhook event (for idempotency)
     */
    static async recordWebhookEvent(
        eventId: string,
        eventType: string,
        payload: unknown
    ): Promise<boolean> {
        // Check if event was already processed
        const [existing] = await db
            .select()
            .from(stripeWebhookEvents)
            .where(eq(stripeWebhookEvents.stripeEventId, eventId))
            .limit(1);

        if (existing) {
            console.log('[Stripe] Webhook event already processed:', eventId);
            return false; // Already processed
        }

        // Record the event
        await db.insert(stripeWebhookEvents).values({
            stripeEventId: eventId,
            eventType,
            payload: payload as Record<string, unknown>,
            processed: false,
        });

        return true; // New event
    }

    /**
     * Mark webhook event as processed
     */
    static async markEventProcessed(eventId: string, error?: string): Promise<void> {
        await db
            .update(stripeWebhookEvents)
            .set({
                processed: true,
                processedAt: new Date(),
                error: error || null,
            })
            .where(eq(stripeWebhookEvents.stripeEventId, eventId));
    }
}
