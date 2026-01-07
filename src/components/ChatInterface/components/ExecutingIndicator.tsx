import React from 'react';
import { ExecutingIndicatorProps } from '../types';

/**
 * ExecutingIndicator Component
 *
 * Displays a visual indicator when a tool is being executed.
 * Shows the tool name with a spinning gear icon.
 */
export const ExecutingIndicator: React.FC<ExecutingIndicatorProps> = ({ toolName }) => {
  return (
    <div className='flex justify-start'>
      <div className='bg-blue-500/10 border border-blue-500/30 rounded-2xl rounded-bl-sm p-4 flex items-center gap-3 shadow-lg'>
        <span className='material-icons text-blue-400 animate-spin'>settings</span>
        <div className='text-sm font-bold text-blue-300 uppercase tracking-wider'>
          Executing: {toolName.replace(/_/g, ' ')}
        </div>
      </div>
    </div>
  );
};
