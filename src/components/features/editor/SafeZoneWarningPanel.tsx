/**
 * SafeZoneWarningPanel
 *
 * Displays warnings when canvas elements enter danger zones.
 * Provides auto-snap suggestions to move elements to safe areas.
 * Shows viewport-specific warnings (desktop/mobile/both).
 */

import React from 'react';
import type { BannerElement } from '../../../types';
import type { SafeZoneWarning, DangerLevel } from '../../../utils/safeZoneUtils';

type SafeZoneWarningPanelProps = {
  warnings: SafeZoneWarning[];
  elements: BannerElement[];
  onSnapToSafe: (element: BannerElement) => void;
  onSelectElement: (elementId: string) => void;
  selectedElementId: string | null;
};

const DANGER_STYLES: Record<DangerLevel, { bg: string; border: string; icon: string; iconColor: string }> = {
  none: { bg: 'bg-green-900/20', border: 'border-green-500/30', icon: 'check_circle', iconColor: 'text-green-400' },
  warning: { bg: 'bg-yellow-900/20', border: 'border-yellow-500/30', icon: 'warning', iconColor: 'text-yellow-400' },
  danger: { bg: 'bg-red-900/20', border: 'border-red-500/30', icon: 'error', iconColor: 'text-red-400' },
};

const VIEWPORT_ICONS: Record<string, string> = {
  desktop: 'computer',
  mobile: 'phone_iphone',
  both: 'devices',
};

export function SafeZoneWarningPanel({
  warnings,
  elements,
  onSnapToSafe,
  onSelectElement,
  selectedElementId,
}: SafeZoneWarningPanelProps): React.JSX.Element | null {
  if (warnings.length === 0) {
    return null;
  }

  // Group warnings by element
  const warningsByElement = warnings.reduce<Record<string, SafeZoneWarning[]>>((acc, warning) => {
    if (!acc[warning.elementId]) {
      acc[warning.elementId] = [];
    }
    acc[warning.elementId].push(warning);
    return acc;
  }, {});

  // Get highest danger level for an element
  const getHighestDangerLevel = (elementWarnings: SafeZoneWarning[]): DangerLevel => {
    if (elementWarnings.some(w => w.dangerLevel === 'danger')) return 'danger';
    if (elementWarnings.some(w => w.dangerLevel === 'warning')) return 'warning';
    return 'none';
  };

  return (
    <div className="w-full bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="material-icons text-yellow-400 text-lg">visibility_off</span>
        <h3 className="text-sm font-bold text-white">Safe Zone Warnings</h3>
        <span className="ml-auto px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-full">
          {warnings.length} {warnings.length === 1 ? 'issue' : 'issues'}
        </span>
      </div>

      {/* Warning List */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {Object.entries(warningsByElement).map(([elementId, elementWarnings]) => {
          const element = elements.find(e => e.id === elementId);
          if (!element) return null;

          const highestLevel = getHighestDangerLevel(elementWarnings);
          const styles = DANGER_STYLES[highestLevel];
          const isSelected = selectedElementId === elementId;
          const hasSuggestion = elementWarnings.some(w => w.suggestedPosition);

          return (
            <div
              key={elementId}
              className={`${styles.bg} ${styles.border} border rounded-lg p-3 transition-all ${
                isSelected ? 'ring-2 ring-white/30' : ''
              }`}
            >
              {/* Element Header */}
              <button
                type="button"
                onClick={() => onSelectElement(elementId)}
                className="w-full flex items-start gap-2 text-left"
              >
                <span className={`material-icons ${styles.iconColor} text-lg shrink-0 mt-0.5`}>
                  {styles.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {elementWarnings[0].elementName}
                  </p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {elementWarnings[0].message}
                  </p>
                </div>
              </button>

              {/* Viewport & Overlap Info */}
              <div className="flex items-center gap-3 mt-2 pt-2 border-t border-white/5">
                {/* Viewport affected */}
                <div className="flex items-center gap-1">
                  <span className="material-icons text-zinc-500 text-sm">
                    {VIEWPORT_ICONS[elementWarnings[0].viewportAffected]}
                  </span>
                  <span className="text-xs text-zinc-500 capitalize">
                    {elementWarnings[0].viewportAffected}
                  </span>
                </div>

                {/* Overlap percentage */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-zinc-500">
                    {elementWarnings[0].overlapPercentage}% overlap
                  </span>
                </div>

                {/* Auto-snap button */}
                {hasSuggestion && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSnapToSafe(element);
                    }}
                    className="ml-auto flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-md transition-colors"
                    title="Move element to safe position"
                  >
                    <span className="material-icons text-sm">open_with</span>
                    Move to Safe
                  </button>
                )}
              </div>

              {/* Multiple zones warning */}
              {elementWarnings.length > 1 && (
                <div className="mt-2 pt-2 border-t border-white/5">
                  <p className="text-xs text-zinc-500">
                    Also overlapping: {elementWarnings.slice(1).map(w => w.zone.label).join(', ')}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Actions Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10">
        <p className="text-xs text-zinc-500">
          Click element to select, or use "Move to Safe"
        </p>
      </div>

      {/* Accessibility: High contrast override */}
      <style>{`
        @media (prefers-contrast: more) {
          .safe-zone-warning-panel {
            background: white !important;
            border: 2px solid black !important;
          }
          .safe-zone-warning-panel * {
            color: black !important;
          }
        }
        @media (forced-colors: active) {
          .safe-zone-warning-panel {
            background: Canvas !important;
            border: 2px solid ButtonText !important;
          }
        }
      `}</style>
    </div>
  );
}

export default SafeZoneWarningPanel;
