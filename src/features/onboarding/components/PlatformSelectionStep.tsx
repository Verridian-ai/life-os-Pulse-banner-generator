/**
 * PlatformSelectionStep
 *
 * Platform selection step for onboarding - lets users choose which social platforms they use.
 */

import React, { useState, useCallback, useEffect } from 'react';

import type { PlatformType } from '../types';

type PlatformSelectionStepProps = {
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
  onPlatformsChange: (platforms: PlatformType[]) => void;
  initialPlatforms?: PlatformType[];
};

type PlatformOption = {
  id: PlatformType;
  name: string;
  icon: string;
  color: string;
  description: string;
};

const PLATFORMS: PlatformOption[] = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: 'work',
    color: 'from-blue-600 to-blue-700',
    description: 'Professional networking',
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    icon: 'tag',
    color: 'from-zinc-700 to-zinc-800',
    description: 'Real-time updates',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: 'camera_alt',
    color: 'from-pink-500 to-purple-600',
    description: 'Visual storytelling',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'thumb_up',
    color: 'from-blue-500 to-blue-600',
    description: 'Community engagement',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: 'play_circle',
    color: 'from-red-500 to-red-600',
    description: 'Video content',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: 'music_note',
    color: 'from-zinc-900 to-zinc-800',
    description: 'Short-form video',
  },
];

export function PlatformSelectionStep({
  onNext,
  onSkip,
  onBack,
  onPlatformsChange,
  initialPlatforms,
}: PlatformSelectionStepProps): React.ReactElement {
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformType[]>(
    initialPlatforms || [],
  );

  // Notify parent of changes
  useEffect(() => {
    onPlatformsChange(selectedPlatforms);
  }, [selectedPlatforms, onPlatformsChange]);

  const togglePlatform = useCallback((platformId: PlatformType) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId) ? prev.filter((p) => p !== platformId) : [...prev, platformId],
    );
  }, []);

  return (
    <div className='w-full max-w-2xl mx-auto px-4'>
      {/* Glass Card Container */}
      <div className='relative bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-glass'>
        <div className='absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none' />

        <div className='relative z-10'>
          {/* Header */}
          <div className='text-center mb-8'>
            <div className='w-14 h-14 mx-auto mb-4 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20'>
              <span className='material-icons text-2xl text-cyan-400'>share</span>
            </div>
            <h2 className='text-2xl font-bold text-white mb-2'>Choose your platforms</h2>
            <p className='text-zinc-400 text-sm'>Select the social networks you use the most</p>
          </div>

          {/* Platform Grid */}
          <div className='grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8'>
            {PLATFORMS.map((platform) => {
              const isSelected = selectedPlatforms.includes(platform.id);
              return (
                <button
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  className={`
                    relative p-4 rounded-xl border transition-all duration-200 text-left
                    ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                        : 'bg-zinc-800/40 border-zinc-700/50 hover:border-zinc-600'
                    }
                  `}
                >
                  {/* Selection indicator */}
                  {isSelected && (
                    <div className='absolute top-2 right-2 w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center'>
                      <span className='material-icons text-xs text-white'>check</span>
                    </div>
                  )}

                  {/* Platform icon */}
                  <div
                    className={`
                      w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-gradient-to-br ${platform.color}
                    `}
                  >
                    <span className='material-icons text-white text-lg'>{platform.icon}</span>
                  </div>

                  {/* Platform name */}
                  <h3
                    className={`font-semibold text-sm mb-0.5 ${
                      isSelected ? 'text-cyan-400' : 'text-white'
                    }`}
                  >
                    {platform.name}
                  </h3>

                  {/* Platform description */}
                  <p className='text-xs text-zinc-500'>{platform.description}</p>
                </button>
              );
            })}
          </div>

          {/* Selection summary */}
          <div className='text-center mb-6'>
            <p className='text-sm text-zinc-400'>
              {selectedPlatforms.length === 0 ? (
                'Select at least one platform to continue'
              ) : (
                <>
                  <span className='text-cyan-400 font-medium'>{selectedPlatforms.length}</span>
                  {' platform'}
                  {selectedPlatforms.length > 1 ? 's' : ''} selected
                </>
              )}
            </p>
          </div>

          {/* Action Buttons */}
          <div className='flex items-center justify-between pt-6 border-t border-zinc-800'>
            <button
              onClick={onBack}
              className='flex items-center gap-1 px-4 py-2 text-zinc-400 hover:text-white transition-colors'
            >
              <span className='material-icons text-lg'>arrow_back</span>
              Back
            </button>

            <div className='flex items-center gap-3'>
              <button
                onClick={onSkip}
                className='px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors'
              >
                Skip
              </button>
              <button
                onClick={onNext}
                disabled={selectedPlatforms.length === 0}
                className={`
                  px-6 py-2.5 rounded-xl font-medium transition-all
                  ${
                    selectedPlatforms.length > 0
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400'
                      : 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                  }
                `}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
