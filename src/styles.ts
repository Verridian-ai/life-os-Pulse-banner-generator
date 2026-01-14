/**
 * Signal Design System - Button & Component Styles
 *
 * Anti-Slop Compliant Palette:
 * - Primary: Orange (f97316) - warm, energetic, distinctive
 * - Accent: Emerald (10b981) - natural green, not algorithmic teal
 * - Neutral: Stone - warm grays for sophisticated dark mode
 *
 * Typography: Space Grotesk
 * Motion: Luxury lag physics (see hooks/useSpring.ts)
 */

// Responsive button base - scales from mobile (320px) to desktop (2560px+)
// Touch target: 44px minimum (iOS HIG), scales up on larger screens
export const BTN_BASE =
  'min-h-[44px] h-11 sm:h-12 px-3 sm:px-4 md:px-5 lg:px-6 rounded-full font-black uppercase tracking-wider text-[10px] sm:text-[11px] md:text-xs transition-all flex items-center justify-center gap-1.5 sm:gap-2 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] touch-manipulation active:scale-[0.98]';

// Smaller button variant for tight spaces - still meets 44px touch target
export const BTN_COMPACT =
  'min-h-[44px] h-11 px-2.5 sm:px-3 md:px-4 rounded-full font-bold uppercase tracking-wide text-[9px] sm:text-[10px] md:text-xs transition-all flex items-center justify-center gap-1 sm:gap-1.5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] touch-manipulation active:scale-[0.98]';

// Orange (Primary) button variants - Anti-Slop compliant
export const BTN_ORANGE_INACTIVE =
  'bg-stone-900 text-orange-500 shadow-neu-sm border border-orange-500/20 hover:text-orange-400 hover:border-orange-500/50 hover:shadow-[0_0_15px_rgba(249,115,22,0.2)]';
export const BTN_ORANGE_ACTIVE =
  'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)] border border-orange-400/30 scale-[1.02]';

// Emerald (Secondary) button variants - Anti-Slop compliant (not teal!)
export const BTN_EMERALD_INACTIVE =
  'bg-stone-900 text-emerald-500 shadow-neu-sm border border-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]';
export const BTN_EMERALD_ACTIVE =
  'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-emerald-400/30 scale-[1.02]';

// Yellow (Warning/Accent) button variants
export const BTN_AMBER_INACTIVE =
  'bg-stone-900 text-yellow-500 shadow-neu-sm border border-yellow-500/20 hover:text-yellow-400 hover:border-yellow-500/50 hover:shadow-[0_0_15px_rgba(234,179,8,0.2)]';
export const BTN_AMBER_ACTIVE =
  'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-[0_0_20px_rgba(234,179,8,0.4)] border border-yellow-400/30 scale-[1.02]';

// Legacy aliases for backward compatibility (now using Anti-Slop colors)
export const BTN_SKY_INACTIVE = BTN_ORANGE_INACTIVE;
export const BTN_SKY_ACTIVE = BTN_ORANGE_ACTIVE;
export const BTN_TEAL_INACTIVE = BTN_EMERALD_INACTIVE;
export const BTN_TEAL_ACTIVE = BTN_EMERALD_ACTIVE;
export const BTN_BLUE_INACTIVE = BTN_ORANGE_INACTIVE;
export const BTN_BLUE_ACTIVE = BTN_ORANGE_ACTIVE;
export const BTN_PURPLE_INACTIVE = BTN_ORANGE_INACTIVE;
export const BTN_PURPLE_ACTIVE = BTN_ORANGE_ACTIVE;

export const BTN_RED_INACTIVE =
  'bg-stone-900 text-red-500 shadow-neu-sm border border-red-500/20 hover:text-red-400 hover:border-red-500/50 hover:shadow-[0_0_15px_rgba(220,38,38,0.2)]';
export const BTN_RED_ACTIVE =
  'bg-gradient-to-br from-red-600 to-red-700 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] border border-red-400/30 scale-[1.02] animate-pulse';

export const BTN_GREEN_INACTIVE =
  'bg-stone-900 text-green-500 shadow-neu-sm border border-green-500/20 hover:text-green-400 hover:border-green-500/50 hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]';
export const BTN_GREEN_ACTIVE =
  'bg-gradient-to-br from-green-600 to-green-700 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)] border border-green-400/30 scale-[1.02]';

export const BTN_NEU_SOLID =
  'bg-stone-800 text-stone-400 shadow-neu-sm border border-white/5 hover:text-white hover:scale-[1.02] active:scale-[0.98] min-h-[44px]';

// Pink (AI/Magic) button variants
export const BTN_PINK_GLASS =
  'bg-pink-500/10 text-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.2)] border border-pink-500/20 hover:bg-pink-500/20 hover:text-pink-300 transition-all';
export const BTN_PINK_ACTIVE =
  'bg-pink-500/20 text-pink-300 shadow-[0_0_15px_rgba(236,72,153,0.4)] border border-pink-500/40';

// Primary button - orange gradient (Anti-Slop compliant)
export const BTN_PRIMARY =
  'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl font-bold text-sm uppercase tracking-wide hover:shadow-lg hover:brightness-110 transition shadow-lg shadow-orange-500/20';

export const BTN_SECONDARY =
  'bg-stone-800 text-stone-300 rounded-xl font-bold text-sm uppercase tracking-wide border border-stone-600 hover:bg-stone-700 hover:text-white transition';

export const INPUT_NEU =
  'bg-stone-900 text-white shadow-[inset_3px_3px_6px_rgba(0,0,0,0.5),inset_-3px_-3px_6px_rgba(255,255,255,0.05)] border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 focus:shadow-[0_0_15px_rgba(249,115,22,0.2)] transition-all';

// Admin/Dashboard specific form controls (Stone palette)
export const ADMIN_INPUT =
  'px-3 py-2 bg-stone-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder-zinc-500';

export const ADMIN_SELECT =
  'px-3 py-1.5 bg-stone-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all cursor-pointer';

// Glass panel styles with stone neutrals
export const GLASS_PANEL = 'bg-stone-900/50 backdrop-blur-xl border border-white/5 rounded-2xl';

export const GLASS_PANEL_LIGHT = 'bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl';

export const DROPDOWN_PANEL =
  'absolute top-full right-0 mt-2 w-56 bg-stone-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden';

// Luxury easing (exported for inline styles)
export const LUXURY_EASING = {
  out: 'cubic-bezier(0.33, 1, 0.68, 1)',
  inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
  magnetic: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
};
