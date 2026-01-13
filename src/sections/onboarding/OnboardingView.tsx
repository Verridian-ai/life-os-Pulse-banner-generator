import React, { useState } from 'react';
import { WelcomeScreen, ProfileSetup, PlatformSelection, ApiSetup } from './components';

type OnboardingStep = 'welcome' | 'profile' | 'platforms' | 'api';

export function OnboardingView() {
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const totalSteps = 4;

  const getStepIndex = () => {
    const steps: OnboardingStep[] = ['welcome', 'profile', 'platforms', 'api'];
    return steps.indexOf(step);
  };

  return (
    <div className="bg-zinc-950 min-h-screen relative overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {step === 'welcome' && (
          <WelcomeScreen onGetStarted={() => setStep('profile')} />
        )}
        {step === 'profile' && (
          <ProfileSetup
            currentStep={getStepIndex()}
            totalSteps={totalSteps}
            onNext={() => setStep('platforms')}
            onBack={() => setStep('welcome')}
          />
        )}
        {step === 'platforms' && (
          <PlatformSelection
            currentStep={getStepIndex()}
            totalSteps={totalSteps}
            onNext={() => setStep('api')}
            onBack={() => setStep('profile')}
          />
        )}
        {step === 'api' && (
          <ApiSetup
            currentStep={getStepIndex()}
            totalSteps={totalSteps}
            onNext={() => console.log('Complete!')}
            onSkip={() => console.log('Skipped!')}
            onBack={() => setStep('platforms')}
          />
        )}
      </div>
    </div>
  );
}

export default OnboardingView;
