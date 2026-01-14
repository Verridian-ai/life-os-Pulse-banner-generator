import React from 'react';
import {
  RefreshCw,
  ArrowLeft,
  Linkedin,
  Youtube,
  Instagram,
  Facebook,
  Twitter,
  Music2,
} from 'lucide-react';
import type { PlatformType } from '../dashboard';
import { formatTooltip } from '../../utils/stringUtils';

// Platform display config
const platformDisplay: Record<
  PlatformType,
  { name: string; icon: React.ElementType; color: string }
> = {
  linkedin: { name: 'LinkedIn', icon: Linkedin, color: 'text-[#0077b5]' },
  youtube: { name: 'YouTube', icon: Youtube, color: 'text-red-500' },
  instagram: { name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
  facebook: { name: 'Facebook', icon: Facebook, color: 'text-blue-500' },
  tiktok: { name: 'TikTok', icon: Music2, color: 'text-white' },
  x: { name: 'X', icon: Twitter, color: 'text-white' },
};

interface HeaderProps {
  onRefresh?: () => void;
  isRefreshLoading?: boolean;
  onBackToDashboard?: () => void;
  activePlatform?: PlatformType;
}

const Header: React.FC<HeaderProps> = React.memo(
  ({ onRefresh, isRefreshLoading = false, onBackToDashboard, activePlatform }) => {
    return (
      <header className='flex flex-col md:flex-row items-center justify-between px-3 py-2 md:px-8 md:py-2 bg-black/60 backdrop-blur-xl sticky top-0 z-50 border-b border-white/5 gap-1.5 md:gap-4 overflow-visible'>
        {/* Left: Logo Area / Back Button */}
        <div className='flex items-center justify-between w-full md:w-auto md:justify-start'>
          <div className='flex items-center gap-2 md:gap-3 relative'>
            {/* Back to Dashboard Button (when in studio) */}
            {onBackToDashboard && (
              <button
                type='button'
                onClick={onBackToDashboard}
                className='min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition mr-2'
                title='Back to Dashboard'
                aria-label='Back to dashboard'
              >
                <ArrowLeft className='w-5 h-5' />
              </button>
            )}

            {/* Platform Indicator (when in studio) */}
            {activePlatform && platformDisplay[activePlatform] && (
              <div className='flex items-center gap-2 px-3 py-1.5 bg-zinc-900/50 border border-white/5 rounded-xl'>
                {React.createElement(platformDisplay[activePlatform].icon, {
                  className: `w-5 h-5 ${platformDisplay[activePlatform].color}`,
                })}
                <span className='text-sm font-bold text-white hidden sm:block'>
                  {platformDisplay[activePlatform].name} Studio
                </span>
              </div>
            )}

            {/* Logo (show only when not in studio) */}
            {!onBackToDashboard && (
              <img
                src='/assets/logo.svg'
                alt='Life OS Logo'
                className='h-12 w-12 md:h-16 md:w-16 lg:h-24 lg:w-24 object-contain -my-2 md:-my-4 lg:-my-6 drop-shadow-2xl relative z-10'
              />
            )}
          </div>
        </div>

        {/* Center: Title (Flex-1 for natural spacing away from larger right nav) */}
        <div className='w-full md:flex-1 text-center mt-1 md:mt-0 md:px-2 lg:px-4'></div>

        {/* Right: Minimal controls */}
        <div className='flex items-center gap-2'>
          {/* Refresh Button (only when in studio) */}
          {onRefresh && (
            <button
              type='button'
              onClick={onRefresh}
              disabled={isRefreshLoading}
              className='min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition disabled:opacity-50 disabled:cursor-not-allowed'
              title={formatTooltip('Refresh', 'Ctrl+R')}
              aria-label={isRefreshLoading ? 'Refreshing...' : 'Refresh'}
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </header>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function to optimize re-renders
    return (
      prevProps.activePlatform === nextProps.activePlatform &&
      prevProps.onBackToDashboard === nextProps.onBackToDashboard &&
      prevProps.isRefreshLoading === nextProps.isRefreshLoading
    );
  },
);

export default Header;
