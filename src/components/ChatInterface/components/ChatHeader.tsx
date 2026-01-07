import React from 'react';
import { ChatHeaderProps } from '../types';
import { BTN_BASE, BTN_BLUE_INACTIVE, BTN_BLUE_ACTIVE } from '../constants';

/**
 * ChatHeader Component
 *
 * Renders the header section of the chat interface including:
 * - Mode toggle buttons (Design/Search)
 * - New chat button (authenticated users only)
 * - History toggle button (authenticated users only)
 * - Settings button
 */
export const ChatHeader: React.FC<ChatHeaderProps> = ({
  mode,
  onModeChange,
  onNewChat,
  showHistory,
  onToggleHistory,
  onShowSettings,
  isAuthenticated,
}) => {
  return (
    <div className='flex items-center justify-between p-4 md:p-6 border-b border-white/5 bg-black/20'>
      {/* Mode Toggle Buttons */}
      <div className='flex space-x-2 md:space-x-4'>
        <button
          onClick={() => onModeChange('design')}
          className={`${BTN_BASE} ${mode === 'design' ? BTN_BLUE_ACTIVE : BTN_BLUE_INACTIVE}`}
        >
          <span className='material-icons text-sm md:text-base drop-shadow-md'>psychology</span>
          Designer Logic
        </button>
        <button
          onClick={() => onModeChange('search')}
          className={`${BTN_BASE} ${mode === 'search' ? BTN_BLUE_ACTIVE : BTN_BLUE_INACTIVE}`}
        >
          <span className='material-icons text-sm md:text-base drop-shadow-md'>public</span>
          Trend Search
        </button>
      </div>

      {/* Action Buttons */}
      <div className='flex items-center gap-2'>
        {/* New Chat Button - Only for authenticated users */}
        {isAuthenticated && (
          <button
            onClick={onNewChat}
            className='h-10 w-10 md:h-12 md:w-12 rounded-full bg-zinc-800 border border-white/5 text-zinc-400 hover:text-white transition flex items-center justify-center hover:bg-zinc-700'
            title='New Conversation'
          >
            <span className='material-icons'>add</span>
          </button>
        )}

        {/* History Button - Only for authenticated users */}
        {isAuthenticated && (
          <button
            onClick={onToggleHistory}
            className={`h-10 w-10 md:h-12 md:w-12 rounded-full border border-white/5 text-zinc-400 hover:text-white transition flex items-center justify-center ${showHistory ? 'bg-blue-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700'}`}
            title='Chat History'
          >
            <span className='material-icons'>history</span>
          </button>
        )}

        {/* Settings Button - Always visible */}
        <button
          onClick={onShowSettings}
          className='h-10 w-10 md:h-12 md:w-12 rounded-full bg-zinc-800 border border-white/5 text-zinc-400 hover:text-white transition flex items-center justify-center hover:bg-zinc-700'
          title='AI Settings'
        >
          <span className='material-icons'>settings</span>
        </button>
      </div>
    </div>
  );
};
