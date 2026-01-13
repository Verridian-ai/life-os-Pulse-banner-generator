import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  HAPTIC_PATTERNS,
  isVibrationSupported,
  prefersReducedMotion,
  triggerHaptic,
  stopHaptic,
  hapticConnected,
  hapticError,
  hapticDisconnected,
} from './haptics';

describe('haptics', () => {
  const originalNavigator = { ...navigator };
  let matchMediaMock: ReturnType<typeof vi.fn>;
  let matchMediaAddEventListenerMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Reset navigator.vibrate
    Object.defineProperty(navigator, 'vibrate', {
      value: vi.fn().mockReturnValue(true),
      writable: true,
      configurable: true,
    });

    // Mock matchMedia for reduced motion checks
    matchMediaAddEventListenerMock = vi.fn();
    matchMediaMock = vi.fn().mockReturnValue({
      matches: false,
      media: '(prefers-reduced-motion: reduce)',
      addEventListener: matchMediaAddEventListenerMock,
      removeEventListener: vi.fn(),
    });
    Object.defineProperty(window, 'matchMedia', {
      value: matchMediaMock,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(navigator, 'vibrate', {
      value: originalNavigator.vibrate,
      writable: true,
      configurable: true,
    });
  });

  describe('HAPTIC_PATTERNS', () => {
    it('defines connection patterns', () => {
      expect(HAPTIC_PATTERNS.CONNECTED).toEqual([50]);
      expect(HAPTIC_PATTERNS.ERROR).toEqual([50, 100, 50]);
      expect(HAPTIC_PATTERNS.DISCONNECTED).toEqual([30]);
    });

    it('defines interaction patterns', () => {
      expect(HAPTIC_PATTERNS.TAP).toEqual([10]);
      expect(HAPTIC_PATTERNS.SELECTION).toEqual([15]);
      expect(HAPTIC_PATTERNS.DRAG_START).toEqual([20]);
      expect(HAPTIC_PATTERNS.DROP).toEqual([25]);
      expect(HAPTIC_PATTERNS.ROTATION_SNAP).toEqual([30]);
      expect(HAPTIC_PATTERNS.BOUNDS_HIT).toEqual([50, 50]);
      expect(HAPTIC_PATTERNS.DELETE).toEqual([20, 30, 20]);
      expect(HAPTIC_PATTERNS.UNDO_REDO).toEqual([15]);
      expect(HAPTIC_PATTERNS.SUCCESS).toEqual([50, 50, 50]);
    });
  });

  describe('isVibrationSupported', () => {
    it('returns true when vibrate is in navigator', () => {
      expect(isVibrationSupported()).toBe(true);
    });

    it('returns false when vibrate is not in navigator', () => {
      Object.defineProperty(navigator, 'vibrate', {
        value: undefined,
        writable: true,
        configurable: true,
      });
      // Need to delete the property entirely for 'in' check to fail
      const nav = navigator as { vibrate?: unknown };
      delete nav.vibrate;

      expect(isVibrationSupported()).toBe(false);
    });
  });

  describe('prefersReducedMotion', () => {
    it('returns false when reduced motion is not preferred', () => {
      matchMediaMock.mockReturnValue({
        matches: false,
        media: '(prefers-reduced-motion: reduce)',
        addEventListener: matchMediaAddEventListenerMock,
        removeEventListener: vi.fn(),
      });

      // Force re-initialization of media query by triggering the function
      const result = prefersReducedMotion();
      expect(result).toBe(false);
    });
  });

  describe('triggerHaptic', () => {
    beforeEach(() => {
      // Ensure reduced motion is off for these tests
      matchMediaMock.mockReturnValue({
        matches: false,
        media: '(prefers-reduced-motion: reduce)',
        addEventListener: matchMediaAddEventListenerMock,
        removeEventListener: vi.fn(),
      });
    });

    it('triggers vibration with array pattern', () => {
      const result = triggerHaptic([50, 100, 50]);
      expect(result).toBe(true);
      expect(navigator.vibrate).toHaveBeenCalledWith([50, 100, 50]);
    });

    it('triggers vibration with pattern name', () => {
      const result = triggerHaptic('TAP');
      expect(result).toBe(true);
      expect(navigator.vibrate).toHaveBeenCalledWith([10]);
    });

    it('returns false when vibration not supported', () => {
      const nav = navigator as { vibrate?: unknown };
      delete nav.vibrate;

      const result = triggerHaptic(HAPTIC_PATTERNS.TAP);
      expect(result).toBe(false);
    });

    it('handles vibration errors gracefully', () => {
      Object.defineProperty(navigator, 'vibrate', {
        value: vi.fn().mockImplementation(() => {
          throw new Error('Vibration failed');
        }),
        writable: true,
        configurable: true,
      });

      const result = triggerHaptic(HAPTIC_PATTERNS.TAP);
      expect(result).toBe(false);
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('stopHaptic', () => {
    it('stops vibration by calling vibrate(0)', () => {
      const result = stopHaptic();
      expect(result).toBe(true);
      expect(navigator.vibrate).toHaveBeenCalledWith(0);
    });

    it('returns false when vibration not supported', () => {
      const nav = navigator as { vibrate?: unknown };
      delete nav.vibrate;

      const result = stopHaptic();
      expect(result).toBe(false);
    });

    it('handles stop errors gracefully', () => {
      Object.defineProperty(navigator, 'vibrate', {
        value: vi.fn().mockImplementation(() => {
          throw new Error('Stop failed');
        }),
        writable: true,
        configurable: true,
      });

      const result = stopHaptic();
      expect(result).toBe(false);
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('convenience functions', () => {
    beforeEach(() => {
      // Ensure reduced motion is off for these tests
      matchMediaMock.mockReturnValue({
        matches: false,
        media: '(prefers-reduced-motion: reduce)',
        addEventListener: matchMediaAddEventListenerMock,
        removeEventListener: vi.fn(),
      });
    });

    it('hapticConnected triggers CONNECTED pattern', () => {
      hapticConnected();
      expect(navigator.vibrate).toHaveBeenCalledWith([50]);
    });

    it('hapticError triggers ERROR pattern', () => {
      hapticError();
      expect(navigator.vibrate).toHaveBeenCalledWith([50, 100, 50]);
    });

    it('hapticDisconnected triggers DISCONNECTED pattern', () => {
      hapticDisconnected();
      expect(navigator.vibrate).toHaveBeenCalledWith([30]);
    });
  });
});
