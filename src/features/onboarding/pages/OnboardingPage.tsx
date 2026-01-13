/**
 * Onboarding Page
 *
 * Main onboarding flow for new users after signup.
 * Handles plan selection, checkout success/cancel, and welcome flow.
 *
 * Routes:
 * - /onboarding - Plan selection for new users
 * - /onboarding/success - After successful Stripe checkout
 * - /onboarding/cancel - If user cancels checkout
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { PlanSelector } from '../components/PlanSelector';
import { WelcomeModal } from '../components/WelcomeModal';
import { getSubscription, type TierType } from '../../billing/services/billingApi';

type OnboardingStep = 'loading' | 'plan_select' | 'welcome' | 'complete';

interface OnboardingPageProps {
    /** Current URL path segment (e.g., 'success', 'cancel', or undefined) */
    pathSegment?: string;
}

export function OnboardingPage({ pathSegment }: OnboardingPageProps): React.ReactElement {
    const { user, isLoading: authLoading, isAuthenticated } = useAuth();
    const [step, setStep] = useState<OnboardingStep>('loading');
    const [selectedTier, setSelectedTier] = useState<TierType>('free');
    const [credits, setCredits] = useState(100);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Handle checkout result based on path segment
    useEffect(() => {
        if (authLoading) return;

        if (!isAuthenticated) {
            // Redirect to login if not authenticated
            window.location.href = '/';
            return;
        }

        const initOnboarding = async () => {
            try {
                if (pathSegment === 'success') {
                    // User completed checkout - fetch their subscription
                    const subData = await getSubscription();
                    if (subData.subscription) {
                        setSelectedTier(subData.subscription.tier);
                    }
                    setCredits(subData.credits?.balance ?? 100);
                    setStep('welcome');
                } else if (pathSegment === 'cancel') {
                    // User cancelled checkout - back to plan selection
                    setStep('plan_select');
                } else {
                    // Check if user already has a subscription
                    try {
                        const subData = await getSubscription();
                        if (subData.subscription && subData.subscription.status === 'active') {
                            // Already subscribed, show welcome
                            setSelectedTier(subData.subscription.tier);
                            setCredits(subData.credits?.balance ?? 100);
                            setStep('welcome');
                        } else {
                            // New user, show plan selection
                            setStep('plan_select');
                        }
                    } catch {
                        // No subscription, show plan selection
                        setStep('plan_select');
                    }
                }
            } catch (err) {
                console.error('[Onboarding] Error initializing:', err);
                setError('Failed to load onboarding. Please try again.');
                setStep('plan_select');
            }
        };

        initOnboarding();
    }, [authLoading, isAuthenticated, pathSegment]);

    const handleSelectPlan = async (tier: TierType) => {
        setSelectedTier(tier);
        setIsProcessing(true);

        try {
            if (tier === 'free') {
                // Free tier - proceed directly to welcome
                setCredits(100);
                setStep('welcome');
            }
            // For paid tiers, PlanSelector handles the Stripe redirect
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to process plan selection');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSkipPlan = () => {
        // Skip to welcome with free tier
        setSelectedTier('free');
        setCredits(100);
        setStep('welcome');
    };

    const handleGetStarted = () => {
        // Navigate to studio
        window.location.href = '/studio';
    };

    const handleSkipTour = () => {
        // Skip tour and go directly to studio
        window.location.href = '/studio';
    };

    // Get tier display name
    const getTierName = (tier: TierType): string => {
        switch (tier) {
            case 'free':
                return 'Free';
            case 'basic':
                return 'Basic';
            case 'premium':
                return 'Premium';
            default:
                return 'Free';
        }
    };

    // Loading state
    if (step === 'loading' || authLoading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-zinc-400">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950">
            {/* Background Gradient */}
            <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-zinc-950 to-pink-900/20 pointer-events-none" />

            {/* Error Message */}
            {error && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-red-500/20 border border-red-500/30 rounded-xl">
                    <p className="text-red-400">{error}</p>
                    <button
                        onClick={() => setError(null)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-zinc-900 border border-white/10 rounded-full text-zinc-400 hover:text-white flex items-center justify-center"
                    >
                        <span className="material-icons text-sm">close</span>
                    </button>
                </div>
            )}

            {/* Plan Selection Step */}
            {step === 'plan_select' && (
                <div className="relative min-h-screen flex items-center justify-center py-12 px-4">
                    <PlanSelector
                        onSelectPlan={handleSelectPlan}
                        onSkip={handleSkipPlan}
                        isLoading={isProcessing}
                    />
                </div>
            )}

            {/* Welcome Modal Step */}
            {step === 'welcome' && (
                <WelcomeModal
                    userName={user?.first_name || user?.username || undefined}
                    tierName={getTierName(selectedTier)}
                    credits={credits}
                    onGetStarted={handleGetStarted}
                    onSkipTour={handleSkipTour}
                />
            )}
        </div>
    );
}
