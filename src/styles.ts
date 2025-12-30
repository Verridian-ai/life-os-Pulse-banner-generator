// Responsive button base - scales from mobile (320px) to desktop (2560px+)
// Touch target: 44px minimum (iOS HIG), scales up on larger screens
export const BTN_BASE =
  'min-h-[44px] h-11 sm:h-12 px-3 sm:px-4 md:px-5 lg:px-6 rounded-full font-black uppercase tracking-wider text-[10px] sm:text-[11px] md:text-xs transition-all flex items-center justify-center gap-1.5 sm:gap-2 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] touch-manipulation active:scale-[0.98]';

// Smaller button variant for tight spaces - still meets 44px touch target
export const BTN_COMPACT =
  'min-h-[44px] h-11 px-2.5 sm:px-3 md:px-4 rounded-full font-bold uppercase tracking-wide text-[9px] sm:text-[10px] md:text-xs transition-all flex items-center justify-center gap-1 sm:gap-1.5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] touch-manipulation active:scale-[0.98]';

export const BTN_BLUE_INACTIVE =
  'bg-zinc-900 text-blue-500 shadow-neu-sm border border-blue-500/20 hover:text-blue-400 hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]';
export const BTN_BLUE_ACTIVE =
  'bg-gradient-to-br from-blue-600 to-cyan-700 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-blue-400/30 scale-[1.02]';

export const BTN_PURPLE_INACTIVE =
  'bg-zinc-900 text-purple-500 shadow-neu-sm border border-purple-500/20 hover:text-purple-400 hover:border-purple-500/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]';
export const BTN_PURPLE_ACTIVE =
  'bg-gradient-to-br from-purple-600 to-pink-700 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] border border-purple-400/30 scale-[1.02]';

export const BTN_RED_INACTIVE =
  'bg-zinc-900 text-red-500 shadow-neu-sm border border-red-500/20 hover:text-red-400 hover:border-red-500/50 hover:shadow-[0_0_15px_rgba(220,38,38,0.2)]';
export const BTN_RED_ACTIVE =
  'bg-gradient-to-br from-red-600 to-orange-700 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] border border-red-400/30 scale-[1.02] animate-pulse';

export const BTN_GREEN_INACTIVE =
  'bg-zinc-900 text-green-500 shadow-neu-sm border border-green-500/20 hover:text-green-400 hover:border-green-500/50 hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]';
export const BTN_GREEN_ACTIVE =
  'bg-gradient-to-br from-green-600 to-emerald-700 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)] border border-green-400/30 scale-[1.02]';

export const BTN_NEU_SOLID =
  'bg-zinc-800 text-zinc-400 shadow-neu-sm border border-white/5 hover:text-white hover:scale-[1.02] active:scale-[0.98] min-h-[44px]';

export const BTN_NEU_WHITE =
  'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:bg-zinc-200 active:scale-[0.98]';

export const BTN_PRIMARY =
  'bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-xl font-bold text-sm uppercase tracking-wide hover:shadow-lg hover:brightness-110 transition';

export const BTN_SECONDARY =
  'bg-zinc-800 text-zinc-300 rounded-xl font-bold text-sm uppercase tracking-wide border border-zinc-600 hover:bg-zinc-700 hover:text-white transition';

export const INPUT_NEU =
  'bg-zinc-900 text-white shadow-[inset_3px_3px_6px_rgba(0,0,0,0.5),inset_-3px_-3px_6px_rgba(255,255,255,0.05)] border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)]';
