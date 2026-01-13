/**
 * useImageCache Hook
 *
 * Manages image caching for canvas rendering to prevent
 * recreating Image objects on every render.
 */

import { useRef, useCallback, useEffect, useState } from 'react';

export interface ImageCacheResult {
  /** Get or create a cached image */
  getCachedImage: (src: string) => HTMLImageElement;
  /** Check if an image is fully loaded */
  isImageLoaded: (src: string) => boolean;
  /** Clear all cached images */
  clearCache: () => void;
  /** Current cache size */
  cacheSize: number;
  /** Version counter that increments when images load */
  renderVersion: number;
}

/**
 * Hook for managing canvas image caching
 *
 * @example
 * const { getCachedImage, isImageLoaded, renderVersion } = useImageCache();
 *
 * // Get or create cached image
 * const img = getCachedImage(imageUrl);
 *
 * // Check if loaded before drawing
 * if (isImageLoaded(imageUrl)) {
 *   ctx.drawImage(img, 0, 0);
 * }
 */
export function useImageCache(): ImageCacheResult {
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const [renderVersion, setRenderVersion] = useState(0);

  // Force re-render when images load
  const forceUpdate = useCallback(() => {
    setRenderVersion((v) => v + 1);
  }, []);

  /**
   * Get or create a cached image
   */
  const getCachedImage = useCallback(
    (src: string): HTMLImageElement => {
      if (imageCache.current.has(src)) {
        return imageCache.current.get(src)!;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';

      // Register handler BEFORE setting src to catch immediate loads (browser cache)
      img.onload = () => {
        console.log('[ImageCache] Image loaded:', src.substring(0, 30));
        forceUpdate();
      };

      img.onerror = () => {
        console.error('[ImageCache] Failed to load:', src.substring(0, 30));
      };

      img.src = src;
      imageCache.current.set(src, img);
      return img;
    },
    [forceUpdate],
  );

  /**
   * Check if an image is fully loaded
   */
  const isImageLoaded = useCallback((src: string): boolean => {
    const img = imageCache.current.get(src);
    return img?.complete ?? false;
  }, []);

  /**
   * Clear all cached images
   */
  const clearCache = useCallback(() => {
    imageCache.current.clear();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    const cache = imageCache.current;
    return () => {
      cache.clear();
    };
  }, []);

  return {
    getCachedImage,
    isImageLoaded,
    clearCache,
    cacheSize: imageCache.current.size,
    renderVersion,
  };
}

export default useImageCache;
