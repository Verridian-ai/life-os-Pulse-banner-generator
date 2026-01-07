/**
 * Haptic feedback utilities using the Vibration API
 * Provides tactile feedback for connection state changes on mobile devices
 *
 * Features:
 * - Progressive enhancement (graceful degradation on unsupported devices)
 * - Respects user's reduced-motion preference
 * - Feature detection for Vibration API availability
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API
 */

/**
 * Vibration patterns for different feedback types
 */
export const HAPTIC_PATTERNS = {
  /** Light vibration on successful connection (50ms) */
  CONNECTED: [50],
  /** Double vibration on error (50ms, pause 100ms, 50ms) */
  ERROR: [50, 100, 50],
  /** Single short vibration on disconnect (30ms) */
  DISCONNECTED: [30],
} as const;

/**
 * Check if the Vibration API is available in the current environment
 * @returns {boolean} True if vibration is supported
 */
export function isVibrationSupported(): boolean {
  return 'vibrate' in navigator;
}

/**
 * Cached media query for reduced motion preference
 * Initialized on first access to avoid repeated DOM queries
 */
let reducedMotionMediaQuery: MediaQueryList | null = null;
let reducedMotionCache: boolean | null = null;

/**
 * Initialize or get the cached media query for reduced motion
 * @returns {MediaQueryList | null} The media query object or null if window is undefined
 */
function getReducedMotionMediaQuery(): MediaQueryList | null {
  if (typeof window === 'undefined') return null;

  if (!reducedMotionMediaQuery) {
    reducedMotionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Update cache when media query changes
    reducedMotionMediaQuery.addEventListener('change', (e) => {
      reducedMotionCache = e.matches;
    });

    // Initialize cache
    reducedMotionCache = reducedMotionMediaQuery.matches;
  }

  return reducedMotionMediaQuery;
}

/**
 * Check if the user has reduced motion preference enabled
 * Respects prefers-reduced-motion media query
 * Uses cached result for performance
 * @returns {boolean} True if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return true;

  // Initialize media query on first call
  if (reducedMotionCache === null) {
    getReducedMotionMediaQuery();
  }

  return reducedMotionCache ?? false;
}

/**
 * Trigger haptic feedback with the given pattern
 * Automatically handles feature detection and reduced-motion preference
 *
 * @param pattern - Vibration pattern (array of durations in milliseconds)
 * @returns {boolean} True if vibration was triggered, false if not supported or disabled
 *
 * @example
 * // Vibrate on successful connection
 * triggerHaptic(HAPTIC_PATTERNS.CONNECTED);
 *
 * @example
 * // Vibrate on error
 * triggerHaptic(HAPTIC_PATTERNS.ERROR);
 */
export function triggerHaptic(pattern: readonly number[]): boolean {
  // Don't vibrate if user prefers reduced motion
  if (prefersReducedMotion()) {
    return false;
  }

  // Don't vibrate if API is not supported
  if (!isVibrationSupported()) {
    return false;
  }

  try {
    navigator.vibrate([...pattern]);
    return true;
  } catch (error) {
    // Silently fail if vibration throws an error
    console.warn('[Haptics] Failed to trigger vibration:', error);
    return false;
  }
}

/**
 * Stop any ongoing vibration
 * @returns {boolean} True if vibration was stopped, false if not supported
 */
export function stopHaptic(): boolean {
  if (!isVibrationSupported()) {
    return false;
  }

  try {
    navigator.vibrate(0);
    return true;
  } catch (error) {
    console.warn('[Haptics] Failed to stop vibration:', error);
    return false;
  }
}

/**
 * Convenience function: Trigger haptic for successful connection
 */
export function hapticConnected(): boolean {
  return triggerHaptic(HAPTIC_PATTERNS.CONNECTED);
}

/**
 * Convenience function: Trigger haptic for connection error
 */
export function hapticError(): boolean {
  return triggerHaptic(HAPTIC_PATTERNS.ERROR);
}

/**
 * Convenience function: Trigger haptic for disconnection
 */
export function hapticDisconnected(): boolean {
  return triggerHaptic(HAPTIC_PATTERNS.DISCONNECTED);
}
