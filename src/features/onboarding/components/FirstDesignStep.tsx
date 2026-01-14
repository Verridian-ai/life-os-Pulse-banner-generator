/**
 * FirstDesignStep
 *
 * Template selection step for onboarding - helps users create their first design.
 */

import React, { useState, useCallback } from 'react';

import type { DesignTemplate } from '../types';

type FirstDesignStepProps = {
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
  onTemplateSelect: (template: DesignTemplate | null) => void;
  initialTemplate?: string | null;
};

const SAMPLE_TEMPLATES: DesignTemplate[] = [
  {
    id: 'linkedin-professional',
    name: 'Professional Banner',
    category: 'Business',
    platform: 'linkedin',
    thumbnailUrl: '/assets/banners/linkedin-technology-minimal-banner.png',
  },
  {
    id: 'linkedin-creative',
    name: 'Creative Gradient',
    category: 'Creative',
    platform: 'linkedin',
    thumbnailUrl: '/assets/banners/linkedin-marketing-cinematic-banner.png',
  },
  {
    id: 'twitter-minimal',
    name: 'Minimal Header',
    category: 'Minimal',
    platform: 'twitter',
    thumbnailUrl: '/assets/banners/x-marketing-cinematic-post.png',
  },
  {
    id: 'instagram-vibrant',
    name: 'Vibrant Story',
    category: 'Social',
    platform: 'instagram',
    thumbnailUrl: '/assets/banners/instagram-marketing-cinematic-post.png',
  },
  {
    id: 'youtube-gaming',
    name: 'Gaming Channel',
    category: 'Entertainment',
    platform: 'youtube',
    thumbnailUrl: '/assets/banners/youtube-technology-cinematic-banner.png',
  },
  {
    id: 'blank-canvas',
    name: 'Start from Scratch',
    category: 'Custom',
    thumbnailUrl: undefined,
  },
];

export function FirstDesignStep({
  onNext,
  onSkip,
  onBack,
  onTemplateSelect,
  initialTemplate,
}: FirstDesignStepProps): React.ReactElement {
  const [selectedId, setSelectedId] = useState<string | null>(initialTemplate || null);

  const handleSelect = useCallback(
    (template: DesignTemplate) => {
      if (selectedId === template.id) {
        setSelectedId(null);
        onTemplateSelect(null);
      } else {
        setSelectedId(template.id);
        onTemplateSelect(template);
      }
    },
    [selectedId, onTemplateSelect],
  );

  const handleContinue = useCallback(() => {
    onNext();
  }, [onNext]);

  return (
    <div className='w-full max-w-3xl mx-auto px-4'>
      {/* Glass Card Container */}
      <div className='relative bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-glass'>
        <div className='absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none' />

        <div className='relative z-10'>
          {/* Header */}
          <div className='text-center mb-8'>
            <div className='w-14 h-14 mx-auto mb-4 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20'>
              <span className='material-icons text-2xl text-cyan-400'>palette</span>
            </div>
            <h2 className='text-2xl font-bold text-white mb-2'>Pick a template</h2>
            <p className='text-zinc-400 text-sm'>
              Choose a starting point for your first design, or skip to explore later
            </p>
          </div>

          {/* Template Grid */}
          <div className='grid grid-cols-2 md:grid-cols-3 gap-4 mb-8'>
            {SAMPLE_TEMPLATES.map((template) => {
              const isSelected = selectedId === template.id;
              const isBlank = template.id === 'blank-canvas';

              return (
                <button
                  key={template.id}
                  onClick={() => handleSelect(template)}
                  className={`
                    relative rounded-xl overflow-hidden transition-all duration-200 group
                    ${
                      isSelected
                        ? 'ring-2 ring-cyan-500 ring-offset-2 ring-offset-zinc-900'
                        : 'hover:ring-2 hover:ring-zinc-600 hover:ring-offset-2 hover:ring-offset-zinc-900'
                    }
                  `}
                >
                  {/* Template Preview */}
                  <div className='aspect-video bg-zinc-800 relative'>
                    {template.thumbnailUrl ? (
                      <img
                        src={template.thumbnailUrl}
                        alt={template.name}
                        className='w-full h-full object-cover'
                        onError={(e) => {
                          // Fallback to gradient on error
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : isBlank ? (
                      <div className='absolute inset-0 flex items-center justify-center bg-zinc-800/80 border-2 border-dashed border-zinc-600'>
                        <span className='material-icons text-4xl text-zinc-500'>add</span>
                      </div>
                    ) : (
                      <div className='absolute inset-0 bg-gradient-to-br from-zinc-700 to-zinc-800' />
                    )}

                    {/* Selection overlay */}
                    {isSelected && (
                      <div className='absolute inset-0 bg-cyan-500/20 flex items-center justify-center'>
                        <div className='w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center'>
                          <span className='material-icons text-white'>check</span>
                        </div>
                      </div>
                    )}

                    {/* Hover overlay */}
                    <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                      <span className='text-white text-sm font-medium'>Select</span>
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className='p-3 bg-zinc-800/60'>
                    <h3
                      className={`text-sm font-medium mb-0.5 ${
                        isSelected ? 'text-cyan-400' : 'text-white'
                      }`}
                    >
                      {template.name}
                    </h3>
                    <p className='text-xs text-zinc-500'>{template.category}</p>
                  </div>
                </button>
              );
            })}
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
                Skip for now
              </button>
              <button
                onClick={handleContinue}
                className='px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:from-cyan-400 hover:to-blue-400 transition-all'
              >
                {selectedId ? 'Create Design' : 'Finish Setup'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
