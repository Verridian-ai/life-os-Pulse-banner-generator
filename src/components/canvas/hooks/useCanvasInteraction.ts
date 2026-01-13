/**
 * useCanvasInteraction Hook
 *
 * Manages canvas element interactions: selection, dragging,
 * resizing, and rotation.
 */

import { useState, useCallback, useRef, RefObject } from 'react';
import { BannerElement } from '../../../types';
import { rotatePoint } from '../core/CanvasRenderer';
import { isOverHandle, ResizeHandle, ElementRect, getCursorForHandle, HANDLE_SIZE } from '../core/SelectionOverlay';

/** Types of drag operations */
export type DragMode = 'move' | 'resize' | 'rotate';

/** State during a drag operation */
export interface DragState {
  mode: DragMode;
  id: string;
  startX: number;
  startY: number;
  initialX: number;
  initialY: number;
  initialW: number;
  initialH: number;
  initialRectX: number;
  initialRectY: number;
  initialFontSize?: number;
  initialRotation?: number;
  handle?: ResizeHandle;
  startAngle?: number;
}

export interface CanvasInteractionOptions {
  /** Reference to the canvas element */
  canvasRef: RefObject<HTMLCanvasElement | null>;
  /** Current elements */
  elements: BannerElement[];
  /** Currently selected element ID */
  selectedElementId: string | null;
  /** Callback to select an element */
  onSelectElement: (id: string | null) => void;
  /** Callback to update elements */
  onElementsChange: (elements: BannerElement[]) => void;
  /** Ref to element rects for hit testing */
  elementRectsRef: RefObject<Record<string, ElementRect>>;
  /** Whether gestures are active (multi-touch) */
  isGesturing?: boolean;
}

export interface CanvasInteractionResult {
  /** Current drag state */
  dragState: DragState | null;
  /** Current cursor style */
  cursor: string;
  /** Handle mouse/touch down */
  handleMouseDown: (e: React.MouseEvent | React.TouchEvent) => void;
  /** Handle mouse/touch move */
  handleMouseMove: (e: React.MouseEvent | React.TouchEvent) => void;
  /** Handle mouse/touch up */
  handleMouseUp: () => void;
  /** Get canvas coordinates from event */
  getCanvasCoords: (e: React.MouseEvent | React.TouchEvent) => { x: number; y: number };
}

/**
 * Hook for canvas element interaction handling
 */
export function useCanvasInteraction(
  options: CanvasInteractionOptions,
): CanvasInteractionResult {
  const {
    canvasRef,
    elements,
    selectedElementId,
    onSelectElement,
    onElementsChange,
    elementRectsRef,
    isGesturing = false,
  } = options;

  const [dragState, setDragState] = useState<DragState | null>(null);
  const [cursor, setCursor] = useState('default');

  /**
   * Convert event coordinates to canvas coordinates
   */
  const getCanvasCoords = useCallback(
    (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0]?.clientX ?? 0 : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0]?.clientY ?? 0 : (e as React.MouseEvent).clientY;

      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    },
    [canvasRef],
  );

  /**
   * Check if point is inside an element
   */
  const hitTestElement = useCallback(
    (x: number, y: number): string | null => {
      const reversedIds = elements.map((el) => el.id).reverse();

      for (const id of reversedIds) {
        const rect = elementRectsRef.current[id];
        if (!rect) continue;

        const cx = rect.x + rect.w / 2;
        const cy = rect.y + rect.h / 2;
        const angleRad = ((rect.rotation || 0) * Math.PI) / 180;
        const localP = rotatePoint(x, y, cx, cy, -angleRad);

        if (
          localP.x >= rect.x &&
          localP.x <= rect.x + rect.w &&
          localP.y >= rect.y &&
          localP.y <= rect.y + rect.h
        ) {
          return id;
        }
      }

      return null;
    },
    [elements, elementRectsRef],
  );

  /**
   * Handle mouse/touch down
   */
  const handleMouseDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      // Skip if multi-touch gesture is in progress
      if (isGesturing) return;

      // For touch events with 2+ touches, let gesture handler take over
      if ('touches' in e && e.touches.length >= 2) return;

      const { x, y } = getCanvasCoords(e);

      // Check if clicking on a handle of selected element
      if (selectedElementId) {
        const rect = elementRectsRef.current[selectedElementId];
        if (rect) {
          const handle = isOverHandle(x, y, rect);
          if (handle) {
            e.preventDefault();
            const el = elements.find((e) => e.id === selectedElementId);
            if (el) {
              const cx = rect.x + rect.w / 2;
              const cy = rect.y + rect.h / 2;
              const startAngle = Math.atan2(y - cy, x - cx);

              setDragState({
                mode: handle === 'rot' ? 'rotate' : 'resize',
                id: selectedElementId,
                handle,
                startX: x,
                startY: y,
                initialX: el.x,
                initialY: el.y,
                initialW: rect.w,
                initialH: rect.h,
                initialRectX: rect.x,
                initialRectY: rect.y,
                initialFontSize: el.fontSize || 48,
                initialRotation: el.rotation || 0,
                startAngle,
              });
            }
            return;
          }
        }
      }

      // Check if clicking on an element
      const hitId = hitTestElement(x, y);

      if (hitId) {
        onSelectElement(hitId);
        const el = elements.find((e) => e.id === hitId);
        const rect = elementRectsRef.current[hitId];
        if (el && rect) {
          e.preventDefault();
          setDragState({
            mode: 'move',
            id: hitId,
            startX: x,
            startY: y,
            initialX: el.x,
            initialY: el.y,
            initialW: rect.w,
            initialH: rect.h,
            initialRectX: rect.x,
            initialRectY: rect.y,
          });
        }
      } else {
        onSelectElement(null);
      }
    },
    [
      isGesturing,
      getCanvasCoords,
      selectedElementId,
      elementRectsRef,
      elements,
      hitTestElement,
      onSelectElement,
    ],
  );

  /**
   * Handle mouse/touch move
   */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      // Skip if multi-touch gesture is in progress
      if (isGesturing) return;

      // For touch events with 2+ touches, let gesture handler take over
      if ('touches' in e && e.touches.length >= 2) return;

      const { x, y } = getCanvasCoords(e);

      // Handle active drag
      if (dragState) {
        e.preventDefault();
        const el = elements.find((e) => e.id === dragState.id);
        if (!el) return;

        const newEl = { ...el };

        if (dragState.mode === 'move') {
          const dx = x - dragState.startX;
          const dy = y - dragState.startY;
          newEl.x = dragState.initialX + dx;
          newEl.y = dragState.initialY + dy;
        } else if (dragState.mode === 'rotate') {
          const cx = dragState.initialRectX + dragState.initialW / 2;
          const cy = dragState.initialRectY + dragState.initialH / 2;
          const currentAngle = Math.atan2(y - cy, x - cx);
          const angleDiff = currentAngle - (dragState.startAngle || 0);
          const newRotation = (dragState.initialRotation || 0) + (angleDiff * 180) / Math.PI;
          newEl.rotation = newRotation;
        } else if (dragState.mode === 'resize' && dragState.handle) {
          const rotationRad = ((dragState.initialRotation || 0) * Math.PI) / 180;
          const cx = dragState.initialRectX + dragState.initialW / 2;
          const cy = dragState.initialRectY + dragState.initialH / 2;

          const localMouse = rotatePoint(x, y, cx, cy, -rotationRad);
          const localStart = rotatePoint(dragState.startX, dragState.startY, cx, cy, -rotationRad);
          const dx = localMouse.x - localStart.x;
          const dy = localMouse.y - localStart.y;

          let newW = dragState.initialW;
          let newH = dragState.initialH;

          if (dragState.handle.includes('e')) newW += dx;
          else if (dragState.handle.includes('w')) newW -= dx;
          if (dragState.handle.includes('s')) newH += dy;
          else if (dragState.handle.includes('n')) newH -= dy;

          if (newW < 20) newW = 20;
          if (newH < 20) newH = 20;

          if (el.type === 'text') {
            let scale = 1;
            if (dragState.handle === 'n' || dragState.handle === 's') {
              scale = newH / dragState.initialH;
            } else {
              scale = newW / dragState.initialW;
            }
            const baseSize = dragState.initialFontSize || 48;
            newEl.fontSize = Math.max(12, Math.round(baseSize * scale));
          } else {
            newEl.width = newW;
            newEl.height = newH;
            const dw = newW - dragState.initialW;
            const dh = newH - dragState.initialH;
            newEl.x = dragState.initialX - dw / 2;
            newEl.y = dragState.initialY - dh / 2;
          }
        }

        onElementsChange(elements.map((e) => (e.id === newEl.id ? newEl : e)));
        return;
      }

      // Update cursor based on hover
      let newCursor = 'default';

      if (selectedElementId) {
        const rect = elementRectsRef.current[selectedElementId];
        if (rect) {
          const handle = isOverHandle(x, y, rect);
          if (handle) {
            newCursor = getCursorForHandle(handle);
          }
        }
      }

      if (newCursor === 'default') {
        const hitId = hitTestElement(x, y);
        if (hitId) {
          newCursor = 'move';
        }
      }

      setCursor(newCursor);
    },
    [
      isGesturing,
      getCanvasCoords,
      dragState,
      elements,
      onElementsChange,
      selectedElementId,
      elementRectsRef,
      hitTestElement,
    ],
  );

  /**
   * Handle mouse/touch up
   */
  const handleMouseUp = useCallback(() => {
    setDragState(null);
  }, []);

  return {
    dragState,
    cursor,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    getCanvasCoords,
  };
}

export default useCanvasInteraction;
