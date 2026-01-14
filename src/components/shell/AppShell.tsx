/**
 * AppShell - Award-winning application wrapper
 *
 * Design Philosophy:
 * - Anti-Slop: Orange/Emerald palette (no teal/purple)
 * - Luxury Lag: Spring physics on interactions
 * - Visual Weight: Pinball Pattern gaze hierarchy
 * - Good Friction: Intentional resistance that creates engagement
 *
 * Features:
 * - Responsive navigation (mobile bottom nav, desktop sidebar)
 * - Glassmorphic header with premium blur
 * - Voice agent button with Spring physics
 * - Mobile menu drawer with smooth transitions
 */

import React, { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MainNav } from './MainNav';
import { BottomNav } from './BottomNav';
import { UserMenu } from './UserMenu';
import { Menu, Search, X, Mic, MicOff, Settings } from 'lucide-react';
import { useSpring, EASING } from '@/hooks/useSpring';
import type { ConnectionState } from '@/types';

export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

export interface AppShellProps {
  children: React.ReactNode;
  navigationItems: NavigationItem[];
  activeItemId: string;
  onNavigate: (id: string) => void;
  onCreateNew?: () => void;
  onOpenSettings?: () => void;
  onOpenAuth?: () => void;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  // Voice Agent props
  showVoiceAgent?: boolean;
  isVoiceActive?: boolean;
  voiceConnectionState?: ConnectionState;
  onToggleVoice?: () => void;
}

export function AppShell({
  children,
  navigationItems,
  activeItemId,
  onNavigate,
  onCreateNew,
  onOpenSettings,
  onOpenAuth,
  showSearch = true,
  onSearch,
  showVoiceAgent = false,
  isVoiceActive = false,
  voiceConnectionState = 'disconnected',
  onToggleVoice,
}: AppShellProps) {
  const { isAuthenticated, user, authUser, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // Spring animation for voice button
  const voiceButtonScale = useSpring(1, 'bouncy');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const handleVoiceClick = useCallback(() => {
    voiceButtonScale.set(0.9);
    setTimeout(() => voiceButtonScale.set(1), 150);
    onToggleVoice?.();
  }, [voiceButtonScale, onToggleVoice]);

  const displayName =
    user?.full_name ||
    user?.username ||
    (user?.email || authUser?.email)?.split('@')[0] ||
    'User';

  // Voice button color based on state
  const getVoiceButtonStyle = () => {
    switch (voiceConnectionState) {
      case 'connecting':
        return {
          background: 'linear-gradient(135deg, #FACC15 0%, #EAB308 100%)',
          boxShadow: '0 8px 32px rgba(250, 204, 21, 0.4)',
        };
      case 'connected':
        return {
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)',
        };
      case 'error':
        return {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          boxShadow: '0 8px 32px rgba(239, 68, 68, 0.4)',
        };
      default:
        return {
          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
          boxShadow: '0 8px 32px rgba(249, 115, 22, 0.4)',
        };
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-white font-['Space_Grotesk',sans-serif]">
      {/* Accessibility: Skip to main content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:px-4 focus:py-2 focus:bg-yellow-400 focus:text-black focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 transition-all shadow-xl"
      >
        Skip to main content
      </a>
      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-4 lg:px-8"
        style={{
          background: 'rgba(12, 10, 9, 0.8)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
        }}
      >
        {/* Subtle bottom gradient line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background:
              'linear-gradient(to right, transparent, rgba(250, 204, 21, 0.2), transparent)',
          }}
        />

        {/* Left: Logo + Mobile Menu */}
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-2 -ml-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/5 transition-all duration-200"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            style={{ transition: `all 200ms ${EASING.luxuryOut}` }}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          <a href="/" className="flex items-center gap-2.5 group">
            <img
              src="/assets/platforms/life os dark mode logo.png"
              alt="Life OS"
              className="h-8 w-auto transition-all duration-300 group-hover:scale-105"
              style={{
                filter: 'drop-shadow(0 4px 12px rgba(250, 204, 21, 0.3))',
              }}
            />
          </a>
        </div>

        {/* Center: Search (Desktop) */}
        {showSearch && (
          <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-6 hidden lg:block">
            <div
              className="relative transition-all duration-300"
              style={{
                transform: searchFocused ? 'scale(1.02)' : 'scale(1)',
                transition: `transform 300ms ${EASING.luxuryOut}`,
              }}
            >
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200"
                style={{
                  color: searchFocused ? '#facc15' : '#78716c',
                }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search designs..."
                className="w-full py-2.5 pl-11 pr-4 text-sm focus:outline-none transition-all duration-200 placeholder:text-stone-500"
                style={{
                  background: searchFocused
                    ? 'rgba(28, 25, 23, 1)'
                    : 'rgba(28, 25, 23, 0.8)',
                  border: searchFocused
                    ? '1px solid rgba(250, 204, 21, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  boxShadow: searchFocused
                    ? '0 0 0 3px rgba(250, 204, 21, 0.1)'
                    : 'none',
                  transition: `all 200ms ${EASING.luxuryOut}`,
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 text-stone-500 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </form>
        )}

        {/* Right: User Menu */}
        <div className="flex items-center gap-2">
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="hidden md:flex w-10 h-10 rounded-xl items-center justify-center text-stone-400 hover:text-white transition-all"
              style={{
                background: 'rgba(28, 25, 23, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                transition: `all 200ms ${EASING.luxuryOut}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(41, 37, 36, 1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(28, 25, 23, 0.8)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
              }}
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}

          <UserMenu
            user={
              isAuthenticated
                ? {
                  name: displayName,
                  email: user?.email || authUser?.email,
                  avatarUrl: user?.avatar_url,
                }
                : undefined
            }
            onSignIn={onOpenAuth}
            onSignOut={signOut}
            onOpenSettings={onOpenSettings}
          />
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-black/80"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className="fixed top-16 left-0 bottom-0 w-64 z-40 lg:hidden"
        style={{
          background: 'rgba(12, 10, 9, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.04)',
          transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: `transform 300ms ${EASING.luxuryOut}`,
        }}
      >
        <MainNav
          items={navigationItems}
          activeItemId={activeItemId}
          onNavigate={(id) => {
            onNavigate(id);
            setMobileMenuOpen(false);
          }}
        />
      </div>

      {/* Sidebar (Desktop) */}
      <MainNav
        items={navigationItems}
        activeItemId={activeItemId}
        onNavigate={onNavigate}
        className="hidden lg:flex"
      />

      {/* Main Content */}
      <main
        id="main-content"
        tabIndex={-1}
        className="lg:ml-64 pt-16 pb-24 lg:pb-8 min-h-screen focus:outline-none"
      >
        <div className="p-4 lg:p-8">{children}</div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <BottomNav
        items={navigationItems}
        activeItemId={activeItemId}
        onNavigate={onNavigate}
        onCreateNew={onCreateNew}
        className="lg:hidden"
      />


      {/* Floating Voice Agent Button */}
      {showVoiceAgent && onToggleVoice && (
        <div className="fixed bottom-24 lg:bottom-8 right-4 lg:right-8 z-50">
          {/* Ripple effect for connected state */}
          {(voiceConnectionState === 'connected' || isVoiceActive) && (
            <div
              className="absolute inset-0 rounded-full animate-ping bg-emerald-500/30"
            />
          )}
          <button
            onClick={handleVoiceClick}
            disabled={
              voiceConnectionState === 'connecting' ||
              voiceConnectionState === 'disconnecting'
            }
            className="relative w-14 h-14 rounded-full flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950"
            style={{
              ...getVoiceButtonStyle(),
              transform: `scale(${voiceButtonScale.value})`,
              border: '2px solid rgba(255, 255, 255, 0.1)',
              cursor:
                voiceConnectionState === 'connecting' ? 'wait' : 'pointer',
              transition: `box-shadow 200ms ${EASING.luxuryOut}`,
            }}
            title={
              voiceConnectionState === 'connecting'
                ? 'Connecting...'
                : voiceConnectionState === 'connected'
                  ? 'Voice Active - Click to stop'
                  : voiceConnectionState === 'error'
                    ? 'Connection failed - Click to retry'
                    : 'Talk to Signal AI'
            }
            aria-label={
              voiceConnectionState === 'connecting'
                ? 'Connecting to voice agent'
                : voiceConnectionState === 'connected'
                  ? 'Voice active, click to disconnect'
                  : voiceConnectionState === 'error'
                    ? 'Connection failed, click to retry'
                    : 'Talk to Signal AI'
            }
          >
            {/* Inner glow */}
            <div
              className="absolute inset-0 rounded-full opacity-50 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.3)_0%,transparent_60%)]"
            />

            {voiceConnectionState === 'connecting' ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : voiceConnectionState === 'connected' || isVoiceActive ? (
              <Mic className="w-6 h-6 text-white relative z-10" />
            ) : voiceConnectionState === 'error' ? (
              <MicOff className="w-6 h-6 text-white relative z-10" />
            ) : (
              <Mic className="w-6 h-6 text-white relative z-10" />
            )}
          </button>

          {/* Status label */}
          {(voiceConnectionState === 'connecting' ||
            voiceConnectionState === 'error') && (
              <div
                className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
                style={{
                  background:
                    voiceConnectionState === 'connecting'
                      ? 'rgba(250, 204, 21, 0.2)'
                      : 'rgba(239, 68, 68, 0.2)',
                  color:
                    voiceConnectionState === 'connecting' ? '#FACC15' : '#ef4444',
                }}
              >
                {voiceConnectionState === 'connecting' ? 'Connecting...' : 'Error'}
              </div>
            )}
        </div>
      )}
    </div>
  );
}

export default AppShell;
