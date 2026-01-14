/**
 * Onboarding Page
 *
 * Multi-step onboarding flow orchestrator for new users after signup.
 * Implements a state machine for step navigation with data collection.
 *
 * Steps:
 * 1. Welcome - Introduction and overview
 * 2. Profile - Basic profile information
 * 3. Platforms - Social media platform selection
 * 4. API Keys - Optional AI service configuration
 * 5. First Design - Template selection to start creating
 *
 * Routes:
 * - /onboarding - Multi-step flow for new users
 * - /onboarding/success - After successful Stripe checkout (legacy support)
 * - /onboarding/cancel - If user cancels checkout (legacy support)
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { AnimatePresence, motion } from 'framer-motion';

import { useAuth } from '../../../context/AuthContext';
import {
  ProgressIndicator,
  OnboardingWelcome,
  ProfileSetupStep,
  PlatformSelectionStep,
  FirstDesignStep,
  PlanSelector,
  WelcomeModal,
} from '../components';
import { getSubscription, type TierType } from '../../billing/services/billingApi';
import type { ProfileFormData, PlatformType, ApiKeysFormData, DesignTemplate } from '../types';

/**
 * Onboarding step identifiers
 */
type OnboardingStep = 'welcome' | 'profile' | 'platforms' | 'firstDesign' | 'complete';

/**
 * Legacy step identifiers for backward compatibility
 */
type LegacyStep = 'loading' | 'plan_select' | 'legacy_welcome';

/**
 * Combined step type
 */
type PageStep = OnboardingStep | LegacyStep;

/**
 * Onboarding steps configuration
 */
const ONBOARDING_STEPS: OnboardingStep[] = ['welcome', 'profile', 'platforms', 'firstDesign'];

/**
 * Step labels for progress indicator
 */
const STEP_LABELS: string[] = ['Welcome', 'Profile', 'Platforms', 'Design'];

/**
 * Collected onboarding data from all steps
 */
type OnboardingData = {
  profile?: ProfileFormData;
  platforms?: PlatformType[];
  selectedTemplate?: string | null;
};

type OnboardingPageProps = {
  /** Current URL path segment (e.g., 'success', 'cancel', or undefined) */
  pathSegment?: string;
};

/**
 * Animation variants for step transitions
 */
const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
};

export function OnboardingPage({ pathSegment }: OnboardingPageProps): React.ReactElement {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, isAuthenticated, markOnboardingComplete } = useAuth();

  // Current step state
  const [currentStep, setCurrentStep] = useState<PageStep>('loading');
  const [stepDirection, setStepDirection] = useState(1); // 1 = forward, -1 = backward

  // Legacy support state
  const [selectedTier, setSelectedTier] = useState<TierType>('free');
  const [credits, setCredits] = useState(100);
  const [isProcessing, setIsProcessing] = useState(false);

  // Collected data state
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Current step index for progress indicator
  const currentStepIndex = useMemo(() => {
    const index = ONBOARDING_STEPS.indexOf(currentStep as OnboardingStep);
    return index >= 0 ? index : 0;
  }, [currentStep]);

  /**
   * Initialize onboarding flow based on path segment (legacy support)
   */
  useEffect(() => {
    console.log('[OnboardingPage] useEffect triggered');
    console.log('[OnboardingPage] authLoading:', authLoading);
    console.log('[OnboardingPage] isAuthenticated:', isAuthenticated);
    console.log('[OnboardingPage] URL params:', window.location.search);

    if (authLoading) {
      console.log('[OnboardingPage] Still loading auth, waiting...');
      return;
    }

    if (!isAuthenticated) {
      console.log('[OnboardingPage] Not authenticated, redirecting to /');
      navigate('/', { replace: true });
      return;
    }

    console.log('[OnboardingPage] Authenticated, proceeding with onboarding init');

    const initOnboarding = async (): Promise<void> => {
      try {
        if (pathSegment === 'success') {
          // User completed checkout - fetch their subscription (legacy flow)
          const subData = await getSubscription();
          if (subData.subscription) {
            setSelectedTier(subData.subscription.tier);
          }
          setCredits(subData.credits?.balance ?? 100);
          setCurrentStep('legacy_welcome');
        } else if (pathSegment === 'cancel') {
          // User cancelled checkout - back to plan selection (legacy flow)
          setCurrentStep('plan_select');
        } else {
          // New user - start multi-step onboarding
          try {
            const subData = await getSubscription();
            if (subData.subscription && subData.subscription.status === 'active') {
              // Already subscribed, start with welcome step
              setSelectedTier(subData.subscription.tier);
              setCredits(subData.credits?.balance ?? 100);
            }
          } catch {
            // No subscription, that's fine
          }
          // Start the new multi-step flow
          setCurrentStep('welcome');
        }
      } catch (err) {
        console.error('[Onboarding] Error initializing:', err);
        setError('Failed to load onboarding. Please try again.');
        setCurrentStep('welcome');
      }
    };

    initOnboarding();
  }, [authLoading, isAuthenticated, pathSegment]);

  /**
   * Navigate to the next step
   */
  const handleNext = useCallback(() => {
    const currentIndex = ONBOARDING_STEPS.indexOf(currentStep as OnboardingStep);
    if (currentIndex < ONBOARDING_STEPS.length - 1) {
      setStepDirection(1);
      setCurrentStep(ONBOARDING_STEPS[currentIndex + 1]);
    } else {
      // Last step completed - finish onboarding
      handleComplete();
    }
  }, [currentStep]);

  /**
   * Navigate to the previous step
   */
  const handleBack = useCallback(() => {
    const currentIndex = ONBOARDING_STEPS.indexOf(currentStep as OnboardingStep);
    if (currentIndex > 0) {
      setStepDirection(-1);
      setCurrentStep(ONBOARDING_STEPS[currentIndex - 1]);
    }
  }, [currentStep]);

  /**
   * Skip current step and move to next
   */
  const handleSkip = useCallback(() => {
    handleNext();
  }, [handleNext]);

  /**
   * Skip all remaining steps and go to dashboard
   */
  const handleSkipAll = useCallback(async () => {
    try {
      await completeOnboarding();
    } catch (err) {
      console.error('[Onboarding] Error skipping:', err);
      setError('Failed to complete onboarding. Please try again.');
    }
  }, []);

  /**
   * Complete onboarding and save data
   */
  const completeOnboarding = useCallback(async (): Promise<void> => {
    try {
      // Save onboarding data to backend
      const response = await fetch('/api/users/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          onboardingCompleted: true,
          onboardingStep: 'complete',
          preferredPlatforms: onboardingData.platforms,
          profile: onboardingData.profile,
        }),
      });

      if (!response.ok) {
        console.warn('[Onboarding] API save failed, continuing anyway');
      }
    } catch (err) {
      console.warn('[Onboarding] Failed to save data to API:', err);
    }

    // Mark onboarding as complete in auth context
    await markOnboardingComplete();

    // Navigate to dashboard using client-side routing to preserve auth state
    navigate('/dashboard');
  }, [onboardingData, markOnboardingComplete, navigate]);

  /**
   * Handle final step completion
   */
  const handleComplete = useCallback(async () => {
    setCurrentStep('complete');
    await completeOnboarding();
  }, [completeOnboarding]);

  /**
   * Handle profile data update
   */
  const handleProfileChange = useCallback((profile: ProfileFormData) => {
    setOnboardingData((prev) => ({ ...prev, profile }));
  }, []);

  /**
   * Handle platforms selection update
   */
  const handlePlatformsChange = useCallback((platforms: PlatformType[]) => {
    setOnboardingData((prev) => ({ ...prev, platforms }));
  }, []);



  /**
   * Handle template selection
   */
  const handleTemplateSelect = useCallback((template: DesignTemplate | null) => {
    setOnboardingData((prev) => ({
      ...prev,
      selectedTemplate: template?.id ?? null,
    }));
  }, []);

  // ============================================
  // Legacy handlers (for backward compatibility)
  // ============================================

  const handleSelectPlan = async (tier: TierType): Promise<void> => {
    setSelectedTier(tier);
    setIsProcessing(true);

    try {
      if (tier === 'free') {
        setCredits(100);
        setCurrentStep('legacy_welcome');
      }
      // For paid tiers, PlanSelector handles the Stripe redirect
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process plan selection');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkipPlan = (): void => {
    setSelectedTier('free');
    setCredits(100);
    setCurrentStep('legacy_welcome');
  };

  const handleLegacyGetStarted = async (): Promise<void> => {
    await markOnboardingComplete();
    navigate('/studio');
  };

  const handleLegacySkipTour = async (): Promise<void> => {
    await markOnboardingComplete();
    navigate('/studio');
  };

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

  // ============================================
  // Render helpers
  // ============================================

  /**
   * Check if we're on a main onboarding step (not legacy)
   */
  const isMainOnboardingStep = ONBOARDING_STEPS.includes(currentStep as OnboardingStep);

  /**
   * Render the current step component
   */
  const renderStep = (): React.ReactNode => {
    switch (currentStep) {
      case 'welcome':
        return (
          <OnboardingWelcome
            onNext={handleNext}
            onSkip={handleSkip}
          />
        );

      case 'profile':
        return (
          <ProfileSetupStep
            onNext={handleNext}
            onSkip={handleSkip}
            onBack={handleBack}
            onProfileChange={handleProfileChange}
            initialData={onboardingData.profile}
          />
        );

      case 'platforms':
        return (
          <PlatformSelectionStep
            onNext={handleNext}
            onSkip={handleSkip}
            onBack={handleBack}
            onPlatformsChange={handlePlatformsChange}
            initialPlatforms={onboardingData.platforms}
          />
        );



      case 'firstDesign':
        return (
          <FirstDesignStep
            onNext={handleComplete}
            onSkip={handleComplete}
            onBack={handleBack}
            onTemplateSelect={handleTemplateSelect}
            initialTemplate={onboardingData.selectedTemplate}
          />
        );

      default:
        return null;
    }
  };

  // ============================================
  // Loading state
  // ============================================

  if (currentStep === 'loading' || authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // Completion state (brief loading while redirecting)
  // ============================================

  if (currentStep === 'complete') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="material-icons text-green-400 text-3xl">check</span>
          </div>
          <p className="text-white text-lg font-semibold mb-2">You're all set!</p>
          <p className="text-zinc-400">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // Main render
  // ============================================

  return (
    <div className="min-h-screen bg-zinc-950 overflow-hidden relative">
      {/* Global Background Gradient Orbs - VOX Premium Depth System */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Cyan orb - top left */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px] motion-reduce:blur-[60px] animate-pulse-slow" />
        {/* Blue orb - top right */}
        <div className="absolute top-10 right-[-10%] w-[400px] h-[400px] bg-blue-600/15 rounded-full blur-[100px] motion-reduce:blur-[50px]" />
        {/* Red/Orange orb - bottom center */}
        <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-red-500/10 to-orange-500/10 rounded-full blur-[120px] motion-reduce:blur-[60px]" />
      </div>

      {/* Noise Texture Overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[1] opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Error Message */}
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-xl shadow-lg">
          <p className="text-red-400 text-sm font-medium">{error}</p>
          <button
            onClick={() => setError(null)}
            className="absolute -top-2 -right-2 w-6 h-6 bg-zinc-900 border border-white/10 rounded-full text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Dismiss error"
          >
            <span className="material-icons text-sm">close</span>
          </button>
        </div>
      )}

      {/* Legacy: Plan Selection Step */}
      {currentStep === 'plan_select' && (
        <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4">
          <PlanSelector
            onSelectPlan={handleSelectPlan}
            onSkip={handleSkipPlan}
            isLoading={isProcessing}
          />
        </div>
      )}

      {/* Legacy: Welcome Modal Step */}
      {currentStep === 'legacy_welcome' && (
        <WelcomeModal
          userName={user?.first_name || user?.username || undefined}
          tierName={getTierName(selectedTier)}
          credits={credits}
          onGetStarted={handleLegacyGetStarted}
          onSkipTour={handleLegacySkipTour}
        />
      )}

      {/* Main Onboarding Flow */}
      {isMainOnboardingStep && (
        <div className="relative z-10 min-h-screen flex flex-col py-8 px-4">
          {/* Header with Progress Indicator */}
          <header className="w-full max-w-2xl mx-auto mb-10">
            <div className="flex items-center justify-between mb-8">
              {/* VOX Logo */}
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <img
                  src="/assets/vox-logo.png"
                  alt="VOX"
                  className="relative h-12 w-auto object-contain drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                />
              </div>

              {/* Skip all button - Premium Glass Pill */}
              <button
                onClick={handleSkipAll}
                className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-zinc-400 hover:text-white text-xs font-medium transition-all backdrop-blur-md"
              >
                Skip Setup
              </button>
            </div>

            {/* Progress Indicator - Enhanced Wrapper */}
            <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-4 shadow-glass-sm">
              <ProgressIndicator
                currentStep={currentStepIndex}
                totalSteps={ONBOARDING_STEPS.length}
                stepLabels={STEP_LABELS}
              />
            </div>
          </header>

          {/* Step Content with Animation */}
          <main className="flex-1 flex items-center justify-center">
            <AnimatePresence mode="wait" custom={stepDirection}>
              <motion.div
                key={currentStep}
                custom={stepDirection}
                variants={prefersReducedMotion ? {} : stepVariants}
                initial={prefersReducedMotion ? {} : 'enter'}
                animate={prefersReducedMotion ? {} : 'center'}
                exit={prefersReducedMotion ? {} : 'exit'}
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="w-full"
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Footer */}
          <footer className="w-full max-w-2xl mx-auto mt-8 text-center pb-4">
            <p className="text-xs text-zinc-600">
              By continuing, you agree to our{' '}
              <a href="/terms" className="text-zinc-500 hover:text-cyan-400 transition-colors underline decoration-zinc-800 hover:decoration-cyan-400/50">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-zinc-500 hover:text-cyan-400 transition-colors underline decoration-zinc-800 hover:decoration-cyan-400/50">
                Privacy Policy
              </a>
            </p>
          </footer>
        </div>
      )}

      {/* Accessibility: Reduced Motion Styles */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
