import React, { useState } from 'react';

interface HashtagSet {
  id: string;
  name: string;
  hashtags: string[];
  category: 'branded' | 'community' | 'niche' | 'broad' | 'trending';
  avgReach?: number;
}

interface HashtagOptimizerProps {
  selectedHashtags: string[];
  onAdd: (hashtag: string) => void;
  onRemove: (hashtag: string) => void;
}

const hashtagSets: HashtagSet[] = [
  { id: '1', name: 'Branded', hashtags: ['#YourBrand', '#YourProduct'], category: 'branded', avgReach: 5000 },
  { id: '2', name: 'Community', hashtags: ['#DesignCommunity', '#CreativeLife'], category: 'community', avgReach: 50000 },
  { id: '3', name: 'Niche', hashtags: ['#AIDesign', '#DesignTools'], category: 'niche', avgReach: 100000 },
  { id: '4', name: 'Broad', hashtags: ['#Design', '#Creative', '#Art'], category: 'broad', avgReach: 500000 },
  { id: '5', name: 'Trending', hashtags: ['#AI2024', '#TechTrends'], category: 'trending', avgReach: 200000 },
];

export function HashtagOptimizer({ selectedHashtags, onAdd, onRemove }: HashtagOptimizerProps) {
  const [customHashtag, setCustomHashtag] = useState('');
  const maxHashtags = 30;

  const getCategoryStyle = (category: string) => {
    const styles: Record<string, { bg: string; border: string; text: string; glow: string }> = {
      branded: {
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/30',
        text: 'text-purple-400',
        glow: 'shadow-[0_0_15px_rgba(168,85,247,0.15)]'
      },
      community: {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        glow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]'
      },
      niche: {
        bg: 'bg-teal-500/10',
        border: 'border-teal-500/30',
        text: 'text-teal-400',
        glow: 'shadow-[0_0_15px_rgba(20,184,166,0.15)]'
      },
      broad: {
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/30',
        text: 'text-orange-400',
        glow: 'shadow-[0_0_15px_rgba(249,115,22,0.15)]'
      },
      trending: {
        bg: 'bg-pink-500/10',
        border: 'border-pink-500/30',
        text: 'text-pink-400',
        glow: 'shadow-[0_0_15px_rgba(236,72,153,0.15)]'
      },
    };
    return styles[category] || { bg: 'bg-zinc-500/10', border: 'border-zinc-500/30', text: 'text-zinc-400', glow: '' };
  };

  const handleAddCustom = () => {
    if (customHashtag && !customHashtag.startsWith('#')) {
      onAdd(`#${customHashtag}`);
    } else if (customHashtag) {
      onAdd(customHashtag);
    }
    setCustomHashtag('');
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white font-['Space_Grotesk']">
          Hashtag Optimizer
        </h3>
        <span className={`text-sm ${selectedHashtags.length >= maxHashtags ? 'text-red-400' : 'text-zinc-400'}`}>
          {selectedHashtags.length}/{maxHashtags}
        </span>
      </div>

      {/* Selected Hashtags */}
      {selectedHashtags.length > 0 && (
        <div className="mb-4 p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
          <div className="flex flex-wrap gap-2">
            {selectedHashtags.map((tag) => (
              <button
                key={tag}
                onClick={() => onRemove(tag)}
                className="px-3 py-1 bg-gradient-to-r from-purple-600/30 via-pink-500/30 to-orange-400/30 border border-pink-500/30 text-pink-300 rounded-lg text-sm hover:from-red-500/30 hover:via-red-500/30 hover:to-red-500/30 hover:border-red-500/30 hover:text-red-400 transition-all group shadow-[0_0_10px_rgba(236,72,153,0.2)]"
              >
                {tag}
                <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">x</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom Hashtag Input */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={customHashtag}
          onChange={(e) => setCustomHashtag(e.target.value)}
          placeholder="Add custom hashtag..."
          className="flex-1 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500/50 focus:shadow-[0_0_20px_rgba(236,72,153,0.2)] transition-all"
          onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
        />
        <button
          onClick={handleAddCustom}
          disabled={!customHashtag || selectedHashtags.length >= maxHashtags}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white rounded-xl transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.4)]"
        >
          Add
        </button>
      </div>

      {/* Hashtag Sets */}
      <div className="space-y-4">
        {hashtagSets.map((set) => {
          const style = getCategoryStyle(set.category);
          return (
            <div
              key={set.id}
              className={`p-4 rounded-xl border backdrop-blur-md ${style.bg} ${style.border} ${style.glow} ${style.text}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{set.name}</span>
                {set.avgReach && (
                  <span className="text-xs opacity-70">~{(set.avgReach / 1000).toFixed(0)}K reach</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {set.hashtags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => selectedHashtags.includes(tag) ? onRemove(tag) : onAdd(tag)}
                    disabled={!selectedHashtags.includes(tag) && selectedHashtags.length >= maxHashtags}
                    className={`px-3 py-1 rounded-lg text-sm transition-all border ${
                      selectedHashtags.includes(tag)
                        ? 'bg-white/20 border-white/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]'
                        : 'bg-black/20 border-transparent hover:bg-black/30 hover:border-white/10'
                    } disabled:opacity-50`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default HashtagOptimizer;
