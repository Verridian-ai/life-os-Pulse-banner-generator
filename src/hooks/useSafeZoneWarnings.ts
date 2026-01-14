/**
 * useSafeZoneWarnings Hook
 *
 * Provides reactive warnings when canvas elements enter danger zones.
 * Includes auto-snap suggestions and viewport-specific warnings.
 */

import { useMemo, useCallback } from 'react';
import type { BannerElement } from '../types';
import { CANVAS_FORMATS, type CanvasFormatId, type CanvasFormat } from '../constants';
import {
  analyzeElementSafety,
  type SafeZoneWarning,
  type DangerLevel,
} from '../utils/safeZoneUtils';

export interface UseSafeZoneWarningsResult {
  /** All warnings for elements in danger zones */
  warnings: SafeZoneWarning[];
  /** Whether any elements are in danger zones */
  hasWarnings: boolean;
  /** Number of elements with danger-level warnings */
  dangerCount: number;
  /** Number of elements with warning-level warnings */
  warningCount: number;
  /** Get warnings for a specific element */
  getElementWarnings: (elementId: string) => SafeZoneWarning[];
  /** Get the highest danger level for an element */
  getElementDangerLevel: (elementId: string) => DangerLevel;
  /** Calculate safe position for an element (auto-snap target) */
  getSafePosition: (element: BannerElement) => { x: number; y: number } | null;
  /** Move element to its safe position */
  snapToSafe: (
    element: BannerElement,
    onUpdate: (id: string, updates: Partial<BannerElement>) => void,
  ) => void;
}

export function useSafeZoneWarnings(
  elements: BannerElement[],
  canvasFormatId: CanvasFormatId,
): UseSafeZoneWarningsResult {
  // Get the format configuration
  const format = useMemo<CanvasFormat | null>(
    () => CANVAS_FORMATS[canvasFormatId] || null,
    [canvasFormatId],
  );

  // Analyze all elements for safety issues
  const warnings = useMemo(() => analyzeElementSafety(elements, format), [elements, format]);

  // Compute summary stats
  const { hasWarnings, dangerCount, warningCount } = useMemo(() => {
    let danger = 0;
    let warning = 0;

    for (const w of warnings) {
      if (w.dangerLevel === 'danger') danger++;
      else if (w.dangerLevel === 'warning') warning++;
    }

    return {
      hasWarnings: warnings.length > 0,
      dangerCount: danger,
      warningCount: warning,
    };
  }, [warnings]);

  // Get warnings for a specific element
  const getElementWarnings = useCallback(
    (elementId: string): SafeZoneWarning[] => {
      return warnings.filter((w) => w.elementId === elementId);
    },
    [warnings],
  );

  // Get highest danger level for an element
  const getElementDangerLevel = useCallback(
    (elementId: string): DangerLevel => {
      const elementWarnings = warnings.filter((w) => w.elementId === elementId);
      if (elementWarnings.length === 0) return 'none';

      const hasDanger = elementWarnings.some((w) => w.dangerLevel === 'danger');
      if (hasDanger) return 'danger';

      const hasWarning = elementWarnings.some((w) => w.dangerLevel === 'warning');
      if (hasWarning) return 'warning';

      return 'none';
    },
    [warnings],
  );

  // Get safe position for an element
  const getSafePosition = useCallback(
    (element: BannerElement): { x: number; y: number } | null => {
      if (!format) return null;

      const elementWarnings = warnings.filter((w) => w.elementId === element.id);
      if (elementWarnings.length === 0) return null;

      // Return the suggested position from the first warning with a suggestion
      const warningWithSuggestion = elementWarnings.find((w) => w.suggestedPosition);
      return warningWithSuggestion?.suggestedPosition || null;
    },
    [warnings, format],
  );

  // Move element to safe position
  const snapToSafe = useCallback(
    (element: BannerElement, onUpdate: (id: string, updates: Partial<BannerElement>) => void) => {
      const safePos = getSafePosition(element);
      if (safePos) {
        onUpdate(element.id, { x: safePos.x, y: safePos.y });
      }
    },
    [getSafePosition],
  );

  return {
    warnings,
    hasWarnings,
    dangerCount,
    warningCount,
    getElementWarnings,
    getElementDangerLevel,
    getSafePosition,
    snapToSafe,
  };
}

export type { SafeZoneWarning, DangerLevel };
