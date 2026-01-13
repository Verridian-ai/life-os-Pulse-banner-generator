/**
 * BannerCanvas - Main canvas component for banner editing
 *
 * Orchestrates canvas rendering, element interaction, and overlays.
 * Uses extracted modules for separation of concerns.
 */

import React, { useRef, useEffect, useImperativeHandle, forwardRef, memo, useCallback } from 'react';
import { BANNER_WIDTH, BANNER_HEIGHT, CanvasFormatId } from '../constants';
import { BannerElement } from '../types';
import type { ProfileOverlayConfig } from './studios/config/platformConfig';
import { useCanvasGestures } from '../hooks/useCanvasGestures';

// Extracted modules
import {
  drawImageCover,
  clearCanvas,
  drawElements,
  drawSafeZones,
  drawSelectionOverlay,
  ElementRect,
} from './canvas/core';
import { useImageCache, useCanvasInteraction } from './canvas/hooks';
import { ProfileOverlay } from './canvas/components';

export interface BannerCanvasHandle {
  generateStageImage: () => string;
}

interface BannerCanvasProps {
  backgroundImage: string | null;
  elements: BannerElement[];
  showSafeZones: boolean;
  profilePic: string | null;
  profileTransform?: { x: number; y: number; scale: number };
  setProfileTransform?: (val: { x: number; y: number; scale: number }) => void;
  onElementsChange: (elements: BannerElement[]) => void;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onProfileFaceEnhance?: () => Promise<void>;
  onProfileRemoveBg?: () => Promise<void>;
  canvasWidth?: number;
  canvasHeight?: number;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  canvasFormatId?: CanvasFormatId;
  showProfileOverlay?: boolean;
  profileOverlayConfig?: ProfileOverlayConfig;
  onProfileUpload?: () => void;
}

const BannerCanvasComponent = forwardRef<BannerCanvasHandle, BannerCanvasProps>(
  (
    {
      backgroundImage,
      elements,
      showSafeZones,
      profilePic,
      profileTransform,
      setProfileTransform,
      onElementsChange,
      selectedElementId,
      onSelectElement,
      onProfileFaceEnhance,
      onProfileRemoveBg,
      canvasWidth = BANNER_WIDTH,
      canvasHeight = BANNER_HEIGHT,
      zoom = 1,
      onZoomChange,
      canvasFormatId = 'linkedin_banner',
      showProfileOverlay = canvasFormatId === 'linkedin_banner',
      profileOverlayConfig,
      onProfileUpload,
    },
    ref,
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const elementRectsRef = useRef<Record<string, ElementRect>>({});

    // Image caching hook
    const { getCachedImage, renderVersion } = useImageCache();

    // Gesture handling (pinch-to-zoom, two-finger pan)
    const { gestureHandlers, isGesturing } = useCanvasGestures({
      zoom,
      setZoom: onZoomChange || (() => {}),
      canvasRef,
      minZoom: 0.5,
      maxZoom: 3.0,
      enabled: !!onZoomChange,
      enableHaptics: true,
    });

    // Element interaction handling
    const { dragState, cursor, handleMouseDown, handleMouseMove, handleMouseUp } =
      useCanvasInteraction({
        canvasRef,
        elements,
        selectedElementId,
        onSelectElement,
        onElementsChange,
        elementRectsRef,
        isGesturing,
      });

    // Cancel drag when gesture starts
    useEffect(() => {
      if (isGesturing && dragState) {
        handleMouseUp();
      }
    }, [isGesturing, dragState, handleMouseUp]);

    /**
     * Render canvas content
     */
    const renderCanvas = useCallback(
      (ctx: CanvasRenderingContext2D, includeSafeZones: boolean, includeHandles: boolean) => {
        // Clear and draw background
        clearCanvas(ctx, canvasWidth, canvasHeight);
        ctx.fillStyle = backgroundImage ? '#f3f4f6' : '#0073b1';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Draw background image if present
        if (backgroundImage) {
          const img = getCachedImage(backgroundImage);
          if (img.complete) {
            drawImageCover(ctx, img, 0, 0, canvasWidth, canvasHeight);
          }
        }

        // Draw elements and update rects
        const dims = drawElements(ctx, elements, getCachedImage);
        dims.forEach((rect, id) => {
          elementRectsRef.current[id] = rect;
        });

        // Draw safe zones
        if (includeSafeZones) {
          drawSafeZones(ctx, canvasFormatId, canvasWidth, canvasHeight, !!backgroundImage);
        }

        // Draw selection overlay
        if (includeHandles && selectedElementId && elementRectsRef.current[selectedElementId]) {
          drawSelectionOverlay(ctx, elementRectsRef.current[selectedElementId]);
        }
      },
      [backgroundImage, elements, getCachedImage, canvasWidth, canvasHeight, canvasFormatId, selectedElementId],
    );

    // Expose generateStageImage to parent
    useImperativeHandle(ref, () => ({
      generateStageImage: () => {
        const canvas = canvasRef.current;
        if (!canvas) return '';
        const ctx = canvas.getContext('2d');
        if (!ctx) return '';

        // Render clean version (no safe zones, no handles)
        renderCanvas(ctx, false, false);
        const dataURL = canvas.toDataURL('image/png');

        // Restore visual state
        renderCanvas(ctx, showSafeZones, true);
        return dataURL;
      },
    }));

    // Re-render on changes
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      renderCanvas(ctx, showSafeZones, true);
      document.fonts.ready.then(() => renderCanvas(ctx, showSafeZones, true));
    }, [backgroundImage, elements, showSafeZones, selectedElementId, renderVersion, renderCanvas]);

    // Handle Ctrl+scroll for element zoom
    const handleCanvasWheel = useCallback(
      (e: React.WheelEvent) => {
        if (e.ctrlKey && selectedElementId) {
          e.preventDefault();
          e.stopPropagation();

          const el = elements.find((el) => el.id === selectedElementId);
          if (el) {
            const delta = -e.deltaY * 0.001;
            const scaleFactor = 1 + delta;
            const newEl = { ...el };

            if (el.type === 'text') {
              const currentSize = el.fontSize || 48;
              newEl.fontSize = Math.max(12, Math.round(currentSize * scaleFactor));
            } else {
              const currentW = el.width || 100;
              const currentH = el.height || 100;
              const newW = currentW * scaleFactor;
              const newH = currentH * scaleFactor;
              newEl.width = newW;
              newEl.height = newH;
              newEl.x = el.x - (newW - currentW) / 2;
              newEl.y = el.y - (newH - currentH) / 2;
            }

            onElementsChange(elements.map((e) => (e.id === newEl.id ? newEl : e)));
          }
        }
      },
      [selectedElementId, elements, onElementsChange],
    );

    // Build cursor class
    const getCursorClass = () => {
      if (dragState) {
        if (dragState.mode === 'move' || dragState.mode === 'rotate') return 'cursor-grabbing';
        return 'cursor-crosshair';
      }
      if (cursor === 'move') return 'cursor-move';
      if (cursor === 'grab') return 'cursor-grab';
      if (cursor.includes('resize')) return `cursor-${cursor}`;
      return 'cursor-default';
    };

    return (
      <div
        className="w-full relative shadow-2xl rounded-lg bg-slate-800 mb-20 group"
        style={{ aspectRatio: `${canvasWidth}/${canvasHeight}` }}
        onWheel={handleCanvasWheel}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className={`w-full h-full absolute top-0 left-0 origin-top-left touch-none ${getCursorClass()}`}
          onMouseDown={handleMouseDown}
          onTouchStart={(e) => {
            gestureHandlers.onTouchStart(e);
            handleMouseDown(e);
          }}
          onTouchMove={(e) => {
            gestureHandlers.onTouchMove(e);
            handleMouseMove(e);
          }}
          onTouchEnd={(e) => {
            gestureHandlers.onTouchEnd(e);
            handleMouseUp();
          }}
        />

        {/* Profile Picture Overlay */}
        {showSafeZones && showProfileOverlay && profileOverlayConfig && (
          <ProfileOverlay
            profilePic={profilePic}
            profileTransform={profileTransform}
            setProfileTransform={setProfileTransform}
            profileOverlayConfig={profileOverlayConfig}
            canvasWidth={canvasWidth}
            onProfileFaceEnhance={onProfileFaceEnhance}
            onProfileRemoveBg={onProfileRemoveBg}
            onProfileUpload={onProfileUpload}
          />
        )}
      </div>
    );
  },
);

const BannerCanvas = memo(BannerCanvasComponent);

export default BannerCanvas;
