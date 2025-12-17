import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { BANNER_WIDTH, BANNER_HEIGHT } from '../constants';
import { BannerElement } from '../types';

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
}

const HANDLE_SIZE = 20; // Increased from 10 to 20 for better touch interaction
const HANDLE_OFFSET = HANDLE_SIZE / 2;
const ROTATION_HANDLE_DIST = 30;

type DragMode = 'move' | 'resize' | 'rotate';
type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w' | 'rot';

interface DragState {
  mode: DragMode;
  id: string;
  startX: number;
  startY: number;
  initialX: number;
  initialY: number;
  initialW: number;
  initialH: number;
  initialRectX: number;
  initialRectY: number;
  initialFontSize?: number;
  initialRotation?: number;
  handle?: ResizeHandle;
  startAngle?: number;
}

const rotatePoint = (x: number, y: number, cx: number, cy: number, angleRad: number) => {
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  const dx = x - cx;
  const dy = y - cy;
  return {
    x: cx + (dx * cos - dy * sin),
    y: cy + (dx * sin + dy * cos),
  };
};

const BannerCanvas = forwardRef<BannerCanvasHandle, BannerCanvasProps>(
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
    },
    ref,
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const elementRects = useRef<
      Record<string, { x: number; y: number; w: number; h: number; rotation: number }>
    >({});

    const [dragState, setDragState] = useState<DragState | null>(null);
    const [cursor, setCursor] = useState('default');
    const [isEnhancingProfile, setIsEnhancingProfile] = useState(false);

    // Internal render function that can be called with different options
    const renderCanvas = (
      ctx: CanvasRenderingContext2D,
      includeSafeZones: boolean,
      includeHandles: boolean,
    ) => {
      // Clear
      ctx.clearRect(0, 0, BANNER_WIDTH, BANNER_HEIGHT);

      // Draw Background
      ctx.fillStyle = backgroundImage ? '#f3f4f6' : '#0073b1';
      ctx.fillRect(0, 0, BANNER_WIDTH, BANNER_HEIGHT);

      const drawContent = () => {
        drawElementsAndOverlays(ctx, includeSafeZones, includeHandles);
      };

      if (backgroundImage) {
        const img = new Image();
        img.src = backgroundImage;
        if (img.complete) {
          drawImageProp(ctx, img, 0, 0, BANNER_WIDTH, BANNER_HEIGHT);
          drawContent();
        } else {
          // Note: For async export this might be tricky, but usually images are pre-loaded in browser cache by the time user clicks download
          drawImageProp(ctx, img, 0, 0, BANNER_WIDTH, BANNER_HEIGHT);
          drawContent();
        }
      } else {
        drawContent();
      }
    };

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      generateStageImage: () => {
        const canvas = canvasRef.current;
        if (!canvas) return '';
        const ctx = canvas.getContext('2d');
        if (!ctx) return '';

        // Render CLEAN version (no safe zones, no handles)
        renderCanvas(ctx, false, false);
        const dataURL = canvas.toDataURL('image/png');

        // Restore visual state immediately
        renderCanvas(ctx, showSafeZones, true);

        return dataURL;
      },
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      if (backgroundImage) img.src = backgroundImage;

      // Trigger render
      if (backgroundImage && !img.complete) {
        img.onload = () => renderCanvas(ctx, showSafeZones, true);
      } else {
        renderCanvas(ctx, showSafeZones, true);
      }

      document.fonts.ready.then(() => renderCanvas(ctx, showSafeZones, true));

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [backgroundImage, elements, showSafeZones, profilePic, selectedElementId]);

    const drawImageProp = (
      ctx: CanvasRenderingContext2D,
      img: HTMLImageElement,
      x: number,
      y: number,
      w: number,
      h: number,
    ) => {
      const offsetX = 0.5;
      const offsetY = 0.5;

      const iw = img.width,
        ih = img.height;
      const r = Math.min(w / iw, h / ih);
      let nw = iw * r,
        nh = ih * r;
      let ar = 1;

      if (nw < w) ar = w / nw;
      if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;
      nw *= ar;
      nh *= ar;

      let cw = iw / (nw / w);
      let ch = ih / (nh / h);

      let cx = (iw - cw) * offsetX;
      let cy = (ih - ch) * offsetY;

      if (cx < 0) cx = 0;
      if (cy < 0) cy = 0;
      if (cw > iw) cw = iw;
      if (ch > ih) ch = ih;

      ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
    };

    const drawElementsAndOverlays = (
      ctx: CanvasRenderingContext2D,
      drawGuides: boolean,
      drawHandles: boolean,
    ) => {
      // 1. Draw User Elements
      elements.forEach((el) => {
        const rotation = el.rotation || 0;
        const angleRad = (rotation * Math.PI) / 180;

        let width = 0,
          height = 0,
          rectX = el.x;

        if (el.type === 'text') {
          // Uses fontWeight property, defaults to bold
          ctx.font = `${el.fontWeight || 'bold'} ${el.fontSize || 48}px "${el.fontFamily || 'Inter'}", sans-serif`;
          const metrics = ctx.measureText(el.content);
          width = metrics.width;
          height = (el.fontSize || 48) * 1.2;

          const align: CanvasTextAlign = (el.textAlign as CanvasTextAlign) || 'left';
          if (align === 'center') {
            rectX = el.x - metrics.width / 2;
          } else if (align === 'right') {
            rectX = el.x - metrics.width;
          }
        } else {
          width = el.width || 100;
          height = el.height || 100;
          rectX = el.x;
        }

        elementRects.current[el.id] = {
          x: rectX,
          y: el.y,
          w: width,
          h: height,
          rotation: rotation,
        };

        ctx.save();
        const cx = rectX + width / 2;
        const cy = el.y + height / 2;

        ctx.translate(cx, cy);
        ctx.rotate(angleRad);
        ctx.translate(-cx, -cy);

        if (el.type === 'text') {
          // Uses fontWeight property, defaults to bold
          ctx.font = `${el.fontWeight || 'bold'} ${el.fontSize || 48}px "${el.fontFamily || 'Inter'}", sans-serif`;
          ctx.fillStyle = el.color || 'white';
          ctx.textBaseline = 'top';
          const align: CanvasTextAlign = (el.textAlign as CanvasTextAlign) || 'left';
          ctx.textAlign = align;
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = 4;
          ctx.fillText(el.content, el.x, el.y);
        } else {
          const img = new Image();
          img.src = el.content;
          if (img.complete) {
            ctx.drawImage(img, el.x, el.y, width, height);
          } else {
            ctx.drawImage(img, el.x, el.y, width, height);
          }
        }
        ctx.restore();
      });

      // 2. Draw Safe Zones
      if (drawGuides) {
        drawSafeZones(ctx);
      }

      // 3. Draw Selection Handles
      if (drawHandles && selectedElementId && elementRects.current[selectedElementId]) {
        drawSelectionOverlay(ctx, selectedElementId);
      }
    };

    const drawSafeZones = (ctx: CanvasRenderingContext2D) => {
      // Dimensions matching the screenshot
      const L_MARGIN = 44;
      const BLOCK_W = 524;
      const T_MARGIN = 132;
      const BLOCK_H = 264; // BANNER_HEIGHT - T_MARGIN
      const R_GUIDE = L_MARGIN + BLOCK_W; // 568

      // Add shadow to make white guides visible on any background
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      // 1. Lines - Solid white for clear visibility
      ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
      ctx.lineWidth = 2;

      // Horizontal at 132 - The "Safe Zone" line
      ctx.beginPath();
      ctx.moveTo(0, T_MARGIN);
      ctx.lineTo(BANNER_WIDTH, T_MARGIN);
      ctx.stroke();

      // Vertical at 44
      ctx.beginPath();
      ctx.moveTo(L_MARGIN, 0);
      ctx.lineTo(L_MARGIN, BANNER_HEIGHT);
      ctx.stroke();

      // Vertical at 568 (Right edge of profile zone)
      ctx.beginPath();
      ctx.moveTo(R_GUIDE, 0);
      ctx.lineTo(R_GUIDE, BANNER_HEIGHT);
      ctx.stroke();

      // 2. Labels
      ctx.fillStyle = 'white';
      ctx.font = '700 18px Inter, sans-serif';
      ctx.textBaseline = 'middle';

      // "44"
      ctx.textAlign = 'center';
      ctx.fillText('44', L_MARGIN / 2, T_MARGIN / 2);

      // "524"
      ctx.fillText('524', L_MARGIN + BLOCK_W / 2, T_MARGIN / 2);

      // "132" & "264"
      ctx.textAlign = 'left';
      ctx.fillText('132', R_GUIDE + 15, T_MARGIN / 2);
      ctx.fillText('264', R_GUIDE + 15, T_MARGIN + BLOCK_H / 2);

      if (!backgroundImage) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.textAlign = 'right';
        ctx.font = '800 56px Inter, sans-serif';
        ctx.fillText('LIFE OS Profile Cover', BANNER_WIDTH - 80, 200);
        ctx.font = '700 56px Inter, sans-serif';
        ctx.fillText('1584 x 396 px', BANNER_WIDTH - 80, 280);
      }

      ctx.restore();
    };

    const drawSelectionOverlay = (ctx: CanvasRenderingContext2D, id: string) => {
      const rect = elementRects.current[id];
      if (!rect) return;
      const rotation = rect.rotation || 0;
      const angleRad = (rotation * Math.PI) / 180;
      const cx = rect.x + rect.w / 2;
      const cy = rect.y + rect.h / 2;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angleRad);
      ctx.translate(-cx, -cy);

      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(rect.x - 2, rect.y - 2, rect.w + 4, rect.h + 4);
      ctx.setLineDash([]);

      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1;

      const handles = [
        { x: rect.x - HANDLE_OFFSET, y: rect.y - HANDLE_OFFSET },
        { x: rect.x + rect.w - HANDLE_OFFSET, y: rect.y - HANDLE_OFFSET },
        { x: rect.x - HANDLE_OFFSET, y: rect.y + rect.h - HANDLE_OFFSET },
        { x: rect.x + rect.w - HANDLE_OFFSET, y: rect.y + rect.h - HANDLE_OFFSET },
      ];
      handles.forEach((h) => {
        ctx.fillRect(h.x, h.y, HANDLE_SIZE, HANDLE_SIZE);
        ctx.strokeRect(h.x, h.y, HANDLE_SIZE, HANDLE_SIZE);
      });

      // Rotation Handle
      const rotX = rect.x + rect.w / 2;
      const rotY = rect.y - ROTATION_HANDLE_DIST;

      // Line to handle
      ctx.beginPath();
      ctx.moveTo(rotX, rect.y);
      ctx.lineTo(rotX, rotY);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Circle Handle
      ctx.beginPath();
      ctx.arc(rotX, rotY, 6, 0, 2 * Math.PI);
      ctx.fillStyle = '#3b82f6'; // Blue fill
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();
    };

    const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    };

    const isOverHandle = (
      x: number,
      y: number,
      rect: { x: number; y: number; w: number; h: number; rotation: number },
    ): ResizeHandle | null => {
      const cx = rect.x + rect.w / 2;
      const cy = rect.y + rect.h / 2;
      const angleRad = ((rect.rotation || 0) * Math.PI) / 180;
      const localP = rotatePoint(x, y, cx, cy, -angleRad);

      const handles: { t: ResizeHandle; cx: number; cy: number }[] = [
        { t: 'nw', cx: rect.x, cy: rect.y },
        { t: 'ne', cx: rect.x + rect.w, cy: rect.y },
        { t: 'sw', cx: rect.x, cy: rect.y + rect.h },
        { t: 'se', cx: rect.x + rect.w, cy: rect.y + rect.h },
        { t: 'n', cx: rect.x + rect.w / 2, cy: rect.y },
        { t: 's', cx: rect.x + rect.w / 2, cy: rect.y + rect.h },
        { t: 'w', cx: rect.x, cy: rect.y + rect.h / 2 },
        { t: 'e', cx: rect.x + rect.w, cy: rect.y + rect.h / 2 },
      ];

      for (const h of handles) {
        if (
          localP.x >= h.cx - HANDLE_SIZE &&
          localP.x <= h.cx + HANDLE_SIZE &&
          localP.y >= h.cy - HANDLE_SIZE &&
          localP.y <= h.cy + HANDLE_SIZE
        ) {
          return h.t;
        }
      }

      const rotCx = cx;
      const rotCy = rect.y - ROTATION_HANDLE_DIST;
      if (
        localP.x >= rotCx - HANDLE_SIZE &&
        localP.x <= rotCx + HANDLE_SIZE &&
        localP.y >= rotCy - HANDLE_SIZE &&
        localP.y <= rotCy + HANDLE_SIZE
      ) {
        return 'rot';
      }
      return null;
    };

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
      const { x, y } = getCanvasCoords(e);

      if (selectedElementId) {
        const rect = elementRects.current[selectedElementId];
        if (rect) {
          const handle = isOverHandle(x, y, rect);
          if (handle) {
            e.preventDefault();
            const el = elements.find((e) => e.id === selectedElementId);
            if (el) {
              const cx = rect.x + rect.w / 2;
              const cy = rect.y + rect.h / 2;
              const startAngle = Math.atan2(y - cy, x - cx);

              setDragState({
                mode: handle === 'rot' ? 'rotate' : 'resize',
                id: selectedElementId,
                handle,
                startX: x,
                startY: y,
                initialX: el.x,
                initialY: el.y,
                initialW: rect.w,
                initialH: rect.h,
                initialRectX: rect.x,
                initialRectY: rect.y,
                initialFontSize: el.fontSize || 48,
                initialRotation: el.rotation || 0,
                startAngle,
              });
            }
            return;
          }
        }
      }

      const reversedIds = elements.map((el) => el.id).reverse();
      let hitId: string | null = null;

      for (const id of reversedIds) {
        const rect = elementRects.current[id];
        const cx = rect.x + rect.w / 2;
        const cy = rect.y + rect.h / 2;
        const angleRad = ((rect.rotation || 0) * Math.PI) / 180;
        const localP = rotatePoint(x, y, cx, cy, -angleRad);

        if (
          localP.x >= rect.x &&
          localP.x <= rect.x + rect.w &&
          localP.y >= rect.y &&
          localP.y <= rect.y + rect.h
        ) {
          hitId = id;
          break;
        }
      }

      if (hitId) {
        onSelectElement(hitId);
        const el = elements.find((e) => e.id === hitId);
        const rect = elementRects.current[hitId];
        if (el && rect) {
          e.preventDefault();
          setDragState({
            mode: 'move',
            id: hitId,
            startX: x,
            startY: y,
            initialX: el.x,
            initialY: el.y,
            initialW: rect.w,
            initialH: rect.h,
            initialRectX: rect.x,
            initialRectY: rect.y,
          });
        }
      } else {
        onSelectElement(null);
      }
    };

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
      const { x, y } = getCanvasCoords(e);

      if (dragState) {
        e.preventDefault();
        const el = elements.find((e) => e.id === dragState.id);
        if (!el) return;

        const newEl = { ...el };

        if (dragState.mode === 'move') {
          const dx = x - dragState.startX;
          const dy = y - dragState.startY;
          newEl.x = dragState.initialX + dx;
          newEl.y = dragState.initialY + dy;
        } else if (dragState.mode === 'rotate') {
          const cx = dragState.initialRectX + dragState.initialW / 2;
          const cy = dragState.initialRectY + dragState.initialH / 2;

          // Calculate current angle and delta
          const currentAngle = Math.atan2(y - cy, x - cx);
          const angleDiff = currentAngle - (dragState.startAngle || 0);
          const newRotation = (dragState.initialRotation || 0) + (angleDiff * 180) / Math.PI;

          newEl.rotation = newRotation;
        } else if (dragState.mode === 'resize' && dragState.handle) {
          const rotationRad = ((dragState.initialRotation || 0) * Math.PI) / 180;
          const cx = dragState.initialRectX + dragState.initialW / 2;
          const cy = dragState.initialRectY + dragState.initialH / 2;

          const localMouse = rotatePoint(x, y, cx, cy, -rotationRad);
          const localStart = rotatePoint(dragState.startX, dragState.startY, cx, cy, -rotationRad);
          const dx = localMouse.x - localStart.x;
          const dy = localMouse.y - localStart.y;

          let newW = dragState.initialW;
          let newH = dragState.initialH;

          if (dragState.handle.includes('e')) newW += dx;
          else if (dragState.handle.includes('w')) newW -= dx;
          if (dragState.handle.includes('s')) newH += dy;
          else if (dragState.handle.includes('n')) newH -= dy;

          if (newW < 20) newW = 20;
          if (newH < 20) newH = 20;

          if (el.type === 'text') {
            let scale = 1;
            if (dragState.handle === 'n' || dragState.handle === 's')
              scale = newH / dragState.initialH;
            else scale = newW / dragState.initialW;
            const baseSize = dragState.initialFontSize || 48;
            newEl.fontSize = Math.max(12, Math.round(baseSize * scale));
          } else {
            newEl.width = newW;
            newEl.height = newH;
            const dw = newW - dragState.initialW;
            const dh = newH - dragState.initialH;
            newEl.x = dragState.initialX - dw / 2;
            newEl.y = dragState.initialY - dh / 2;
          }
        }
        const newElements = elements.map((e) => (e.id === newEl.id ? newEl : e));
        onElementsChange(newElements);
        return;
      }

      let newCursor = 'default';
      if (selectedElementId) {
        const rect = elementRects.current[selectedElementId];
        if (rect) {
          const handle = isOverHandle(x, y, rect);
          if (handle) {
            if (handle === 'rot') newCursor = 'grab';
            else if (handle === 'nw' || handle === 'se') newCursor = 'nwse-resize';
            else if (handle === 'ne' || handle === 'sw') newCursor = 'nesw-resize';
            else if (handle === 'n' || handle === 's') newCursor = 'ns-resize';
            else if (handle === 'e' || handle === 'w') newCursor = 'ew-resize';
          }
        }
      }
      if (newCursor === 'default') {
        const reversedIds = elements.map((el) => el.id).reverse();
        for (const id of reversedIds) {
          const rect = elementRects.current[id];
          const cx = rect.x + rect.w / 2;
          const cy = rect.y + rect.h / 2;
          const angleRad = ((rect.rotation || 0) * Math.PI) / 180;
          const localP = rotatePoint(x, y, cx, cy, -angleRad);
          if (
            localP.x >= rect.x &&
            localP.x <= rect.x + rect.w &&
            localP.y >= rect.y &&
            localP.y <= rect.y + rect.h
          ) {
            newCursor = 'move';
            break;
          }
        }
      }
      setCursor(newCursor);
    };

    const [profileDrag, setProfileDrag] = useState<{
      startX: number;
      startY: number;
      startPX: number;
      startPY: number;
    } | null>(null);

    const handleMouseUp = () => {
      setDragState(null);
      setProfileDrag(null);
    };

    // --- Profile Interaction ---
    const handleProfileMouseDown = (e: React.MouseEvent) => {
      if (!setProfileTransform || e.button !== 0) return; // Only left click
      e.stopPropagation();
      e.preventDefault();
      setProfileDrag({
        startX: e.clientX,
        startY: e.clientY,
        startPX: profileTransform?.x || 0,
        startPY: profileTransform?.y || 0,
      });
    };

    const handleProfileMouseMove = (e: React.MouseEvent) => {
      if (!profileDrag || !setProfileTransform) return;
      e.preventDefault();
      const dx = e.clientX - profileDrag.startX;
      const dy = e.clientY - profileDrag.startY;

      // 1px drag = 1px move (assuming 1:1 scale for simplicity, or adjust sensitivity)
      setProfileTransform({
        x: profileDrag.startPX + dx,
        y: profileDrag.startPY + dy,
        scale: profileTransform?.scale || 1,
      });
    };

    const handleProfileWheel = (e: React.WheelEvent) => {
      if (!setProfileTransform) return;
      e.stopPropagation();

      // Requirement: "Control and then the scroll wheel"
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = -e.deltaY * 0.002; // Sensitivity
        const currentScale = profileTransform?.scale || 1;
        const newScale = Math.min(Math.max(0.5, currentScale + delta), 5);
        setProfileTransform({
          x: profileTransform?.x || 0,
          y: profileTransform?.y || 0,
          scale: newScale,
        });
      }
    };

    // --- Canvas Element Interaction (Zoom) ---
    const handleCanvasWheel = (e: React.WheelEvent) => {
      // Requirement: "same with logos... Control and then scroll"
      if (e.ctrlKey && selectedElementId) {
        e.preventDefault();
        e.stopPropagation();

        const el = elements.find((el) => el.id === selectedElementId);
        if (el) {
          const delta = -e.deltaY * 0.001; // Sensitivity
          const scaleFactor = 1 + delta;

          const newEl = { ...el };
          if (el.type === 'text') {
            const currentSize = el.fontSize || 48;
            newEl.fontSize = Math.max(12, Math.round(currentSize * scaleFactor));
          } else {
            const currentW = el.width || 100;
            const currentH = el.height || 100;

            // Center Zoom?
            // To center zoom, we need to adjust x/y based on the size change
            const newW = currentW * scaleFactor;
            const newH = currentH * scaleFactor;
            const dw = newW - currentW;
            const dh = newH - currentH;

            newEl.width = newW;
            newEl.height = newH;
            newEl.x = el.x - dw / 2;
            newEl.y = el.y - dh / 2;
          }

          onElementsChange(elements.map((e) => (e.id === newEl.id ? newEl : e)));
        }
      }
    };

    return (
      <div
        className='w-full relative shadow-2xl rounded-lg bg-slate-800 mb-20 group aspect-[1584/396]'
        onWheel={handleCanvasWheel}
        onMouseMove={(e) => {
          if (profileDrag) handleProfileMouseMove(e);
          else handleMouseMove(e);
        }}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <canvas
          ref={canvasRef}
          width={BANNER_WIDTH}
          height={BANNER_HEIGHT}
          className={`w-full h-full absolute top-0 left-0 origin-top-left touch-none ${dragState
              ? dragState.mode === 'move' || dragState.mode === 'rotate'
                ? 'cursor-grabbing'
                : 'cursor-crosshair'
              : cursor === 'move'
                ? 'cursor-move'
                : cursor === 'nw-resize'
                  ? 'cursor-nw-resize'
                  : cursor === 'ne-resize'
                    ? 'cursor-ne-resize'
                    : cursor === 'sw-resize'
                      ? 'cursor-sw-resize'
                      : cursor === 'se-resize'
                        ? 'cursor-se-resize'
                        : cursor === 'n-resize'
                          ? 'cursor-n-resize'
                          : cursor === 's-resize'
                            ? 'cursor-s-resize'
                            : cursor === 'e-resize'
                              ? 'cursor-e-resize'
                              : cursor === 'w-resize'
                                ? 'cursor-w-resize'
                                : cursor === 'rotate'
                                  ? 'cursor-alias'
                                  : cursor === 'grab'
                                    ? 'cursor-grab'
                                    : cursor === 'grabbing'
                                      ? 'cursor-grabbing'
                                      : 'cursor-default'
            }`}
          onMouseDown={handleMouseDown}
          // Mouse move/up handled by parent for robustness
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        />

        {/* Profile Picture Overlay - Floating above canvas to allow overlap - Round Circle */}
        {showSafeZones && (
          <div
            className={`absolute rounded-full border-4 border-white overflow-hidden shadow-lg z-10 bg-slate-100 group w-[20.83%] aspect-square left-[19.31%] top-full -translate-x-1/2 -translate-y-1/2 pointer-events-auto ${profileDrag ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={handleProfileMouseDown}
            onWheel={handleProfileWheel}
          >
            {profilePic ? (
              <div className='w-full h-full relative pointer-events-none'>
                <img
                  src={profilePic}
                  alt='Profile'
                  className={`w-full h-full object-cover select-none ${profileDrag ? 'transition-none' : 'transition-transform duration-100 ease-out'}`}
                  style={{
                    transform: `scale(${profileTransform?.scale || 1}) translate(${profileTransform?.x || 0}px, ${profileTransform?.y || 0}px)`,
                  }}
                />
                {/* Face Enhance Button - Appears on hover */}
                <div className='absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-auto'>
                  <button
                    type='button'
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (onProfileFaceEnhance && !isEnhancingProfile) {
                        setIsEnhancingProfile(true);
                        try {
                          await onProfileFaceEnhance();
                        } catch (error) {
                          console.error('[Profile] Face enhance failed:', error);
                        } finally {
                          setIsEnhancingProfile(false);
                        }
                      }
                    }}
                    disabled={isEnhancingProfile}
                    className='bg-gradient-to-br from-pink-600 to-pink-700 hover:from-pink-500 hover:to-pink-600 disabled:from-pink-800 disabled:to-pink-800 text-white font-bold py-2 px-4 rounded-xl transition flex items-center justify-center gap-2 text-xs shadow-lg'
                    title='Enhance face quality with AI'
                  >
                    {isEnhancingProfile ? (
                      <>
                        <span className='material-icons text-sm animate-spin'>refresh</span>
                        Enhancing...
                      </>
                    ) : (
                      <>
                        <span className='material-icons text-sm'>face</span>
                        Face Enhance
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className='text-slate-400 font-bold text-center leading-tight select-none pointer-events-none'>
                <span className='material-icons text-4xl block md:text-5xl lg:text-6xl mb-1'>
                  person
                </span>
                <span className='text-[8px] md:text-[10px] lg:text-sm whitespace-nowrap px-2'>
                  524 px zone
                </span>
                <div className='mt-2 text-[10px] text-slate-300 opacity-60'>
                  Ctrl+Scroll to Zoom
                  <br />
                  Drag to Move
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
);

export default BannerCanvas;
