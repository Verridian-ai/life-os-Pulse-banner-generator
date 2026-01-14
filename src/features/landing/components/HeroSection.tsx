/**
 * Hero Section Component
 *
 * Main landing page hero with value proposition and CTA.
 * Life OS Design: Glassmorphism with gradient accents.
 */

import React from 'react';

interface HeroSectionProps {
  onGetStarted: () => void;
  onLearnMore: () => void;
}

export function HeroSection({ onGetStarted, onLearnMore }: HeroSectionProps): React.ReactElement {
  return (
    <section className='relative min-h-[90vh] flex items-center justify-center overflow-hidden'>
      {/* Background Effects */}
      <div className='absolute inset-0 bg-zinc-950' />
      <div className='absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse' />
      <div className='absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-pink-600/15 rounded-full blur-[100px] animate-pulse delay-1000' />
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[150px]' />

      {/* Grid Pattern Overlay */}
      <div
        className='absolute inset-0 opacity-[0.03]'
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                     linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />

      {/* Content */}
      <div className='relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
        {/* Badge */}
        <div className='inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8 backdrop-blur-sm'>
          <span className='w-2 h-2 bg-green-400 rounded-full animate-pulse' />
          <span className='text-sm text-zinc-300'>AI-Powered Design Platform</span>
        </div>

        {/* Main Headline */}
        <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight'>
          Create Stunning
          <span className='block bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent'>
            Social Media Banners
          </span>
          <span className='block'>in Seconds</span>
        </h1>

        {/* Subheadline */}
        <p className='text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed'>
          Transform your LinkedIn, YouTube, Instagram, and more with AI-generated professional
          designs. No design skills required.
        </p>

        {/* CTA Buttons */}
        <div className='flex flex-col sm:flex-row items-center justify-center gap-4 mb-12'>
          <button
            onClick={onGetStarted}
            className='group relative w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-2xl hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98]'
          >
            <span className='flex items-center justify-center gap-2'>
              Get Started Free
              <span className='material-icons group-hover:translate-x-1 transition-transform'>
                arrow_forward
              </span>
            </span>
          </button>
          <button
            onClick={onLearnMore}
            className='w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold text-lg rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-sm'
          >
            <span className='flex items-center justify-center gap-2'>
              <span className='material-icons'>play_circle</span>
              See How It Works
            </span>
          </button>
        </div>

        {/* Social Proof */}
        <div className='flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-zinc-500'>
          <div className='flex items-center gap-2'>
            <div className='flex -space-x-2'>
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className='w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-zinc-950 flex items-center justify-center text-white text-xs font-bold'
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <span>Join 10,000+ creators</span>
          </div>
          <div className='hidden sm:block w-px h-4 bg-zinc-700' />
          <div className='flex items-center gap-1'>
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} className='material-icons text-yellow-400 text-lg'>
                star
              </span>
            ))}
            <span className='ml-1'>4.9/5 rating</span>
          </div>
        </div>

        {/* Preview Image/Mockup */}
        <div className='relative mt-16'>
          <div className='absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent z-10 pointer-events-none' />
          <div className='relative bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-white/10 rounded-3xl p-2 sm:p-4 backdrop-blur-xl shadow-2xl shadow-purple-500/10'>
            <div className='bg-zinc-950 rounded-2xl overflow-hidden'>
              {/* Browser Chrome */}
              <div className='flex items-center gap-2 px-4 py-3 bg-zinc-900 border-b border-white/5'>
                <div className='flex gap-1.5'>
                  <div className='w-3 h-3 rounded-full bg-red-500/80' />
                  <div className='w-3 h-3 rounded-full bg-yellow-500/80' />
                  <div className='w-3 h-3 rounded-full bg-green-500/80' />
                </div>
                <div className='flex-1 ml-4'>
                  <div className='max-w-md mx-auto px-4 py-1.5 bg-zinc-800 rounded-lg text-xs text-zinc-400 text-center'>
                    nanobanna.ai/studio
                  </div>
                </div>
              </div>
              {/* App Preview */}
              <div className='aspect-[16/9] bg-gradient-to-br from-zinc-900 to-zinc-950 flex items-center justify-center'>
                <div className='grid grid-cols-3 gap-4 p-8 max-w-4xl'>
                  {/* Sample Banner Cards */}
                  {['LinkedIn', 'YouTube', 'Instagram'].map((platform, i) => (
                    <div
                      key={platform}
                      className='aspect-video bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl border border-white/10 flex items-center justify-center'
                      style={{
                        animationDelay: `${i * 200}ms`,
                      }}
                    >
                      <span className='text-white/40 text-sm font-medium'>{platform}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accessibility: High Contrast Mode */}
      <style>{`
                @media (prefers-contrast: more) {
                    .bg-gradient-to-r {
                        background: #7c3aed !important;
                    }
                }
                @media (forced-colors: active) {
                    button {
                        border: 2px solid ButtonText !important;
                    }
                }
            `}</style>
    </section>
  );
}
