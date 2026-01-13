/**
 * Tests for useSafeZoneWarnings Hook
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSafeZoneWarnings } from './useSafeZoneWarnings';
import type { BannerElement } from '../types';
import type { CanvasFormatId } from '../constants';

// Mock the CANVAS_FORMATS constant
vi.mock('../constants', async () => {
  const actual = await vi.importActual('../constants');
  return {
    ...actual,
    CANVAS_FORMATS: {
      linkedin_banner: {
        id: 'linkedin_banner',
        name: 'LinkedIn Banner',
        width: 1584,
        height: 396,
        platform: 'linkedin',
        category: 'banner',
        aspectRatio: '4:1',
        safeZones: [
          {
            type: 'circle',
            label: 'Profile Overlap',
            x: 166,
            y: 396,
            width: 168,
            height: 168,
            radius: 84,
          },
        ],
      },
      instagram_post: {
        id: 'instagram_post',
        name: 'Instagram Post',
        width: 1080,
        height: 1080,
        platform: 'instagram',
        category: 'post',
        aspectRatio: '1:1',
        safeZones: [],
      },
    },
  };
});

describe('useSafeZoneWarnings', () => {
  describe('basic functionality', () => {
    it('returns empty warnings when no elements overlap danger zones', () => {
      const elements: BannerElement[] = [
        {
          id: 'test-1',
          type: 'text',
          content: 'Safe Text',
          x: 800,
          y: 200,
          fontSize: 48,
          color: 'white',
        },
      ];

      const { result } = renderHook(() => useSafeZoneWarnings(elements, 'linkedin_banner' as CanvasFormatId));

      expect(result.current.warnings).toHaveLength(0);
      expect(result.current.hasWarnings).toBe(false);
      expect(result.current.dangerCount).toBe(0);
      expect(result.current.warningCount).toBe(0);
    });

    it('detects elements in danger zones', () => {
      const elements: BannerElement[] = [
        {
          id: 'test-1',
          type: 'image',
          content: 'test.png',
          x: 100,
          y: 300,
          width: 100,
          height: 100,
        },
      ];

      const { result } = renderHook(() => useSafeZoneWarnings(elements, 'linkedin_banner' as CanvasFormatId));

      expect(result.current.warnings.length).toBeGreaterThan(0);
      expect(result.current.hasWarnings).toBe(true);
    });

    it('returns empty warnings for format with no safe zones', () => {
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

      const { result } = renderHook(() => useSafeZoneWarnings(elements, 'instagram_post' as CanvasFormatId));

      expect(result.current.warnings).toHaveLength(0);
      expect(result.current.hasWarnings).toBe(false);
    });
  });

  describe('getElementWarnings', () => {
    it('returns warnings for specific element', () => {
      const elements: BannerElement[] = [
        {
          id: 'danger-element',
          type: 'image',
          content: 'test.png',
          x: 100,
          y: 300,
          width: 100,
          height: 100,
        },
        {
          id: 'safe-element',
          type: 'text',
          content: 'Safe',
          x: 800,
          y: 200,
          fontSize: 48,
          color: 'white',
        },
      ];

      const { result } = renderHook(() => useSafeZoneWarnings(elements, 'linkedin_banner' as CanvasFormatId));

      const dangerWarnings = result.current.getElementWarnings('danger-element');
      const safeWarnings = result.current.getElementWarnings('safe-element');

      expect(dangerWarnings.length).toBeGreaterThan(0);
      expect(safeWarnings.length).toBe(0);
    });
  });

  describe('getElementDangerLevel', () => {
    it('returns danger level for element in danger zone', () => {
      const elements: BannerElement[] = [
        {
          id: 'test-1',
          type: 'image',
          content: 'test.png',
          x: 100,
          y: 300,
          width: 100,
          height: 100,
        },
      ];

      const { result } = renderHook(() => useSafeZoneWarnings(elements, 'linkedin_banner' as CanvasFormatId));

      const level = result.current.getElementDangerLevel('test-1');

      expect(['warning', 'danger']).toContain(level);
    });

    it('returns none for element in safe area', () => {
      const elements: BannerElement[] = [
        {
          id: 'safe-1',
          type: 'text',
          content: 'Safe',
          x: 800,
          y: 200,
          fontSize: 48,
          color: 'white',
        },
      ];

      const { result } = renderHook(() => useSafeZoneWarnings(elements, 'linkedin_banner' as CanvasFormatId));

      const level = result.current.getElementDangerLevel('safe-1');

      expect(level).toBe('none');
    });
  });

  describe('getSafePosition', () => {
    it('returns suggested safe position for element in danger zone', () => {
      const elements: BannerElement[] = [
        {
          id: 'test-1',
          type: 'image',
          content: 'test.png',
          x: 100,
          y: 300,
          width: 100,
          height: 100,
        },
      ];

      const { result } = renderHook(() => useSafeZoneWarnings(elements, 'linkedin_banner' as CanvasFormatId));

      const safePos = result.current.getSafePosition(elements[0]);

      expect(safePos).not.toBeNull();
      if (safePos) {
        expect(typeof safePos.x).toBe('number');
        expect(typeof safePos.y).toBe('number');
      }
    });

    it('returns null for element in safe area', () => {
      const elements: BannerElement[] = [
        {
          id: 'safe-1',
          type: 'text',
          content: 'Safe',
          x: 800,
          y: 200,
          fontSize: 48,
          color: 'white',
        },
      ];

      const { result } = renderHook(() => useSafeZoneWarnings(elements, 'linkedin_banner' as CanvasFormatId));

      const safePos = result.current.getSafePosition(elements[0]);

      expect(safePos).toBeNull();
    });
  });

  describe('snapToSafe', () => {
    it('calls onUpdate with safe position', () => {
      const elements: BannerElement[] = [
        {
          id: 'test-1',
          type: 'image',
          content: 'test.png',
          x: 100,
          y: 300,
          width: 100,
          height: 100,
        },
      ];

      const onUpdate = vi.fn();

      const { result } = renderHook(() => useSafeZoneWarnings(elements, 'linkedin_banner' as CanvasFormatId));

      act(() => {
        result.current.snapToSafe(elements[0], onUpdate);
      });

      expect(onUpdate).toHaveBeenCalledWith('test-1', expect.objectContaining({
        x: expect.any(Number),
        y: expect.any(Number),
      }));
    });

    it('does not call onUpdate for element already in safe area', () => {
      const elements: BannerElement[] = [
        {
          id: 'safe-1',
          type: 'text',
          content: 'Safe',
          x: 800,
          y: 200,
          fontSize: 48,
          color: 'white',
        },
      ];

      const onUpdate = vi.fn();

      const { result } = renderHook(() => useSafeZoneWarnings(elements, 'linkedin_banner' as CanvasFormatId));

      act(() => {
        result.current.snapToSafe(elements[0], onUpdate);
      });

      expect(onUpdate).not.toHaveBeenCalled();
    });
  });
});
