import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  LINKEDIN_BANNER_WIDTH,
  LINKEDIN_BANNER_HEIGHT,
  getImageDimensions,
  needsResize,
  resizeToCanvasDimensions,
  resizeToLinkedInBanner,
  urlToBase64,
  prepareForOutpainting,
} from './imageUtils';

describe('imageUtils', () => {
  let mockContext: CanvasRenderingContext2D;
  let mockCanvas: HTMLCanvasElement;
  let mockImageInstances: HTMLImageElement[];

  beforeEach(() => {
    mockImageInstances = [];

    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock canvas context
    mockContext = {
      imageSmoothingEnabled: false,
      imageSmoothingQuality: 'low',
      fillStyle: '',
      fillRect: vi.fn(),
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    // Mock canvas
    mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue(mockContext),
      toDataURL: vi.fn().mockReturnValue('data:image/png;base64,mock'),
    } as unknown as HTMLCanvasElement;

    // Mock document.createElement for canvas
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'canvas') {
        return mockCanvas as unknown as HTMLElement;
      }
      return document.createElementNS('http://www.w3.org/1999/xhtml', tagName);
    });

    // Mock Image constructor
    vi.stubGlobal(
      'Image',
      class MockImage {
        width = 1000;
        height = 500;
        crossOrigin = '';
        src = '';
        onload: (() => void) | null = null;
        onerror: ((error: unknown) => void) | null = null;

        constructor() {
          mockImageInstances.push(this as unknown as HTMLImageElement);
          // Simulate async image loading
          setTimeout(() => {
            if (this.src && this.onload) {
              this.onload();
            }
          }, 0);
        }
      },
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('constants', () => {
    it('exports LinkedIn banner dimensions', () => {
      expect(LINKEDIN_BANNER_WIDTH).toBe(1584);
      expect(LINKEDIN_BANNER_HEIGHT).toBe(396);
    });
  });

  describe('getImageDimensions', () => {
    it('returns image dimensions', async () => {
      const promise = getImageDimensions('data:image/png;base64,test');

      // Wait for mock image to "load"
      await vi.waitFor(() => expect(mockImageInstances.length).toBeGreaterThan(0));

      const result = await promise;
      expect(result).toEqual({ width: 1000, height: 500 });
    });

    it('rejects on image load error', async () => {
      // Override Image to simulate error
      vi.stubGlobal(
        'Image',
        class MockErrorImage {
          crossOrigin = '';
          src = '';
          onload: (() => void) | null = null;
          onerror: ((error: unknown) => void) | null = null;

          constructor() {
            setTimeout(() => {
              if (this.onerror) {
                this.onerror(new Error('Load failed'));
              }
            }, 0);
          }
        },
      );

      await expect(getImageDimensions('invalid-url')).rejects.toThrow('Failed to load image');
    });
  });

  describe('needsResize', () => {
    it('returns true when dimensions differ from LinkedIn banner', async () => {
      const result = await needsResize('data:image/png;base64,test');
      expect(result).toBe(true);
    });

    it('returns false when dimensions match LinkedIn banner', async () => {
      // Override Image to return LinkedIn dimensions
      vi.stubGlobal(
        'Image',
        class MockLinkedInImage {
          width = LINKEDIN_BANNER_WIDTH;
          height = LINKEDIN_BANNER_HEIGHT;
          crossOrigin = '';
          src = '';
          onload: (() => void) | null = null;
          onerror: ((error: unknown) => void) | null = null;

          constructor() {
            setTimeout(() => {
              if (this.onload) {
                this.onload();
              }
            }, 0);
          }
        },
      );

      const result = await needsResize('data:image/png;base64,test');
      expect(result).toBe(false);
    });

    it('returns true on error (assumes resize needed)', async () => {
      vi.stubGlobal(
        'Image',
        class MockErrorImage {
          crossOrigin = '';
          src = '';
          onload: (() => void) | null = null;
          onerror: ((error: unknown) => void) | null = null;

          constructor() {
            setTimeout(() => {
              if (this.onerror) {
                this.onerror(new Error('Load failed'));
              }
            }, 0);
          }
        },
      );

      const result = await needsResize('invalid-url');
      expect(result).toBe(true);
    });
  });

  describe('resizeToCanvasDimensions', () => {
    it('resizes image to target dimensions', async () => {
      const result = await resizeToCanvasDimensions('data:image/png;base64,test', 800, 600);

      expect(mockCanvas.width).toBe(800);
      expect(mockCanvas.height).toBe(600);
      expect(mockContext.drawImage).toHaveBeenCalled();
      expect(result).toBe('data:image/png;base64,mock');
    });

    it('uses cover fit mode by default', async () => {
      await resizeToCanvasDimensions('data:image/png;base64,test', 800, 600);

      expect(mockContext.imageSmoothingEnabled).toBe(true);
      expect(mockContext.imageSmoothingQuality).toBe('high');
    });

    it('handles contain fit mode', async () => {
      await resizeToCanvasDimensions('data:image/png;base64,test', 800, 600, { fit: 'contain' });

      expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 800, 600);
    });

    it('rejects when canvas context is null', async () => {
      mockCanvas.getContext = vi.fn().mockReturnValue(null);

      await expect(
        resizeToCanvasDimensions('data:image/png;base64,test', 800, 600),
      ).rejects.toThrow('Failed to get canvas context');
    });

    it('rejects on image load error', async () => {
      vi.stubGlobal(
        'Image',
        class MockErrorImage {
          crossOrigin = '';
          src = '';
          onload: (() => void) | null = null;
          onerror: ((error: unknown) => void) | null = null;

          constructor() {
            setTimeout(() => {
              if (this.onerror) {
                this.onerror(new Error('Load failed'));
              }
            }, 0);
          }
        },
      );

      await expect(resizeToCanvasDimensions('invalid-url', 800, 600)).rejects.toThrow(
        'Failed to load image for resizing',
      );
    });
  });

  describe('resizeToLinkedInBanner', () => {
    it('resizes to LinkedIn banner dimensions by default', async () => {
      await resizeToLinkedInBanner('data:image/png;base64,test');

      expect(mockCanvas.width).toBe(LINKEDIN_BANNER_WIDTH);
      expect(mockCanvas.height).toBe(LINKEDIN_BANNER_HEIGHT);
    });

    it('accepts custom dimensions', async () => {
      await resizeToLinkedInBanner('data:image/png;base64,test', {
        width: 1200,
        height: 300,
      });

      expect(mockCanvas.width).toBe(1200);
      expect(mockCanvas.height).toBe(300);
    });

    it('supports contain fit mode', async () => {
      await resizeToLinkedInBanner('data:image/png;base64,test', { fit: 'contain' });

      expect(mockContext.fillRect).toHaveBeenCalled();
    });
  });

  describe('urlToBase64', () => {
    it('converts URL to base64 data URL', async () => {
      const result = await urlToBase64('https://example.com/image.png');

      expect(mockContext.drawImage).toHaveBeenCalled();
      expect(result).toBe('data:image/png;base64,mock');
    });

    it('rejects when canvas context is null', async () => {
      mockCanvas.getContext = vi.fn().mockReturnValue(null);

      await expect(urlToBase64('https://example.com/image.png')).rejects.toThrow(
        'Failed to get canvas context',
      );
    });

    it('rejects on image load error', async () => {
      vi.stubGlobal(
        'Image',
        class MockErrorImage {
          crossOrigin = '';
          src = '';
          onload: (() => void) | null = null;
          onerror: ((error: unknown) => void) | null = null;

          constructor() {
            setTimeout(() => {
              if (this.onerror) {
                this.onerror(new Error('Load failed'));
              }
            }, 0);
          }
        },
      );

      await expect(urlToBase64('invalid-url')).rejects.toThrow('Failed to load image from URL');
    });
  });

  describe('prepareForOutpainting', () => {
    it('creates composite image and mask', async () => {
      const result = await prepareForOutpainting('data:image/png;base64,test');

      expect(result.image).toBe('data:image/png;base64,mock');
      expect(result.mask).toBe('data:image/png;base64,mock');
    });

    it('uses default LinkedIn dimensions', async () => {
      await prepareForOutpainting('data:image/png;base64,test');

      // First canvas call is for composite, second for mask
      expect(mockCanvas.width).toBe(LINKEDIN_BANNER_WIDTH);
      expect(mockCanvas.height).toBe(LINKEDIN_BANNER_HEIGHT);
    });

    it('accepts custom dimensions', async () => {
      await prepareForOutpainting('data:image/png;base64,test', 1200, 300);

      expect(mockCanvas.width).toBe(1200);
      expect(mockCanvas.height).toBe(300);
    });

    it('fills mask with white background and black image area', async () => {
      await prepareForOutpainting('data:image/png;base64,test');

      // Check fillRect was called for both composite and mask canvases
      expect(mockContext.fillRect).toHaveBeenCalled();
    });

    it('rejects on image load error', async () => {
      vi.stubGlobal(
        'Image',
        class MockErrorImage {
          crossOrigin = '';
          src = '';
          onload: (() => void) | null = null;
          onerror: ((error: unknown) => void) | null = null;

          constructor() {
            setTimeout(() => {
              if (this.onerror) {
                this.onerror(new Error('Load failed'));
              }
            }, 0);
          }
        },
      );

      await expect(prepareForOutpainting('invalid-url')).rejects.toThrow(
        'Failed to load image for outpainting prep',
      );
    });
  });
});
