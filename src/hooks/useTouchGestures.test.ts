/**
 * useTouchGestures Hook Tests
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTouchGestures } from './useTouchGestures';

// Helper to create mock touch events
function createTouchEvent(
  type: 'touchstart' | 'touchmove' | 'touchend',
  touches: Array<{ identifier: number; clientX: number; clientY: number }>,
): React.TouchEvent {
  const touchList = {
    length: touches.length,
    item: (index: number) => touches[index] || null,
    [Symbol.iterator]: function* () {
      for (let i = 0; i < touches.length; i++) {
        yield touches[i];
      }
    },
  } as unknown as TouchList;

  // Also add array-like indexing
  touches.forEach((touch, i) => {
    (touchList as Record<number, typeof touch>)[i] = touch;
  });

  return {
    type,
    touches: touchList,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  } as unknown as React.TouchEvent;
}

describe('useTouchGestures', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('returns initial gesture state', () => {
      const { result } = renderHook(() => useTouchGestures());

      expect(result.current.gestureState).toEqual({
        gestureType: 'none',
        isGesturing: false,
        scale: 1,
        panX: 0,
        panY: 0,
        centerX: 0,
        centerY: 0,
        touchCount: 0,
      });
    });

    it('returns handlers object', () => {
      const { result } = renderHook(() => useTouchGestures());

      expect(result.current.handlers).toHaveProperty('onTouchStart');
      expect(result.current.handlers).toHaveProperty('onTouchMove');
      expect(result.current.handlers).toHaveProperty('onTouchEnd');
    });

    it('returns resetGesture function', () => {
      const { result } = renderHook(() => useTouchGestures());

      expect(typeof result.current.resetGesture).toBe('function');
    });
  });

  describe('single touch detection', () => {
    it('detects single touch as single-touch gesture type', () => {
      const { result } = renderHook(() => useTouchGestures());

      const touchStart = createTouchEvent('touchstart', [
        { identifier: 0, clientX: 100, clientY: 100 },
      ]);

      act(() => {
        result.current.handlers.onTouchStart(touchStart);
      });

      expect(result.current.gestureState.touchCount).toBe(1);
      expect(result.current.gestureState.gestureType).toBe('single-touch');
      expect(result.current.gestureState.isGesturing).toBe(false);
    });
  });

  describe('two-finger gesture detection', () => {
    it('detects two-finger touch and sets isGesturing', () => {
      const { result } = renderHook(() => useTouchGestures());

      const touchStart = createTouchEvent('touchstart', [
        { identifier: 0, clientX: 100, clientY: 100 },
        { identifier: 1, clientX: 200, clientY: 100 },
      ]);

      act(() => {
        result.current.handlers.onTouchStart(touchStart);
      });

      expect(result.current.gestureState.touchCount).toBe(2);
      expect(result.current.gestureState.isGesturing).toBe(true);
    });

    it('calculates center point between two touches', () => {
      const { result } = renderHook(() => useTouchGestures());

      const touchStart = createTouchEvent('touchstart', [
        { identifier: 0, clientX: 100, clientY: 100 },
        { identifier: 1, clientX: 200, clientY: 200 },
      ]);

      act(() => {
        result.current.handlers.onTouchStart(touchStart);
      });

      // Center should be (150, 150)
      expect(result.current.gestureState.centerX).toBe(150);
      expect(result.current.gestureState.centerY).toBe(150);
    });
  });

  describe('pinch gesture', () => {
    it('detects pinch-out (spread) gesture', () => {
      const onPinch = vi.fn();
      const { result } = renderHook(() => useTouchGestures({ onPinch }));

      // Start with fingers 100px apart
      const touchStart = createTouchEvent('touchstart', [
        { identifier: 0, clientX: 100, clientY: 100 },
        { identifier: 1, clientX: 200, clientY: 100 },
      ]);

      act(() => {
        result.current.handlers.onTouchStart(touchStart);
      });

      // Move fingers 150px apart (50% larger)
      const touchMove = createTouchEvent('touchmove', [
        { identifier: 0, clientX: 75, clientY: 100 },
        { identifier: 1, clientX: 225, clientY: 100 },
      ]);

      act(() => {
        result.current.handlers.onTouchMove(touchMove);
      });

      expect(onPinch).toHaveBeenCalled();
      expect(result.current.gestureState.gestureType).toBe('pinch');
    });

    it('detects pinch-in (pinch) gesture', () => {
      const onPinch = vi.fn();
      const { result } = renderHook(() => useTouchGestures({ onPinch }));

      // Start with fingers 100px apart
      const touchStart = createTouchEvent('touchstart', [
        { identifier: 0, clientX: 100, clientY: 100 },
        { identifier: 1, clientX: 200, clientY: 100 },
      ]);

      act(() => {
        result.current.handlers.onTouchStart(touchStart);
      });

      // Move fingers 50px apart (50% smaller)
      const touchMove = createTouchEvent('touchmove', [
        { identifier: 0, clientX: 125, clientY: 100 },
        { identifier: 1, clientX: 175, clientY: 100 },
      ]);

      act(() => {
        result.current.handlers.onTouchMove(touchMove);
      });

      expect(onPinch).toHaveBeenCalled();
      // Scale should be less than 1
      const callArg = onPinch.mock.calls[0][0];
      expect(callArg).toBeLessThan(1);
    });
  });

  describe('gesture callbacks', () => {
    it('calls onGestureStart when gesture begins', () => {
      const onGestureStart = vi.fn();
      const onPinch = vi.fn();
      const { result } = renderHook(() => useTouchGestures({ onGestureStart, onPinch }));

      // Start two-finger touch
      const touchStart = createTouchEvent('touchstart', [
        { identifier: 0, clientX: 100, clientY: 100 },
        { identifier: 1, clientX: 200, clientY: 100 },
      ]);

      act(() => {
        result.current.handlers.onTouchStart(touchStart);
      });

      // Move to trigger gesture detection
      const touchMove = createTouchEvent('touchmove', [
        { identifier: 0, clientX: 50, clientY: 100 },
        { identifier: 1, clientX: 250, clientY: 100 },
      ]);

      act(() => {
        result.current.handlers.onTouchMove(touchMove);
      });

      expect(onGestureStart).toHaveBeenCalledWith('pinch');
    });

    it('calls onGestureEnd when gesture ends', () => {
      const onGestureEnd = vi.fn();
      const onPinch = vi.fn();
      const { result } = renderHook(() => useTouchGestures({ onGestureEnd, onPinch }));

      // Start two-finger touch
      const touchStart = createTouchEvent('touchstart', [
        { identifier: 0, clientX: 100, clientY: 100 },
        { identifier: 1, clientX: 200, clientY: 100 },
      ]);

      act(() => {
        result.current.handlers.onTouchStart(touchStart);
      });

      // Trigger gesture
      const touchMove = createTouchEvent('touchmove', [
        { identifier: 0, clientX: 50, clientY: 100 },
        { identifier: 1, clientX: 250, clientY: 100 },
      ]);

      act(() => {
        result.current.handlers.onTouchMove(touchMove);
      });

      // End gesture (one finger lifted)
      const touchEnd = createTouchEvent('touchend', [{ identifier: 0, clientX: 50, clientY: 100 }]);

      act(() => {
        result.current.handlers.onTouchEnd(touchEnd);
      });

      expect(onGestureEnd).toHaveBeenCalledWith('pinch');
    });
  });

  describe('enabled option', () => {
    it('does not process gestures when disabled', () => {
      const onPinch = vi.fn();
      const { result } = renderHook(() => useTouchGestures({ onPinch, enabled: false }));

      const touchStart = createTouchEvent('touchstart', [
        { identifier: 0, clientX: 100, clientY: 100 },
        { identifier: 1, clientX: 200, clientY: 100 },
      ]);

      act(() => {
        result.current.handlers.onTouchStart(touchStart);
      });

      // Gesture state should remain unchanged
      expect(result.current.gestureState.isGesturing).toBe(false);
      expect(result.current.gestureState.touchCount).toBe(0);
    });
  });

  describe('resetGesture', () => {
    it('resets gesture state to initial values', () => {
      const { result } = renderHook(() => useTouchGestures());

      // Start a gesture
      const touchStart = createTouchEvent('touchstart', [
        { identifier: 0, clientX: 100, clientY: 100 },
        { identifier: 1, clientX: 200, clientY: 100 },
      ]);

      act(() => {
        result.current.handlers.onTouchStart(touchStart);
      });

      expect(result.current.gestureState.isGesturing).toBe(true);

      // Reset
      act(() => {
        result.current.resetGesture();
      });

      expect(result.current.gestureState).toEqual({
        gestureType: 'none',
        isGesturing: false,
        scale: 1,
        panX: 0,
        panY: 0,
        centerX: 0,
        centerY: 0,
        touchCount: 0,
      });
    });
  });
});
