/**
 * useTouchGestures Hook
 *
 * Multi-touch gesture detection for pinch-to-zoom and two-finger pan.
 * Provides gesture state and handlers for touch interactions.
 *
 * @example
 * const { gestureState, handlers } = useTouchGestures({
 *   onPinch: (scale, center) => setZoom(prev => prev * scale),
 *   onPan: (dx, dy) => setPan(prev => ({ x: prev.x + dx, y: prev.y + dy })),
 * });
 *
 * <div {...handlers}>...</div>
 */

import { useRef, useCallback, useState } from 'react';

export type GestureType = 'none' | 'pinch' | 'pan' | 'single-touch';

export interface GestureState {
  /** Current gesture type being performed */
  gestureType: GestureType;
  /** Whether a multi-touch gesture is in progress */
  isGesturing: boolean;
  /** Current pinch scale factor (1.0 = no scale) */
  scale: number;
  /** Cumulative pan X offset */
  panX: number;
  /** Cumulative pan Y offset */
  panY: number;
  /** Center X coordinate of the gesture (for zoom-to-point) */
  centerX: number;
  /** Center Y coordinate of the gesture */
  centerY: number;
  /** Number of active touch points */
  touchCount: number;
}

export interface TouchGestureOptions {
  /** Callback when pinch gesture changes scale */
  onPinch?: (scale: number, centerX: number, centerY: number) => void;
  /** Callback when two-finger pan gesture moves */
  onPan?: (deltaX: number, deltaY: number) => void;
  /** Callback when gesture starts */
  onGestureStart?: (gestureType: GestureType) => void;
  /** Callback when gesture ends */
  onGestureEnd?: (gestureType: GestureType) => void;
  /** Minimum distance change to register as pinch (prevents jitter) */
  pinchThreshold?: number;
  /** Minimum movement to register as pan (prevents jitter) */
  panThreshold?: number;
  /** Whether gestures are enabled */
  enabled?: boolean;
}

interface TouchPoint {
  id: number;
  x: number;
  y: number;
}

/**
 * Calculate distance between two touch points
 */
function getDistance(p1: TouchPoint, p2: TouchPoint): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate center point between two touches
 */
function getCenter(p1: TouchPoint, p2: TouchPoint): { x: number; y: number } {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
}

/**
 * Determine gesture type based on touch movement
 * If fingers move in same direction = pan
 * If fingers move toward/away from each other = pinch
 */
function detectGestureType(
  prevP1: TouchPoint,
  prevP2: TouchPoint,
  currP1: TouchPoint,
  currP2: TouchPoint,
  threshold: number
): GestureType {
  const prevDist = getDistance(prevP1, prevP2);
  const currDist = getDistance(currP1, currP2);
  const distChange = Math.abs(currDist - prevDist);

  // Movement vectors for each finger
  const v1 = { x: currP1.x - prevP1.x, y: currP1.y - prevP1.y };
  const v2 = { x: currP2.x - prevP2.x, y: currP2.y - prevP2.y };

  // Check if movements are parallel (pan) or convergent/divergent (pinch)
  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

  // If distance between fingers changes significantly, it's a pinch
  if (distChange > threshold) {
    return 'pinch';
  }

  // If both fingers move in same direction (parallel), it's a pan
  if (mag1 > threshold && mag2 > threshold && dot > 0) {
    return 'pan';
  }

  return 'none';
}

/**
 * Hook for detecting and handling multi-touch gestures
 */
export function useTouchGestures(options: TouchGestureOptions = {}) {
  const {
    onPinch,
    onPan,
    onGestureStart,
    onGestureEnd,
    pinchThreshold = 5,
    panThreshold = 3,
    enabled = true,
  } = options;

  const [gestureState, setGestureState] = useState<GestureState>({
    gestureType: 'none',
    isGesturing: false,
    scale: 1,
    panX: 0,
    panY: 0,
    centerX: 0,
    centerY: 0,
    touchCount: 0,
  });

  // Track touch points for gesture calculation
  const touchesRef = useRef<Map<number, TouchPoint>>(new Map());
  const initialDistanceRef = useRef<number>(0);
  const initialCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastTouchesRef = useRef<TouchPoint[]>([]);
  const gestureTypeRef = useRef<GestureType>('none');
  const cumulativeScaleRef = useRef<number>(1);

  /**
   * Convert TouchList to array of TouchPoints
   * Works with both native TouchList and React.TouchList
   */
  const getTouchPoints = useCallback((touches: React.TouchList): TouchPoint[] => {
    const points: TouchPoint[] = [];
    for (let i = 0; i < touches.length; i++) {
      const touch = touches.item(i);
      if (touch) {
        points.push({
          id: touch.identifier,
          x: touch.clientX,
          y: touch.clientY,
        });
      }
    }
    return points;
  }, []);

  /**
   * Handle touch start - initialize gesture tracking
   */
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled) return;

      const points = getTouchPoints(e.touches);

      // Store all current touches
      touchesRef.current.clear();
      points.forEach((p) => touchesRef.current.set(p.id, p));

      const touchCount = points.length;

      if (touchCount === 2) {
        // Initialize two-finger gesture
        const [p1, p2] = points;
        initialDistanceRef.current = getDistance(p1, p2);
        initialCenterRef.current = getCenter(p1, p2);
        lastTouchesRef.current = [p1, p2];
        cumulativeScaleRef.current = 1;
        gestureTypeRef.current = 'none';

        setGestureState((prev) => ({
          ...prev,
          touchCount,
          isGesturing: true,
          centerX: initialCenterRef.current.x,
          centerY: initialCenterRef.current.y,
        }));
      } else if (touchCount === 1) {
        // Single touch - let parent handle element dragging
        gestureTypeRef.current = 'single-touch';
        setGestureState((prev) => ({
          ...prev,
          touchCount,
          gestureType: 'single-touch',
          isGesturing: false,
        }));
      } else {
        // More than 2 fingers - ignore
        setGestureState((prev) => ({
          ...prev,
          touchCount,
        }));
      }
    },
    [enabled, getTouchPoints]
  );

  /**
   * Handle touch move - detect and process gestures
   */
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled) return;

      const points = getTouchPoints(e.touches);

      if (points.length === 2 && lastTouchesRef.current.length === 2) {
        const [currP1, currP2] = points;
        const [prevP1, prevP2] = lastTouchesRef.current;

        // Detect gesture type if not yet determined
        if (gestureTypeRef.current === 'none') {
          gestureTypeRef.current = detectGestureType(
            prevP1,
            prevP2,
            currP1,
            currP2,
            pinchThreshold
          );

          if (gestureTypeRef.current !== 'none') {
            onGestureStart?.(gestureTypeRef.current);
          }
        }

        const currentDistance = getDistance(currP1, currP2);
        const currentCenter = getCenter(currP1, currP2);

        if (gestureTypeRef.current === 'pinch' || gestureTypeRef.current === 'none') {
          // Calculate scale change
          if (initialDistanceRef.current > 0) {
            const scale = currentDistance / initialDistanceRef.current;

            // Only trigger callback if scale changed significantly
            if (Math.abs(scale - cumulativeScaleRef.current) > 0.01) {
              cumulativeScaleRef.current = scale;

              setGestureState((prev) => ({
                ...prev,
                gestureType: 'pinch',
                scale,
                centerX: currentCenter.x,
                centerY: currentCenter.y,
              }));

              onPinch?.(scale, currentCenter.x, currentCenter.y);
              gestureTypeRef.current = 'pinch';
            }
          }
        }

        if (gestureTypeRef.current === 'pan') {
          // Calculate pan delta from center movement
          const deltaX = currentCenter.x - initialCenterRef.current.x;
          const deltaY = currentCenter.y - initialCenterRef.current.y;

          // Calculate frame-by-frame delta for smooth panning
          const prevCenter = getCenter(prevP1, prevP2);
          const frameDeltaX = currentCenter.x - prevCenter.x;
          const frameDeltaY = currentCenter.y - prevCenter.y;

          if (Math.abs(frameDeltaX) > 0.5 || Math.abs(frameDeltaY) > 0.5) {
            setGestureState((prev) => ({
              ...prev,
              gestureType: 'pan',
              panX: deltaX,
              panY: deltaY,
              centerX: currentCenter.x,
              centerY: currentCenter.y,
            }));

            onPan?.(frameDeltaX, frameDeltaY);
          }
        }

        // Update last touches for next frame
        lastTouchesRef.current = [currP1, currP2];
      }
    },
    [enabled, getTouchPoints, onPinch, onPan, onGestureStart, pinchThreshold]
  );

  /**
   * Handle touch end - finalize gesture
   */
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled) return;

      const points = getTouchPoints(e.touches);
      const remainingCount = points.length;

      // Clear ended touches
      touchesRef.current.clear();
      points.forEach((p) => touchesRef.current.set(p.id, p));

      if (remainingCount < 2) {
        // Gesture ended
        const endedType = gestureTypeRef.current;
        if (endedType !== 'none' && endedType !== 'single-touch') {
          onGestureEnd?.(endedType);
        }

        // Reset gesture state
        gestureTypeRef.current = remainingCount === 1 ? 'single-touch' : 'none';
        initialDistanceRef.current = 0;
        cumulativeScaleRef.current = 1;
        lastTouchesRef.current = [];

        setGestureState({
          gestureType: remainingCount === 1 ? 'single-touch' : 'none',
          isGesturing: false,
          scale: 1,
          panX: 0,
          panY: 0,
          centerX: 0,
          centerY: 0,
          touchCount: remainingCount,
        });
      } else {
        // Still have 2+ touches, update references
        const [p1, p2] = points;
        initialDistanceRef.current = getDistance(p1, p2);
        initialCenterRef.current = getCenter(p1, p2);
        lastTouchesRef.current = [p1, p2];
      }
    },
    [enabled, getTouchPoints, onGestureEnd]
  );

  /**
   * Reset gesture state (useful when disabling gestures)
   */
  const resetGesture = useCallback(() => {
    touchesRef.current.clear();
    initialDistanceRef.current = 0;
    cumulativeScaleRef.current = 1;
    lastTouchesRef.current = [];
    gestureTypeRef.current = 'none';

    setGestureState({
      gestureType: 'none',
      isGesturing: false,
      scale: 1,
      panX: 0,
      panY: 0,
      centerX: 0,
      centerY: 0,
      touchCount: 0,
    });
  }, []);

  return {
    gestureState,
    resetGesture,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}

export default useTouchGestures;
