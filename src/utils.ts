export interface OptimizedImageResult {
  base64: string;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
}

export const optimizeImage = (
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality = 0.8,
  scaleUp = false,
): Promise<OptimizedImageResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const originalWidth = img.width;
        const originalHeight = img.height;
        let { width, height } = img;

        // Calculate the scale ratio to fit within the bounding box
        const ratio = Math.min(maxWidth / width, maxHeight / height);

        // Apply scaling if:
        // 1. The image is larger than the box (ratio < 1) - Downscale
        // 2. The image is smaller AND scaleUp is true (ratio > 1) - Upscale
        if (ratio < 1 || (scaleUp && ratio > 1)) {
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Use high quality scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Return compressed base64 and metadata
        resolve({
          base64: canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', quality),
          width,
          height,
          originalWidth,
          originalHeight,
        });
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};
