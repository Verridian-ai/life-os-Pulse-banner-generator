import React, { useState } from 'react';
import {
  CANVAS_FORMATS,
  FORMAT_CATEGORIES,
  type CanvasFormatId,
  type CanvasFormat,
} from '../../../constants';
import { useCanvasState } from '../../../context/canvas/CanvasStateContext';
import { BTN_NEU_SOLID } from '../../../styles';

// Platform logo paths
const PLATFORM_LOGOS: Record<string, string> = {
  linkedin: '/assets/platforms/linkedin.svg',
  facebook: '/assets/platforms/facebook.svg',
  x: '/assets/platforms/x.svg',
  instagram: '/assets/platforms/instagram.svg',
  youtube: '/assets/platforms/youtube.svg',
};

// Platform color mapping
const PLATFORM_COLORS: Record<string, { bg: string; border: string; text: string; active: string }> = {
  linkedin: {
    bg: 'from-blue-600/20 to-blue-700/20',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    active: 'from-blue-600 to-blue-700',
  },
  facebook: {
    bg: 'from-indigo-600/20 to-indigo-700/20',
    border: 'border-indigo-500/30',
    text: 'text-indigo-400',
    active: 'from-indigo-600 to-indigo-700',
  },
  x: {
    bg: 'from-zinc-600/20 to-zinc-700/20',
    border: 'border-zinc-500/30',
    text: 'text-zinc-300',
    active: 'from-zinc-600 to-zinc-700',
  },
  instagram: {
    bg: 'from-pink-600/20 to-purple-600/20',
    border: 'border-pink-500/30',
    text: 'text-pink-400',
    active: 'from-pink-600 to-purple-600',
  },
  youtube: {
    bg: 'from-red-600/20 to-red-700/20',
    border: 'border-red-500/30',
    text: 'text-red-400',
    active: 'from-red-600 to-red-700',
  },
};

interface CanvasFormatSelectorProps {
  onFormatChange?: (format: CanvasFormat) => void;
}

export function CanvasFormatSelector({ onFormatChange }: CanvasFormatSelectorProps) {
  const { canvasFormatId, setCanvasFormatId, canvasFormat } = useCanvasState();
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<CanvasFormatId | null>(null);

  const handleFormatSelect = (formatId: CanvasFormatId) => {
    if (formatId === canvasFormatId) {
      setIsOpen(false);
      return;
    }

    // Show confirmation dialog when switching formats
    setShowConfirmDialog(formatId);
  };

  const confirmFormatChange = () => {
    if (showConfirmDialog) {
      setCanvasFormatId(showConfirmDialog);
      onFormatChange?.(CANVAS_FORMATS[showConfirmDialog]);
      setShowConfirmDialog(null);
      setIsOpen(false);
    }
  };

  const cancelFormatChange = () => {
    setShowConfirmDialog(null);
  };

  const colors = PLATFORM_COLORS[canvasFormat.platform] || PLATFORM_COLORS.linkedin;

  return (
    <div className="relative">
      {/* Current Format Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          min-h-[44px] px-4 py-2 rounded-xl
          flex items-center gap-3
          bg-gradient-to-br ${colors.bg}
          border ${colors.border}
          ${colors.text}
          hover:brightness-110
          transition-all duration-200
          shadow-lg
        `}
      >
        {PLATFORM_LOGOS[canvasFormat.platform] ? (
          <img
            src={PLATFORM_LOGOS[canvasFormat.platform]}
            alt={`${canvasFormat.platform} logo`}
            className="w-5 h-5 object-contain"
          />
        ) : (
          <span className="material-icons text-lg">{canvasFormat.icon}</span>
        )}
        <div className="text-left">
          <p className="text-xs font-black uppercase tracking-wider">{canvasFormat.name}</p>
          <p className="text-[10px] opacity-70">
            {canvasFormat.width} x {canvasFormat.height}px
          </p>
        </div>
        <span className="material-icons text-base ml-2">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute top-full left-0 mt-2 w-80 max-h-[70vh] overflow-auto bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-50 p-3">
            {Object.entries(FORMAT_CATEGORIES).map(([platformKey, category]) => {
              const platformColors = PLATFORM_COLORS[platformKey] || PLATFORM_COLORS.linkedin;

              return (
                <div key={platformKey} className="mb-4 last:mb-0">
                  {/* Platform Header */}
                  <div className="flex items-center gap-2 px-2 mb-2">
                    {PLATFORM_LOGOS[platformKey] ? (
                      <img
                        src={PLATFORM_LOGOS[platformKey]}
                        alt={`${category.label} logo`}
                        className="w-4 h-4 object-contain"
                      />
                    ) : (
                      <span className={`material-icons text-sm ${platformColors.text}`}>
                        {category.icon}
                      </span>
                    )}
                    <span className={`text-xs font-bold uppercase tracking-wider ${platformColors.text}`}>
                      {category.label}
                    </span>
                  </div>

                  {/* Format Options */}
                  <div className="space-y-1">
                    {category.formats.map((formatId) => {
                      const format = CANVAS_FORMATS[formatId];
                      const isActive = formatId === canvasFormatId;

                      return (
                        <button
                          key={formatId}
                          onClick={() => handleFormatSelect(formatId)}
                          className={`
                            w-full min-h-[44px] px-3 py-2 rounded-xl
                            flex items-center gap-3
                            transition-all duration-200
                            ${isActive
                              ? `bg-gradient-to-br ${platformColors.active} text-white shadow-lg`
                              : `bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white`
                            }
                          `}
                        >
                          <span className="material-icons text-lg">{format.icon}</span>
                          <div className="flex-1 text-left">
                            <p className="text-xs font-bold">{format.name}</p>
                            <p className="text-[10px] opacity-70">
                              {format.width} x {format.height}px • {format.aspectRatio}
                            </p>
                          </div>
                          {isActive && (
                            <span className="material-icons text-sm">check_circle</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl p-6 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-icons text-amber-500 text-2xl">warning</span>
              <h3 className="text-white font-bold text-lg">Change Canvas Format?</h3>
            </div>

            <p className="text-zinc-400 text-sm mb-2">
              You are switching from{' '}
              <span className="text-white font-medium">{canvasFormat.name}</span> to{' '}
              <span className="text-white font-medium">
                {CANVAS_FORMATS[showConfirmDialog].name}
              </span>.
            </p>

            <p className="text-zinc-500 text-xs mb-6">
              Your current design elements will be preserved, but may need repositioning due to
              the different canvas dimensions.
            </p>

            <div className="flex gap-3">
              <button
                onClick={cancelFormatChange}
                className={`${BTN_NEU_SOLID} flex-1 rounded-xl`}
              >
                Cancel
              </button>
              <button
                onClick={confirmFormatChange}
                className="flex-1 min-h-[44px] px-4 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 text-white font-bold text-sm uppercase tracking-wider hover:brightness-110 transition"
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
