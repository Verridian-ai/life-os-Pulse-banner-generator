/**
 * Pricing Cards Component
 *
 * Displays available subscription tiers with upgrade options.
 */

import React, { useState } from 'react';
import { createCheckout, type TierType } from '../services/billingApi';

interface PricingCardsProps {
    currentTier: TierType;
    onUpgradeStart?: () => void;
    onUpgradeComplete?: () => void;
    onError?: (error: Error) => void;
}

const TIER_FEATURES = {
    free: [
        '100 credits/month',
        'Basic image generation',
        'Standard templates',
        'Community support',
    ],
    basic: [
        '500 credits/month',
        'Priority image generation',
        'All templates',
        'Background removal',
        'Email support',
    ],
    premium: [
        '2,000 credits/month',
        'Fastest generation',
        'All templates + exclusive',
        'All image processing',
        'Face enhancement',
        'Priority support',
        'Early access to features',
    ],
};

export function PricingCards({
    currentTier,
    onUpgradeStart,
    onUpgradeComplete,
    onError,
}: PricingCardsProps): React.ReactElement {
    const [isLoading, setIsLoading] = useState<TierType | null>(null);

    const handleUpgrade = async (tier: 'basic' | 'premium') => {
        try {
            setIsLoading(tier);
            onUpgradeStart?.();

            const result = await createCheckout(tier);

            if (result.url) {
                // Redirect to Stripe Checkout
                window.location.href = result.url;
            }
        } catch (error) {
            console.error('Upgrade error:', error);
            onError?.(error as Error);
        } finally {
            setIsLoading(null);
            onUpgradeComplete?.();
        }
    };

    const renderTierCard = (
        tier: TierType,
        name: string,
        price: number,
        features: string[],
        highlighted = false
    ) => {
        const isCurrent = currentTier === tier;
        const isUpgrade = tier !== 'free' && (
            (currentTier === 'free') ||
            (currentTier === 'basic' && tier === 'premium')
        );
        const isDowngrade = (
            (currentTier === 'premium' && tier === 'basic') ||
            (currentTier !== 'free' && tier === 'free')
        );

        return (
            <div
                key={tier}
                className={`relative rounded-2xl border p-6 ${
                    highlighted
                        ? 'border-purple-500/50 bg-purple-500/5'
                        : 'border-white/10 bg-zinc-900'
                } ${isCurrent ? 'ring-2 ring-purple-500' : ''}`}
            >
                {highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-purple-500 text-white text-xs font-medium rounded-full">
                        Most Popular
                    </div>
                )}

                {isCurrent && (
                    <div className="absolute -top-3 right-4 px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                        Current Plan
                    </div>
                )}

                <h3 className="text-xl font-bold text-white capitalize">{name}</h3>

                <div className="mt-4">
                    <span className="text-4xl font-bold text-white">${price}</span>
                    <span className="text-zinc-400">/month</span>
                </div>

                <ul className="mt-6 space-y-3">
                    {features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                            <svg
                                className="w-5 h-5 text-green-400 shrink-0 mt-0.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                            {feature}
                        </li>
                    ))}
                </ul>

                <div className="mt-8">
                    {tier === 'free' ? (
                        <button
                            disabled
                            className="w-full py-2.5 px-4 rounded-lg text-sm font-medium bg-zinc-800 text-zinc-400 cursor-not-allowed"
                        >
                            {isCurrent ? 'Current Plan' : 'Free Tier'}
                        </button>
                    ) : isCurrent ? (
                        <button
                            disabled
                            className="w-full py-2.5 px-4 rounded-lg text-sm font-medium bg-green-500/20 text-green-400 cursor-not-allowed"
                        >
                            Current Plan
                        </button>
                    ) : isUpgrade ? (
                        <button
                            onClick={() => handleUpgrade(tier as 'basic' | 'premium')}
                            disabled={isLoading !== null}
                            className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium transition ${
                                highlighted
                                    ? 'bg-purple-500 hover:bg-purple-600 text-white'
                                    : 'bg-white/10 hover:bg-white/20 text-white'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isLoading === tier ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Processing...
                                </span>
                            ) : (
                                `Upgrade to ${name}`
                            )}
                        </button>
                    ) : isDowngrade ? (
                        <button
                            disabled
                            className="w-full py-2.5 px-4 rounded-lg text-sm font-medium bg-zinc-800 text-zinc-500 cursor-not-allowed"
                        >
                            Downgrade via Portal
                        </button>
                    ) : null}
                </div>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {renderTierCard('free', 'Free', 0, TIER_FEATURES.free)}
            {renderTierCard('basic', 'Basic', 9.99, TIER_FEATURES.basic)}
            {renderTierCard('premium', 'Premium', 29.99, TIER_FEATURES.premium, true)}
        </div>
    );
}
