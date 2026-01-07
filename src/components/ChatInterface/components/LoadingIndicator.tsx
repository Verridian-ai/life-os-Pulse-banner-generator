import React from 'react';
import { LoadingIndicatorProps } from '../types';

/**
 * LoadingIndicator Component
 *
 * Displays an animated loading indicator while waiting for AI response.
 * Shows three bouncing purple dots in a card with glassmorphic styling.
 */
export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ message }) => {
  return (
    <div className='flex justify-start'>
      <div className='bg-white/5 border border-white/5 rounded-2xl rounded-bl-sm p-4 flex items-center gap-2 shadow-lg'>
        <div className='w-2 h-2 bg-purple-500 rounded-full animate-bounce'></div>
        <div className='w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]'></div>
        <div className='w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0.4s]'></div>
        {message && (
          <span className='ml-2 text-sm text-zinc-400 font-medium'>{message}</span>
        )}
      </div>
    </div>
  );
};
