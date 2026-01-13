/**
 * useBreakpoint Hook
 *
 * Provides Tailwind breakpoint detection with boolean helpers.
 * Built on useMediaQuery for efficient media query subscription.
 *
 * Breakpoints match tailwind.config.js:
 * - xs: 320px, sm: 360px, mobile: 375px, phone: 393px, phablet: 428px
 * - tablet-sm: 600px, md: 768px, tablet: 834px
 * - lg: 1024px, tablet-lg: 1194px, xl: 1280px
 * - 2xl: 1440px, laptop: 1512px, 3xl: 1920px, 4xl: 2560px
 *
 * @example
 * const { isMobile, isTablet, isDesktop, isLandscape } = useBreakpoint();
 * if (isMobile) return <MobileLayout />;
 */

import { useMediaQuery } from './useMediaQuery';

/**
 * Breakpoint categories for common use cases
 */
export type BreakpointCategory = 'mobile' | 'tablet' | 'desktop';

/**
 * Device type based on screen width
 */
export type DeviceType = 'phone' | 'phablet' | 'tablet' | 'laptop' | 'desktop';

export interface BreakpointState {
  // Primary boolean helpers (most common)
  isMobile: boolean;        // < 768px
  isTablet: boolean;        // 768px - 1023px
  isDesktop: boolean;       // >= 1024px

  // Orientation helpers
  isLandscape: boolean;
  isPortrait: boolean;
  isPhoneLandscape: boolean; // Landscape with constrained height (< 500px)

  // Detailed device detection
  isPhone: boolean;         // < 600px
  isPhablet: boolean;       // 428px - 599px
  isTabletSm: boolean;      // 600px - 767px
  isTabletMd: boolean;      // 768px - 833px
  isTabletLg: boolean;      // 834px - 1023px
  isLaptop: boolean;        // 1024px - 1439px
  isLargeDesktop: boolean;  // >= 1440px

  // Touch detection (uses pointer media query)
  hasCoarsePointer: boolean; // Touch device
  hasFinePointer: boolean;   // Mouse/trackpad

  // Current breakpoint category
  breakpoint: BreakpointCategory;

  // Current device type
  deviceType: DeviceType;
}

/**
 * Comprehensive breakpoint detection hook
 */
export function useBreakpoint(): BreakpointState {
  // Primary breakpoints
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // Orientation
  const isLandscape = useMediaQuery('(orientation: landscape)');
  const isPortrait = useMediaQuery('(orientation: portrait)');
  const isPhoneLandscape = useMediaQuery('(orientation: landscape) and (max-height: 500px)');

  // Detailed breakpoints
  const isPhone = useMediaQuery('(max-width: 599px)');
  const isPhablet = useMediaQuery('(min-width: 428px) and (max-width: 599px)');
  const isTabletSm = useMediaQuery('(min-width: 600px) and (max-width: 767px)');
  const isTabletMd = useMediaQuery('(min-width: 768px) and (max-width: 833px)');
  const isTabletLg = useMediaQuery('(min-width: 834px) and (max-width: 1023px)');
  const isLaptop = useMediaQuery('(min-width: 1024px) and (max-width: 1439px)');
  const isLargeDesktop = useMediaQuery('(min-width: 1440px)');

  // Touch detection
  const hasCoarsePointer = useMediaQuery('(pointer: coarse)');
  const hasFinePointer = useMediaQuery('(pointer: fine)');

  // Derived values
  const breakpoint: BreakpointCategory = isDesktop ? 'desktop' : isTablet ? 'tablet' : 'mobile';

  const deviceType: DeviceType = isLargeDesktop
    ? 'desktop'
    : isLaptop
    ? 'laptop'
    : isTablet
    ? 'tablet'
    : isPhablet
    ? 'phablet'
    : 'phone';

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLandscape,
    isPortrait,
    isPhoneLandscape,
    isPhone,
    isPhablet,
    isTabletSm,
    isTabletMd,
    isTabletLg,
    isLaptop,
    isLargeDesktop,
    hasCoarsePointer,
    hasFinePointer,
    breakpoint,
    deviceType,
  };
}

/**
 * Simplified hook for just mobile detection
 * Drop-in replacement for the old `isMobile` pattern
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

export default useBreakpoint;
