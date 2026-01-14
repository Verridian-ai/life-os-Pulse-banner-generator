import React from 'react';
import { StudioMode, STUDIO_SUB_TABS } from '../../constants';

interface StudioSubNavProps {
  currentMode: StudioMode;
  onModeChange: (mode: StudioMode) => void;
}

/**
 * StudioSubNav - Specialized sub-navigation for switching between Studio modes
 * (Canvas, Posts, Media). Utilizes Glassmorphism and premium interactive states.
 */
export const StudioSubNav: React.FC<StudioSubNavProps> = ({ currentMode, onModeChange }) => {
  return (
    <div className='flex items-center justify-center py-6 px-4'>
      <div className='bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 flex gap-1 shadow-[0_20px_50px_rgba(0,0,0,0.5)]'>
        {STUDIO_SUB_TABS.map((tab) => {
          const isActive = currentMode === tab.mode;
          return (
            <button
              key={tab.mode}
              onClick={() => onModeChange(tab.mode)}
              title={tab.description}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 relative group
                ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] scale-[1.02]'
                    : 'text-zinc-500 hover:text-white hover:bg-white/5'
                }
              `}
              type='button'
              aria-current={isActive ? 'page' : undefined}
            >
              <span className='material-icons text-sm'>{tab.icon}</span>
              <span className='text-[10px] font-black uppercase tracking-widest leading-none'>
                {tab.label}
              </span>

              {/* Subtle hover indicator for inactive tabs */}
              {!isActive && (
                <div className='absolute inset-0 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity' />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
