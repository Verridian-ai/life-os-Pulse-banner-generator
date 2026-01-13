import React, { useState } from 'react';

interface CopywritingPanelProps {
  content: string;
  onChange: (content: string) => void;
  onRewrite: () => void;
  isRewriting?: boolean;
}

const tones = [
  { id: 'professional', label: 'Professional' },
  { id: 'casual', label: 'Casual' },
  { id: 'inspiring', label: 'Inspiring' },
  { id: 'educational', label: 'Educational' },
  { id: 'storytelling', label: 'Storytelling' },
];

export function CopywritingPanel({ content, onChange, onRewrite, isRewriting }: CopywritingPanelProps) {
  const [selectedTone, setSelectedTone] = useState('professional');
  const charCount = content.length;
  const optimalMin = 150;
  const optimalMax = 700;

  const getCharCountColor = () => {
    if (charCount >= optimalMin && charCount <= optimalMax) return 'text-green-400';
    if (charCount > optimalMax) return 'text-yellow-400';
    return 'text-zinc-400';
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white font-['Space_Grotesk']">
          Copywriting
        </h3>
        <button
          onClick={onRewrite}
          disabled={isRewriting}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 hover:from-blue-500 hover:via-blue-400 hover:to-cyan-300 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 flex items-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
        >
          {isRewriting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Rewriting...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              AI Rewrite
            </>
          )}
        </button>
      </div>

      {/* Tone Selector */}
      <div className="mb-4">
        <label className="block text-sm text-zinc-400 mb-2">Tone</label>
        <div className="flex flex-wrap gap-2">
          {tones.map((tone) => (
            <button
              key={tone.id}
              onClick={() => setSelectedTone(tone.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedTone === tone.id
                  ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                  : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tone.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Editor */}
      <div className="mb-4">
        <label className="block text-sm text-zinc-400 mb-2">Content</label>
        <textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          rows={8}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all resize-none backdrop-blur-sm"
          placeholder="Write your LinkedIn post content here..."
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-zinc-500">
            Optimal: {optimalMin}-{optimalMax} characters
          </p>
          <p className={`text-sm font-medium ${getCharCountColor()}`}>
            {charCount} characters
          </p>
        </div>
      </div>

      {/* Hashtag Suggestions */}
      <div>
        <label className="block text-sm text-zinc-400 mb-2">Suggested Hashtags</label>
        <div className="flex flex-wrap gap-2">
          {['#AI', '#Design', '#Productivity', '#Tech', '#StartupLife'].map((tag) => (
            <button
              key={tag}
              className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-cyan-400/20 hover:border-blue-500/30 rounded-lg text-sm text-cyan-400 transition-all"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CopywritingPanel;
