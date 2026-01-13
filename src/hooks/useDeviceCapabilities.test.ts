/**
 * useDeviceCapabilities Hook Tests
 */

import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDeviceCapabilities } from './useDeviceCapabilities';

// Mock haptics utility
vi.mock('../utils/haptics', () => ({
  isVibrationSupported: vi.fn(() => false),
}));

import { isVibrationSupported } from '../utils/haptics';

describe('useDeviceCapabilities', () => {
  let matchMediaResults: Record<string, boolean>;

  const createMatchMediaMock = () => {
    return vi.fn((query: string) => ({
      matches: matchMediaResults[query] ?? false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  };

  beforeEach(() => {
    matchMediaResults = {};
    vi.clearAllMocks();

    // Default navigator mocks
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 0,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(navigator, 'hardwareConcurrency', {
      value: 8,
      writable: true,
      configurable: true,
    });

    // Mock getComputedStyle for safe area insets
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: () => '0',
    } as CSSStyleDeclaration);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('touch capabilities', () => {
    it('detects touchscreen device', () => {
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 5,
        writable: true,
        configurable: true,
      });
      window.matchMedia = createMatchMediaMock();

      const { result } = renderHook(() => useDeviceCapabilities());

      expect(result.current.hasTouchscreen).toBe(true);
    });

    it('detects non-touchscreen device', () => {
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 0,
        writable: true,
        configurable: true,
      });
      window.matchMedia = createMatchMediaMock();

      const { result } = renderHook(() => useDeviceCapabilities());

      expect(result.current.hasTouchscreen).toBe(false);
    });

    it('detects multi-touch capability', () => {
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 10,
        writable: true,
        configurable: true,
      });
      window.matchMedia = createMatchMediaMock();

      const { result } = renderHook(() => useDeviceCapabilities());

      expect(result.current.hasMultiTouch).toBe(true);
    });

    it('detects single-touch only (no multi-touch)', () => {
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 1,
        writable: true,
        configurable: true,
      });
      window.matchMedia = createMatchMediaMock();

      const { result } = renderHook(() => useDeviceCapabilities());

      expect(result.current.hasTouchscreen).toBe(true);
      expect(result.current.hasMultiTouch).toBe(false);
    });
  });

  describe('pointer capabilities', () => {
    it('detects coarse pointer (touch input)', () => {
      matchMediaResults = {
        '(pointer: coarse)': true,
        '(pointer: fine)': false,
      };
      window.matchMedia = createMatchMediaMock();

      const { result } = renderHook(() => useDeviceCapabilities());

      expect(result.current.hasCoarsePointer).toBe(true);
      expect(result.current.hasFinePointer).toBe(false);
    });

    it('detects fine pointer (mouse/trackpad)', () => {
      matchMediaResults = {
        '(pointer: coarse)': false,
        '(pointer: fine)': true,
      };
      window.matchMedia = createMatchMediaMock();

      const { result } = renderHook(() => useDeviceCapabilities());

      expect(result.current.hasCoarsePointer).toBe(false);
      expect(result.current.hasFinePointer).toBe(true);
    });

    it('detects hover support (non-touch primary input)', () => {
      matchMediaResults = {
        '(hover: hover)': true,
        '(pointer: coarse)': false,
      };
      window.matchMedia = createMatchMediaMock();

      const { result } = renderHook(() => useDeviceCapabilities());

      expect(result.current.supportsHover).toBe(true);
    });

    it('detects no hover on touch-only devices', () => {
      matchMediaResults = {
        '(hover: hover)': true,
        '(pointer: coarse)': true,
      };
      window.matchMedia = createMatchMediaMock();

      const { result } = renderHook(() => useDeviceCapabilities());

      // Touch primary = no practical hover
      expect(result.current.supportsHover).toBe(false);
    });
  });

  describe('haptic feedback', () => {
    it('detects haptic support when vibration API available', () => {
      vi.mocked(isVibrationSupported).mockReturnValue(true);
      window.matchMedia = createMatchMediaMock();

      const { result } = renderHook(() => useDeviceCapabilities());

      expect(result.current.supportsHaptics).toBe(true);
    });

    it('detects no haptic support when vibration API unavailable', () => {
      vi.mocked(isVibrationSupported).mockReturnValue(false);
      window.matchMedia = createMatchMediaMock();

      const { result } = renderHook(() => useDeviceCapabilities());

      expect(result.current.supportsHaptics).toBe(false);
    });
  });

  describe('motion preferences', () => {
    it('detects prefers-reduced-motion', () => {
      matchMediaResults = {
        '(prefers-reduced-motion: reduce)': true,
      };
      window.matchMedia = createMatchMediaMock();

      const { result } = renderHook(() => useDeviceCapabilities());

      expect(result.current.prefersReducedMotion).toBe(true);
    });

    it('detects no motion preference', () => {
      matchMediaResults = {
        '(prefers-reduced-motion: reduce)': false,
      };
      window.matchMedia = createMatchMediaMock();

      const { result } = renderHook(() => useDeviceCapabilities());

      expect(result.current.prefersReducedMotion).toBe(false);
    });
  });

  describe('display preferences', () => {
    it('detects dark color scheme preference', () => {
      matchMediaResults = {
        '(prefers-color-scheme: dark)': true,
        '(prefers-color-scheme: light)': false,
      };
      window.matchMedia = createMatchMediaMock();

      const { result } = renderHook(() => useDeviceCapabilities());

      expect(result.current.prefersColorScheme).toBe('dark');
    });

    it('detects light color scheme preference', () => {
      matchMediaResults = {
        '(prefers-color-scheme: dark)': false,
        '(prefers-color-scheme: light)': true,
      };
      window.matchMedia = createMatchMediaMock();

      const { result } = renderHook(() => useDeviceCapabilities());

      expect(result.current.prefersColorScheme).toBe('light');
    });

    it('detects no color scheme preference', () => {
      matchMediaResults = {
        '(prefers-color-scheme: dark)': false,
        '(prefers-color-scheme: light)': false,
      };
      window.matchMedia = createMatchMediaMock();

      const { result } = renderHook(() => useDeviceCapabilities());

      expect(result.current.prefersColorScheme).toBe('no-preference');
    });

    it('detects more contrast preference', () => {
      matchMediaResults = {
        '(prefers-contrast: more)': true,
        '(prefers-contrast: less)': false,
      };
      window.matchMedia = createMatchMediaMock();

      const { result } = renderHook(() => useDeviceCapabilities());

      expect(result.current.prefersContrast).toBe('more');
    });

    it('detects less contrast preference', () => {
      matchMediaResults = {
        '(prefers-contrast: more)': false,
        '(prefers-contrast: less)': true,
      };
      window.matchMedia = createMatchMediaMock();

      const { result } = renderHook(() => useDeviceCapabilities());

      expect(result.current.prefersContrast).toBe('less');
    });

    it('detects reduced transparency preference', () => {
      matchMediaResults = {
        '(prefers-reduced-transparency: reduce)': true,
      };
      window.matchMedia = createMatchMediaMock();

      const { result } = renderHook(() => useDeviceCapabilities());

      expect(result.current.prefersReducedTransparency).toBe(true);
    });
  });

  describe('performance indicators', () => {
    it('detects hardware concurrency', () => {
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        value: 16,
        writable: true,
        configurable: true,
      });
      window.matchMedia = createMatchMediaMock();

      const { result } = renderHook(() => useDeviceCapabilities());

      expect(result.current.hardwareConcurrency).toBe(16);
    });

    it('defaults to 4 cores when hardwareConcurrency unavailable', () => {
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        value: undefined,
        writable: true,
        configurable: true,
      });
      window.matchMedia = createMatchMediaMock();

      const { result } = renderHook(() => useDeviceCapabilities());

      expect(result.current.hardwareConcurrency).toBe(4);
    });

    it('returns null for deviceMemory when unavailable', () => {
      window.matchMedia = createMatchMediaMock();

      const { result } = renderHook(() => useDeviceCapabilities());

      // deviceMemory is not standard, so likely null
      expect(result.current.deviceMemory).toBeNull();
    });

    it('returns isLowPowerMode as false (not reliably detectable)', () => {
      window.matchMedia = createMatchMediaMock();

      const { result } = renderHook(() => useDeviceCapabilities());

      expect(result.current.isLowPowerMode).toBe(false);
    });
  });

  describe('viewport insets', () => {
    it('returns default insets of 0', () => {
      window.matchMedia = createMatchMediaMock();

      const { result } = renderHook(() => useDeviceCapabilities());

      expect(result.current.viewportInsets).toEqual({
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      });
    });
  });
});
