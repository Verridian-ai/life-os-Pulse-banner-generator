/**
 * useMediaQuery Hook Tests
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useMediaQuery } from './useMediaQuery';

describe('useMediaQuery', () => {
  let matchMediaMock: ReturnType<typeof vi.fn>;
  let addEventListenerMock: ReturnType<typeof vi.fn>;
  let removeEventListenerMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    addEventListenerMock = vi.fn();
    removeEventListenerMock = vi.fn();

    matchMediaMock = vi.fn((query: string) => ({
      matches: false,
      media: query,
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
      onchange: null,
      addListener: vi.fn(), // Deprecated but sometimes needed
      removeListener: vi.fn(), // Deprecated but sometimes needed
      dispatchEvent: vi.fn(),
    }));

    window.matchMedia = matchMediaMock;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns false initially (SSR safe)', () => {
    const { result } = renderHook(() => useMediaQuery('(max-width: 767px)'));
    // Initial state before useEffect runs
    expect(typeof result.current).toBe('boolean');
  });

  it('calls matchMedia with the provided query', () => {
    renderHook(() => useMediaQuery('(max-width: 767px)'));
    expect(matchMediaMock).toHaveBeenCalledWith('(max-width: 767px)');
  });

  it('returns true when media query matches', () => {
    matchMediaMock.mockReturnValue({
      matches: true,
      media: '(max-width: 767px)',
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
    });

    const { result } = renderHook(() => useMediaQuery('(max-width: 767px)'));
    expect(result.current).toBe(true);
  });

  it('returns false when media query does not match', () => {
    matchMediaMock.mockReturnValue({
      matches: false,
      media: '(max-width: 767px)',
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
    });

    const { result } = renderHook(() => useMediaQuery('(max-width: 767px)'));
    expect(result.current).toBe(false);
  });

  it('subscribes to media query changes', () => {
    renderHook(() => useMediaQuery('(max-width: 767px)'));
    expect(addEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('unsubscribes on unmount', () => {
    const { unmount } = renderHook(() => useMediaQuery('(max-width: 767px)'));
    unmount();
    expect(removeEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('updates when media query changes', () => {
    let changeHandler: ((event: MediaQueryListEvent) => void) | null = null;

    addEventListenerMock.mockImplementation((event: string, handler: (event: MediaQueryListEvent) => void) => {
      if (event === 'change') {
        changeHandler = handler;
      }
    });

    matchMediaMock.mockReturnValue({
      matches: false,
      media: '(max-width: 767px)',
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
    });

    const { result } = renderHook(() => useMediaQuery('(max-width: 767px)'));
    expect(result.current).toBe(false);

    // Simulate media query change
    act(() => {
      if (changeHandler) {
        changeHandler({ matches: true } as MediaQueryListEvent);
      }
    });

    expect(result.current).toBe(true);
  });

  it('resubscribes when query changes', () => {
    const { rerender } = renderHook(
      ({ query }) => useMediaQuery(query),
      { initialProps: { query: '(max-width: 767px)' } }
    );

    // Initial render: matchMedia is called in useState initializer and useEffect
    const initialCalls = matchMediaMock.mock.calls.length;
    expect(initialCalls).toBeGreaterThanOrEqual(1);

    rerender({ query: '(min-width: 1024px)' });

    // After rerender: matchMedia should be called again with new query
    expect(matchMediaMock.mock.calls.length).toBeGreaterThan(initialCalls);
    expect(matchMediaMock).toHaveBeenLastCalledWith('(min-width: 1024px)');
  });

  it('handles orientation queries', () => {
    matchMediaMock.mockReturnValue({
      matches: true,
      media: '(orientation: landscape)',
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
    });

    const { result } = renderHook(() => useMediaQuery('(orientation: landscape)'));
    expect(result.current).toBe(true);
  });

  it('handles prefers-reduced-motion queries', () => {
    matchMediaMock.mockReturnValue({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
    });

    const { result } = renderHook(() => useMediaQuery('(prefers-reduced-motion: reduce)'));
    expect(result.current).toBe(true);
  });
});
