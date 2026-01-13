/**
 * BottomNav - Award-winning mobile bottom navigation
 *
 * Design Philosophy:
 * - Anti-Slop: Orange/Emerald palette (no teal/purple)
 * - Luxury Lag: Spring physics on interactions
 * - Good Friction: Intentional resistance that creates engagement
 * - Visual Weight: Pinball Pattern gaze hierarchy
 *
 * Features:
 * - 4 nav items max, centered FAB for primary action
 * - Spring-animated active indicator
 * - Haptic-style visual feedback
 * - Safe area support for notched devices
 */

import React, { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { useSpring } from '@/hooks/useSpring';
import type { NavigationItem } from './AppShell';

interface BottomNavProps {
  items: NavigationItem[];
  activeItemId: string;
  onNavigate: (id: string) => void;
  onCreateNew?: () => void;
  className?: string;
}

export function BottomNav({
  items,
  activeItemId,
  onNavigate,
  onCreateNew,
  className = '',
}: BottomNavProps) {
  const [pressedId, setPressedId] = useState<string | null>(null);
  const [fabPressed, setFabPressed] = useState(false);

  // Spring animation for FAB scale
  const fabScale = useSpring(1, 'bouncy');

  // Mobile-specific navigation logic
  const mobileItems = React.useMemo(() => {
    // 1. Remove quick-generate
    const filtered = items.filter(i => i.id !== 'quick-generate');

    // 2. Find key items
    const homeItem = filtered.find(i => i.id === 'dashboard');
    const studioItem = filtered.find(i => i.id === 'design-studio');
    const templatesItem = filtered.find(i => i.id === 'templates');
    const galleryItem = filtered.find(i => i.id === 'gallery');

    // 3. Construct custom mobile order: Home, Templates, Studio, Gallery
    // Note: If items are missing (e.g. auth state), fallback to filtered list
    if (homeItem && studioItem && templatesItem && galleryItem) {
      // Clone and rename Dashboard to Home
      const mobileHome = { ...homeItem, label: 'Home' };
      // Return reordered list
      return [mobileHome, templatesItem, studioItem, galleryItem];
    }

    // Fallback: Just return first 4 of filtered
    return filtered.slice(0, 4);
  }, [items]);

  // Show up to 5 items - if 5 items, no FAB; if 4 items, split around FAB
  const showFab = mobileItems.length <= 4 && onCreateNew;

  // Split logic for 4 items with FAB: 2 left, 2 right
  const leftItems = showFab ? mobileItems.slice(0, 2) : mobileItems.slice(0, 5);
  const rightItems = showFab ? mobileItems.slice(2, 4) : [];

  // Handle nav item press with Good Friction
  const handlePressStart = useCallback((id: string) => {
    setPressedId(id);
  }, []);

  const handlePressEnd = useCallback(() => {
    setPressedId(null);
  }, []);

  const handleFabPressStart = useCallback(() => {
    setFabPressed(true);
    fabScale.set(0.9);
  }, [fabScale]);

  const handleFabPressEnd = useCallback(() => {
    setFabPressed(false);
    fabScale.set(1);
  }, [fabScale]);

  const handleFabClick = useCallback(() => {
    // Bounce animation on click
    fabScale.set(0.85);
    setTimeout(() => fabScale.set(1.05), 100);
    setTimeout(() => fabScale.set(1), 200);
    onCreateNew?.();
  }, [fabScale, onCreateNew]);

  // Helper to render nav items
  const renderNavItem = (item: NavigationItem) => {
    const isActive = item.id === activeItemId;
    const isPressed = item.id === pressedId;

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => (item.onClick ? item.onClick() : onNavigate(item.id))}
        onPointerDown={() => handlePressStart(item.id)}
        onPointerUp={handlePressEnd}
        onPointerLeave={handlePressEnd}
        className={`relative flex flex-col items-center justify-center gap-0.5 p-2 min-w-[72px] min-h-[56px] transition-transform duration-200 ease-[cubic-bezier(0.33,1,0.68,1)] touch-manipulation ${isPressed ? 'scale-[0.92]' : 'scale-100'
          }`}
      >
        {/* Active indicator - animated pill */}
        <div
          className={`absolute top-1 left-1/2 -translate-x-1/2 h-1 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-300 transition-all duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] ${isActive
            ? 'w-6 opacity-100 shadow-[0_2px_8px_rgba(250,204,21,0.4)]'
            : 'w-0 opacity-0 shadow-none'
            }`}
        />

        {/* Icon with visual weight */}
        <span
          className={`transition-all duration-200 ease-[cubic-bezier(0.33,1,0.68,1)] ${isActive
            ? 'text-yellow-400 scale-115 drop-shadow-[0_2px_4px_rgba(250,204,21,0.3)]'
            : isPressed
              ? 'text-yellow-200 scale-95'
              : 'text-stone-500 scale-100'
            }`}
        >
          {item.icon}
        </span>

        {/* Label with weight hierarchy */}
        <span
          className={`text-[10px] font-semibold tracking-wide uppercase transition-all duration-200 ${isActive ? 'text-yellow-400 opacity-100' : 'text-stone-500 opacity-80'
            }`}
        >
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav
        className={`fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)] ${className}`}
      >
        {/* Glassmorphic background with luxury blur */}
        <div className="absolute inset-0 bg-stone-950/90 backdrop-blur-xl border-t border-white/[0.06]" />

        {/* Subtle top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent" />

        <div className="relative flex justify-around items-center h-16 px-1 max-w-2xl mx-auto">
          {/* Left Items */}
          {leftItems.map(renderNavItem)}

          {/* FAB Placeholder (only when showing FAB) */}
          {showFab && <div className="w-16" />}

          {/* Right Items */}
          {rightItems.map(renderNavItem)}
        </div>
      </nav>

      {/* Floating Action Button with Spring Physics (only when showing FAB) */}
      {showFab && (
        <button
          type="button"
          onClick={handleFabClick}
          onPointerDown={handleFabPressStart}
          onPointerUp={handleFabPressEnd}
          onPointerLeave={handleFabPressEnd}
          className="fixed bottom-8 left-1/2 z-50 w-14 h-14 rounded-full flex items-center justify-center focus-ring touch-manipulation border-2 border-white/10 bg-gradient-to-br from-yellow-400 to-yellow-500 transition-shadow duration-200 ease-[cubic-bezier(0.33,1,0.68,1)]"
          style={{
            transform: `translateX(-50%) scale(${fabScale.value})`,
            boxShadow: fabPressed
              ? '0 4px 20px rgba(250, 204, 21, 0.3)'
              : '0 8px 32px rgba(250, 204, 21, 0.4), 0 4px 12px rgba(250, 204, 21, 0.2)',
          }}
          aria-label="Create new design"
        >
          {/* Inner glow effect */}
          <div
            className="absolute inset-0 rounded-full opacity-50 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.3)_0%,transparent_60%)]"
          />

          {/* Icon */}
          <Plus
            className="w-6 h-6 text-white relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
          />
        </button>
      )}
    </>
  );
}

export default BottomNav;
