/**
 * OnboardingWelcome
 *
 * Welcome step for onboarding - introduces the user to the platform.
 */

import React from 'react';

type OnboardingWelcomeProps = {
  onNext: () => void;
  onSkip: () => void;
};

export function OnboardingWelcome({ onNext, onSkip }: OnboardingWelcomeProps): React.ReactElement {
  return (
    <div className='w-full max-w-2xl mx-auto px-4'>
      {/* Glass Card Container */}
      <div className='relative bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-glass'>
        {/* Inner glow effect */}
        <div className='absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none' />

        <div className='relative z-10 text-center'>
          {/* Welcome Icon */}
          <div className='w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/20'>
            <span className='material-icons text-4xl text-cyan-400'>auto_awesome</span>
          </div>

          {/* Title */}
          <h1 className='text-3xl md:text-4xl font-bold text-white mb-4'>
            Welcome to{' '}
            <span className='bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent'>
              VOX
            </span>
          </h1>

          {/* Subtitle */}
          <p className='text-lg text-zinc-400 mb-8 max-w-md mx-auto'>
            Create stunning social media graphics in minutes with AI-powered design tools.
          </p>

          {/* Features preview */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-10'>
            {[
              { icon: 'palette', title: 'AI Design', desc: 'Generate beautiful banners' },
              { icon: 'bolt', title: 'Instant Export', desc: 'Perfect dimensions' },
              { icon: 'groups', title: 'Multi-Platform', desc: 'LinkedIn, Twitter & more' },
            ].map((feature) => (
              <div
                key={feature.title}
                className='p-4 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-500/20 transition-colors'
              >
                <span className='material-icons text-2xl text-cyan-400 mb-2'>{feature.icon}</span>
                <h3 className='text-sm font-semibold text-white mb-1'>{feature.title}</h3>
                <p className='text-xs text-zinc-500'>{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
            <button
              onClick={onNext}
              className='w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30'
            >
              Get Started
            </button>
            <button
              onClick={onSkip}
              className='text-sm text-zinc-500 hover:text-zinc-300 transition-colors'
            >
              Skip introduction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
