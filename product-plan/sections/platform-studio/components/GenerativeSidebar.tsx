import React, { useState } from 'react';

interface Format {
  id: string;
  name: string;
  width: number;
  height: number;
}

interface GenerativeSidebarProps {
  formats: Format[];
  selectedFormat: Format;
  onFormatChange: (format: Format) => void;
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
}

export function GenerativeSidebar({
  formats,
  selectedFormat,
  onFormatChange,
  onGenerate,
  isGenerating,
}: GenerativeSidebarProps) {
  const [prompt, setPrompt] = useState('');
  const [imageSize, setImageSize] = useState<'1k' | '2k' | '4k'>('2k');

  const handleGenerate = () => {
    if (prompt.trim()) {
      onGenerate(prompt);
    }
  };

  return (
    <aside className="w-80 bg-white/5 backdrop-blur-xl border-l border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h2 className="text-lg font-semibold text-white font-['Space_Grotesk'] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gradient-to-r from-sky-500 to-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
          Generate
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Format Selector */}
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Format</label>
          <select
            value={selectedFormat.id}
            onChange={(e) => {
              const format = formats.find((f) => f.id === e.target.value);
              if (format) onFormatChange(format);
            }}
            className="w-full px-4 py-3 bg-white/5 backdrop-blur border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-xl text-white focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 transition-all"
          >
            {formats.map((format) => (
              <option key={format.id} value={format.id} className="bg-zinc-900">
                {format.name} ({format.width}×{format.height})
              </option>
            ))}
          </select>
        </div>

        {/* Prompt Input */}
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to create..."
            rows={4}
            className="w-full px-4 py-3 bg-white/5 backdrop-blur border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 transition-all resize-none"
          />
        </div>

        {/* Size Selector */}
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Output Size</label>
          <div className="grid grid-cols-3 gap-2">
            {(['1k', '2k', '4k'] as const).map((size) => (
              <button
                key={size}
                onClick={() => setImageSize(size)}
                className={`py-2 rounded-xl text-sm font-medium transition-all ${
                  imageSize === size
                    ? 'bg-gradient-to-r from-sky-500 via-teal-500 to-cyan-400 text-white shadow-[0_0_20px_rgba(20,184,166,0.3)]'
                    : 'bg-white/5 backdrop-blur border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {size.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="w-full py-4 bg-gradient-to-r from-sky-500 via-teal-500 to-cyan-400 text-white font-semibold rounded-xl shadow-[0_0_40px_rgba(20,184,166,0.3)] hover:shadow-[0_0_60px_rgba(20,184,166,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate
            </>
          )}
        </button>

        {/* Quick Actions */}
        <div className="space-y-2">
          <p className="text-sm text-zinc-500">Quick actions</p>
          <div className="grid grid-cols-2 gap-2">
            <button className="p-3 bg-white/5 backdrop-blur border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] hover:bg-white/10 rounded-xl text-sm text-zinc-300 transition-all flex items-center gap-2">
              <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Enhance
            </button>
            <button className="p-3 bg-white/5 backdrop-blur border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] hover:bg-white/10 rounded-xl text-sm text-zinc-300 transition-all flex items-center gap-2">
              <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Regenerate
            </button>
          </div>
        </div>

        {/* Edit Tools */}
        <div className="space-y-2">
          <p className="text-sm text-zinc-500">Edit tools</p>
          <div className="space-y-2">
            <button className="w-full p-3 bg-white/5 backdrop-blur border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] hover:bg-white/10 rounded-xl text-sm text-zinc-300 transition-all flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 backdrop-blur border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center">
                <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              Remove Background
            </button>
            <button className="w-full p-3 bg-white/5 backdrop-blur border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] hover:bg-white/10 rounded-xl text-sm text-zinc-300 transition-all flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 backdrop-blur border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center">
                <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </div>
              Upscale 2x
            </button>
            <button className="w-full p-3 bg-white/5 backdrop-blur border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] hover:bg-white/10 rounded-xl text-sm text-zinc-300 transition-all flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 backdrop-blur border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center">
                <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              Restore & Enhance
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default GenerativeSidebar;
