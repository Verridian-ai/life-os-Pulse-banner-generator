/**
 * Features Section Component
 *
 * Showcases AI capabilities and key features.
 * Life OS Design: Neumorphic cards with glass effects.
 */

import React from 'react';

const FEATURES = [
  {
    icon: 'auto_awesome',
    title: 'AI-Powered Generation',
    description:
      'Describe your vision in words and watch AI create stunning banner designs instantly. Our multi-model AI selects the best approach for each task.',
    gradient: 'from-purple-500 to-violet-600',
    bgGlow: 'bg-purple-500/20',
  },
  {
    icon: 'mic',
    title: 'Voice Commands',
    description:
      'Control your design hands-free. Speak naturally to generate, edit, and refine your banners with 17+ voice commands.',
    gradient: 'from-pink-500 to-rose-600',
    bgGlow: 'bg-pink-500/20',
  },
  {
    icon: 'auto_fix_high',
    title: 'Smart Editing',
    description:
      'Remove backgrounds, upscale images, enhance faces, and apply magic edits. Professional results without professional software.',
    gradient: 'from-blue-500 to-cyan-600',
    bgGlow: 'bg-blue-500/20',
  },
  {
    icon: 'dashboard_customize',
    title: 'Platform Templates',
    description:
      'Pre-designed templates optimized for each platform. LinkedIn banners, YouTube thumbnails, Instagram stories, and more.',
    gradient: 'from-emerald-500 to-teal-600',
    bgGlow: 'bg-emerald-500/20',
  },
  {
    icon: 'palette',
    title: 'Brand Consistency',
    description:
      'Save your brand colors, fonts, and assets. Apply your brand identity consistently across all designs.',
    gradient: 'from-amber-500 to-orange-600',
    bgGlow: 'bg-amber-500/20',
  },
  {
    icon: 'bolt',
    title: 'Instant Export',
    description:
      'Download in multiple formats and resolutions. Optimized for web, social media, and print with one click.',
    gradient: 'from-indigo-500 to-purple-600',
    bgGlow: 'bg-indigo-500/20',
  },
];

export function FeaturesSection(): React.ReactElement {
  return (
    <section className='relative py-24 sm:py-32 overflow-hidden'>
      {/* Background */}
      <div className='absolute inset-0 bg-zinc-950' />
      <div className='absolute top-1/2 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] -translate-y-1/2' />
      <div className='absolute bottom-0 right-0 w-[300px] h-[300px] bg-pink-600/10 rounded-full blur-[100px]' />

      <div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Section Header */}
        <div className='text-center mb-16'>
          <div className='inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-6 backdrop-blur-sm'>
            <span className='material-icons text-purple-400 text-sm'>star</span>
            <span className='text-sm text-zinc-300'>Powerful Features</span>
          </div>
          <h2 className='text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4'>
            Everything You Need to
            <span className='block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'>
              Create Like a Pro
            </span>
          </h2>
          <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
            Professional design tools powered by cutting-edge AI. No experience required.
          </p>
        </div>

        {/* Features Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8'>
          {FEATURES.map((feature, index) => (
            <div
              key={feature.title}
              className='group relative'
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Glow Effect */}
              <div
                className={`absolute inset-0 ${feature.bgGlow} rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500`}
              />

              {/* Card */}
              <div className='relative h-full bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-white/5 rounded-3xl p-8 backdrop-blur-sm hover:border-white/10 transition-all duration-300 hover:-translate-y-1'>
                {/* Icon */}
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                >
                  <span className='material-icons text-white text-2xl'>{feature.icon}</span>
                </div>

                {/* Content */}
                <h3 className='text-xl font-bold text-white mb-3'>{feature.title}</h3>
                <p className='text-zinc-400 leading-relaxed'>{feature.description}</p>

                {/* Hover Arrow */}
                <div className='mt-6 flex items-center gap-2 text-sm text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity'>
                  <span>Learn more</span>
                  <span className='material-icons text-sm group-hover:translate-x-1 transition-transform'>
                    arrow_forward
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className='text-center mt-16'>
          <p className='text-zinc-500 mb-4'>
            And much more: batch processing, collaboration, API access...
          </p>
          <a
            href='#pricing'
            className='inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium transition'
          >
            <span>View all features</span>
            <span className='material-icons text-lg'>arrow_forward</span>
          </a>
        </div>
      </div>

      {/* Accessibility */}
      <style>{`
                @media (prefers-contrast: more) {
                    .group:hover {
                        outline: 2px solid white;
                    }
                }
                @media (forced-colors: active) {
                    .bg-gradient-to-br {
                        background: Canvas !important;
                        border: 2px solid ButtonText !important;
                    }
                }
            `}</style>
    </section>
  );
}
