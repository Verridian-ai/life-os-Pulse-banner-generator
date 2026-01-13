import React from 'react';
import { PlatformCard, RecentDesignCard, EmptyState, LiveFeaturesSection } from './components';
import type { Platform, Design } from './components';

// Platform data with enhanced descriptions
const platforms: Platform[] = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Professional content & thought leadership',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Thumbnails, titles & video optimization',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Stories, reels & carousel posts',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    description: 'Posts, covers & ad creatives',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Viral hooks & trending content',
  },
  {
    id: 'x',
    name: 'X (Twitter)',
    description: 'Threads, posts & engagement',
  },
];

// Sample recent designs
const recentDesigns: Design[] = [
  {
    id: '1',
    title: 'Q1 Results Announcement',
    platform: 'linkedin',
    thumbnailUrl: '',
    updatedAt: '2 hours ago',
  },
  {
    id: '2',
    title: 'Product Launch Thumbnail',
    platform: 'youtube',
    thumbnailUrl: '',
    updatedAt: 'Yesterday',
  },
  {
    id: '3',
    title: 'Summer Campaign',
    platform: 'instagram',
    thumbnailUrl: '',
    updatedAt: '3 days ago',
  },
];

// Neumorphic + Glass styling utilities
const glassStyles = {
  card: 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]',
  neumorphicRaised: 'shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.05)]',
};

interface DashboardViewProps {
  userName?: string;
}

export function DashboardView({ userName = 'there' }: DashboardViewProps) {
  const handlePlatformClick = (platformId: string) => {
    console.log('Navigate to studio:', platformId);
  };

  const handleDesignClick = (designId: string) => {
    console.log('Open design:', designId);
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-6 lg:p-8 relative overflow-hidden">
      {/* Background ambient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:50px_50px]"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Welcome Section with Glass Card */}
        <div className={`${glassStyles.card} rounded-3xl p-6 md:p-8 mb-8`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white font-['Space_Grotesk']">
                Welcome back, {userName}
              </h1>
              <p className="text-zinc-400 mt-1">
                What would you like to create today?
              </p>
            </div>

            {/* Quick stats */}
            <div className="flex gap-4">
              <div className={`
                px-4 py-2 rounded-xl
                bg-white/5 border border-white/10
                ${glassStyles.neumorphicRaised}
              `}>
                <p className="text-xs text-zinc-500">This week</p>
                <p className="text-lg font-semibold text-white">12 designs</p>
              </div>
              <div className={`
                px-4 py-2 rounded-xl
                bg-white/5 border border-white/10
                ${glassStyles.neumorphicRaised}
              `}>
                <p className="text-xs text-zinc-500">AI Credits</p>
                <p className="text-lg font-semibold text-sky-400">847</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Platform Cards + Recent Designs */}
          <div className="lg:col-span-3 space-y-8">
            {/* Platform Cards */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white font-['Space_Grotesk']">
                  Choose a platform
                </h2>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-xs text-green-400">All studios live</span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {platforms.map((platform) => (
                  <PlatformCard
                    key={platform.id}
                    platform={platform}
                    onClick={handlePlatformClick}
                  />
                ))}
              </div>
            </section>

            {/* Recent Designs */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white font-['Space_Grotesk']">
                  Recent designs
                </h2>
                <button className={`
                  px-4 py-2 rounded-xl text-sm
                  bg-white/5 border border-white/10
                  text-sky-400 hover:bg-white/10
                  transition-colors
                `}>
                  View all
                </button>
              </div>

              {recentDesigns.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentDesigns.map((design) => (
                    <RecentDesignCard
                      key={design.id}
                      design={design}
                      onClick={handleDesignClick}
                      onDelete={(id) => console.log('Delete:', id)}
                      onDuplicate={(id) => console.log('Duplicate:', id)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No designs yet"
                  description="Create your first design by selecting a platform above."
                  actionLabel="Create design"
                  onAction={() => console.log('Create design')}
                />
              )}
            </section>
          </div>

          {/* Right Column - Live Features & Quick Actions */}
          <div className="space-y-6">
            {/* Live Features */}
            <LiveFeaturesSection />

            {/* Quick Actions */}
            <div className={`${glassStyles.card} rounded-2xl p-4`}>
              <h3 className="text-sm font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className={`
                  w-full flex items-center gap-3 p-3 rounded-xl
                  bg-gradient-to-r from-sky-500/20 to-teal-500/20
                  border border-sky-500/30
                  hover:from-sky-500/30 hover:to-teal-500/30
                  transition-all group
                `}>
                  <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-sm text-white">Quick Generate</span>
                  <svg className="w-4 h-4 text-zinc-500 ml-auto group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button className={`
                  w-full flex items-center gap-3 p-3 rounded-xl
                  bg-white/5 border border-white/10
                  hover:bg-white/10 transition-colors group
                `}>
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                  </div>
                  <span className="text-sm text-white">Templates</span>
                  <svg className="w-4 h-4 text-zinc-500 ml-auto group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button className={`
                  w-full flex items-center gap-3 p-3 rounded-xl
                  bg-white/5 border border-white/10
                  hover:bg-white/10 transition-colors group
                `}>
                  <div className="w-8 h-8 rounded-lg bg-yellow-400/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <span className="text-sm text-white">Brand Kit</span>
                  <svg className="w-4 h-4 text-zinc-500 ml-auto group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Upgrade Card */}
            <div className={`
              ${glassStyles.card} rounded-2xl p-4
              bg-gradient-to-br from-sky-500/10 to-teal-500/10
              border-sky-500/20
            `}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Pro Plan</p>
                  <p className="text-xs text-zinc-400">Unlock all AI features</p>
                </div>
              </div>
              <button className={`
                w-full py-2 rounded-xl
                bg-white/10 border border-white/20
                text-sm text-white font-medium
                hover:bg-white/20 transition-colors
              `}>
                Upgrade
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions FAB (Mobile) */}
        <button className={`
          md:hidden fixed bottom-20 right-4 w-14 h-14
          bg-gradient-to-r from-sky-500 to-teal-500
          rounded-full
          shadow-lg shadow-sky-500/25
          flex items-center justify-center text-white
          hover:shadow-xl hover:shadow-sky-500/30
          transition-all
        `}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default DashboardView;
