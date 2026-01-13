/**
 * Tests for Layout Scaling Utilities
 */

import { describe, it, expect, vi } from 'vitest';
import {
  scaleElementsProportionally,
  validateAndFixSafeZones,
  optimizeLayoutForFormat,
} from './layoutScalingUtils';
import type { BannerElement } from '../types';
import type { CanvasFormat } from '../constants';

// Mock safe zone utilities
vi.mock('./safeZoneUtils', () => ({
  analyzeElementSafety: vi.fn((elements, format) => {
    // Return warnings for elements that are in the first 200px (simulated danger zone)
    return elements
      .filter((el: BannerElement) => el.x < 200 && el.y > format.height - 200)
      .map((el: BannerElement) => ({
        elementId: el.id,
        elementName: el.type === 'text' ? el.content.slice(0, 20) : 'Image',
        zone: { label: 'Profile Overlap', type: 'circle', x: 100, y: format.height, width: 200, height: 200 },
        dangerLevel: 'danger',
        overlapPercentage: 50,
        message: 'Element overlaps with profile zone',
        viewportAffected: 'both',
        suggestedPosition: { x: 220, y: el.y },
      }));
  }),
}));

// Test fixtures
const linkedInBanner: CanvasFormat = {
  id: 'linkedin_banner',
  name: 'LinkedIn Banner',
  platform: 'linkedin',
  category: 'banner',
  width: 1584,
  height: 396,
  aspectRatio: '4:1',
  safeZones: [
    { type: 'circle', label: 'Profile Overlap', x: 166, y: 396, width: 168, height: 168, radius: 84 },
  ],
  description: 'LinkedIn profile banner',
  icon: 'badge',
};

const instagramPost: CanvasFormat = {
  id: 'instagram_post',
  name: 'Instagram Post',
  platform: 'instagram',
  category: 'post',
  width: 1080,
  height: 1080,
  aspectRatio: '1:1',
  safeZones: [],
  description: 'Instagram square post',
  icon: 'crop_square',
};

const tiktokVideo: CanvasFormat = {
  id: 'tiktok_video',
  name: 'TikTok Video',
  platform: 'tiktok',
  category: 'story',
  width: 1080,
  height: 1920,
  aspectRatio: '9:16',
  safeZones: [],
  description: 'TikTok vertical video',
  icon: 'video_library',
};

describe('layoutScalingUtils', () => {
  describe('scaleElementsProportionally', () => {
    it('returns empty array for empty elements', () => {
      const result = scaleElementsProportionally([], linkedInBanner, instagramPost);
      expect(result).toEqual([]);
    });

    it('scales element positions proportionally', () => {
      const elements: BannerElement[] = [
        {
          id: 'text-1',
          type: 'text',
          content: 'Hello World',
          x: 792, // Center of LinkedIn banner (1584/2)
          y: 198, // Center of LinkedIn banner (396/2)
          fontSize: 48,
          color: 'white',
        },
      ];

      const result = scaleElementsProportionally(elements, linkedInBanner, instagramPost);

      // Width ratio: 1080/1584 = 0.682
      // Height ratio: 1080/396 = 2.727
      expect(result[0].x).toBe(540); // 792 * 0.682 ≈ 540
      expect(result[0].y).toBe(540); // 198 * 2.727 ≈ 540
    });

    it('scales width and height if present', () => {
      const elements: BannerElement[] = [
        {
          id: 'image-1',
          type: 'image',
          content: 'test.png',
          x: 100,
          y: 100,
          width: 200,
          height: 100,
        },
      ];

      const result = scaleElementsProportionally(elements, linkedInBanner, instagramPost);

      expect(result[0].width).toBeDefined();
      expect(result[0].height).toBeDefined();
      // Width: 200 * (1080/1584) ≈ 136
      expect(result[0].width).toBeCloseTo(136, -1);
    });

    it('scales fontSize with bounds (min 12, max 200)', () => {
      const elements: BannerElement[] = [
        {
          id: 'text-1',
          type: 'text',
          content: 'Large Text',
          x: 100,
          y: 100,
          fontSize: 120,
          color: 'white',
        },
      ];

      // Scale to much larger canvas
      const result = scaleElementsProportionally(elements, linkedInBanner, tiktokVideo);

      // Average ratio for tiktok: ((1080/1584) + (1920/396))/2 ≈ 2.77
      // 120 * 2.77 = 332, but capped at 200
      expect(result[0].fontSize).toBeLessThanOrEqual(200);
      expect(result[0].fontSize).toBeGreaterThanOrEqual(12);
    });

    it('does not go below minimum fontSize of 12', () => {
      const elements: BannerElement[] = [
        {
          id: 'text-1',
          type: 'text',
          content: 'Small Text',
          x: 100,
          y: 100,
          fontSize: 14,
          color: 'white',
        },
      ];

      // Scale to smaller format (would result in fontSize < 12)
      const smallFormat: CanvasFormat = {
        ...instagramPost,
        width: 200,
        height: 200,
      };

      const result = scaleElementsProportionally(elements, linkedInBanner, smallFormat);

      expect(result[0].fontSize).toBeGreaterThanOrEqual(12);
    });

    it('preserves other element properties', () => {
      const elements: BannerElement[] = [
        {
          id: 'text-1',
          type: 'text',
          content: 'Styled Text',
          x: 100,
          y: 100,
          fontSize: 48,
          color: '#ff0000',
          fontWeight: 'bold',
          textAlign: 'center',
          opacity: 80,
        },
      ];

      const result = scaleElementsProportionally(elements, linkedInBanner, instagramPost);

      expect(result[0].id).toBe('text-1');
      expect(result[0].type).toBe('text');
      expect(result[0].content).toBe('Styled Text');
      expect(result[0].color).toBe('#ff0000');
      expect(result[0].fontWeight).toBe('bold');
      expect(result[0].textAlign).toBe('center');
      expect(result[0].opacity).toBe(80);
    });

    it('handles multiple elements', () => {
      const elements: BannerElement[] = [
        { id: 'el-1', type: 'text', content: 'A', x: 100, y: 50, fontSize: 24, color: 'white' },
        { id: 'el-2', type: 'image', content: 'img.png', x: 500, y: 200, width: 200, height: 150 },
        { id: 'el-3', type: 'text', content: 'B', x: 1000, y: 300, fontSize: 36, color: 'black' },
      ];

      const result = scaleElementsProportionally(elements, linkedInBanner, instagramPost);

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('el-1');
      expect(result[1].id).toBe('el-2');
      expect(result[2].id).toBe('el-3');
    });
  });

  describe('validateAndFixSafeZones', () => {
    it('returns empty result for empty elements', () => {
      const result = validateAndFixSafeZones([], linkedInBanner);

      expect(result.optimizedElements).toEqual([]);
      expect(result.repositionedCount).toBe(0);
      expect(result.repositionedElements).toEqual([]);
    });

    it('does not reposition elements in safe areas', () => {
      const elements: BannerElement[] = [
        {
          id: 'safe-1',
          type: 'text',
          content: 'Safe Text',
          x: 800, // Far from danger zone
          y: 200,
          fontSize: 48,
          color: 'white',
        },
      ];

      const result = validateAndFixSafeZones(elements, linkedInBanner);

      expect(result.repositionedCount).toBe(0);
      expect(result.optimizedElements[0].x).toBe(800);
      expect(result.optimizedElements[0].y).toBe(200);
    });

    it('repositions elements in danger zones', () => {
      const elements: BannerElement[] = [
        {
          id: 'danger-1',
          type: 'image',
          content: 'test.png',
          x: 100, // In simulated danger zone (x < 200)
          y: 300, // In simulated danger zone (y > height - 200)
          width: 100,
          height: 100,
        },
      ];

      const result = validateAndFixSafeZones(elements, linkedInBanner);

      expect(result.repositionedCount).toBe(1);
      expect(result.repositionedElements[0].elementId).toBe('danger-1');
      expect(result.optimizedElements[0].x).toBe(220); // Suggested safe position
    });

    it('reports repositioned element details', () => {
      const elements: BannerElement[] = [
        {
          id: 'danger-1',
          type: 'image',
          content: 'test.png',
          x: 50,
          y: 350,
          width: 80,
          height: 80,
        },
      ];

      const result = validateAndFixSafeZones(elements, linkedInBanner);

      expect(result.repositionedElements[0]).toEqual({
        elementId: 'danger-1',
        elementName: 'Image',
        reason: 'Moved out of Profile Overlap',
      });
    });
  });

  describe('optimizeLayoutForFormat', () => {
    it('returns empty result for empty elements', () => {
      const result = optimizeLayoutForFormat([], linkedInBanner, instagramPost);

      expect(result.optimizedElements).toEqual([]);
      expect(result.repositionedCount).toBe(0);
    });

    it('scales and validates in sequence', () => {
      const elements: BannerElement[] = [
        {
          id: 'text-1',
          type: 'text',
          content: 'Center Text',
          x: 792, // Center
          y: 198, // Center
          fontSize: 48,
          color: 'white',
        },
      ];

      const result = optimizeLayoutForFormat(elements, linkedInBanner, instagramPost);

      // Should be scaled but not repositioned (center is safe)
      expect(result.repositionedCount).toBe(0);
      expect(result.optimizedElements[0].x).not.toBe(792); // Scaled
    });

    it('handles extreme aspect ratio changes', () => {
      const elements: BannerElement[] = [
        {
          id: 'text-1',
          type: 'text',
          content: 'Wide Banner Text',
          x: 1400,
          y: 300,
          fontSize: 64,
          color: 'white',
        },
      ];

      // Wide banner (4:1) to tall story (9:16)
      const result = optimizeLayoutForFormat(elements, linkedInBanner, tiktokVideo);

      expect(result.optimizedElements[0].y).toBeGreaterThan(300); // Scaled up vertically
      expect(result.optimizedElements[0].fontSize).toBeDefined();
    });

    it('preserves element count through full pipeline', () => {
      const elements: BannerElement[] = [
        { id: 'el-1', type: 'text', content: 'A', x: 100, y: 50, fontSize: 24, color: 'white' },
        { id: 'el-2', type: 'image', content: 'img.png', x: 500, y: 200, width: 200, height: 150 },
        { id: 'el-3', type: 'text', content: 'B', x: 1000, y: 300, fontSize: 36, color: 'black' },
      ];

      const result = optimizeLayoutForFormat(elements, linkedInBanner, instagramPost);

      expect(result.optimizedElements).toHaveLength(3);
    });
  });
});
