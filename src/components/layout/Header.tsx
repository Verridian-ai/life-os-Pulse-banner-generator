import React, { useState } from 'react';
import { Tab } from '../../constants';
import {
  BTN_BASE,
  BTN_BLUE_ACTIVE,
  BTN_BLUE_INACTIVE,
  BTN_PURPLE_ACTIVE,
  BTN_PURPLE_INACTIVE,
  BTN_GREEN_ACTIVE,
  BTN_GREEN_INACTIVE,
} from '../../styles';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  onOpenInstructions: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenSettings, onOpenAuth, onOpenInstructions }) => {
  const { isAuthenticated, user, supabaseUser, signOut } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setShowProfileMenu(false);
  };

  return (
    <header className='flex flex-col md:flex-row items-center justify-between px-4 py-3 md:px-8 md:py-2 bg-black/60 backdrop-blur-xl sticky top-0 z-50 border-b border-white/5 gap-2 md:gap-4 overflow-visible'>
      {/* Left: Logo Area */}
      <div className='flex items-center justify-between w-full md:w-auto md:justify-start'>
        <div className='flex items-center gap-2 md:gap-3 relative'>
          <img
            src='/assets/3d_render_of_202512101206.png'
            alt='Logo'
            className='h-12 w-12 md:h-16 md:w-16 lg:h-24 lg:w-24 object-contain -my-2 md:-my-4 lg:-my-6 drop-shadow-2xl relative z-10'
          />
          <span className='text-base md:text-lg font-black tracking-tight text-white uppercase md:hidden'>
            LIFE OS
          </span>
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
        <h1 className='text-lg sm:text-xl md:text-2xl lg:text-3xl font-black tracking-wide text-white uppercase drop-shadow-lg'>
          <span className='hidden sm:inline'>Banner and Profile Editor</span>
          <span className='sm:hidden'>Banner Editor</span>
        </h1>
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
          <button
            onClick={() => setActiveTab(Tab.GALLERY)}
            className={`${BTN_BASE} ${activeTab === Tab.GALLERY ? BTN_GREEN_ACTIVE : BTN_GREEN_INACTIVE} text-xs md:text-sm min-h-[44px] py-2 px-3 md:px-4`}
          >
            <span className='material-icons text-base md:text-lg drop-shadow-md'>
              photo_library
            </span>
            <span className='hidden sm:inline'>Gallery</span>
          </button>
          <button
            onClick={() => setActiveTab(Tab.BRAINSTORM)}
            className={`${BTN_BASE} ${activeTab === Tab.BRAINSTORM ? BTN_PURPLE_ACTIVE : BTN_PURPLE_INACTIVE} text-xs md:text-sm min-h-[44px] py-2 px-3 md:px-4`}
          >
            <span className='material-icons text-base md:text-lg drop-shadow-md'>auto_awesome</span>
            <span className='hidden sm:inline'>Partner</span>
          </button>
        </nav>

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
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className='flex md:hidden min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 border border-white/10 items-center justify-center text-white active:scale-95 transition shrink-0'
              title={user?.email || supabaseUser?.email || 'Profile'}
              aria-label='User profile menu'
            >
              <span className='material-icons text-lg'>account_circle</span>
            </button>

            {/* Desktop Profile Button */}
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className='hidden md:flex min-w-[44px] min-h-[44px] w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 border border-white/10 items-center justify-center text-white hover:shadow-lg transition shrink-0'
              title={user?.email || supabaseUser?.email || 'Profile'}
              aria-label='User profile menu'
            >
              <span className='material-icons text-xl'>account_circle</span>
            </button>

            {showProfileMenu && (
              <div className='absolute right-0 mt-2 w-64 sm:w-72 md:w-80 max-w-[90vw] bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50'>
                <div className='bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-b border-white/5 p-4'>
                  <div className='flex items-center gap-3'>
                    <div className='w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center'>
                      <span className='material-icons text-2xl text-white'>account_circle</span>
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-xs font-bold text-white uppercase tracking-wide truncate'>
                        {user?.full_name ||
                         user?.username ||
                         (user?.email || supabaseUser?.email)?.split('@')[0] ||
                         'User'}
                      </p>
                      <p className='text-[10px] text-zinc-400 truncate'>
                        {user?.email || supabaseUser?.email}
                      </p>
                    </div>
                  </div>
                </div>
                <div className='p-2'>
                  <button
                    onClick={() => {
                      onOpenSettings();
                      setShowProfileMenu(false);
                    }}
                    className='w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition text-left'
                  >
                    <span className='material-icons text-zinc-400 text-lg'>settings</span>
                    <span className='text-sm text-zinc-300 font-medium'>Settings</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className='w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 transition text-left'
                  >
                    <span className='material-icons text-red-400 text-lg'>logout</span>
                    <span className='text-sm text-red-400 font-medium'>Sign Out</span>
                  </button>
                </div>
              </div>
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
};

export default Header;
