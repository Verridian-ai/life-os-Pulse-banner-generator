/**
 * useDeviceCapabilities Hook
 *
 * Detects device capabilities for progressive enhancement.
 * Provides feature detection for touch, haptics, hover, and motion preferences.
 *
 * @example
 * const { hasTouchscreen, supportsHaptics, prefersReducedMotion } = useDeviceCapabilities();
 * if (hasTouchscreen) enableTouchGestures();
 */

import { useState, useEffect, useMemo } from 'react';
import { useMediaQuery } from './useMediaQuery';
import { isVibrationSupported } from '../utils/haptics';

export interface ViewportInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface DeviceCapabilities {
  // Input methods
  hasTouchscreen: boolean;
  hasMultiTouch: boolean;
  supportsHover: boolean;
  hasCoarsePointer: boolean;  // Touch input
  hasFinePointer: boolean;    // Mouse/trackpad

  // Haptic feedback
  supportsHaptics: boolean;

  // Motion preferences
  prefersReducedMotion: boolean;

  // Display preferences
  prefersReducedTransparency: boolean;
  prefersColorScheme: 'light' | 'dark' | 'no-preference';
  prefersContrast: 'more' | 'less' | 'no-preference';

  // Safe area insets (for notched devices)
  viewportInsets: ViewportInsets;

  // Performance indicators
  isLowPowerMode: boolean;
  deviceMemory: number | null;   // GB, null if not available
  hardwareConcurrency: number;   // CPU cores
}

/**
 * Get safe area insets from CSS env() values
 * Returns 0 for non-notched devices
 */
function getSafeAreaInsets(): ViewportInsets {
  if (typeof window === 'undefined') {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }

  const computeInset = (name: string): number => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name);
    return parseFloat(value) || 0;
  };

  return {
    top: computeInset('env(safe-area-inset-top)'),
    bottom: computeInset('env(safe-area-inset-bottom)'),
    left: computeInset('env(safe-area-inset-left)'),
    right: computeInset('env(safe-area-inset-right)'),
  };
}

/**
 * Detect if device supports multi-touch
 */
function getMaxTouchPoints(): number {
  if (typeof navigator === 'undefined') return 0;
  return navigator.maxTouchPoints || 0;
}

/**
 * Get device memory in GB (if available)
 */
function getDeviceMemory(): number | null {
  if (typeof navigator === 'undefined') return null;
  // @ts-expect-error - deviceMemory is not in standard navigator type
  return navigator.deviceMemory ?? null;
}

/**
 * Get hardware concurrency (CPU cores)
 */
function getHardwareConcurrency(): number {
  if (typeof navigator === 'undefined') return 4; // Default assumption
  return navigator.hardwareConcurrency || 4;
}

/**
 * Comprehensive device capabilities detection hook
 */
export function useDeviceCapabilities(): DeviceCapabilities {
  // Media query based detection
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const prefersReducedTransparency = useMediaQuery('(prefers-reduced-transparency: reduce)');
  const prefersMoreContrast = useMediaQuery('(prefers-contrast: more)');
  const prefersLessContrast = useMediaQuery('(prefers-contrast: less)');
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const prefersLightMode = useMediaQuery('(prefers-color-scheme: light)');
  const hasCoarsePointer = useMediaQuery('(pointer: coarse)');
  const hasFinePointer = useMediaQuery('(pointer: fine)');
  const canHover = useMediaQuery('(hover: hover)');

  // State for values that need to be computed on mount
  const [viewportInsets, setViewportInsets] = useState<ViewportInsets>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  // Compute static values once
  const staticCapabilities = useMemo(() => ({
    maxTouchPoints: getMaxTouchPoints(),
    deviceMemory: getDeviceMemory(),
    hardwareConcurrency: getHardwareConcurrency(),
    supportsHaptics: isVibrationSupported(),
  }), []);

  // Update safe area insets on mount and orientation change
  useEffect(() => {
    const updateInsets = () => {
      setViewportInsets(getSafeAreaInsets());
    };

    updateInsets();

    // Update on orientation change (which can affect safe areas)
    window.addEventListener('orientationchange', updateInsets);
    window.addEventListener('resize', updateInsets);

    return () => {
      window.removeEventListener('orientationchange', updateInsets);
      window.removeEventListener('resize', updateInsets);
    };
  }, []);

  // Derive color scheme preference
  const prefersColorScheme: 'light' | 'dark' | 'no-preference' =
    prefersDarkMode ? 'dark' : prefersLightMode ? 'light' : 'no-preference';

  // Derive contrast preference
  const prefersContrast: 'more' | 'less' | 'no-preference' =
    prefersMoreContrast ? 'more' : prefersLessContrast ? 'less' : 'no-preference';

  return {
    // Input methods
    hasTouchscreen: staticCapabilities.maxTouchPoints > 0,
    hasMultiTouch: staticCapabilities.maxTouchPoints >= 2,
    supportsHover: canHover && !hasCoarsePointer,
    hasCoarsePointer,
    hasFinePointer,

    // Haptic feedback
    supportsHaptics: staticCapabilities.supportsHaptics,

    // Motion preferences
    prefersReducedMotion,

    // Display preferences
    prefersReducedTransparency,
    prefersColorScheme,
    prefersContrast,

    // Safe area insets
    viewportInsets,

    // Performance indicators
    isLowPowerMode: false, // No reliable way to detect this
    deviceMemory: staticCapabilities.deviceMemory,
    hardwareConcurrency: staticCapabilities.hardwareConcurrency,
  };
}

export default useDeviceCapabilities;
