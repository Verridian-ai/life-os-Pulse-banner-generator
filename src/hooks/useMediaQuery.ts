/**
 * useMediaQuery Hook
 *
 * Core hook for responsive design that wraps window.matchMedia.
 * SSR-safe (returns false initially, hydrates on client).
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 767px)');
 * const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
 */

import { useState, useEffect } from 'react';

/**
 * Subscribe to a CSS media query and return whether it matches.
 *
 * @param query - Valid CSS media query string
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  // Initialize with actual value if on client, false for SSR
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    // Create MediaQueryList
    const mql = window.matchMedia(query);

    // Handler for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    // Modern API: addEventListener
    mql.addEventListener('change', handleChange);

    // Cleanup
    return () => {
      mql.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}

export default useMediaQuery;
