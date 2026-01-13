/**
 * useCanvasGestures Hook
 *
 * Canvas-specific gesture handling for pinch-to-zoom and two-finger pan.
 * Wraps useTouchGestures with zoom bounds, pan limits, and canvas coordinate conversion.
 *
 * @example
 * const { gestureHandlers, isGesturing } = useCanvasGestures({
 *   zoom,
 *   setZoom,
 *   canvasRef,
 *   minZoom: 0.5,
 *   maxZoom: 3,
 * });
 *
 * <canvas {...gestureHandlers} />
 */

import { useCallback, useRef, RefObject } from 'react';
import { useTouchGestures, GestureState, GestureType } from './useTouchGestures';
import { triggerHaptic } from '../utils/haptics';

export interface CanvasGestureOptions {
  /** Current zoom level */
  zoom: number;
  /** Callback to update zoom level */
  setZoom: (zoom: number) => void;
  /** Reference to the canvas element for coordinate conversion */
  canvasRef: RefObject<HTMLCanvasElement | null>;
  /** Minimum zoom level (default: 0.5) */
  minZoom?: number;
  /** Maximum zoom level (default: 3.0) */
  maxZoom?: number;
  /** Whether gestures are enabled (default: true) */
  enabled?: boolean;
  /** Callback when zoom changes */
  onZoomChange?: (zoom: number, centerX: number, centerY: number) => void;
  /** Callback when pan changes */
  onPanChange?: (deltaX: number, deltaY: number) => void;
  /** Whether to trigger haptic feedback (default: true) */
  enableHaptics?: boolean;
}

export interface CanvasGestureResult {
  /** Event handlers to spread on the canvas element */
  gestureHandlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
  };
  /** Current gesture state */
  gestureState: GestureState;
  /** Whether a multi-touch gesture is currently in progress */
  isGesturing: boolean;
  /** Whether the touch is a single finger (for element dragging) */
  isSingleTouch: boolean;
  /** Reset gesture state */
  resetGesture: () => void;
}

/**
 * Hook for canvas-specific gesture handling with zoom bounds and pan support
 */
export function useCanvasGestures(options: CanvasGestureOptions): CanvasGestureResult {
  const {
    zoom,
    setZoom,
    canvasRef,
    minZoom = 0.5,
    maxZoom = 3.0,
    enabled = true,
    onZoomChange,
    onPanChange,
    enableHaptics = true,
  } = options;

  // Track the zoom at gesture start for relative scaling
  const initialZoomRef = useRef<number>(zoom);
  const hasHitBoundsRef = useRef<boolean>(false);

  /**
   * Handle pinch gesture - update zoom with bounds
   */
  const handlePinch = useCallback(
    (scale: number, centerX: number, centerY: number) => {
      // Calculate new zoom based on initial zoom and scale factor
      const newZoom = initialZoomRef.current * scale;

      // Clamp to bounds
      const clampedZoom = Math.max(minZoom, Math.min(maxZoom, newZoom));

      // Trigger haptic feedback when hitting bounds
      if (enableHaptics) {
        const hitMin = newZoom < minZoom && !hasHitBoundsRef.current;
        const hitMax = newZoom > maxZoom && !hasHitBoundsRef.current;

        if (hitMin || hitMax) {
          triggerHaptic('BOUNDS_HIT');
          hasHitBoundsRef.current = true;
        } else if (newZoom >= minZoom && newZoom <= maxZoom) {
          hasHitBoundsRef.current = false;
        }
      }

      // Only update if zoom actually changed
      if (Math.abs(clampedZoom - zoom) > 0.001) {
        setZoom(clampedZoom);
        onZoomChange?.(clampedZoom, centerX, centerY);
      }
    },
    [zoom, setZoom, minZoom, maxZoom, onZoomChange, enableHaptics]
  );

  /**
   * Handle pan gesture
   */
  const handlePan = useCallback(
    (deltaX: number, deltaY: number) => {
      // Pan is currently informational - parent can use onPanChange to implement viewport panning
      onPanChange?.(deltaX, deltaY);
    },
    [onPanChange]
  );

  /**
   * Handle gesture start
   */
  const handleGestureStart = useCallback(
    (gestureType: GestureType) => {
      // Store initial zoom when gesture starts
      initialZoomRef.current = zoom;
      hasHitBoundsRef.current = false;

      // Haptic feedback for gesture start
      if (enableHaptics && gestureType !== 'none' && gestureType !== 'single-touch') {
        triggerHaptic('TAP');
      }
    },
    [zoom, enableHaptics]
  );

  /**
   * Handle gesture end
   */
  const handleGestureEnd = useCallback(
    (gestureType: GestureType) => {
      // Haptic feedback for gesture end
      if (enableHaptics && gestureType === 'pinch') {
        triggerHaptic('DROP');
      }
    },
    [enableHaptics]
  );

  // Use the core touch gestures hook
  const { gestureState, handlers, resetGesture } = useTouchGestures({
    onPinch: handlePinch,
    onPan: handlePan,
    onGestureStart: handleGestureStart,
    onGestureEnd: handleGestureEnd,
    enabled,
    pinchThreshold: 5,
    panThreshold: 3,
  });

  // Determine if this is a single touch (for element dragging)
  const isSingleTouch = gestureState.touchCount === 1 && gestureState.gestureType === 'single-touch';
  const isGesturing = gestureState.isGesturing && gestureState.touchCount >= 2;

  return {
    gestureHandlers: handlers,
    gestureState,
    isGesturing,
    isSingleTouch,
    resetGesture,
  };
}

export default useCanvasGestures;
