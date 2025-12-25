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

/**
 * Prepare an image for outpainting by creating a composite with extended canvas
 * and a mask indicating the original image area
 *
 * @param imageSource - Base64 data URL or image URL
 * @returns Promise<{image: string, mask: string}> - Composite image and mask
 */
export const prepareForOutpainting = async (
  imageSource: string
): Promise<{ image: string; mask: string }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        // Target dimensions for LinkedIn banner
        const targetWidth = LINKEDIN_BANNER_WIDTH;
        const targetHeight = LINKEDIN_BANNER_HEIGHT;

        // Create the composite canvas (image centered on banner-sized canvas)
        const compositeCanvas = document.createElement('canvas');
        compositeCanvas.width = targetWidth;
        compositeCanvas.height = targetHeight;
        const compositeCtx = compositeCanvas.getContext('2d');

        // Create the mask canvas
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = targetWidth;
        maskCanvas.height = targetHeight;
        const maskCtx = maskCanvas.getContext('2d');

        if (!compositeCtx || !maskCtx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Fill composite with neutral gray (areas to be outpainted)
        compositeCtx.fillStyle = '#808080';
        compositeCtx.fillRect(0, 0, targetWidth, targetHeight);

        // Fill mask with white (areas to be generated)
        maskCtx.fillStyle = '#FFFFFF';
        maskCtx.fillRect(0, 0, targetWidth, targetHeight);

        // Calculate where to place the original image (centered)
        const scale = Math.min(
          targetWidth / img.width,
          targetHeight / img.height
        );
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const offsetX = (targetWidth - scaledWidth) / 2;
        const offsetY = (targetHeight - scaledHeight) / 2;

        // Draw original image centered on composite
        compositeCtx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);

        // Draw black rectangle on mask where original image is (areas to keep)
        maskCtx.fillStyle = '#000000';
        maskCtx.fillRect(offsetX, offsetY, scaledWidth, scaledHeight);

        console.log('[ImageUtils] Prepared image for outpainting:', {
          original: `${img.width}x${img.height}`,
          target: `${targetWidth}x${targetHeight}`,
          offset: `(${offsetX}, ${offsetY})`,
        });

        resolve({
          image: compositeCanvas.toDataURL('image/png'),
          mask: maskCanvas.toDataURL('image/png'),
        });
      } catch (error) {
        console.error('[ImageUtils] Outpainting preparation error:', error);
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for outpainting'));
    };

    img.src = imageSource;
  });
};
