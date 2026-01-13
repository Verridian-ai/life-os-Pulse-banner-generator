/**
 * Welcome Modal Component
 *
 * Displays a welcome message after successful signup/checkout.
 * Shows quick start tips and guides users to the studio.
 */

import React, { useState } from 'react';

interface WelcomeModalProps {
    userName?: string;
    tierName?: string;
    credits?: number;
    onGetStarted: () => void;
    onSkipTour?: () => void;
}

const QUICK_START_STEPS = [
    {
        icon: 'auto_awesome',
        title: 'Generate Your First Banner',
        description: 'Use AI to create stunning LinkedIn banners in seconds',
    },
    {
        icon: 'tune',
        title: 'Customize & Edit',
        description: 'Fine-tune colors, text, and layouts to match your brand',
    },
    {
        icon: 'mic',
        title: 'Voice Commands',
        description: 'Control the editor hands-free with voice commands',
    },
    {
        icon: 'download',
        title: 'Export & Share',
        description: 'Download in multiple formats and update your profile',
    },
];

export function WelcomeModal({
    userName,
    tierName = 'Free',
    credits = 100,
    onGetStarted,
    onSkipTour,
}: WelcomeModalProps): React.ReactElement {
    const [currentStep, setCurrentStep] = useState(0);
    const [showSteps, setShowSteps] = useState(false);

    const handleContinue = () => {
        if (!showSteps) {
            setShowSteps(true);
            return;
        }

        if (currentStep < QUICK_START_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onGetStarted();
        }
    };

    const handleSkip = () => {
        if (onSkipTour) {
            onSkipTour();
        } else {
            onGetStarted();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-lg mx-4 bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-pink-600/20 pointer-events-none" />

                {/* Content */}
                <div className="relative p-8">
                    {!showSteps ? (
                        /* Welcome Screen */
                        <>
                            {/* Celebration Icon */}
                            <div className="flex justify-center mb-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
                                    <span className="material-icons text-white text-4xl">
                                        celebration
                                    </span>
                                </div>
                            </div>

                            {/* Welcome Message */}
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-white mb-2">
                                    Welcome{userName ? `, ${userName}` : ''}!
                                </h2>
                                <p className="text-zinc-400 text-lg">
                                    You're all set to create amazing banners
                                </p>
                            </div>

                            {/* Plan Info */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-zinc-400">Your Plan</p>
                                        <p className="text-xl font-bold text-white">{tierName}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-zinc-400">Credits Available</p>
                                        <p className="text-xl font-bold text-purple-400">
                                            {credits.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* CTA Buttons */}
                            <div className="space-y-3">
                                <button
                                    onClick={handleContinue}
                                    className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
                                >
                                    Quick Start Guide
                                </button>
                                <button
                                    onClick={handleSkip}
                                    className="w-full py-3 px-6 text-zinc-400 hover:text-white text-sm transition"
                                >
                                    Skip tour and go to Studio
                                </button>
                            </div>
                        </>
                    ) : (
                        /* Quick Start Steps */
                        <>
                            {/* Progress Dots */}
                            <div className="flex justify-center gap-2 mb-8">
                                {QUICK_START_STEPS.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`w-2 h-2 rounded-full transition-all ${
                                            index === currentStep
                                                ? 'w-6 bg-purple-500'
                                                : index < currentStep
                                                  ? 'bg-purple-500/50'
                                                  : 'bg-white/20'
                                        }`}
                                    />
                                ))}
                            </div>

                            {/* Step Content */}
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <span className="material-icons text-purple-400 text-3xl">
                                        {QUICK_START_STEPS[currentStep].icon}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">
                                    {QUICK_START_STEPS[currentStep].title}
                                </h3>
                                <p className="text-zinc-400 text-lg">
                                    {QUICK_START_STEPS[currentStep].description}
                                </p>
                            </div>

                            {/* Step Number */}
                            <p className="text-center text-sm text-zinc-500 mb-6">
                                Step {currentStep + 1} of {QUICK_START_STEPS.length}
                            </p>

                            {/* Navigation */}
                            <div className="flex gap-3">
                                {currentStep > 0 && (
                                    <button
                                        onClick={() => setCurrentStep(currentStep - 1)}
                                        className="flex-1 py-3 px-6 bg-zinc-800 text-white font-medium rounded-xl hover:bg-zinc-700 transition"
                                    >
                                        Back
                                    </button>
                                )}
                                <button
                                    onClick={handleContinue}
                                    className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
                                >
                                    {currentStep === QUICK_START_STEPS.length - 1
                                        ? 'Go to Studio'
                                        : 'Next'}
                                </button>
                            </div>

                            {/* Skip Link */}
                            <button
                                onClick={handleSkip}
                                className="w-full mt-4 py-2 text-zinc-500 hover:text-zinc-300 text-sm transition"
                            >
                                Skip tutorial
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
