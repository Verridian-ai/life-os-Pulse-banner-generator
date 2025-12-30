/**
 * Image utility functions for banner processing
 * LinkedIn banner dimensions: 1584 x 396 pixels (4:1 aspect ratio)
 */

// LinkedIn banner standard dimensions
export const LINKEDIN_BANNER_WIDTH = 1584;
export const LINKEDIN_BANNER_HEIGHT = 396;

/**
 * Resize an image to exact LinkedIn banner dimensions (1584x396)
 * Uses high-quality canvas rendering with proper aspect ratio handling
 *
 * @param imageSource - Base64 data URL or image URL
 * @param options - Resize options
 * @returns Promise<string> - Resized image as base64 data URL
 */
export const resizeToLinkedInBanner = async (
  imageSource: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    fit?: 'cover' | 'contain' | 'fill';
  } = {}
): Promise<string> => {
  const {
    width = LINKEDIN_BANNER_WIDTH,
    height = LINKEDIN_BANNER_HEIGHT,
    quality = 0.95,
    fit = 'cover',
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Handle CORS for external URLs

    img.onload = () => {
      try {
        // Create canvas with target dimensions
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Enable high-quality image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Calculate source and destination dimensions based on fit mode
        let sx = 0, sy = 0, sw = img.width, sh = img.height;
        let dx = 0, dy = 0, dw = width, dh = height;

        if (fit === 'cover') {
          // Scale to cover entire canvas, cropping if necessary (center crop)
          const sourceRatio = img.width / img.height;
          const targetRatio = width / height;

          if (sourceRatio > targetRatio) {
            // Source is wider - crop left/right
            sw = img.height * targetRatio;
            sx = (img.width - sw) / 2;
          } else {
            // Source is taller - crop top/bottom
            sh = img.width / targetRatio;
            sy = (img.height - sh) / 2;
          }
        } else if (fit === 'contain') {
          // Scale to fit within canvas, may have letterboxing
          const sourceRatio = img.width / img.height;
          const targetRatio = width / height;

          // Fill background with transparent
          ctx.fillStyle = 'transparent';
          ctx.fillRect(0, 0, width, height);

          if (sourceRatio > targetRatio) {
            // Source is wider - letterbox top/bottom
            dh = width / sourceRatio;
            dy = (height - dh) / 2;
          } else {
            // Source is taller - letterbox left/right
            dw = height * sourceRatio;
            dx = (width - dw) / 2;
          }
        }
        // fit === 'fill' uses default values (stretch to fill)

        // Draw resized image
        ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);

        // Convert to base64
        const resizedDataUrl = canvas.toDataURL('image/png', quality);

        console.log('[ImageUtils] Resized image to', width, 'x', height, 'using', fit, 'mode');
        resolve(resizedDataUrl);
      } catch (error) {
        console.error('[ImageUtils] Canvas resize error:', error);
        reject(error);
      }
    };

    img.onerror = (error) => {
      console.error('[ImageUtils] Failed to load image for resize:', error);
      reject(new Error('Failed to load image for resizing'));
    };

    // Handle both data URLs and external URLs
    img.src = imageSource;
  });
};

/**
 * Get image dimensions from a data URL or image URL
 */
export const getImageDimensions = (imageSource: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageSource;
  });
};

/**
 * Check if image needs resizing to LinkedIn banner dimensions
 */
export const needsResize = async (imageSource: string): Promise<boolean> => {
  try {
    const { width, height } = await getImageDimensions(imageSource);
    return width !== LINKEDIN_BANNER_WIDTH || height !== LINKEDIN_BANNER_HEIGHT;
  } catch {
    return true; // If we can't check, assume it needs resize
  }
};

/**
 * Convert image URL to base64 data URL
 */
export const urlToBase64 = async (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => {
      reject(new Error('Failed to load image from URL'));
    };

    img.src = url;
  });
};

export const prepareForOutpainting = async (
  imageSource: string,
  width: number = LINKEDIN_BANNER_WIDTH,
  height: number = LINKEDIN_BANNER_HEIGHT
): Promise<{ image: string; mask: string }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        // 1. Create the Composite Image Canvas
        const imgCanvas = document.createElement('canvas');
        imgCanvas.width = width;
        imgCanvas.height = height;
        const imgCtx = imgCanvas.getContext('2d');
        if (!imgCtx) throw new Error('Failed to get context');

        // Fill with black (technically doesn't matter for the masked out part, but good for consistency)
        imgCtx.fillStyle = '#000000';
        imgCtx.fillRect(0, 0, width, height);

        // Draw image "contained"
        const sourceRatio = img.width / img.height;
        const targetRatio = width / height;
        let dx = 0, dy = 0, dw = width, dh = height;

        if (sourceRatio > targetRatio) {
          // Source is wider than target
          dw = width;
          dh = width / sourceRatio;
          dy = (height - dh) / 2;
        } else {
          // Source is taller than target
          dh = height;
          dw = height * sourceRatio;
          dx = (width - dw) / 2;
        }

        // Draw the image
        imgCtx.drawImage(img, 0, 0, img.width, img.height, dx, dy, dw, dh);
        const compositeImage = imgCanvas.toDataURL('image/png');

        // 2. Create the Mask Canvas
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = width;
        maskCanvas.height = height;
        const maskCtx = maskCanvas.getContext('2d');
        if (!maskCtx) throw new Error('Failed to get mask context');

        // Fill background with WHITE (This represents the area to GENERATE/FILL)
        maskCtx.fillStyle = '#FFFFFF';
        maskCtx.fillRect(0, 0, width, height);

        // Draw black rectangle where the image IS (This represents the area to PRESERVE)
        maskCtx.fillStyle = '#000000';
        maskCtx.fillRect(dx, dy, dw, dh);

        const maskImage = maskCanvas.toDataURL('image/png');

        resolve({ image: compositeImage, mask: maskImage });
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = (err) => reject(new Error('Failed to load image for outpainting prep'));
    img.src = imageSource;
  });
};
