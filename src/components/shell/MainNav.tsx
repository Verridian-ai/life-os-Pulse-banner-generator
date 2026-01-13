/**
 * MainNav - Award-winning desktop sidebar navigation
 *
 * Design Philosophy:
 * - Anti-Slop: Orange/Emerald palette (no teal/purple)
 * - Visual Weight: Pinball Pattern gaze hierarchy
 * - Good Friction: Hover states with intentional resistance
 * - Luxury Aesthetic: Refined glassmorphism with depth
 *
 * Features:
 * - Active state with animated indicator bar
 * - Upgrade CTA with premium styling
 * - Staggered hover effects
 */

import { useState, useCallback } from 'react';
import { Sparkles, ArrowRight, Crown } from 'lucide-react';
import { EASING } from '@/hooks/useSpring';
import type { NavigationItem } from './AppShell';

interface MainNavProps {
  items: NavigationItem[];
  activeItemId: string;
  onNavigate: (id: string) => void;
  className?: string;
}

export function MainNav({ items, activeItemId, onNavigate, className = '' }: MainNavProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pressedId, setPressedId] = useState<string | null>(null);

  const handleHoverStart = useCallback((id: string) => {
    setHoveredId(id);
  }, []);

  const handleHoverEnd = useCallback(() => {
    setHoveredId(null);
  }, []);

  const handlePressStart = useCallback((id: string) => {
    setPressedId(id);
  }, []);

  const handlePressEnd = useCallback(() => {
    setPressedId(null);
  }, []);

  return (
    <aside
      className={`fixed top-16 left-0 bottom-0 w-64 flex-col z-40 ${className}`}
      style={{
        background: 'rgba(12, 10, 9, 0.6)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderRight: '1px solid rgba(255, 255, 255, 0.04)',
      }}
    >
      {/* Subtle right edge gradient */}
      <div
        className="absolute top-0 right-0 bottom-0 w-px"
        style={{
          background: 'linear-gradient(to bottom, rgba(250, 204, 21, 0.1), transparent 50%, rgba(250, 204, 21, 0.1))',
        }}
      />

      {/* Navigation Items */}
      <nav className="p-4 space-y-1.5">
        {items.map((item, _index) => {
          const isActive = item.id === activeItemId;
          const isHovered = item.id === hoveredId;
          const isPressed = item.id === pressedId;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => (item.onClick ? item.onClick() : onNavigate(item.id))}
              onMouseEnter={() => handleHoverStart(item.id)}
              onMouseLeave={handleHoverEnd}
              onPointerDown={() => handlePressStart(item.id)}
              onPointerUp={handlePressEnd}
              className="group w-full flex items-center gap-3 px-4 py-3 rounded-xl relative overflow-hidden transition-all duration-200"
              aria-current={isActive ? 'page' : undefined}
              style={{
                background: isActive
                  ? 'linear-gradient(135deg, rgba(250, 204, 21, 0.20) 0%, rgba(234, 179, 8, 0.14) 100%)'
                  : isHovered
                  ? 'rgba(255, 255, 255, 0.04)'
                  : 'transparent',
                transform: isPressed ? 'scale(0.98)' : 'scale(1)',
                transition: `all 200ms ${EASING.luxuryOut}`,
              }}
            >
              {/* Active indicator bar - animated (6px width for WCAG 3:1 contrast) */}
              <div
                className="absolute left-0 top-1/2 w-1.5 rounded-full"
                style={{
                  height: isActive ? '24px' : '0px',
                  transform: 'translateY(-50%)',
                  background: isActive
                    ? 'linear-gradient(to bottom, #facc15, #eab308)'
                    : 'transparent',
                  boxShadow: isActive ? '0 0 12px rgba(250, 204, 21, 0.5)' : 'none',
                  transition: `all 300ms ${EASING.luxuryOut}`,
                }}
              />

              {/* Left edge inner glow for redundant visual encoding */}
              <div
                className="absolute left-0 top-0 bottom-0 w-8 pointer-events-none"
                style={{
                  background: isActive
                    ? 'linear-gradient(to right, rgba(250, 204, 21, 0.08) 0%, transparent 100%)'
                    : 'transparent',
                  opacity: isActive ? 1 : 0,
                  transition: `opacity 300ms ${EASING.luxuryOut}`,
                }}
              />

              {/* Icon with visual weight */}
              <span
                style={{
                  color: isActive
                    ? '#facc15'
                    : isHovered
                    ? '#fde047'
                    : '#78716c',
                  transform: isHovered && !isActive ? 'translateX(2px)' : 'translateX(0)',
                  transition: `all 200ms ${EASING.luxuryOut}`,
                }}
              >
                {item.icon}
              </span>

              {/* Label - Bold (700) for active state to improve visual distinction */}
              <span
                className="text-sm font-medium"
                style={{
                  color: isActive ? '#fafaf9' : isHovered ? '#d6d3d1' : '#a8a29e',
                  fontWeight: isActive ? 700 : 500,
                  transition: `all 200ms ${EASING.luxuryOut}`,
                }}
              >
                {item.label}
              </span>

              {/* Hover arrow indicator - Base opacity 0.3 for visibility affordance */}
              <ArrowRight
                className="w-4 h-4 ml-auto"
                style={{
                  opacity: isHovered && !isActive ? 0.6 : isActive ? 0.3 : 0.3,
                  transform: isHovered && !isActive ? 'translateX(0)' : 'translateX(-4px)',
                  color: isActive ? '#facc15' : '#78716c',
                  transition: `all 200ms ${EASING.luxuryOut}`,
                }}
              />
            </button>
          );
        })}
      </nav>

      {/* Pro Upgrade Card - Premium Design */}
      <div className="mt-auto p-4">
        <div
          className="group relative p-5 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, rgba(41, 37, 36, 0.8) 0%, rgba(28, 25, 23, 0.9) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          }}
          onMouseEnter={() => setHoveredId('upgrade')}
          onMouseLeave={handleHoverEnd}
        >
          {/* Decorative background glow */}
          <div
            className="absolute -top-8 -right-8 w-32 h-32 rounded-full transition-opacity duration-500"
            style={{
              background: 'radial-gradient(circle, rgba(250, 204, 21, 0.15) 0%, transparent 70%)',
              opacity: hoveredId === 'upgrade' ? 1 : 0.5,
            }}
          />

          {/* Crown icon badge */}
          <div className="absolute top-3 right-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.15) 100%)',
                transform: hoveredId === 'upgrade' ? 'rotate(-6deg) scale(1.05)' : 'rotate(0deg)',
              }}
            >
              <Crown className="w-4 h-4 text-yellow-400" />
            </div>
          </div>

          {/* Content */}
          <h3
            className="font-bold text-white mb-1.5 relative z-10 text-[15px]"
          >
            Upgrade to Pro
          </h3>
          <p
            className="text-xs leading-relaxed relative z-10 mb-4 text-stone-400"
          >
            Unlock unlimited AI generations and premium features
          </p>

          {/* CTA Button */}
          <button
            type="button"
            className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 relative z-10 overflow-hidden group/btn"
            style={{
              background: 'linear-gradient(135deg, #facc15 0%, #eab308 100%)',
              color: 'black',
              boxShadow: '0 4px 16px rgba(250, 204, 21, 0.3)',
              transition: `all 200ms ${EASING.luxuryOut}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(250, 204, 21, 0.4)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(250, 204, 21, 0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Button inner highlight */}
            <div
              className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            />
            <Sparkles className="w-3.5 h-3.5" />
            <span>Upgrade Now</span>
            <ArrowRight
              className="w-3.5 h-3.5 transition-all duration-300 opacity-0 -ml-3"
            />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default MainNav;
