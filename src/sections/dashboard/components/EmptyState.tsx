import React from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className='flex flex-col items-center justify-center py-16 px-4'>
      {/* Illustration */}
      <div className='w-24 h-24 rounded-full bg-zinc-800/50 flex items-center justify-center mb-6'>
        <svg
          className='w-12 h-12 text-zinc-600'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={1.5}
            d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
          />
        </svg>
      </div>

      {/* Text */}
      <h3 className="text-lg font-semibold text-white mb-2 font-['Space_Grotesk']">{title}</h3>
      <p className='text-zinc-400 text-center max-w-sm mb-6'>{description}</p>

      {/* Action */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className='px-6 py-3 bg-gradient-to-r from-sky-500 to-teal-500 text-white font-semibold rounded-xl hover:from-sky-400 hover:to-teal-400 transition-all'
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
