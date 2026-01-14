/**
 * Landing Page
 *
 * Main marketing landing page for Nanobanna.
 * Assembles all landing sections into a cohesive page.
 *
 * Life OS Design System:
 * - Neumorphism + Glassmorphism hybrid
 * - Mobile-first responsive
 * - WCAG 2.1 AA compliant
 */

import React, { useEffect } from 'react';
import { HeroSection } from '../components/HeroSection';
import { FeaturesSection } from '../components/FeaturesSection';
import { PlatformsSection } from '../components/PlatformsSection';
import { PricingSection } from '../components/PricingSection';
import { FAQSection } from '../components/FAQSection';
import { Footer } from '../components/Footer';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export function LandingPage({ onGetStarted, onSignIn }: LandingPageProps): React.ReactElement {
  // Smooth scroll for anchor links
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLAnchorElement;
      if (target.tagName === 'A' && target.hash) {
        const element = document.querySelector(target.hash);
        if (element) {
          e.preventDefault();
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  const handleLearnMore = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectPlatform = (platformId: string) => {
    // Store selected platform and redirect to signup
    sessionStorage.setItem('selectedPlatform', platformId);
    onGetStarted();
  };

  const handleSelectPlan = (planId: string) => {
    // Store selected plan and redirect to signup
    sessionStorage.setItem('selectedPlan', planId);
    onGetStarted();
  };

  return (
    <div className='min-h-screen bg-zinc-950 text-white'>
      {/* Navigation Header */}
      <header className='fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5'>
        <nav className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            {/* Logo */}
            <a href='/' className='flex items-center gap-2'>
              <div className='w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center'>
                <span className='text-white font-black text-sm'>N</span>
              </div>
              <span className='text-lg font-black text-white hidden sm:inline'>Nanobanna</span>
            </a>

            {/* Nav Links - Desktop */}
            <div className='hidden md:flex items-center gap-8'>
              <a href='#features' className='text-sm text-zinc-400 hover:text-white transition'>
                Features
              </a>
              <a href='#platforms' className='text-sm text-zinc-400 hover:text-white transition'>
                Platforms
              </a>
              <a href='#pricing' className='text-sm text-zinc-400 hover:text-white transition'>
                Pricing
              </a>
              <a href='#faq' className='text-sm text-zinc-400 hover:text-white transition'>
                FAQ
              </a>
            </div>

            {/* Auth Buttons */}
            <div className='flex items-center gap-3'>
              <button
                onClick={onSignIn}
                className='px-4 py-2 text-sm text-zinc-300 hover:text-white transition'
              >
                Sign In
              </button>
              <button
                onClick={onGetStarted}
                className='px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all'
              >
                Get Started
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <HeroSection onGetStarted={onGetStarted} onLearnMore={handleLearnMore} />

        {/* Features Section */}
        <div id='features'>
          <FeaturesSection />
        </div>

        {/* Platforms Section */}
        <PlatformsSection onSelectPlatform={handleSelectPlatform} />

        {/* Pricing Section */}
        <PricingSection onSelectPlan={handleSelectPlan} />

        {/* FAQ Section */}
        <FAQSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Skip to main content link for accessibility */}
      <a
        href='#features'
        className='sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-lg'
      >
        Skip to main content
      </a>

      {/* Accessibility styles */}
      <style>{`
                @media (prefers-reduced-motion: reduce) {
                    * {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                    }
                }
                @media (prefers-contrast: more) {
                    .bg-zinc-950 {
                        background: black !important;
                    }
                    .text-zinc-400 {
                        color: #a1a1aa !important;
                    }
                }
                @media (forced-colors: active) {
                    header {
                        background: Canvas !important;
                        border-bottom: 1px solid ButtonText !important;
                    }
                }
            `}</style>
    </div>
  );
}
