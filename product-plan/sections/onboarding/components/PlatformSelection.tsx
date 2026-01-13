import React, { useState } from 'react';

interface Platform {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

interface PlatformSelectionProps {
  onNext: (platforms: string[]) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

const platforms: Platform[] = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    color: 'bg-blue-600',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  {
    id: 'youtube',
    name: 'YouTube',
    color: 'bg-red-600',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
  {
    id: 'instagram',
    name: 'Instagram',
    color: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
  {
    id: 'facebook',
    name: 'Facebook',
    color: 'bg-blue-500',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    color: 'bg-zinc-900',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    ),
  },
  {
    id: 'x',
    name: 'X (Twitter)',
    color: 'bg-zinc-800',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
];

export function PlatformSelection({ onNext, onBack, currentStep, totalSteps }: PlatformSelectionProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const togglePlatform = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen flex flex-col p-6">
      {/* Progress Dots with Neumorphic Effect */}
      <div className="flex justify-center gap-3 mb-8">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i <= currentStep
                ? 'bg-gradient-to-br from-sky-500 via-teal-500 to-cyan-400 shadow-[0_0_12px_rgba(20,184,166,0.5),2px_2px_4px_rgba(0,0,0,0.3),-2px_-2px_4px_rgba(255,255,255,0.05)]'
                : 'bg-zinc-800 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.05)]'
            }`}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full">
        {/* Glass Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-2xl p-8 w-full">
          {/* Header */}
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-2 font-['Space_Grotesk']">
            Select your platforms
          </h2>
          <p className="text-zinc-400 text-center mb-8">
            Choose the platforms you create content for
          </p>

          {/* Platform Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full mb-8">
            {platforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => togglePlatform(platform.id)}
                className={`relative p-6 rounded-2xl transition-all duration-300 ${
                  selected.includes(platform.id)
                    ? 'bg-white/10 backdrop-blur-xl border border-teal-500/50 shadow-[0_0_30px_rgba(20,184,166,0.2),inset_0_1px_1px_rgba(255,255,255,0.1)]'
                    : 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.05),inset_0_1px_1px_rgba(255,255,255,0.1)] hover:bg-white/10 hover:border-white/20'
                }`}
              >
                {/* Checkmark */}
                {selected.includes(platform.id) && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-gradient-to-br from-sky-500 via-teal-500 to-cyan-400 rounded-full flex items-center justify-center shadow-[0_0_12px_rgba(20,184,166,0.5)]">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                {/* Icon */}
                <div className={`w-14 h-14 ${platform.color} rounded-xl flex items-center justify-center text-white mx-auto mb-3 shadow-[4px_4px_8px_rgba(0,0,0,0.3),-2px_-2px_6px_rgba(255,255,255,0.05)]`}>
                  {platform.icon}
                </div>

                {/* Name */}
                <p className="text-white font-medium text-center">{platform.name}</p>
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 w-full">
            <button
              onClick={onBack}
              className="flex-1 px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all duration-300 shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.05)]"
            >
              Back
            </button>
            <button
              onClick={() => onNext(selected)}
              disabled={selected.length === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-sky-500 via-teal-500 to-cyan-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-[0_0_30px_rgba(20,184,166,0.3),4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.05)] hover:shadow-[0_0_40px_rgba(20,184,166,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              Continue ({selected.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlatformSelection;
