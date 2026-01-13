/**
 * Layout Scaling Utilities
 *
 * Provides proportional scaling and safe zone validation for canvas elements
 * when switching between canvas formats.
 */

import type { BannerElement } from '../types';
import type { CanvasFormat } from '../constants';
import { analyzeElementSafety } from './safeZoneUtils';

/**
 * Result of layout optimization
 */
export interface LayoutOptimizationResult {
  optimizedElements: BannerElement[];
  repositionedCount: number;
  repositionedElements: Array<{
    elementId: string;
    elementName: string;
    reason: string;
  }>;
}

/**
 * Scale elements proportionally when switching canvas formats.
 *
 * This function adjusts element positions and sizes based on the
 * aspect ratio change between the old and new canvas formats.
 *
 * @param elements - Array of banner elements to scale
 * @param oldFormat - The previous canvas format
 * @param newFormat - The new canvas format
 * @returns Array of scaled banner elements
 */
export function scaleElementsProportionally(
  elements: BannerElement[],
  oldFormat: CanvasFormat,
  newFormat: CanvasFormat
): BannerElement[] {
  if (elements.length === 0) {
    return elements;
  }

  const widthRatio = newFormat.width / oldFormat.width;
  const heightRatio = newFormat.height / oldFormat.height;
  // Use average ratio for font sizes to maintain visual balance
  const avgRatio = (widthRatio + heightRatio) / 2;

  return elements.map((el) => {
    const scaled: BannerElement = {
      ...el,
      x: Math.round(el.x * widthRatio),
      y: Math.round(el.y * heightRatio),
    };

    // Scale dimensions if present
    if (el.width !== undefined) {
      scaled.width = Math.round(el.width * widthRatio);
    }
    if (el.height !== undefined) {
      scaled.height = Math.round(el.height * heightRatio);
    }

    // Scale font size with bounds
    if (el.fontSize !== undefined) {
      scaled.fontSize = Math.round(
        Math.max(12, Math.min(200, el.fontSize * avgRatio))
      );
    }

    return scaled;
  });
}

/**
 * Validate elements against safe zones and reposition those in danger zones.
 *
 * Uses the existing safeZoneUtils to detect overlaps and get suggested
 * safe positions.
 *
 * @param elements - Array of banner elements to validate
 * @param format - The canvas format to validate against
 * @returns Optimization result with repositioned elements
 */
export function validateAndFixSafeZones(
  elements: BannerElement[],
  format: CanvasFormat
): LayoutOptimizationResult {
  if (elements.length === 0) {
    return {
      optimizedElements: elements,
      repositionedCount: 0,
      repositionedElements: [],
    };
  }

  // Analyze all elements for safety warnings
  const warnings = analyzeElementSafety(elements, format);

  // Filter to only danger level (>= 25% overlap)
  const dangerWarnings = warnings.filter((w) => w.dangerLevel === 'danger');

  const repositionedElements: LayoutOptimizationResult['repositionedElements'] = [];

  const optimizedElements = elements.map((el) => {
    // Find the first danger warning for this element
    const warning = dangerWarnings.find((w) => w.elementId === el.id);

    if (warning?.suggestedPosition) {
      repositionedElements.push({
        elementId: el.id,
        elementName: warning.elementName,
        reason: `Moved out of ${warning.zone.label}`,
      });

      return {
        ...el,
        x: warning.suggestedPosition.x,
        y: warning.suggestedPosition.y,
      };
    }

    return el;
  });

  return {
    optimizedElements,
    repositionedCount: repositionedElements.length,
    repositionedElements,
  };
}

/**
 * Full layout optimization pipeline for format switching.
 *
 * Phase 1: Scale elements proportionally to fit new dimensions
 * Phase 2: Validate against safe zones and reposition violators
 *
 * @param elements - Array of banner elements to optimize
 * @param oldFormat - The previous canvas format
 * @param newFormat - The new canvas format
 * @returns Complete optimization result
 */
export function optimizeLayoutForFormat(
  elements: BannerElement[],
  oldFormat: CanvasFormat,
  newFormat: CanvasFormat
): LayoutOptimizationResult {
  if (elements.length === 0) {
    return {
      optimizedElements: elements,
      repositionedCount: 0,
      repositionedElements: [],
    };
  }

  // Phase 1: Scale elements proportionally
  const scaledElements = scaleElementsProportionally(elements, oldFormat, newFormat);

  // Phase 2: Validate and fix safe zone violations
  return validateAndFixSafeZones(scaledElements, newFormat);
}
