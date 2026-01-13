/**
 * Tests for Safe Zone Utilities
 */

import { describe, it, expect } from 'vitest';
import {
  getElementBounds,
  checkZoneOverlap,
  isDangerZone,
  getDangerLevel,
  getViewportAffected,
  calculateSafePosition,
  analyzeElementSafety,
} from './safeZoneUtils';
import type { BannerElement } from '../types';
import type { SafeZoneConfig, CanvasFormat } from '../constants';

describe('safeZoneUtils', () => {
  describe('getElementBounds', () => {
    it('calculates bounds for text element with left alignment', () => {
      const element: BannerElement = {
        id: 'test-1',
        type: 'text',
        content: 'Hello',
        x: 100,
        y: 50,
        fontSize: 48,
        color: 'white',
      };

      const bounds = getElementBounds(element);

      expect(bounds.x).toBe(100);
      expect(bounds.y).toBe(50);
      expect(bounds.width).toBeGreaterThan(0);
      expect(bounds.height).toBeGreaterThan(0);
    });

    it('calculates bounds for text element with center alignment', () => {
      const element: BannerElement = {
        id: 'test-2',
        type: 'text',
        content: 'Hello',
        x: 200,
        y: 50,
        fontSize: 48,
        textAlign: 'center',
        color: 'white',
      };

      const bounds = getElementBounds(element);

      // For center alignment, x should be adjusted
      expect(bounds.x).toBeLessThan(200);
    });

    it('calculates bounds for image element', () => {
      const element: BannerElement = {
        id: 'test-3',
        type: 'image',
        content: 'data:image/png;base64,...',
        x: 100,
        y: 100,
        width: 200,
        height: 150,
      };

      const bounds = getElementBounds(element);

      expect(bounds.x).toBe(100);
      expect(bounds.y).toBe(100);
      expect(bounds.width).toBe(200);
      expect(bounds.height).toBe(150);
    });
  });

  describe('checkZoneOverlap', () => {
    const rectZone: SafeZoneConfig = {
      type: 'rect',
      label: 'Danger Zone',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    };

    it('detects overlap with rectangular zone', () => {
      const element: BannerElement = {
        id: 'test-1',
        type: 'image',
        content: 'test.png',
        x: 50,
        y: 50,
        width: 100,
        height: 100,
      };

      const result = checkZoneOverlap(element, rectZone);

      expect(result.overlaps).toBe(true);
      expect(result.percentage).toBeGreaterThan(0);
    });

    it('detects no overlap when element is outside zone', () => {
      const element: BannerElement = {
        id: 'test-2',
        type: 'image',
        content: 'test.png',
        x: 200,
        y: 200,
        width: 50,
        height: 50,
      };

      const result = checkZoneOverlap(element, rectZone);

      expect(result.overlaps).toBe(false);
      expect(result.percentage).toBe(0);
    });

    it('detects overlap with circular zone', () => {
      const circleZone: SafeZoneConfig = {
        type: 'circle',
        label: 'Profile Zone',
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        radius: 50,
      };

      const element: BannerElement = {
        id: 'test-3',
        type: 'image',
        content: 'test.png',
        x: 80,
        y: 80,
        width: 40,
        height: 40,
      };

      const result = checkZoneOverlap(element, circleZone);

      expect(result.overlaps).toBe(true);
    });
  });

  describe('isDangerZone', () => {
    it('identifies danger zones by label', () => {
      expect(isDangerZone({ label: 'Danger Zone', type: 'rect', x: 0, y: 0, width: 100, height: 100 })).toBe(true);
      expect(isDangerZone({ label: 'Dead Zone', type: 'rect', x: 0, y: 0, width: 100, height: 100 })).toBe(true);
      expect(isDangerZone({ label: 'Profile Overlap', type: 'rect', x: 0, y: 0, width: 100, height: 100 })).toBe(true);
      expect(isDangerZone({ label: 'UI Overlap', type: 'rect', x: 0, y: 0, width: 100, height: 100 })).toBe(true);
      expect(isDangerZone({ label: 'Cover Photo', type: 'rect', x: 0, y: 0, width: 100, height: 100 })).toBe(true);
    });

    it('identifies safe zones by label', () => {
      expect(isDangerZone({ label: 'Safe Zone', type: 'rect', x: 0, y: 0, width: 100, height: 100 })).toBe(false);
      expect(isDangerZone({ label: 'Content Area', type: 'rect', x: 0, y: 0, width: 100, height: 100 })).toBe(false);
    });
  });

  describe('getDangerLevel', () => {
    it('returns none for 0% overlap', () => {
      expect(getDangerLevel(0)).toBe('none');
    });

    it('returns warning for <25% overlap', () => {
      expect(getDangerLevel(10)).toBe('warning');
      expect(getDangerLevel(24)).toBe('warning');
    });

    it('returns danger for >=25% overlap', () => {
      expect(getDangerLevel(25)).toBe('danger');
      expect(getDangerLevel(50)).toBe('danger');
      expect(getDangerLevel(100)).toBe('danger');
    });
  });

  describe('getViewportAffected', () => {
    it('identifies mobile-specific zones', () => {
      expect(getViewportAffected({ label: 'Mobile Danger', type: 'rect', x: 0, y: 0, width: 100, height: 100 })).toBe('mobile');
    });

    it('identifies desktop-specific zones', () => {
      expect(getViewportAffected({ label: 'Desktop UI', type: 'rect', x: 0, y: 0, width: 100, height: 100 })).toBe('desktop');
    });

    it('defaults to both for generic zones', () => {
      expect(getViewportAffected({ label: 'Danger Zone', type: 'rect', x: 0, y: 0, width: 100, height: 100 })).toBe('both');
    });
  });

  describe('calculateSafePosition', () => {
    it('calculates safe position outside rectangular zone', () => {
      const element: BannerElement = {
        id: 'test-1',
        type: 'image',
        content: 'test.png',
        x: 50,
        y: 50,
        width: 50,
        height: 50,
      };

      const zone: SafeZoneConfig = {
        type: 'rect',
        label: 'Danger',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      };

      const safePos = calculateSafePosition(element, zone, 1000, 500);

      // Should move element outside the zone
      const bounds = getElementBounds(element);
      const movedElement = { ...element, x: safePos.x, y: safePos.y };
      const movedBounds = getElementBounds(movedElement);

      // New position should be outside zone or at edge
      expect(
        safePos.x >= zone.x + zone.width ||
        safePos.x + bounds.width <= zone.x ||
        safePos.y >= zone.y + zone.height ||
        safePos.y + bounds.height <= zone.y
      ).toBe(true);
    });

    it('clamps position to canvas bounds', () => {
      const element: BannerElement = {
        id: 'test-2',
        type: 'image',
        content: 'test.png',
        x: 10,
        y: 10,
        width: 100,
        height: 100,
      };

      const zone: SafeZoneConfig = {
        type: 'rect',
        label: 'Danger',
        x: 0,
        y: 0,
        width: 200,
        height: 200,
      };

      const safePos = calculateSafePosition(element, zone, 300, 300);

      expect(safePos.x).toBeGreaterThanOrEqual(0);
      expect(safePos.y).toBeGreaterThanOrEqual(0);
      expect(safePos.x).toBeLessThanOrEqual(200); // 300 - 100 (element width)
      expect(safePos.y).toBeLessThanOrEqual(200); // 300 - 100 (element height)
    });
  });

  describe('analyzeElementSafety', () => {
    const mockFormat: CanvasFormat = {
      id: 'test_format',
      name: 'Test Format',
      width: 1000,
      height: 500,
      platform: 'linkedin',
      category: 'banner',
      aspectRatio: '2:1',
      safeZones: [
        {
          type: 'rect',
          label: 'Profile Overlap',
          x: 0,
          y: 0,
          width: 200,
          height: 200,
        },
      ],
    };

    it('generates warnings for elements in danger zones', () => {
      const elements: BannerElement[] = [
        {
          id: 'test-1',
          type: 'image',
          content: 'test.png',
          x: 50,
          y: 50,
          width: 100,
          height: 100,
        },
      ];

      const warnings = analyzeElementSafety(elements, mockFormat);

      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings[0].elementId).toBe('test-1');
      expect(warnings[0].dangerLevel).not.toBe('none');
    });

    it('returns empty array for elements in safe areas', () => {
      const elements: BannerElement[] = [
        {
          id: 'test-1',
          type: 'image',
          content: 'test.png',
          x: 500,
          y: 250,
          width: 100,
          height: 100,
        },
      ];

      const warnings = analyzeElementSafety(elements, mockFormat);

      expect(warnings.length).toBe(0);
    });

    it('returns empty array when format has no safe zones', () => {
      const formatNoZones: CanvasFormat = {
        ...mockFormat,
        safeZones: [],
      };

      const elements: BannerElement[] = [
        {
          id: 'test-1',
          type: 'image',
          content: 'test.png',
          x: 50,
          y: 50,
          width: 100,
          height: 100,
        },
      ];

      const warnings = analyzeElementSafety(elements, formatNoZones);

      expect(warnings.length).toBe(0);
    });

    it('includes suggested safe position in warnings', () => {
      const elements: BannerElement[] = [
        {
          id: 'test-1',
          type: 'image',
          content: 'test.png',
          x: 50,
          y: 50,
          width: 100,
          height: 100,
        },
      ];

      const warnings = analyzeElementSafety(elements, mockFormat);

      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings[0].suggestedPosition).toBeDefined();
      expect(warnings[0].suggestedPosition?.x).toBeDefined();
      expect(warnings[0].suggestedPosition?.y).toBeDefined();
    });
  });
});
