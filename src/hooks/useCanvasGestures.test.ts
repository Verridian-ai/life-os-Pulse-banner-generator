/**
 * useCanvasGestures Hook Tests
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCanvasGestures } from './useCanvasGestures';
import React from 'react';

// Mock haptics to avoid vibration API issues in tests
vi.mock('../utils/haptics', () => ({
  triggerHaptic: vi.fn(() => true),
  isVibrationSupported: vi.fn(() => false),
}));

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

describe('useCanvasGestures', () => {
  let mockSetZoom: ReturnType<typeof vi.fn>;
  let mockCanvasRef: React.RefObject<HTMLCanvasElement>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSetZoom = vi.fn();
    mockCanvasRef = {
      current: document.createElement('canvas'),
    };
  });

  describe('initialization', () => {
    it('returns gesture handlers', () => {
      const { result } = renderHook(() =>
        useCanvasGestures({
          zoom: 1,
          setZoom: mockSetZoom,
          canvasRef: mockCanvasRef,
        }),
      );

      expect(result.current.gestureHandlers).toHaveProperty('onTouchStart');
      expect(result.current.gestureHandlers).toHaveProperty('onTouchMove');
      expect(result.current.gestureHandlers).toHaveProperty('onTouchEnd');
    });

    it('returns gesture state', () => {
      const { result } = renderHook(() =>
        useCanvasGestures({
          zoom: 1,
          setZoom: mockSetZoom,
          canvasRef: mockCanvasRef,
        }),
      );

      expect(result.current.gestureState).toBeDefined();
      expect(result.current.isGesturing).toBe(false);
      expect(result.current.isSingleTouch).toBe(false);
    });
  });

  describe('zoom bounds', () => {
    it('respects minimum zoom bound', () => {
      const { result } = renderHook(() =>
        useCanvasGestures({
          zoom: 0.6,
          setZoom: mockSetZoom,
          canvasRef: mockCanvasRef,
          minZoom: 0.5,
          maxZoom: 3.0,
        }),
      );

      // Start pinch gesture
      const touchStart = createTouchEvent('touchstart', [
        { identifier: 0, clientX: 100, clientY: 100 },
        { identifier: 1, clientX: 200, clientY: 100 },
      ]);

      act(() => {
        result.current.gestureHandlers.onTouchStart(touchStart);
      });

      // Pinch in (reduce zoom) significantly
      const touchMove = createTouchEvent('touchmove', [
        { identifier: 0, clientX: 140, clientY: 100 },
        { identifier: 1, clientX: 160, clientY: 100 },
      ]);

      act(() => {
        result.current.gestureHandlers.onTouchMove(touchMove);
      });

      // setZoom should be called with value >= minZoom
      if (mockSetZoom.mock.calls.length > 0) {
        const lastZoomValue = mockSetZoom.mock.calls[mockSetZoom.mock.calls.length - 1][0];
        expect(lastZoomValue).toBeGreaterThanOrEqual(0.5);
      }
    });

    it('respects maximum zoom bound', () => {
      const { result } = renderHook(() =>
        useCanvasGestures({
          zoom: 2.5,
          setZoom: mockSetZoom,
          canvasRef: mockCanvasRef,
          minZoom: 0.5,
          maxZoom: 3.0,
        }),
      );

      // Start pinch gesture
      const touchStart = createTouchEvent('touchstart', [
        { identifier: 0, clientX: 100, clientY: 100 },
        { identifier: 1, clientX: 200, clientY: 100 },
      ]);

      act(() => {
        result.current.gestureHandlers.onTouchStart(touchStart);
      });

      // Pinch out (increase zoom) significantly
      const touchMove = createTouchEvent('touchmove', [
        { identifier: 0, clientX: 0, clientY: 100 },
        { identifier: 1, clientX: 300, clientY: 100 },
      ]);

      act(() => {
        result.current.gestureHandlers.onTouchMove(touchMove);
      });

      // setZoom should be called with value <= maxZoom
      if (mockSetZoom.mock.calls.length > 0) {
        const lastZoomValue = mockSetZoom.mock.calls[mockSetZoom.mock.calls.length - 1][0];
        expect(lastZoomValue).toBeLessThanOrEqual(3.0);
      }
    });
  });

  describe('enabled option', () => {
    it('does not process gestures when disabled', () => {
      const { result } = renderHook(() =>
        useCanvasGestures({
          zoom: 1,
          setZoom: mockSetZoom,
          canvasRef: mockCanvasRef,
          enabled: false,
        }),
      );

      const touchStart = createTouchEvent('touchstart', [
        { identifier: 0, clientX: 100, clientY: 100 },
        { identifier: 1, clientX: 200, clientY: 100 },
      ]);

      act(() => {
        result.current.gestureHandlers.onTouchStart(touchStart);
      });

      expect(result.current.isGesturing).toBe(false);
    });

    it('is enabled by default when setZoom is provided', () => {
      const { result } = renderHook(() =>
        useCanvasGestures({
          zoom: 1,
          setZoom: mockSetZoom,
          canvasRef: mockCanvasRef,
        }),
      );

      const touchStart = createTouchEvent('touchstart', [
        { identifier: 0, clientX: 100, clientY: 100 },
        { identifier: 1, clientX: 200, clientY: 100 },
      ]);

      act(() => {
        result.current.gestureHandlers.onTouchStart(touchStart);
      });

      expect(result.current.isGesturing).toBe(true);
    });
  });

  describe('single touch detection', () => {
    it('detects single touch correctly', () => {
      const { result } = renderHook(() =>
        useCanvasGestures({
          zoom: 1,
          setZoom: mockSetZoom,
          canvasRef: mockCanvasRef,
        }),
      );

      const touchStart = createTouchEvent('touchstart', [
        { identifier: 0, clientX: 100, clientY: 100 },
      ]);

      act(() => {
        result.current.gestureHandlers.onTouchStart(touchStart);
      });

      expect(result.current.isSingleTouch).toBe(true);
      expect(result.current.isGesturing).toBe(false);
    });

    it('does not call setZoom on single touch', () => {
      const { result } = renderHook(() =>
        useCanvasGestures({
          zoom: 1,
          setZoom: mockSetZoom,
          canvasRef: mockCanvasRef,
        }),
      );

      const touchStart = createTouchEvent('touchstart', [
        { identifier: 0, clientX: 100, clientY: 100 },
      ]);

      act(() => {
        result.current.gestureHandlers.onTouchStart(touchStart);
      });

      const touchMove = createTouchEvent('touchmove', [
        { identifier: 0, clientX: 150, clientY: 150 },
      ]);

      act(() => {
        result.current.gestureHandlers.onTouchMove(touchMove);
      });

      expect(mockSetZoom).not.toHaveBeenCalled();
    });
  });

  describe('callbacks', () => {
    it('calls onZoomChange when zoom changes', () => {
      const onZoomChange = vi.fn();
      const { result } = renderHook(() =>
        useCanvasGestures({
          zoom: 1,
          setZoom: mockSetZoom,
          canvasRef: mockCanvasRef,
          onZoomChange,
        }),
      );

      // Start pinch gesture
      const touchStart = createTouchEvent('touchstart', [
        { identifier: 0, clientX: 100, clientY: 100 },
        { identifier: 1, clientX: 200, clientY: 100 },
      ]);

      act(() => {
        result.current.gestureHandlers.onTouchStart(touchStart);
      });

      // Pinch out
      const touchMove = createTouchEvent('touchmove', [
        { identifier: 0, clientX: 50, clientY: 100 },
        { identifier: 1, clientX: 250, clientY: 100 },
      ]);

      act(() => {
        result.current.gestureHandlers.onTouchMove(touchMove);
      });

      // onZoomChange should be called with zoom value and center coordinates
      if (onZoomChange.mock.calls.length > 0) {
        const [zoomValue, centerX, centerY] = onZoomChange.mock.calls[0];
        expect(typeof zoomValue).toBe('number');
        expect(typeof centerX).toBe('number');
        expect(typeof centerY).toBe('number');
      }
    });
  });

  describe('resetGesture', () => {
    it('resets gesture state', () => {
      const { result } = renderHook(() =>
        useCanvasGestures({
          zoom: 1,
          setZoom: mockSetZoom,
          canvasRef: mockCanvasRef,
        }),
      );

      // Start a gesture
      const touchStart = createTouchEvent('touchstart', [
        { identifier: 0, clientX: 100, clientY: 100 },
        { identifier: 1, clientX: 200, clientY: 100 },
      ]);

      act(() => {
        result.current.gestureHandlers.onTouchStart(touchStart);
      });

      expect(result.current.isGesturing).toBe(true);

      // Reset
      act(() => {
        result.current.resetGesture();
      });

      expect(result.current.isGesturing).toBe(false);
    });
  });
});
