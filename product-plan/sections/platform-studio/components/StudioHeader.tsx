import React from 'react';

interface StudioHeaderProps {
  platform: string;
  activeTab: 'canvas' | 'templates' | 'media';
  onTabChange: (tab: 'canvas' | 'templates' | 'media') => void;
  onBack: () => void;
}

export function StudioHeader({ platform, activeTab, onTabChange, onBack }: StudioHeaderProps) {
  const tabs = [
    { id: 'canvas' as const, label: 'Canvas' },
    { id: 'templates' as const, label: 'Templates' },
    { id: 'media' as const, label: 'Media' },
  ];

  return (
    <header className="h-14 bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center px-4 gap-4 relative z-20">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="w-8 h-8 rounded-lg bg-white/5 backdrop-blur border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Platform Badge */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-lg">
        <div className="w-5 h-5 rounded bg-gradient-to-br from-sky-500 via-teal-500 to-cyan-400 shadow-[0_0_12px_rgba(20,184,166,0.4)]" />
        <span className="text-sm font-medium text-white capitalize">{platform}</span>
      </div>

      {/* Tabs */}
      <nav className="hidden md:flex items-center gap-1 ml-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white/10 backdrop-blur border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] text-white'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Voice Agent */}
        <button className="w-10 h-10 rounded-xl bg-gradient-to-r from-sky-500 via-teal-500 to-cyan-400 flex items-center justify-center text-white shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_30px_rgba(20,184,166,0.5)] transition-shadow">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>

        {/* Export */}
        <button className="hidden md:flex px-4 py-2 bg-white/5 backdrop-blur border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] hover:bg-white/10 rounded-lg text-sm font-medium text-white transition-all gap-2 items-center">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Export
        </button>
      </div>
    </header>
  );
}

export default StudioHeader;
