/**
 * Stripe SDK Initialization
 *
 * Provides configured Stripe client for billing operations.
 */

import Stripe from 'stripe';

// Environment configuration
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Stripe price IDs (from Stripe Dashboard)
export const STRIPE_PRICES = {
    free: process.env.STRIPE_PRICE_FREE || 'price_free',
    basic: process.env.STRIPE_PRICE_BASIC || 'price_basic',
    premium: process.env.STRIPE_PRICE_PREMIUM || 'price_premium',
} as const;

// Credit allocations per tier (monthly)
export const TIER_CREDITS = {
    free: 100,
    basic: 500,
    premium: 2000,
} as const;

// Price display (for frontend)
export const TIER_PRICES = {
    free: 0,
    basic: 9.99,
    premium: 29.99,
} as const;

/**
 * Get the Stripe client singleton
 */
let stripeClient: Stripe | null = null;

export function getStripe(): Stripe | null {
    if (!STRIPE_SECRET_KEY) {
        console.warn('[Stripe] Missing STRIPE_SECRET_KEY, billing disabled');
        return null;
    }

    if (!stripeClient) {
        stripeClient = new Stripe(STRIPE_SECRET_KEY, {
            apiVersion: '2024-12-18.acacia',
            typescript: true,
        });
        console.log('[Stripe] Client initialized');
    }

    return stripeClient;
}

/**
 * Check if Stripe billing is enabled
 */
export function isStripeEnabled(): boolean {
    return !!STRIPE_SECRET_KEY;
}

/**
 * Get webhook secret for signature verification
 */
export function getWebhookSecret(): string | undefined {
    return STRIPE_WEBHOOK_SECRET;
}

/**
 * Get tier ID from Stripe price ID
 */
export function getTierFromPriceId(priceId: string): 'free' | 'basic' | 'premium' | null {
    if (priceId === STRIPE_PRICES.free) return 'free';
    if (priceId === STRIPE_PRICES.basic) return 'basic';
    if (priceId === STRIPE_PRICES.premium) return 'premium';
    return null;
}

/**
 * Get credits allocation for a tier
 */
export function getCreditsForTier(tier: 'free' | 'basic' | 'premium'): number {
    return TIER_CREDITS[tier];
}

/**
 * Map Stripe subscription status to internal status
 */
export function mapSubscriptionStatus(stripeStatus: Stripe.Subscription.Status): string {
    switch (stripeStatus) {
        case 'active':
            return 'active';
        case 'trialing':
            return 'trialing';
        case 'past_due':
            return 'past_due';
        case 'canceled':
            return 'canceled';
        case 'incomplete':
            return 'incomplete';
        case 'incomplete_expired':
            return 'incomplete_expired';
        case 'unpaid':
            return 'unpaid';
        case 'paused':
            return 'paused';
        default:
            return 'unknown';
    }
}

/**
 * Format Stripe amount (cents) to display amount
 */
export function formatStripeAmount(amount: number, currency = 'usd'): string {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase(),
    });
    return formatter.format(amount / 100);
}

export { Stripe };
