/**
 * SelectionOverlay - Element selection UI rendering
 *
 * Pure functions for drawing selection handles, rotation controls,
 * and bounding boxes around selected canvas elements.
 */

import { rotatePoint } from './CanvasRenderer';

/** Size of resize handles (touch-friendly) */
export const HANDLE_SIZE = 20;

/** Half handle size for centering */
export const HANDLE_OFFSET = HANDLE_SIZE / 2;

/** Distance of rotation handle from element top */
export const ROTATION_HANDLE_DIST = 30;

/** Types of resize handles */
export type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w' | 'rot';

/** Element bounding rectangle with rotation */
export interface ElementRect {
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
}

/**
 * Draw selection overlay (bounding box + handles) for an element
 *
 * @param ctx - Canvas 2D rendering context
 * @param rect - Element bounding rectangle
 */
export function drawSelectionOverlay(ctx: CanvasRenderingContext2D, rect: ElementRect): void {
  const rotation = rect.rotation || 0;
  const angleRad = (rotation * Math.PI) / 180;
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angleRad);
  ctx.translate(-cx, -cy);

  // Draw bounding box
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(rect.x - 2, rect.y - 2, rect.w + 4, rect.h + 4);
  ctx.setLineDash([]);

  // Draw corner handles
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 1;

  const handles = [
    { x: rect.x - HANDLE_OFFSET, y: rect.y - HANDLE_OFFSET },
    { x: rect.x + rect.w - HANDLE_OFFSET, y: rect.y - HANDLE_OFFSET },
    { x: rect.x - HANDLE_OFFSET, y: rect.y + rect.h - HANDLE_OFFSET },
    { x: rect.x + rect.w - HANDLE_OFFSET, y: rect.y + rect.h - HANDLE_OFFSET },
  ];

  handles.forEach((h) => {
    ctx.fillRect(h.x, h.y, HANDLE_SIZE, HANDLE_SIZE);
    ctx.strokeRect(h.x, h.y, HANDLE_SIZE, HANDLE_SIZE);
  });

  // Rotation Handle
  const rotX = rect.x + rect.w / 2;
  const rotY = rect.y - ROTATION_HANDLE_DIST;

  // Line to handle
  ctx.beginPath();
  ctx.moveTo(rotX, rect.y);
  ctx.lineTo(rotX, rotY);
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Circle Handle
  ctx.beginPath();
  ctx.arc(rotX, rotY, 6, 0, 2 * Math.PI);
  ctx.fillStyle = '#3b82f6';
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}

/**
 * Check if a point is over a resize/rotation handle
 *
 * @param x - Point X coordinate
 * @param y - Point Y coordinate
 * @param rect - Element bounding rectangle
 * @returns Handle type if over a handle, null otherwise
 */
export function isOverHandle(x: number, y: number, rect: ElementRect): ResizeHandle | null {
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  const angleRad = ((rect.rotation || 0) * Math.PI) / 180;

  // Transform point to element's local coordinate system
  const localP = rotatePoint(x, y, cx, cy, -angleRad);

  // Define handle positions
  const handles: { t: ResizeHandle; cx: number; cy: number }[] = [
    { t: 'nw', cx: rect.x, cy: rect.y },
    { t: 'ne', cx: rect.x + rect.w, cy: rect.y },
    { t: 'sw', cx: rect.x, cy: rect.y + rect.h },
    { t: 'se', cx: rect.x + rect.w, cy: rect.y + rect.h },
    { t: 'n', cx: rect.x + rect.w / 2, cy: rect.y },
    { t: 's', cx: rect.x + rect.w / 2, cy: rect.y + rect.h },
    { t: 'w', cx: rect.x, cy: rect.y + rect.h / 2 },
    { t: 'e', cx: rect.x + rect.w, cy: rect.y + rect.h / 2 },
  ];

  // Check each handle
  for (const h of handles) {
    if (
      localP.x >= h.cx - HANDLE_SIZE &&
      localP.x <= h.cx + HANDLE_SIZE &&
      localP.y >= h.cy - HANDLE_SIZE &&
      localP.y <= h.cy + HANDLE_SIZE
    ) {
      return h.t;
    }
  }

  // Check rotation handle
  const rotCx = cx;
  const rotCy = rect.y - ROTATION_HANDLE_DIST;
  if (
    localP.x >= rotCx - HANDLE_SIZE &&
    localP.x <= rotCx + HANDLE_SIZE &&
    localP.y >= rotCy - HANDLE_SIZE &&
    localP.y <= rotCy + HANDLE_SIZE
  ) {
    return 'rot';
  }

  return null;
}

/**
 * Get cursor style for a handle type
 *
 * @param handle - Handle type
 * @returns CSS cursor value
 */
export function getCursorForHandle(handle: ResizeHandle | null): string {
  if (!handle) return 'default';

  switch (handle) {
    case 'rot':
      return 'grab';
    case 'nw':
    case 'se':
      return 'nwse-resize';
    case 'ne':
    case 'sw':
      return 'nesw-resize';
    case 'n':
    case 's':
      return 'ns-resize';
    case 'e':
    case 'w':
      return 'ew-resize';
    default:
      return 'default';
  }
}
