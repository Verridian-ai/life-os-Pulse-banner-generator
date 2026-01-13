/**
 * Plan Selector Component
 *
 * Displays pricing tiers during onboarding with selection capability.
 * Used after signup to choose a subscription plan.
 */

import React, { useState } from 'react';
import { createCheckout, type TierType } from '../../billing/services/billingApi';

interface PlanSelectorProps {
    onSelectPlan: (tier: TierType) => void;
    onSkip?: () => void;
    isLoading?: boolean;
}

const PLANS = [
    {
        id: 'free' as TierType,
        name: 'Free',
        price: 0,
        credits: 100,
        description: 'Perfect for trying out',
        features: [
            '100 credits/month',
            'Basic image generation',
            'Standard templates',
            'Community support',
        ],
        highlighted: false,
        cta: 'Start Free',
    },
    {
        id: 'basic' as TierType,
        name: 'Basic',
        price: 9.99,
        credits: 500,
        description: 'Great for regular use',
        features: [
            '500 credits/month',
            'Priority generation',
            'All templates',
            'Background removal',
            'Email support',
        ],
        highlighted: false,
        cta: 'Get Basic',
    },
    {
        id: 'premium' as TierType,
        name: 'Premium',
        price: 29.99,
        credits: 2000,
        description: 'For power users',
        features: [
            '2,000 credits/month',
            'Fastest generation',
            'All templates + exclusive',
            'All image processing',
            'Face enhancement',
            'Priority support',
            'Early access features',
        ],
        highlighted: true,
        cta: 'Go Premium',
    },
];

export function PlanSelector({ onSelectPlan, onSkip, isLoading }: PlanSelectorProps): React.ReactElement {
    const [selectedPlan, setSelectedPlan] = useState<TierType | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSelectPlan = async (tier: TierType) => {
        setSelectedPlan(tier);
        setError(null);

        if (tier === 'free') {
            // Free plan - just proceed
            onSelectPlan(tier);
            return;
        }

        // Paid plan - redirect to Stripe Checkout
        try {
            setIsProcessing(true);
            const result = await createCheckout(
                tier as 'basic' | 'premium',
                `${window.location.origin}/onboarding/success`,
                `${window.location.origin}/onboarding`
            );

            if (result.url) {
                window.location.href = result.url;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start checkout');
            setSelectedPlan(null);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Choose Your Plan</h2>
                <p className="text-zinc-400">
                    Start with free or unlock more power. Upgrade anytime.
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
                    <p className="text-red-400">{error}</p>
                </div>
            )}

            {/* Plan Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PLANS.map((plan) => (
                    <div
                        key={plan.id}
                        className={`relative rounded-2xl border p-6 transition-all duration-200 ${
                            plan.highlighted
                                ? 'border-purple-500/50 bg-purple-500/5 scale-105'
                                : 'border-white/10 bg-zinc-900/50 hover:border-white/20'
                        } ${selectedPlan === plan.id ? 'ring-2 ring-purple-500' : ''}`}
                    >
                        {/* Popular Badge */}
                        {plan.highlighted && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                                Most Popular
                            </div>
                        )}

                        {/* Plan Header */}
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                            <p className="text-sm text-zinc-400 mt-1">{plan.description}</p>
                        </div>

                        {/* Price */}
                        <div className="mb-6">
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-white">
                                    ${plan.price}
                                </span>
                                <span className="text-zinc-400">/month</span>
                            </div>
                            <p className="text-sm text-purple-400 mt-1">
                                {plan.credits.toLocaleString()} credits
                            </p>
                        </div>

                        {/* Features */}
                        <ul className="space-y-3 mb-8">
                            {plan.features.map((feature, i) => (
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

                        {/* CTA Button */}
                        <button
                            onClick={() => handleSelectPlan(plan.id)}
                            disabled={isLoading || isProcessing}
                            className={`w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                                plan.highlighted
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                                    : plan.id === 'free'
                                        ? 'bg-zinc-800 text-white hover:bg-zinc-700'
                                        : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                        >
                            {isProcessing && selectedPlan === plan.id ? (
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
                                plan.cta
                            )}
                        </button>
                    </div>
                ))}
            </div>

            {/* Skip Option */}
            {onSkip && (
                <div className="text-center mt-8">
                    <button
                        onClick={onSkip}
                        disabled={isLoading || isProcessing}
                        className="text-sm text-zinc-500 hover:text-zinc-300 transition underline-offset-4 hover:underline"
                    >
                        Skip for now, I'll decide later
                    </button>
                </div>
            )}

            {/* Fine Print */}
            <p className="text-center text-xs text-zinc-500 mt-6">
                Cancel anytime. No long-term commitments required.
            </p>
        </div>
    );
}
