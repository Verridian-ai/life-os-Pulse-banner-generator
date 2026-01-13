/**
 * SafeZoneRenderer - Safe zone overlay drawing utilities
 *
 * Pure functions for rendering platform-specific safe zones
 * (e.g., LinkedIn profile overlap areas, content-safe regions).
 */

import { CANVAS_FORMATS, CanvasFormatId, SafeZoneConfig } from '../../../constants';

/**
 * Draw a rectangular safe zone with label
 *
 * @param ctx - Canvas 2D rendering context
 * @param zone - Safe zone configuration
 * @param defaultColor - Fallback color if zone has no color
 */
export function drawRectZone(
  ctx: CanvasRenderingContext2D,
  zone: SafeZoneConfig,
  defaultColor: string,
): void {
  // Fill zone with color
  ctx.fillStyle = zone.color || defaultColor;
  ctx.fillRect(zone.x, zone.y, zone.width, zone.height);

  // Draw border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);
  ctx.setLineDash([]);

  // Draw label with shadow for visibility
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 3;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = '600 12px Inter, sans-serif';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.fillText(zone.label, zone.x + 8, zone.y + 6);
  ctx.restore();
}

/**
 * Draw a circular safe zone with label (for profile pictures)
 *
 * @param ctx - Canvas 2D rendering context
 * @param zone - Safe zone configuration
 * @param defaultColor - Fallback color if zone has no color
 */
export function drawCircleZone(
  ctx: CanvasRenderingContext2D,
  zone: SafeZoneConfig,
  defaultColor: string,
): void {
  const radius = zone.radius || Math.min(zone.width, zone.height) / 2;

  ctx.fillStyle = zone.color || defaultColor;
  ctx.beginPath();
  ctx.arc(zone.x, zone.y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Label outside circle
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 3;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = '600 12px Inter, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText(zone.label, zone.x + radius + 10, zone.y);
  ctx.restore();
}

/**
 * Draw dimensions watermark when no background is set
 *
 * @param ctx - Canvas 2D rendering context
 * @param canvasWidth - Canvas width
 * @param canvasHeight - Canvas height
 * @param formatName - Display name of the format
 * @param hasBackground - Whether a background image exists
 */
export function drawDimensionsWatermark(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  formatName: string,
  hasBackground: boolean,
): void {
  if (hasBackground) return;

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 4;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Scale font size based on canvas size
  const baseFontSize = Math.min(canvasWidth, canvasHeight) / 10;
  ctx.font = `800 ${Math.max(24, baseFontSize)}px Inter, sans-serif`;
  ctx.fillText(formatName, canvasWidth / 2, canvasHeight / 2 - 30);

  ctx.font = `700 ${Math.max(18, baseFontSize * 0.75)}px Inter, sans-serif`;
  ctx.fillText(`${canvasWidth} x ${canvasHeight} px`, canvasWidth / 2, canvasHeight / 2 + 30);
  ctx.restore();
}

/**
 * Determine zone color based on zone type/label
 *
 * @param zone - Safe zone configuration
 * @returns Appropriate default color for the zone
 */
export function getZoneColor(zone: SafeZoneConfig): string {
  const isContentSafe = zone.label.toLowerCase().includes('safe');
  const isUniversal = zone.label.toLowerCase().includes('universal');

  if (isUniversal) {
    return 'rgba(59, 130, 246, 0.15)'; // Blue for universal
  } else if (isContentSafe) {
    return 'rgba(34, 197, 94, 0.15)'; // Green for content-safe
  }
  return 'rgba(239, 68, 68, 0.12)'; // Red for danger/overlap zones
}

/**
 * Draw all safe zones for a canvas format
 *
 * @param ctx - Canvas 2D rendering context
 * @param canvasFormatId - Format identifier (e.g., 'linkedin_banner')
 * @param canvasWidth - Canvas width
 * @param canvasHeight - Canvas height
 * @param hasBackground - Whether a background image exists
 */
export function drawSafeZones(
  ctx: CanvasRenderingContext2D,
  canvasFormatId: CanvasFormatId,
  canvasWidth: number,
  canvasHeight: number,
  hasBackground: boolean,
): void {
  const format = CANVAS_FORMATS[canvasFormatId];

  // Always draw dimensions watermark if no background
  drawDimensionsWatermark(ctx, canvasWidth, canvasHeight, format?.name || 'Canvas', hasBackground);

  // If no format or no safe zones, just show dimensions
  if (!format || !format.safeZones || format.safeZones.length === 0) {
    return;
  }

  ctx.save();

  for (const zone of format.safeZones) {
    const defaultColor = getZoneColor(zone);

    if (zone.type === 'rect') {
      drawRectZone(ctx, zone, defaultColor);
    } else if (zone.type === 'circle') {
      drawCircleZone(ctx, zone, defaultColor);
    }
  }

  ctx.restore();
}
