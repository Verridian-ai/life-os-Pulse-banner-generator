import React from 'react';
import { Skeleton } from '../ui/Skeleton';

interface DashboardSkeletonProps {
  /** When true, renders the full page layout including header and sidebar */
  fullPage?: boolean;
}

/**
 * Dashboard content skeleton - shows the inner dashboard structure
 */
const DashboardContentSkeleton: React.FC = () => (
  <div className='space-y-10'>
    {/* Welcome Header Skeleton */}
    <div className='relative'>
      <div className='space-y-2'>
        <Skeleton height={40} width='60%' className='max-w-md' />
        <Skeleton height={24} width='40%' className='max-w-xs' />
      </div>
    </div>

    {/* Platforms Section Skeleton */}
    <section>
      <div className='flex items-center gap-3 mb-5'>
        <div className='w-1 h-6 bg-yellow-400/20 rounded-full' />
        <Skeleton width={180} height={24} />
      </div>
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5'>
        {/* 6 Platform Cards */}
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className='aspect-[4/5] rounded-2xl w-full' />
        ))}
      </div>
    </section>

    {/* Recent Designs Section Skeleton */}
    <section>
      <div className='flex items-center justify-between mb-5'>
        <div className='flex items-center gap-3'>
          <div className='w-1 h-6 bg-yellow-400/20 rounded-full' />
          <Skeleton width={150} height={24} />
        </div>
        {/* View All button placeholder */}
        <Skeleton width={80} height={32} className='rounded-lg' />
      </div>

      {/* Recent Designs Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6'>
        {[...Array(4)].map((_, i) => (
          <div key={i} className='space-y-3'>
            {/* Image thumbnail */}
            <Skeleton className='aspect-video w-full rounded-xl' />
            {/* Meta info */}
            <div className='space-y-2'>
              <Skeleton height={16} width='80%' />
              <Skeleton height={14} width='40%' />
            </div>
          </div>
        ))}
      </div>
    </section>
  </div>
);

/**
 * Sidebar navigation skeleton for desktop view
 */
const SidebarSkeleton: React.FC = () => (
  <aside className='hidden lg:flex flex-col w-64 h-[calc(100vh-64px)] fixed left-0 top-16 bg-stone-950/50 border-r border-white/5 p-4'>
    {/* Create New Button Skeleton */}
    <Skeleton height={48} className='w-full rounded-xl mb-6' />

    {/* Navigation Items */}
    <nav className='space-y-1 flex-1'>
      {[60, 45, 55, 50, 65, 48, 52, 58, 42].map((width, i) => (
        <div key={i} className='flex items-center gap-3 px-3 py-2.5'>
          <Skeleton width={20} height={20} className='rounded' />
          <Skeleton height={16} width={`${width}%`} />
        </div>
      ))}
    </nav>
  </aside>
);

/**
 * Header skeleton with logo, search, and user menu placeholders
 */
const HeaderSkeleton: React.FC = () => (
  <header
    className='fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-4 lg:px-8'
    style={{
      background: 'rgba(12, 10, 9, 0.8)',
      backdropFilter: 'blur(20px) saturate(180%)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    }}
  >
    {/* Left: Logo */}
    <div className='flex items-center gap-3'>
      <div className='lg:hidden'>
        <Skeleton width={40} height={40} className='rounded-xl' />
      </div>
      <div className='flex items-center gap-2'>
        <Skeleton width={32} height={32} className='rounded-lg' />
        <Skeleton width={80} height={20} className='hidden sm:block' />
      </div>
    </div>

    {/* Center: Search Bar */}
    <div className='hidden md:flex flex-1 max-w-md mx-8'>
      <Skeleton height={40} className='w-full rounded-xl' />
    </div>

    {/* Right: Voice + User Menu */}
    <div className='flex items-center gap-3'>
      <Skeleton width={44} height={44} className='rounded-full' />
      <Skeleton width={44} height={44} className='rounded-full' />
    </div>
  </header>
);

/**
 * Mobile bottom navigation skeleton
 */
const BottomNavSkeleton: React.FC = () => (
  <nav className='lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-stone-950/95 backdrop-blur-lg border-t border-white/5 z-40'>
    <div className='flex items-center justify-around h-full px-2'>
      {[...Array(5)].map((_, i) => (
        <div key={i} className='flex flex-col items-center gap-1 p-2'>
          <Skeleton width={24} height={24} className='rounded' />
          <Skeleton width={32} height={10} />
        </div>
      ))}
    </div>
  </nav>
);

/**
 * DashboardSkeleton - Content-aware loading skeleton for the dashboard
 *
 * @param fullPage - When true, renders complete page layout including header and sidebar
 *                   Use fullPage=true in App.tsx Suspense fallback
 *                   Use fullPage=false (default) for content-only skeleton
 */
export const DashboardSkeleton: React.FC<DashboardSkeletonProps> = ({ fullPage = false }) => {
  if (!fullPage) {
    return (
      <div aria-busy='true' aria-label='Loading dashboard content'>
        <DashboardContentSkeleton />
      </div>
    );
  }

  // Full page skeleton with AppShell structure
  return (
    <div
      className="min-h-screen bg-stone-950 text-white font-['Space_Grotesk',sans-serif]"
      aria-busy='true'
      aria-label='Loading dashboard'
    >
      {/* Header Skeleton */}
      <HeaderSkeleton />

      {/* Desktop Sidebar Skeleton */}
      <SidebarSkeleton />

      {/* Main Content Area */}
      <main className='pt-16 pb-20 lg:pb-8 lg:pl-64 min-h-screen' id='main-content'>
        <div className='p-4 lg:p-8'>
          <DashboardContentSkeleton />
        </div>
      </main>

      {/* Mobile Bottom Nav Skeleton */}
      <BottomNavSkeleton />
    </div>
  );
};
