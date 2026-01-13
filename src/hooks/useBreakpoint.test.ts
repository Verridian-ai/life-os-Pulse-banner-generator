/**
 * useBreakpoint Hook Tests
 */

import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useBreakpoint, useIsMobile } from './useBreakpoint';

describe('useBreakpoint', () => {
  let matchMediaResults: Record<string, boolean>;

  const createMatchMediaMock = () => {
    return vi.fn((query: string) => ({
      matches: matchMediaResults[query] ?? false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  };

  beforeEach(() => {
    matchMediaResults = {};
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('mobile device detection', () => {
    it('detects mobile viewport (< 768px)', () => {
      matchMediaResults = {
        '(max-width: 767px)': true,
        '(min-width: 768px) and (max-width: 1023px)': false,
        '(min-width: 1024px)': false,
      };
      window.matchMedia = createMatchMediaMock();

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.isMobile).toBe(true);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(false);
      expect(result.current.breakpoint).toBe('mobile');
    });

    it('detects phone viewport (< 600px)', () => {
      matchMediaResults = {
        '(max-width: 599px)': true,
        '(min-width: 428px) and (max-width: 599px)': false,
      };
      window.matchMedia = createMatchMediaMock();

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.isPhone).toBe(true);
      expect(result.current.deviceType).toBe('phone');
    });

    it('detects phablet viewport (428px - 599px)', () => {
      matchMediaResults = {
        '(max-width: 599px)': true,
        '(min-width: 428px) and (max-width: 599px)': true,
        '(max-width: 767px)': true,
      };
      window.matchMedia = createMatchMediaMock();

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.isPhablet).toBe(true);
      expect(result.current.deviceType).toBe('phablet');
    });
  });

  describe('tablet device detection', () => {
    it('detects tablet viewport (768px - 1023px)', () => {
      matchMediaResults = {
        '(max-width: 767px)': false,
        '(min-width: 768px) and (max-width: 1023px)': true,
        '(min-width: 1024px)': false,
        '(min-width: 1440px)': false,
        '(min-width: 1024px) and (max-width: 1439px)': false,
      };
      window.matchMedia = createMatchMediaMock();

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.isTablet).toBe(true);
      expect(result.current.isMobile).toBe(false);
      expect(result.current.isDesktop).toBe(false);
      expect(result.current.breakpoint).toBe('tablet');
      expect(result.current.deviceType).toBe('tablet');
    });

    it('detects small tablet (600px - 767px)', () => {
      matchMediaResults = {
        '(min-width: 600px) and (max-width: 767px)': true,
      };
      window.matchMedia = createMatchMediaMock();

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.isTabletSm).toBe(true);
    });

    it('detects medium tablet (768px - 833px)', () => {
      matchMediaResults = {
        '(min-width: 768px) and (max-width: 833px)': true,
      };
      window.matchMedia = createMatchMediaMock();

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.isTabletMd).toBe(true);
    });

    it('detects large tablet (834px - 1023px)', () => {
      matchMediaResults = {
        '(min-width: 834px) and (max-width: 1023px)': true,
      };
      window.matchMedia = createMatchMediaMock();

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.isTabletLg).toBe(true);
    });
  });

  describe('desktop device detection', () => {
    it('detects desktop viewport (>= 1024px)', () => {
      matchMediaResults = {
        '(max-width: 767px)': false,
        '(min-width: 768px) and (max-width: 1023px)': false,
        '(min-width: 1024px)': true,
        '(min-width: 1024px) and (max-width: 1439px)': true,
        '(min-width: 1440px)': false,
      };
      window.matchMedia = createMatchMediaMock();

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.isDesktop).toBe(true);
      expect(result.current.isLaptop).toBe(true);
      expect(result.current.breakpoint).toBe('desktop');
      expect(result.current.deviceType).toBe('laptop');
    });

    it('detects large desktop (>= 1440px)', () => {
      matchMediaResults = {
        '(min-width: 1024px)': true,
        '(min-width: 1440px)': true,
        '(min-width: 1024px) and (max-width: 1439px)': false,
      };
      window.matchMedia = createMatchMediaMock();

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.isLargeDesktop).toBe(true);
      expect(result.current.deviceType).toBe('desktop');
    });
  });

  describe('orientation detection', () => {
    it('detects landscape orientation', () => {
      matchMediaResults = {
        '(orientation: landscape)': true,
        '(orientation: portrait)': false,
      };
      window.matchMedia = createMatchMediaMock();

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.isLandscape).toBe(true);
      expect(result.current.isPortrait).toBe(false);
    });

    it('detects portrait orientation', () => {
      matchMediaResults = {
        '(orientation: landscape)': false,
        '(orientation: portrait)': true,
      };
      window.matchMedia = createMatchMediaMock();

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.isLandscape).toBe(false);
      expect(result.current.isPortrait).toBe(true);
    });

    it('detects phone in landscape with constrained height', () => {
      matchMediaResults = {
        '(orientation: landscape) and (max-height: 500px)': true,
        '(orientation: landscape)': true,
      };
      window.matchMedia = createMatchMediaMock();

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.isPhoneLandscape).toBe(true);
    });
  });

  describe('pointer detection', () => {
    it('detects coarse pointer (touch device)', () => {
      matchMediaResults = {
        '(pointer: coarse)': true,
        '(pointer: fine)': false,
      };
      window.matchMedia = createMatchMediaMock();

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.hasCoarsePointer).toBe(true);
      expect(result.current.hasFinePointer).toBe(false);
    });

    it('detects fine pointer (mouse/trackpad)', () => {
      matchMediaResults = {
        '(pointer: coarse)': false,
        '(pointer: fine)': true,
      };
      window.matchMedia = createMatchMediaMock();

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.hasCoarsePointer).toBe(false);
      expect(result.current.hasFinePointer).toBe(true);
    });

    it('detects hybrid device (both pointer types)', () => {
      matchMediaResults = {
        '(pointer: coarse)': true,
        '(pointer: fine)': true,
      };
      window.matchMedia = createMatchMediaMock();

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.hasCoarsePointer).toBe(true);
      expect(result.current.hasFinePointer).toBe(true);
    });
  });
});

describe('useIsMobile', () => {
  it('returns true on mobile viewport', () => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      media: '(max-width: 767px)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it('returns false on desktop viewport', () => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      media: '(max-width: 767px)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });
});
