/**
 * ElementRenderer - Canvas element drawing utilities
 *
 * Pure functions for rendering text and image elements on canvas
 * with support for rotation, styling, shadows, strokes, and decorations.
 */

import { BannerElement } from '../../../types';

/** Calculated element dimensions for hit testing */
export interface ElementDimensions {
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
}

/**
 * Apply text transform to content
 *
 * @param content - Original text
 * @param transform - Transform type
 * @returns Transformed text
 */
export function applyTextTransform(
  content: string,
  transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize',
): string {
  if (!transform || transform === 'none') return content;

  switch (transform) {
    case 'uppercase':
      return content.toUpperCase();
    case 'lowercase':
      return content.toLowerCase();
    case 'capitalize':
      return content.replace(/\b\w/g, (c) => c.toUpperCase());
    default:
      return content;
  }
}

/**
 * Build CSS font string from element properties
 *
 * @param el - Banner element with font properties
 * @returns CSS font string
 */
export function buildFontString(el: BannerElement): string {
  const fontStyle = el.fontStyle === 'italic' ? 'italic ' : '';
  return `${fontStyle}${el.fontWeight || 'bold'} ${el.fontSize || 48}px "${el.fontFamily || 'Inter'}", sans-serif`;
}

/**
 * Calculate text element dimensions
 *
 * @param ctx - Canvas 2D rendering context
 * @param el - Text element
 * @returns Calculated dimensions
 */
export function measureTextElement(
  ctx: CanvasRenderingContext2D,
  el: BannerElement,
): { width: number; height: number; rectX: number } {
  ctx.font = buildFontString(el);
  const displayText = applyTextTransform(el.content, el.textTransform);
  const metrics = ctx.measureText(displayText);
  const width = metrics.width;
  const height = (el.fontSize || 48) * (el.lineHeight || 1.2);

  let rectX = el.x;
  const align = (el.textAlign as CanvasTextAlign) || 'left';
  if (align === 'center') {
    rectX = el.x - width / 2;
  } else if (align === 'right') {
    rectX = el.x - width;
  }

  return { width, height, rectX };
}

/**
 * Draw text element on canvas
 *
 * @param ctx - Canvas 2D rendering context
 * @param el - Text element to draw
 * @param rectX - Calculated X position (accounting for alignment)
 */
export function drawTextElement(
  ctx: CanvasRenderingContext2D,
  el: BannerElement,
  rectX: number,
): void {
  // Apply opacity
  const opacity = el.opacity !== undefined ? el.opacity / 100 : 1;
  ctx.globalAlpha = opacity;

  // Set font and colors
  ctx.font = buildFontString(el);
  ctx.fillStyle = el.color || 'white';
  ctx.textBaseline = 'top';
  const align = (el.textAlign as CanvasTextAlign) || 'left';
  ctx.textAlign = align;

  // Apply letter spacing if supported
  const letterSpacing = el.letterSpacing ?? 0;
  if ('letterSpacing' in ctx) {
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${letterSpacing}px`;
  }

  // Get display text
  const displayText = applyTextTransform(el.content, el.textTransform);

  // Measure for background and decorations
  const textMetrics = ctx.measureText(displayText);
  const fontSize = el.fontSize || 48;
  const textHeight = fontSize * (el.lineHeight || 1.2);
  const bgPadding = el.backgroundPadding ?? 0;

  // Calculate background X position based on alignment
  let bgX = el.x - bgPadding;
  if (align === 'center') {
    bgX = el.x - textMetrics.width / 2 - bgPadding;
  } else if (align === 'right') {
    bgX = el.x - textMetrics.width - bgPadding;
  }

  // Draw background/highlight if set
  if (el.backgroundColor && el.backgroundColor !== 'transparent') {
    ctx.save();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.fillStyle = el.backgroundColor;
    ctx.fillRect(
      bgX,
      el.y - bgPadding,
      textMetrics.width + bgPadding * 2,
      textHeight + bgPadding * 2,
    );
    ctx.restore();
    ctx.fillStyle = el.color || 'white';
  }

  // Apply text shadow
  const shadowColor = el.textShadowColor || 'rgba(0,0,0,0.5)';
  const shadowBlur = el.textShadowBlur ?? 4;
  const shadowOffsetX = el.textShadowOffsetX ?? 2;
  const shadowOffsetY = el.textShadowOffsetY ?? 2;
  ctx.shadowColor = shadowBlur > 0 ? shadowColor : 'transparent';
  ctx.shadowBlur = shadowBlur;
  ctx.shadowOffsetX = shadowOffsetX;
  ctx.shadowOffsetY = shadowOffsetY;

  // Draw text stroke if configured
  if (el.textStrokeWidth && el.textStrokeWidth > 0) {
    ctx.strokeStyle = el.textStrokeColor || '#000000';
    ctx.lineWidth = el.textStrokeWidth * 2; // Canvas stroke is centered
    ctx.lineJoin = 'round';

    // Apply stroke style
    if (el.textStrokeStyle === 'dashed') {
      ctx.setLineDash([el.textStrokeWidth * 3, el.textStrokeWidth * 2]);
    } else if (el.textStrokeStyle === 'dotted') {
      ctx.setLineDash([el.textStrokeWidth, el.textStrokeWidth]);
    } else {
      ctx.setLineDash([]);
    }

    ctx.strokeText(displayText, el.x, el.y);
    ctx.setLineDash([]);
  }

  // Draw text
  ctx.fillText(displayText, el.x, el.y);

  // Reset shadow for decorations
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Draw text decorations (underline, line-through)
  if (el.textDecoration && el.textDecoration !== 'none') {
    ctx.strokeStyle = el.color || 'white';
    ctx.lineWidth = Math.max(1, fontSize / 20);
    ctx.lineCap = 'round';

    // Calculate line positions
    let lineStartX = el.x;
    if (align === 'center') {
      lineStartX = el.x - textMetrics.width / 2;
    } else if (align === 'right') {
      lineStartX = el.x - textMetrics.width;
    }
    const lineEndX = lineStartX + textMetrics.width;

    if (el.textDecoration.includes('underline')) {
      const underlineY = el.y + fontSize * 1.1;
      ctx.beginPath();
      ctx.moveTo(lineStartX, underlineY);
      ctx.lineTo(lineEndX, underlineY);
      ctx.stroke();
    }

    if (el.textDecoration.includes('line-through')) {
      const strikeY = el.y + fontSize * 0.55;
      ctx.beginPath();
      ctx.moveTo(lineStartX, strikeY);
      ctx.lineTo(lineEndX, strikeY);
      ctx.stroke();
    }
  }

  // Reset letter spacing
  if ('letterSpacing' in ctx) {
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px';
  }

  // Reset opacity
  ctx.globalAlpha = 1;
}

/**
 * Draw image element on canvas
 *
 * @param ctx - Canvas 2D rendering context
 * @param el - Image element
 * @param img - Loaded image element
 * @param width - Element width
 * @param height - Element height
 */
export function drawImageElement(
  ctx: CanvasRenderingContext2D,
  el: BannerElement,
  img: HTMLImageElement,
  width: number,
  height: number,
): void {
  ctx.drawImage(img, el.x, el.y, width, height);
}

/**
 * Draw a single element with rotation transform
 *
 * @param ctx - Canvas 2D rendering context
 * @param el - Element to draw
 * @param getImage - Function to get cached image
 * @returns Element dimensions for hit testing
 */
export function drawElement(
  ctx: CanvasRenderingContext2D,
  el: BannerElement,
  getImage: (src: string) => HTMLImageElement,
): ElementDimensions {
  const rotation = el.rotation || 0;
  const angleRad = (rotation * Math.PI) / 180;

  let width = 0;
  let height = 0;
  let rectX = el.x;

  // Measure element
  if (el.type === 'text') {
    const measured = measureTextElement(ctx, el);
    width = measured.width;
    height = measured.height;
    rectX = measured.rectX;
  } else {
    width = el.width || 100;
    height = el.height || 100;
    rectX = el.x;
  }

  // Calculate center for rotation
  const cx = rectX + width / 2;
  const cy = el.y + height / 2;

  // Apply rotation transform
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angleRad);
  ctx.translate(-cx, -cy);

  // Draw element
  if (el.type === 'text') {
    drawTextElement(ctx, el, rectX);
  } else {
    const img = getImage(el.content);
    drawImageElement(ctx, el, img, width, height);
  }

  ctx.restore();

  return {
    x: rectX,
    y: el.y,
    w: width,
    h: height,
    rotation,
  };
}

/**
 * Draw all elements and return their dimensions
 *
 * @param ctx - Canvas 2D rendering context
 * @param elements - Array of elements to draw
 * @param getImage - Function to get cached images
 * @returns Map of element ID to dimensions
 */
export function drawElements(
  ctx: CanvasRenderingContext2D,
  elements: BannerElement[],
  getImage: (src: string) => HTMLImageElement,
): Map<string, ElementDimensions> {
  const dimensions = new Map<string, ElementDimensions>();

  elements.forEach((el) => {
    const dims = drawElement(ctx, el, getImage);
    dimensions.set(el.id, dims);
  });

  return dimensions;
}
