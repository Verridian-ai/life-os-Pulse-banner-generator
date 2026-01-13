/**
 * CanvasRenderer - Core canvas drawing utilities
 *
 * Pure functions for basic canvas operations like drawing images
 * with cover/contain behavior.
 */

/**
 * Draw an image on canvas with object-fit: cover behavior
 * Centers the image and crops to fill the target area
 *
 * @param ctx - Canvas 2D rendering context
 * @param img - Image element to draw
 * @param x - Target X position
 * @param y - Target Y position
 * @param w - Target width
 * @param h - Target height
 * @param offsetX - Horizontal alignment (0-1, default 0.5 = center)
 * @param offsetY - Vertical alignment (0-1, default 0.5 = center)
 */
export function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  offsetX = 0.5,
  offsetY = 0.5,
): void {
  const iw = img.width;
  const ih = img.height;

  // Calculate aspect ratio scale
  const r = Math.min(w / iw, h / ih);
  let nw = iw * r;
  let nh = ih * r;
  let ar = 1;

  // Scale up to cover
  if (nw < w) ar = w / nw;
  if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;
  nw *= ar;
  nh *= ar;

  // Calculate crop region
  let cw = iw / (nw / w);
  let ch = ih / (nh / h);
  let cx = (iw - cw) * offsetX;
  let cy = (ih - ch) * offsetY;

  // Clamp to image bounds
  if (cx < 0) cx = 0;
  if (cy < 0) cy = 0;
  if (cw > iw) cw = iw;
  if (ch > ih) ch = ih;

  ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
}

/**
 * Clear canvas with a solid color
 *
 * @param ctx - Canvas 2D rendering context
 * @param width - Canvas width
 * @param height - Canvas height
 * @param color - Fill color (default: transparent)
 */
export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color?: string,
): void {
  ctx.clearRect(0, 0, width, height);
  if (color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
  }
}

/**
 * Rotate a point around a center point
 *
 * @param x - Point X coordinate
 * @param y - Point Y coordinate
 * @param cx - Center X coordinate
 * @param cy - Center Y coordinate
 * @param angleRad - Rotation angle in radians
 * @returns Rotated point coordinates
 */
export function rotatePoint(
  x: number,
  y: number,
  cx: number,
  cy: number,
  angleRad: number,
): { x: number; y: number } {
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  const dx = x - cx;
  const dy = y - cy;
  return {
    x: cx + (dx * cos - dy * sin),
    y: cy + (dx * sin + dy * cos),
  };
}
