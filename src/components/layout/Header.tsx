import React, { useState, useEffect, useCallback } from 'react';

import { Tab } from '../../constants';
import {
  BTN_BASE,
  BTN_BLUE_ACTIVE,
  BTN_BLUE_INACTIVE,
  BTN_PURPLE_ACTIVE,
  BTN_PURPLE_INACTIVE,
} from '../../styles';

import { useAuth } from '../../context/AuthContext';
import { ConnectionState } from '../../types';
import { hapticConnected, hapticError, hapticDisconnected } from '../../utils/haptics';
import { useDropdownKeyboard } from '../../hooks/useDropdownKeyboard';

interface HeaderProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  onOpenInstructions: () => void;
  onOpenQuickGen?: () => void;
  isVoiceActive?: boolean;
  voiceConnectionState?: ConnectionState;
  onToggleVoice?: () => void;
}

// Migrated to src/hooks/useDropdownKeyboard.ts

const Header: React.FC<HeaderProps> = React.memo(({
  activeTab,
  setActiveTab,
  onOpenSettings,
  onOpenAuth,
  onOpenInstructions,
  onOpenQuickGen,
  isVoiceActive = false,
  voiceConnectionState = 'disconnected',
  onToggleVoice,
}) => {
  const { isAuthenticated, user, authUser, signOut } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const previousConnectionState = React.useRef<ConnectionState>(voiceConnectionState);

  const handleSignOut = useCallback(async () => {
    await signOut();
    setShowProfileMenu(false);
  }, [signOut]);

  // Menu items for keyboard navigation (Settings, Sign Out)
  const menuItemCount = 2;

  const handleMenuItemSelect = useCallback(
    (index: number) => {
      if (index === 0) {
        // Settings
        onOpenSettings();
        setShowProfileMenu(false);
      } else if (index === 1) {
        // Sign Out
        handleSignOut();
      }
    },
    [onOpenSettings, handleSignOut]
  );

  const { focusedIndex, handleKeyDown, menuRef, buttonRef, itemRefs } = useDropdownKeyboard(
    showProfileMenu,
    setShowProfileMenu,
    menuItemCount,
    handleMenuItemSelect
  );

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const setItemRef = useCallback((index: number) => (el: HTMLButtonElement | null) => {
    itemRefs.current[index] = el;
  }, [itemRefs]);

  // Haptic feedback on connection state changes
  useEffect(() => {
    const prevState = previousConnectionState.current;
    const currentState = voiceConnectionState;

    // Only trigger haptic on actual state transitions (not initial render)
    if (prevState !== currentState) {
      if (currentState === 'connected') {
        hapticConnected();
      } else if (currentState === 'error') {
        hapticError();
      } else if (currentState === 'disconnected' && prevState === 'connected') {
        // Only vibrate on disconnect if transitioning from connected state
        hapticDisconnected();
      }

      // Update the previous state ref
      previousConnectionState.current = currentState;
    }
  }, [voiceConnectionState]);

  return (
    <header className='flex flex-col md:flex-row items-center justify-between px-3 py-2 md:px-8 md:py-2 bg-black/60 backdrop-blur-xl sticky top-0 z-50 border-b border-white/5 gap-1.5 md:gap-4 overflow-visible'>
      {/* Left: Logo Area */}
      <div className='flex items-center justify-between w-full md:w-auto md:justify-start'>
        <div className='flex items-center gap-2 md:gap-3 relative'>
          <img
            src='/assets/logo.svg'
            alt='Life OS Logo'
            className='h-12 w-12 md:h-16 md:w-16 lg:h-24 lg:w-24 object-contain -my-2 md:-my-4 lg:-my-6 drop-shadow-2xl relative z-10'
          />
          {/* Text removed on mobile - logo already displays "Life OS" */}
        </div>

        {/* Mobile Menu Button (Help + Settings) */}
        <div className='flex items-center gap-2 md:hidden'>
          <button
            onClick={onOpenInstructions}
            className='min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 hover:text-purple-300 transition shrink-0'
            title='How to Get API Keys'
            aria-label='Help and instructions'
          >
            <span className='material-icons text-xl'>help</span>
          </button>
          <button
            onClick={onOpenSettings}
            className='min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition shrink-0'
            title='Settings'
            aria-label='Open settings'
          >
            <span className='material-icons text-xl'>settings</span>
          </button>
        </div>
      </div>

      {/* Center: Title (Flex-1 for natural spacing away from larger right nav) */}
      <div className='w-full md:flex-1 text-center mt-1 md:mt-0 md:px-2 lg:px-4'>
      </div>

      {/* Right: Navigation */}
      <div className='flex items-center gap-2 md:gap-4 w-full md:w-auto justify-center md:justify-end flex-wrap'>
        <nav className='flex items-center gap-1 md:gap-2 p-1 bg-white/5 rounded-full border border-white/5 flex-wrap justify-center'>
          <button
            onClick={() => setActiveTab(Tab.STUDIO)}
            className={`${BTN_BASE} ${activeTab === Tab.STUDIO ? BTN_BLUE_ACTIVE : BTN_BLUE_INACTIVE} text-xs md:text-sm min-h-[44px] py-2 px-3 md:px-4`}
          >
            <span className='material-icons text-base md:text-lg drop-shadow-md'>edit_note</span>
            <span className='hidden sm:inline'>Studio</span>
          </button>

          {onOpenQuickGen && (
            <button
              onClick={onOpenQuickGen}
              className={`${BTN_BASE} bg-gradient-to-br from-purple-600/20 to-pink-600/20 text-purple-400 border border-purple-500/30 hover:from-purple-600/30 hover:to-pink-600/30 text-xs md:text-sm min-h-[44px] py-2 px-3 md:px-4`}
            >
              <span className='material-icons text-base md:text-lg drop-shadow-md'>bolt</span>
              <span className='hidden sm:inline'>Quick Gen</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab(Tab.BRAINSTORM)}
            className={`${BTN_BASE} ${activeTab === Tab.BRAINSTORM ? BTN_PURPLE_ACTIVE : BTN_PURPLE_INACTIVE} text-xs md:text-sm min-h-[44px] py-2 px-3 md:px-4`}
          >
            <span className='material-icons text-base md:text-lg drop-shadow-md'>auto_awesome</span>
            <span className='hidden sm:inline'>Partner</span>
          </button>
        </nav>

        {/* Voice Agent Toggle Button with Status Label */}
        {onToggleVoice && (
          <div className='flex flex-col items-center justify-center relative min-w-[60px]'>
            <button
              onClick={onToggleVoice}
              disabled={voiceConnectionState === 'connecting' || voiceConnectionState === 'disconnecting'}
              className={`min-w-[44px] min-h-[44px] w-12 h-12 rounded-full border flex items-center justify-center transition-all shadow-lg shrink-0 relative z-10 ${voiceConnectionState === 'connecting'
                ? 'bg-gradient-to-br from-amber-600 to-yellow-600 border-amber-400/50 text-white shadow-amber-500/50 cursor-not-allowed'
                : voiceConnectionState === 'connected' || isVoiceActive
                  ? 'bg-gradient-to-br from-green-600 to-emerald-600 border-green-400/50 text-white animate-pulse shadow-green-500/50'
                  : voiceConnectionState === 'error'
                    ? 'bg-gradient-to-br from-red-600 to-rose-600 border-red-400/50 text-white shadow-red-500/50 hover:from-red-700 hover:to-rose-700 cursor-pointer'
                    : voiceConnectionState === 'disconnecting'
                      ? 'bg-gradient-to-br from-gray-600 to-gray-700 border-gray-500/50 text-gray-300 shadow-gray-500/50 cursor-not-allowed'
                      : 'bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border-blue-500/30 text-blue-400 hover:text-blue-300 hover:from-blue-600/30 hover:to-cyan-600/30'
                }`}
              title={
                voiceConnectionState === 'connecting'
                  ? 'Connecting to Benno...'
                  : voiceConnectionState === 'connected' || isVoiceActive
                    ? 'Stop Benno'
                    : voiceConnectionState === 'error'
                      ? 'Connection failed - Click to retry'
                      : voiceConnectionState === 'disconnecting'
                        ? 'Disconnecting...'
                        : 'Talk to Benno'
              }
              aria-label={
                voiceConnectionState === 'connecting'
                  ? 'Connecting to voice agent...'
                  : voiceConnectionState === 'connected' || isVoiceActive
                    ? 'Stop voice agent'
                    : voiceConnectionState === 'error'
                      ? 'Voice connection failed - Click to retry connection'
                      : voiceConnectionState === 'disconnecting'
                        ? 'Disconnecting...'
                        : 'Start voice agent'
              }
            >
              {voiceConnectionState === 'connecting' ? (
                <span className='material-icons text-xl animate-spin'>sync</span>
              ) : voiceConnectionState === 'error' ? (
                <span className='material-icons text-xl'>error_outline</span>
              ) : (
                <span className='material-icons text-xl'>
                  {voiceConnectionState === 'connected' || isVoiceActive ? 'mic' : 'mic_none'}
                </span>
              )}
            </button>

            {/* Status Text Label */}
            <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap overflow-hidden transition-all duration-300 ${voiceConnectionState === 'disconnected' ? 'max-h-0 opacity-0' : 'max-h-6 opacity-100'
              }`}>
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${voiceConnectionState === 'connecting' ? 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20' :
                  voiceConnectionState === 'connected' ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20' :
                    voiceConnectionState === 'error' ? 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20' :
                      'bg-zinc-800 text-zinc-400'
                }`}>
                {voiceConnectionState === 'connecting' ? 'Connecting...' :
                  voiceConnectionState === 'connected' ? 'Connected' :
                    voiceConnectionState === 'error' ? 'Failed' :
                      voiceConnectionState === 'disconnecting' ? 'Closing...' : ''}
              </span>
            </div>
          </div>
        )}

        {/* Help/Instructions Button - Desktop Only */}
        <button
          onClick={onOpenInstructions}
          className='hidden md:flex min-w-[44px] min-h-[44px] w-12 h-12 rounded-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/30 items-center justify-center text-purple-400 hover:text-purple-300 hover:from-purple-600/30 hover:to-blue-600/30 transition shadow-lg shrink-0'
          title='How to Get API Keys'
          aria-label='Help and instructions'
        >
          <span className='material-icons text-xl'>help</span>
        </button>

        {/* Profile/Login Button */}
        {isAuthenticated ? (
          <div className='relative'>
            {/* Mobile Profile Button */}
            <button
              ref={buttonRef}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              onKeyDown={handleKeyDown}
              className='flex md:hidden min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 border border-white/10 items-center justify-center text-white active:scale-95 transition shrink-0'
              title={user?.email || authUser?.email || 'Profile'}
              aria-label='User profile menu'
              aria-haspopup='menu'
              aria-expanded={showProfileMenu}
            >
              <span className='material-icons text-lg'>account_circle</span>
            </button>

            {/* Desktop Profile Button */}
            <button
              ref={buttonRef}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              onKeyDown={handleKeyDown}
              className='hidden md:flex min-w-[44px] min-h-[44px] w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 border border-white/10 items-center justify-center text-white hover:shadow-lg transition shrink-0'
              title={user?.email || authUser?.email || 'Profile'}
              aria-label='User profile menu'
              aria-haspopup='menu'
              aria-expanded={showProfileMenu}
            >
              <span className='material-icons text-xl'>account_circle</span>
            </button>

            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-transparent"
                  onClick={() => setShowProfileMenu(false)}
                  aria-hidden="true"
                />
                <div
                  ref={menuRef}
                  role='menu'
                  aria-label='User profile menu'
                  className='absolute right-0 mt-2 w-64 sm:w-72 md:w-80 max-w-[90vw] bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50'
                >
                  <div className='bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-b border-white/5 p-4'>
                    <div className='flex items-center gap-3'>
                      <div className='w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center'>
                        <span className='material-icons text-2xl text-white'>account_circle</span>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-xs font-bold text-white uppercase tracking-wide truncate'>
                          {user?.full_name ||
                            user?.username ||
                            (user?.email || authUser?.email)?.split('@')[0] ||
                            'User'}
                        </p>
                        <p className='text-[10px] text-zinc-400 truncate'>
                          {user?.email || authUser?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='p-2'>
                    <button
                      ref={setItemRef(0)}
                      onClick={() => {
                        onOpenSettings();
                        setShowProfileMenu(false);
                      }}
                      onKeyDown={handleKeyDown}
                      role='menuitem'
                      tabIndex={focusedIndex === 0 ? 0 : -1}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-left ${focusedIndex === 0
                        ? 'bg-white/10 ring-2 ring-blue-500/50'
                        : 'hover:bg-white/5'
                        }`}
                    >
                      <span className='material-icons text-zinc-400 text-lg'>settings</span>
                      <span className='text-sm text-zinc-300 font-medium'>Settings</span>
                    </button>
                    <button
                      ref={setItemRef(1)}
                      onClick={handleSignOut}
                      onKeyDown={handleKeyDown}
                      role='menuitem'
                      tabIndex={focusedIndex === 1 ? 0 : -1}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-left ${focusedIndex === 1
                        ? 'bg-red-500/20 ring-2 ring-red-500/50'
                        : 'hover:bg-red-500/10'
                        }`}
                    >
                      <span className='material-icons text-red-400 text-lg'>logout</span>
                      <span className='text-sm text-red-400 font-medium'>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className='hidden md:flex min-w-[44px] min-h-[44px] w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 border border-white/10 items-center justify-center text-white hover:shadow-lg transition shrink-0 group'
            title='Sign In'
            aria-label='Sign in to your account'
          >
            <span className='material-icons text-xl group-hover:scale-110 transition-transform'>login</span>
          </button>
        )}

        {/* Desktop Settings Button */}
        <button
          onClick={onOpenSettings}
          className='hidden md:flex min-w-[44px] min-h-[44px] w-12 h-12 rounded-full bg-zinc-900 border border-white/5 items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition shadow-[4px_4px_8px_rgba(0,0,0,0.5),-4px_-4px_8px_rgba(255,255,255,0.05)] shrink-0'
          title='Settings'
          aria-label='Open settings'
        >
          <span className='material-icons text-xl'>settings</span>
        </button>
      </div>
    </header>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function to optimize re-renders
  // Only re-render if these specific props change
  return (
    prevProps.activeTab === nextProps.activeTab &&
    prevProps.isVoiceActive === nextProps.isVoiceActive &&
    prevProps.voiceConnectionState === nextProps.voiceConnectionState
    // Function props (setActiveTab, onOpenSettings, etc.) don't need comparison
    // as they're stable and don't cause meaningful changes
  );
});

export default Header;