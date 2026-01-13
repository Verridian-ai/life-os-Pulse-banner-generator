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
  // Initialize with false for SSR safety
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Create MediaQueryList
    const mql = window.matchMedia(query);

    // Set initial value
    setMatches(mql.matches);

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
