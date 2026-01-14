/**
 * Safe Zone Utilities
 *
 * Provides collision detection, danger zone warnings, and auto-snap
 * functionality for canvas elements.
 */

import type { BannerElement } from '../types';
import type { SafeZoneConfig, CanvasFormat } from '../constants';

// Danger level for warnings
export type DangerLevel = 'none' | 'warning' | 'danger';

// Warning for an element in a danger zone
export interface SafeZoneWarning {
  elementId: string;
  elementName: string;
  zone: SafeZoneConfig;
  dangerLevel: DangerLevel;
  overlapPercentage: number;
  message: string;
  viewportAffected: 'desktop' | 'mobile' | 'both';
  suggestedPosition?: { x: number; y: number };
}

// Element bounding box
interface ElementBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Get the bounding box for an element
 */
export function getElementBounds(element: BannerElement): ElementBounds {
  if (element.type === 'text') {
    // Estimate text width based on fontSize and content length
    // This is approximate; actual measurement needs canvas context
    const fontSize = element.fontSize || 48;
    const avgCharWidth = fontSize * 0.6;
    const width = element.content.length * avgCharWidth;
    const height = fontSize * (element.lineHeight || 1.2);

    let x = element.x;
    const align = element.textAlign || 'left';
    if (align === 'center') {
      x = element.x - width / 2;
    } else if (align === 'right') {
      x = element.x - width;
    }

    return { x, y: element.y, width, height };
  }

  return {
    x: element.x,
    y: element.y,
    width: element.width || 100,
    height: element.height || 100,
  };
}

/**
 * Check if a rectangular element overlaps with a rectangular zone
 */
function rectRectOverlap(
  elem: ElementBounds,
  zone: SafeZoneConfig,
): { overlaps: boolean; percentage: number } {
  const elemRight = elem.x + elem.width;
  const elemBottom = elem.y + elem.height;
  const zoneRight = zone.x + zone.width;
  const zoneBottom = zone.y + zone.height;

  // Check for no overlap
  if (elem.x >= zoneRight || elemRight <= zone.x || elem.y >= zoneBottom || elemBottom <= zone.y) {
    return { overlaps: false, percentage: 0 };
  }

  // Calculate overlap area
  const overlapX = Math.max(0, Math.min(elemRight, zoneRight) - Math.max(elem.x, zone.x));
  const overlapY = Math.max(0, Math.min(elemBottom, zoneBottom) - Math.max(elem.y, zone.y));
  const overlapArea = overlapX * overlapY;
  const elemArea = elem.width * elem.height;

  return {
    overlaps: true,
    percentage: Math.round((overlapArea / elemArea) * 100),
  };
}

/**
 * Check if a rectangular element overlaps with a circular zone
 */
function rectCircleOverlap(
  elem: ElementBounds,
  zone: SafeZoneConfig,
): { overlaps: boolean; percentage: number } {
  const radius = zone.radius || Math.min(zone.width, zone.height) / 2;
  const circleCenterX = zone.x;
  const circleCenterY = zone.y;

  // Find the closest point on the rectangle to the circle center
  const closestX = Math.max(elem.x, Math.min(circleCenterX, elem.x + elem.width));
  const closestY = Math.max(elem.y, Math.min(circleCenterY, elem.y + elem.height));

  // Calculate distance from closest point to circle center
  const distX = circleCenterX - closestX;
  const distY = circleCenterY - closestY;
  const distSquared = distX * distX + distY * distY;

  if (distSquared > radius * radius) {
    return { overlaps: false, percentage: 0 };
  }

  // Approximate overlap percentage (simplified)
  const dist = Math.sqrt(distSquared);
  const penetration = radius - dist;
  const maxPenetration = Math.min(elem.width, elem.height);

  return {
    overlaps: true,
    percentage: Math.min(100, Math.round((penetration / maxPenetration) * 100)),
  };
}

/**
 * Check if an element overlaps with a safe zone
 */
export function checkZoneOverlap(
  element: BannerElement,
  zone: SafeZoneConfig,
): { overlaps: boolean; percentage: number } {
  const bounds = getElementBounds(element);

  if (zone.type === 'circle') {
    return rectCircleOverlap(bounds, zone);
  }
  return rectRectOverlap(bounds, zone);
}

/**
 * Determine if a zone is a danger zone (vs safe zone)
 */
export function isDangerZone(zone: SafeZoneConfig): boolean {
  const label = zone.label.toLowerCase();
  return (
    label.includes('danger') ||
    label.includes('dead') ||
    label.includes('overlap') ||
    label.includes('profile') ||
    label.includes('ui') ||
    label.includes('cover')
  );
}

/**
 * Get the danger level based on overlap percentage
 */
export function getDangerLevel(overlapPercentage: number): DangerLevel {
  if (overlapPercentage === 0) return 'none';
  if (overlapPercentage < 25) return 'warning';
  return 'danger';
}

/**
 * Determine which viewport is affected by the zone
 */
export function getViewportAffected(zone: SafeZoneConfig): 'desktop' | 'mobile' | 'both' {
  const label = zone.label.toLowerCase();
  if (label.includes('mobile')) return 'mobile';
  if (label.includes('desktop')) return 'desktop';
  return 'both';
}

/**
 * Generate a user-friendly warning message
 */
function generateWarningMessage(
  elementName: string,
  zone: SafeZoneConfig,
  overlapPercentage: number,
  viewport: 'desktop' | 'mobile' | 'both',
): string {
  const viewportText = viewport === 'both' ? 'on all devices' : `on ${viewport}`;

  if (overlapPercentage >= 75) {
    return `"${elementName}" is mostly hidden by ${zone.label} ${viewportText}`;
  } else if (overlapPercentage >= 50) {
    return `"${elementName}" is partially covered by ${zone.label} ${viewportText}`;
  } else if (overlapPercentage >= 25) {
    return `"${elementName}" overlaps with ${zone.label} ${viewportText}`;
  }
  return `"${elementName}" is near ${zone.label} - may be partially obscured ${viewportText}`;
}

/**
 * Calculate the nearest safe position for an element
 */
export function calculateSafePosition(
  element: BannerElement,
  zone: SafeZoneConfig,
  canvasWidth: number,
  canvasHeight: number,
): { x: number; y: number } {
  const bounds = getElementBounds(element);

  // Calculate distances to move element out of zone
  let newX = element.x;
  let newY = element.y;

  if (zone.type === 'circle') {
    const radius = zone.radius || Math.min(zone.width, zone.height) / 2;
    const elemCenterX = bounds.x + bounds.width / 2;
    const elemCenterY = bounds.y + bounds.height / 2;

    // Calculate direction from circle center to element center
    const dx = elemCenterX - zone.x;
    const dy = elemCenterY - zone.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      // Move element outside circle radius + element half-width padding
      const targetDist = radius + Math.max(bounds.width, bounds.height) / 2 + 20;
      const scale = targetDist / dist;
      newX = zone.x + dx * scale - bounds.width / 2;
      newY = zone.y + dy * scale - bounds.height / 2;
    } else {
      // Element is at circle center, move it right
      newX = zone.x + radius + 20;
    }
  } else {
    // Rectangular zone - find shortest escape path
    const zoneRight = zone.x + zone.width;
    const zoneBottom = zone.y + zone.height;
    // Element bounds used for escape distance calculations
    const _elemRight = bounds.x + bounds.width;
    const _elemBottom = bounds.y + bounds.height;
    void _elemRight;
    void _elemBottom; // Reserved for future edge-case handling

    // Calculate distances to each edge
    const escapeLeft = bounds.x - zone.x + bounds.width;
    const escapeRight = zoneRight - bounds.x;
    const escapeTop = bounds.y - zone.y + bounds.height;
    const escapeBottom = zoneBottom - bounds.y;

    const minEscape = Math.min(escapeLeft, escapeRight, escapeTop, escapeBottom);

    if (minEscape === escapeLeft) {
      newX = zone.x - bounds.width - 20;
    } else if (minEscape === escapeRight) {
      newX = zoneRight + 20;
    } else if (minEscape === escapeTop) {
      newY = zone.y - bounds.height - 20;
    } else {
      newY = zoneBottom + 20;
    }
  }

  // Clamp to canvas bounds
  newX = Math.max(0, Math.min(newX, canvasWidth - bounds.width));
  newY = Math.max(0, Math.min(newY, canvasHeight - bounds.height));

  return { x: newX, y: newY };
}

/**
 * Analyze all elements against all danger zones and generate warnings
 */
export function analyzeElementSafety(
  elements: BannerElement[],
  format: CanvasFormat | null,
): SafeZoneWarning[] {
  if (!format || !format.safeZones || format.safeZones.length === 0) {
    return [];
  }

  const warnings: SafeZoneWarning[] = [];

  for (const element of elements) {
    for (const zone of format.safeZones) {
      // Only warn about danger zones, not safe zones
      if (!isDangerZone(zone)) continue;

      const { overlaps, percentage } = checkZoneOverlap(element, zone);

      if (overlaps && percentage > 0) {
        const viewport = getViewportAffected(zone);
        const dangerLevel = getDangerLevel(percentage);
        const elementName =
          element.type === 'text'
            ? element.content.slice(0, 20) + (element.content.length > 20 ? '...' : '')
            : 'Image';

        const suggestedPosition = calculateSafePosition(element, zone, format.width, format.height);

        warnings.push({
          elementId: element.id,
          elementName,
          zone,
          dangerLevel,
          overlapPercentage: percentage,
          message: generateWarningMessage(elementName, zone, percentage, viewport),
          viewportAffected: viewport,
          suggestedPosition,
        });
      }
    }
  }

  return warnings;
}

/**
 * Get all danger zones from a format
 */
export function getDangerZones(format: CanvasFormat | null): SafeZoneConfig[] {
  if (!format || !format.safeZones) return [];
  return format.safeZones.filter(isDangerZone);
}

/**
 * Get all safe content zones from a format
 */
export function getSafeContentZones(format: CanvasFormat | null): SafeZoneConfig[] {
  if (!format || !format.safeZones) return [];
  return format.safeZones.filter((z) => !isDangerZone(z));
}
