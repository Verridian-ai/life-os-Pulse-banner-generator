import type { ChatMessage } from '@/types';

/**
 * ChatInterface Constants
 *
 * Shared constants used across ChatInterface components
 */

// =============================================================================
// Button Style Constants (Neumorphic Design System)
// =============================================================================

/**
 * Base button styles for neumorphic buttons
 * Responsive heights and spacing with uppercase text styling
 */
export const BTN_BASE =
  'h-10 md:h-12 px-4 md:px-6 rounded-full font-black uppercase tracking-wider text-[10px] md:text-xs transition-all flex items-center justify-center gap-2 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] whitespace-nowrap';

/**
 * Inactive blue button style (mode toggle, unselected state)
 * Dark background with blue text and subtle glow on hover
 */
export const BTN_BLUE_INACTIVE =
  'bg-zinc-900 text-blue-500 shadow-[4px_4px_8px_rgba(0,0,0,0.5),-4px_-4px_8px_rgba(255,255,255,0.05)] border border-blue-500/20 hover:text-blue-400 hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]';

/**
 * Active blue button style (mode toggle, selected state)
 * Gradient background with blue glow and slight scale increase
 */
export const BTN_BLUE_ACTIVE =
  'bg-gradient-to-br from-blue-600 to-cyan-700 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-blue-400/30 scale-[1.02]';

/**
 * White neumorphic button style (generate buttons)
 * White background with shadow and hover effects
 */
export const BTN_NEU_WHITE =
  'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:bg-zinc-200 active:scale-[0.98]';

// =============================================================================
// Chat Message Constants
// =============================================================================

/**
 * Initial message shown when starting a new chat
 * Introduces NANO and explains the interface
 */
export const INITIAL_MESSAGE: ChatMessage = {
  role: 'model',
  text: 'HELLO! I AM NANO, YOUR PRO LINKEDIN BANNER STRATEGIST. \n\nUPLOAD YOUR LOGO, PROFILE PICTURE, OR ANY REFERENCE IMAGES, AND WE CAN DISCUSS A DESIGN THAT PERFECTLY MATCHES YOUR BRAND COLORS AND STYLE.',
};
