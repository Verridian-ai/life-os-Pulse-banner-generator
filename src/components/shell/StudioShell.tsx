/**
 * StudioShell - Lightweight wrapper for studio screens with mobile navigation
 *
 * Provides consistent mobile bottom navigation across all platform studios
 * (LinkedIn, YouTube, Facebook, Instagram, TikTok, X) without duplicating
 * the full AppShell header logic.
 *
 * Mobile (< 1024px): Bottom nav visible
 * Desktop (>= 1024px): Bottom nav hidden
 */

import React from 'react';
import { BottomNav } from './BottomNav';
import { FileEdit, Zap, Sparkles, Mic, HelpCircle } from 'lucide-react';
import type { NavigationItem } from './AppShell';

interface StudioShellProps {
  children: React.ReactNode;
  onNavigate: (id: string) => void;
  onCreateNew?: () => void;
  activeNavItem?: string;
  isVoiceActive?: boolean;
}

export function StudioShell({ children, onNavigate, onCreateNew, activeNavItem = 'studio', isVoiceActive = false }: StudioShellProps) {
  // Navigation items: Studio, Quick Gen, Partner, Voice, Help
  const navigationItems: NavigationItem[] = [
    { id: 'studio', label: 'Studio', icon: <FileEdit className="w-5 h-5" /> },
    { id: 'quick-gen', label: 'Quick Gen', icon: <Zap className="w-5 h-5" /> },
    { id: 'partner', label: 'Partner', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'voice', label: '', icon: <Mic className={`w-5 h-5 ${isVoiceActive ? 'text-yellow-400' : ''}`} /> },
    { id: 'help', label: '', icon: <HelpCircle className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Main Content */}
      {children}

      {/* Bottom Navigation (visible on all screens) */}
      <BottomNav
        items={navigationItems}
        activeItemId={activeNavItem}
        onNavigate={onNavigate}
        onCreateNew={onCreateNew}
        className=""
      />
    </>
  );
}

export default StudioShell;
