/**
 * PlatformFormatSelector - Platform-filtered format selector
 *
 * A modified version of CanvasFormatSelector that only shows
 * formats for the specified platform. Used by platform-specific studios.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  CANVAS_FORMATS,
  type CanvasFormatId,
  type CanvasFormat,
} from '@/constants';
import { useCanvasState } from '@/context/canvas/CanvasStateContext';
import { BTN_NEU_SOLID } from '@/styles';
import type { PlatformStudioConfig } from '../config/platformConfig';

// Platform logo paths
const PLATFORM_LOGOS: Record<string, string> = {
  linkedin: '/assets/platforms/linkedin.svg',
  facebook: '/assets/platforms/facebook.svg',
  x: '/assets/platforms/x.svg',
  instagram: '/assets/platforms/instagram.svg',
  youtube: '/assets/platforms/youtube.svg',
  tiktok: '/assets/platforms/tiktok.svg',
};

// Platform color mapping with enhanced glass effects
const PLATFORM_COLORS: Record<string, {
  bg: string;
  border: string;
  text: string;
  active: string;
  glow: string;
  iconBg: string;
}> = {
  linkedin: {
    bg: 'from-blue-600/15 to-blue-800/10',
    border: 'border-blue-500/20 hover:border-blue-400/40',
    text: 'text-blue-400',
    active: 'from-blue-500 to-blue-600',
    glow: 'shadow-blue-500/20',
    iconBg: 'bg-blue-500/20',
  },
  facebook: {
    bg: 'from-indigo-600/15 to-indigo-800/10',
    border: 'border-indigo-500/20 hover:border-indigo-400/40',
    text: 'text-indigo-400',
    active: 'from-indigo-500 to-indigo-600',
    glow: 'shadow-indigo-500/20',
    iconBg: 'bg-indigo-500/20',
  },
  x: {
    bg: 'from-zinc-600/15 to-zinc-800/10',
    border: 'border-zinc-500/20 hover:border-zinc-400/40',
    text: 'text-zinc-300',
    active: 'from-zinc-500 to-zinc-600',
    glow: 'shadow-zinc-500/20',
    iconBg: 'bg-zinc-500/20',
  },
  instagram: {
    bg: 'from-pink-600/15 to-purple-700/10',
    border: 'border-pink-500/20 hover:border-pink-400/40',
    text: 'text-pink-400',
    active: 'from-pink-500 to-purple-500',
    glow: 'shadow-pink-500/20',
    iconBg: 'bg-pink-500/20',
  },
  youtube: {
    bg: 'from-red-600/15 to-red-800/10',
    border: 'border-red-500/20 hover:border-red-400/40',
    text: 'text-red-400',
    active: 'from-red-500 to-red-600',
    glow: 'shadow-red-500/20',
    iconBg: 'bg-red-500/20',
  },
  tiktok: {
    bg: 'from-cyan-500/15 to-pink-600/10',
    border: 'border-cyan-500/20 hover:border-cyan-400/40',
    text: 'text-cyan-400',
    active: 'from-cyan-500 to-pink-500',
    glow: 'shadow-cyan-500/20',
    iconBg: 'bg-cyan-500/20',
  },
};

interface PlatformFormatSelectorProps {
  platformConfig: PlatformStudioConfig;
  onFormatChange?: (format: CanvasFormat) => void;
}

export function PlatformFormatSelector({ platformConfig, onFormatChange }: PlatformFormatSelectorProps) {
  const { canvasFormatId, setCanvasFormatId, canvasFormat } = useCanvasState();
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<CanvasFormatId | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<CanvasFormatId, HTMLButtonElement>>(new Map());

  // Only use formats from this platform
  const allowedFormats = platformConfig.formats;
  const colors = PLATFORM_COLORS[platformConfig.id] || PLATFORM_COLORS.linkedin;

  // Handle opening with animation
  const handleOpen = useCallback(() => {
    setIsAnimating(true);
    setIsOpen(true);
    setFocusedIndex(allowedFormats.indexOf(canvasFormatId));
  }, [canvasFormatId, allowedFormats]);

  // Handle closing
  const handleClose = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
    buttonRef.current?.focus();
  }, []);

  // Focus management
  useEffect(() => {
    if (isOpen && focusedIndex >= 0) {
      const formatId = allowedFormats[focusedIndex];
      itemRefs.current.get(formatId)?.focus();
    }
  }, [focusedIndex, isOpen, allowedFormats]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, handleClose]);

  const handleFormatSelect = useCallback((formatId: CanvasFormatId) => {
    if (formatId === canvasFormatId) {
      handleClose();
      return;
    }
    setShowConfirmDialog(formatId);
  }, [canvasFormatId, handleClose]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleOpen();
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        handleClose();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => (prev + 1) % allowedFormats.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => (prev - 1 + allowedFormats.length) % allowedFormats.length);
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(allowedFormats.length - 1);
        break;
      case 'Tab':
        handleClose();
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0) {
          handleFormatSelect(allowedFormats[focusedIndex]);
        }
        break;
    }
  }, [isOpen, focusedIndex, allowedFormats, handleOpen, handleClose, handleFormatSelect]);

  const confirmFormatChange = () => {
    if (showConfirmDialog) {
      setCanvasFormatId(showConfirmDialog);
      onFormatChange?.(CANVAS_FORMATS[showConfirmDialog]);
      setShowConfirmDialog(null);
      handleClose();
    }
  };

  const cancelFormatChange = () => {
    setShowConfirmDialog(null);
  };

  const setItemRef = useCallback((formatId: CanvasFormatId) => (el: HTMLButtonElement | null) => {
    if (el) {
      itemRefs.current.set(formatId, el);
    } else {
      itemRefs.current.delete(formatId);
    }
  }, []);

  return (
    <div className="relative">
      {/* Current Format Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => isOpen ? handleClose() : handleOpen()}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Canvas format: ${canvasFormat.name}, ${canvasFormat.width} by ${canvasFormat.height} pixels. Press Enter to change.`}
        className={`
          min-h-[44px] px-3 sm:px-4 py-2.5 rounded-2xl
          flex items-center gap-2 sm:gap-3
          bg-gradient-to-br ${colors.bg}
          backdrop-blur-md
          border ${colors.border}
          ${colors.text}
          hover:scale-[1.02] active:scale-[0.98]
          transition-all duration-200 ease-out
          shadow-lg ${colors.glow}
          group
          touch-manipulation
        `}
      >
        {/* Platform Icon with glow */}
        <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${colors.iconBg} flex items-center justify-center transition-transform group-hover:scale-110`}>
          {PLATFORM_LOGOS[platformConfig.id] ? (
            <img
              src={PLATFORM_LOGOS[platformConfig.id]}
              alt=""
              className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
            />
          ) : (
            <span className="material-icons text-base sm:text-lg">{canvasFormat.icon}</span>
          )}
        </div>

        {/* Format Info */}
        <div className="text-left min-w-0 flex-1">
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-wide sm:tracking-wider truncate">
            {canvasFormat.name}
          </p>
          <p className="text-[9px] sm:text-[10px] opacity-60 font-medium">
            {canvasFormat.width} x {canvasFormat.height}
          </p>
        </div>

        {/* Chevron with rotation */}
        <span
          className={`material-icons text-sm sm:text-base opacity-60 transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
        >
          expand_more
        </span>
      </button>

      {/* Dropdown Menu - Single platform, no category grouping */}
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Menu with glass effect */}
          <div
            ref={menuRef}
            role="listbox"
            aria-label={`Select ${platformConfig.name} format`}
            onKeyDown={handleKeyDown}
            className={`
              absolute top-full mt-2 z-50
              left-0 sm:left-auto sm:right-0
              w-[calc(100vw-2rem)] sm:w-80
              max-w-[320px]
              max-h-[60vh] sm:max-h-[70vh]
              bg-zinc-900/95 backdrop-blur-xl
              border border-white/10
              rounded-2xl sm:rounded-3xl
              shadow-2xl shadow-black/50
              overflow-hidden
              ${isAnimating ? 'animate-in fade-in slide-in-from-top-2 duration-200' : ''}
            `}
            onAnimationEnd={() => setIsAnimating(false)}
          >
            {/* Platform Header */}
            <div className={`flex items-center gap-2 px-4 py-3 bg-gradient-to-r ${colors.bg} border-b border-white/5`}>
              {PLATFORM_LOGOS[platformConfig.id] ? (
                <img
                  src={PLATFORM_LOGOS[platformConfig.id]}
                  alt=""
                  className="w-5 h-5 object-contain"
                />
              ) : (
                <span className={`material-icons text-lg ${colors.text}`}>
                  design_services
                </span>
              )}
              <span className={`text-sm font-bold ${colors.text}`}>
                {platformConfig.displayName}
              </span>
              <span className="text-[10px] text-zinc-500 ml-auto">
                {allowedFormats.length} formats
              </span>
            </div>

            {/* Scroll container */}
            <div className="overflow-y-auto max-h-[calc(60vh-3rem)] sm:max-h-[calc(70vh-4rem)] p-2 sm:p-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {/* Format Options - Simple list, no category grouping */}
              <div className="space-y-1">
                {allowedFormats.map((formatId) => {
                  const format = CANVAS_FORMATS[formatId];
                  if (!format) return null;

                  const isActive = formatId === canvasFormatId;
                  const isFocused = allowedFormats[focusedIndex] === formatId;

                                      return (
                                        <button
                                          key={formatId}
                                          ref={setItemRef(formatId)}
                                          type="button"
                                          role="option"
                                          aria-selected={isActive ? 'true' : 'false'}
                                          tabIndex={isFocused ? 0 : -1}
                                          onClick={() => handleFormatSelect(formatId)}
                                          onKeyDown={handleKeyDown}
                                          className={`
                                            w-full min-h-[52px] sm:min-h-[56px] px-3 py-2.5 rounded-xl                        flex items-center gap-3
                        transition-all duration-150 ease-out
                        touch-manipulation
                        ${isActive
                          ? `bg-gradient-to-br ${colors.active} text-white shadow-lg ring-2 ring-white/20`
                          : `bg-white/[0.03] hover:bg-white/[0.08] text-zinc-300 hover:text-white`
                        }
                        ${isFocused && !isActive ? 'ring-2 ring-white/30 bg-white/[0.06]' : ''}
                      `}
                    >
                      {/* Format Icon */}
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-white/20' : 'bg-white/5'}`}>
                        <span className={`material-icons text-lg ${isActive ? 'text-white' : colors.text}`}>
                          {format.icon}
                        </span>
                      </div>

                      {/* Format Details */}
                      <div className="flex-1 text-left min-w-0">
                        <p className={`text-xs font-bold truncate ${isActive ? 'text-white' : ''}`}>
                          {format.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-[10px] font-medium ${isActive ? 'text-white/70' : 'text-zinc-500'}`}>
                            {format.width} x {format.height}
                          </span>
                          <span className={`w-1 h-1 rounded-full ${isActive ? 'bg-white/40' : 'bg-zinc-600'}`} />
                          <span className={`text-[10px] ${isActive ? 'text-white/70' : 'text-zinc-500'}`}>
                            {format.aspectRatio}
                          </span>
                        </div>
                      </div>

                      {/* Check Icon */}
                      {isActive && (
                        <span className="material-icons text-base text-white/90 shrink-0">
                          check_circle
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom hint */}
            <div className="hidden sm:flex items-center justify-center gap-4 px-3 py-2 border-t border-white/5 bg-black/20">
              <span className="text-[9px] text-zinc-500 flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-white/10 rounded text-[8px]">Up/Down</kbd> Navigate
              </span>
              <span className="text-[9px] text-zinc-500 flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-white/10 rounded text-[8px]">Enter</kbd> Select
              </span>
              <span className="text-[9px] text-zinc-500 flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-white/10 rounded text-[8px]">Esc</kbd> Close
              </span>
            </div>
          </div>
        </>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-description"
        >
          <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-5 sm:p-6 max-w-md w-full animate-in zoom-in-95 slide-in-from-bottom-4 duration-200">
            {/* Header with icon */}
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 flex items-center justify-center shrink-0">
                <span className="material-icons text-yellow-400 text-2xl">swap_horiz</span>
              </div>
              <div>
                <h3 id="confirm-dialog-title" className="text-white font-bold text-lg">
                  Change Canvas Format?
                </h3>
                <p className="text-zinc-400 text-sm mt-1">
                  This will resize your canvas
                </p>
              </div>
            </div>

            {/* Format comparison */}
            <div id="confirm-dialog-description" className="bg-black/30 rounded-2xl p-4 mb-5 space-y-3">
              {/* From */}
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${colors.iconBg} flex items-center justify-center`}>
                  <span className={`material-icons text-sm ${colors.text}`}>{canvasFormat.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-zinc-500">From</p>
                  <p className="text-sm text-white font-medium truncate">{canvasFormat.name}</p>
                </div>
                <span className="text-[10px] text-zinc-500">
                  {canvasFormat.width} x {canvasFormat.height}
                </span>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <span className="material-icons text-zinc-600 text-lg">arrow_downward</span>
              </div>

              {/* To */}
              {(() => {
                const newFormat = CANVAS_FORMATS[showConfirmDialog];
                return (
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${colors.iconBg} flex items-center justify-center`}>
                      <span className={`material-icons text-sm ${colors.text}`}>{newFormat.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-zinc-500">To</p>
                      <p className="text-sm text-white font-medium truncate">{newFormat.name}</p>
                    </div>
                    <span className="text-[10px] text-zinc-500">
                      {newFormat.width} x {newFormat.height}
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* Info note */}
            <p className="text-zinc-500 text-xs mb-5 flex items-start gap-2">
              <span className="material-icons text-sm text-zinc-600 mt-0.5">info</span>
              <span>
                Your design elements will be preserved but may need repositioning for the new dimensions.
              </span>
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={cancelFormatChange}
                className={`${BTN_NEU_SOLID} flex-1 rounded-xl text-sm`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmFormatChange}
                autoFocus
                className={`flex-1 min-h-[44px] px-4 rounded-xl bg-gradient-to-br ${colors.active} text-white font-bold text-sm uppercase tracking-wider hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg ${colors.glow}`}
              >
                Change Format
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlatformFormatSelector;
