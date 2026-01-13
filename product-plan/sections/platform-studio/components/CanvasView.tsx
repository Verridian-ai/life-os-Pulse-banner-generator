import React from 'react';

interface Format {
  id: string;
  name: string;
  width: number;
  height: number;
}

interface CanvasViewProps {
  format: Format;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  showSafeZones: boolean;
  onToggleSafeZones: () => void;
}

export function CanvasView({ format, zoom, onZoomChange, showSafeZones, onToggleSafeZones }: CanvasViewProps) {
  const zoomOptions = [
    { value: 0.5, label: '50%' },
    { value: 0.75, label: '75%' },
    { value: 1, label: '100%' },
    { value: 1.5, label: '150%' },
    { value: 2, label: '200%' },
  ];

  return (
    <div className="flex-1 relative overflow-hidden">
      {/* Canvas Container */}
      <div className="absolute inset-0 flex items-center justify-center p-8">
        {/* Canvas with Neumorphic Effect */}
        <div
          className="relative bg-zinc-900/80 backdrop-blur-sm border border-white/10 shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.05),0_0_40px_rgba(20,184,166,0.15)] rounded-2xl overflow-hidden transition-transform"
          style={{
            width: format.width * zoom * 0.3,
            height: format.height * zoom * 0.3,
            maxWidth: '100%',
            maxHeight: '100%',
          }}
        >
          {/* Checkerboard Pattern (transparent bg indicator) */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(45deg, #333 25%, transparent 25%),
                linear-gradient(-45deg, #333 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #333 75%),
                linear-gradient(-45deg, transparent 75%, #333 75%)
              `,
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
            }}
          />

          {/* Safe Zones Overlay */}
          {showSafeZones && (
            <div className="absolute inset-4 border-2 border-dashed border-teal-500/50 rounded pointer-events-none shadow-[0_0_10px_rgba(20,184,166,0.3)]">
              <span className="absolute -top-6 left-0 text-xs text-teal-400">Safe Zone</span>
            </div>
          )}

          {/* Empty State */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500">
            <div className="w-20 h-20 mb-4 rounded-2xl bg-white/5 backdrop-blur border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center">
              <svg className="w-10 h-10 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm">Generate or drop an image</p>
          </div>
        </div>
      </div>

      {/* Bottom Toolbar - Glass Card */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.05)] rounded-2xl">
        {/* Zoom Controls */}
        <button
          onClick={() => onZoomChange(Math.max(0.25, zoom - 0.25))}
          className="w-8 h-8 rounded-lg bg-white/5 backdrop-blur border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>

        <select
          value={zoom}
          onChange={(e) => onZoomChange(parseFloat(e.target.value))}
          className="bg-white/5 backdrop-blur text-white text-sm px-3 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30"
        >
          {zoomOptions.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-zinc-900">
              {opt.label}
            </option>
          ))}
        </select>

        <button
          onClick={() => onZoomChange(Math.min(3, zoom + 0.25))}
          className="w-8 h-8 rounded-lg bg-white/5 backdrop-blur border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        <div className="w-px h-6 bg-white/10 mx-2" />

        {/* Safe Zones Toggle */}
        <button
          onClick={onToggleSafeZones}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            showSafeZones
              ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30 shadow-[0_0_10px_rgba(20,184,166,0.2)]'
              : 'bg-white/5 backdrop-blur border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
          }`}
        >
          Safe Zones
        </button>

        {/* Fit to View */}
        <button
          onClick={() => onZoomChange(1)}
          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/5 backdrop-blur border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
        >
          Fit
        </button>
      </div>

      {/* Format Badge - Glass Card */}
      <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-xl">
        <span className="text-sm text-zinc-400">
          {format.name} <span className="text-teal-400/80">•</span> {format.width}×{format.height}
        </span>
      </div>
    </div>
  );
}

export default CanvasView;
