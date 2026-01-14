/**
 * UserMenu - User avatar with dropdown menu
 *
 * Signal Design System: sky/teal gradient avatar
 * Features: Sign in/out, settings access, improved avatar and dropdown styling
 */

import React, { useState, useRef, useEffect } from 'react';
import { Settings, LogOut, User, ChevronDown, Sparkles, ArrowRight, Crown } from 'lucide-react';

interface UserMenuProps {
  user?: {
    name: string;
    email?: string;
    avatarUrl?: string;
  };
  onSignIn?: () => void;
  onSignOut?: () => void;
  onOpenSettings?: () => void;
}

export function UserMenu({ user, onSignIn, onSignOut, onOpenSettings }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  // Not signed in
  if (!user) {
    return (
      <button
        onClick={onSignIn}
        className='group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-teal-500 text-white rounded-xl font-bold text-sm hover:brightness-110 hover:shadow-lg hover:shadow-sky-900/30 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:ring-offset-2 focus:ring-offset-zinc-950'
      >
        Sign In
        <ArrowRight className='w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300' />
      </button>
    );
  }

  return (
    <div className='relative' ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2.5 p-1.5 rounded-xl transition-all duration-200 ${
          isOpen ? 'bg-white/5' : 'hover:bg-white/5'
        }`}
        aria-expanded={isOpen}
        aria-haspopup='menu'
      >
        {user.avatarUrl && !avatarError ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            onError={() => setAvatarError(true)}
            className='w-9 h-9 rounded-xl object-cover ring-2 ring-white/10'
          />
        ) : (
          <div className='w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-teal-500 flex items-center justify-center shadow-lg shadow-sky-900/30 text-xs font-bold text-white'>
            {initials}
          </div>
        )}
        <div className='hidden sm:block text-left mr-1'>
          <p className='text-sm font-medium text-white leading-tight truncate max-w-[100px]'>
            {user.name}
          </p>
          <p className='text-[10px] text-zinc-500 leading-tight'>Free Plan</p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-zinc-500 transition-transform duration-200 hidden sm:block ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className='absolute right-0 top-full mt-2 w-64 bg-zinc-900/98 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200'>
          {/* User Info Header */}
          <div className='px-4 py-4 border-b border-white/5 bg-gradient-to-br from-sky-500/10 to-teal-500/10'>
            <div className='flex items-center gap-3'>
              {user.avatarUrl && !avatarError ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className='w-11 h-11 rounded-xl object-cover ring-2 ring-white/10'
                />
              ) : (
                <div className='w-11 h-11 rounded-xl bg-gradient-to-br from-sky-400 to-teal-500 flex items-center justify-center shadow-lg text-sm font-bold text-white'>
                  {initials}
                </div>
              )}
              <div className='flex-1 min-w-0'>
                <p className='font-bold text-white text-sm truncate'>{user.name}</p>
                {user.email && <p className='text-xs text-zinc-400 truncate'>{user.email}</p>}
              </div>
            </div>
          </div>

          {/* Upgrade CTA */}
          <div className='px-3 py-3 border-b border-white/5'>
            <button className='w-full flex items-center gap-3 px-3 py-2.5 bg-gradient-to-r from-yellow-400/10 to-yellow-300/10 hover:from-yellow-400/20 hover:to-yellow-300/20 border border-yellow-400/20 rounded-xl transition-colors group'>
              <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400/20 to-yellow-300/20 flex items-center justify-center'>
                <Crown className='w-4 h-4 text-yellow-400' />
              </div>
              <div className='flex-1 text-left'>
                <p className='text-xs font-bold text-yellow-400'>Upgrade to Pro</p>
                <p className='text-[10px] text-zinc-500'>Unlimited AI generations</p>
              </div>
              <Sparkles className='w-4 h-4 text-yellow-400/50 group-hover:text-yellow-400 transition-colors' />
            </button>
          </div>

          {/* Menu Items */}
          <div className='py-2'>
            {onOpenSettings && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenSettings();
                }}
                className='w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors'
              >
                <Settings className='w-4 h-4' />
                Settings
              </button>
            )}
            <button className='w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors'>
              <User className='w-4 h-4' />
              Profile
            </button>
          </div>

          {/* Sign Out */}
          {onSignOut && (
            <div className='border-t border-white/5 py-2'>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onSignOut();
                }}
                className='w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors'
              >
                <LogOut className='w-4 h-4' />
                Sign out
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default UserMenu;
