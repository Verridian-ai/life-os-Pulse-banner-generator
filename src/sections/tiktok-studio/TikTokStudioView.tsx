import { useState } from 'react';

interface TrendingSound {
  id: string;
  name: string;
  artist: string;
  usageCount: string;
  trend: 'rising' | 'peak' | 'declining';
}

interface TrendingHashtag {
  tag: string;
  views: string;
  trend: 'rising' | 'peak' | 'declining';
}

const sampleSounds: TrendingSound[] = [
  { id: '1', name: 'Original Sound', artist: '@creator', usageCount: '2.3M', trend: 'rising' },
  { id: '2', name: 'Aesthetic Vibes', artist: '@musicmaker', usageCount: '1.8M', trend: 'peak' },
  { id: '3', name: 'Corporate Beat', artist: '@producer', usageCount: '950K', trend: 'rising' },
  { id: '4', name: 'Chill Lo-fi', artist: '@beatsmith', usageCount: '1.2M', trend: 'declining' },
];

const sampleHashtags: TrendingHashtag[] = [
  { tag: '#fyp', views: '45.2T', trend: 'peak' },
  { tag: '#viral', views: '28.1T', trend: 'peak' },
  { tag: '#learnontiktok', views: '12.8T', trend: 'rising' },
  { tag: '#smallbusiness', views: '8.4T', trend: 'rising' },
  { tag: '#entrepreneur', views: '6.2T', trend: 'peak' },
];

export function TikTokStudioView() {
  const [viralScore] = useState(76);
  const [fypPotential] = useState(82);

  const getTrendIcon = (trend: string) => {
    if (trend === 'rising') return '↑';
    if (trend === 'peak') return '●';
    return '↓';
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'rising') return 'text-green-400';
    if (trend === 'peak') return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-6 lg:p-8 relative overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white font-['Space_Grotesk']">
              TikTok Studio
            </h1>
            <p className="text-zinc-400 mt-1">
              Create viral content with trending sounds and hashtags
            </p>
          </div>

          <button type="button" className="px-6 py-3 bg-gradient-to-r from-cyan-400 via-pink-500 to-red-500 hover:from-cyan-300 hover:via-pink-400 hover:to-red-400 text-white font-semibold rounded-xl transition-all shadow-[0_0_30px_rgba(236,72,153,0.4)]">
            Export
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Preview & Hook */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Preview */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 font-['Space_Grotesk']">
                Content Preview
              </h3>

              <div className="flex justify-center">
                <div className="aspect-[9/16] w-64 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden relative shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                  {/* Placeholder */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500">
                    <svg className="w-12 h-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs">1080 × 1920</p>
                  </div>

                  {/* TikTok UI Overlay */}
                  <div className="absolute right-2 bottom-20 flex flex-col gap-4 items-center">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20" />
                      <div className="w-5 h-5 -mt-2 rounded-full bg-gradient-to-r from-pink-500 to-red-500 flex items-center justify-center shadow-[0_0_10px_rgba(236,72,153,0.5)]">
                        <span className="text-white text-xs">+</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                      <span className="text-xs text-white mt-1">24.5K</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/>
                      </svg>
                      <span className="text-xs text-white mt-1">1.2K</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hook Analyzer */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 font-['Space_Grotesk']">
                Hook Analyzer
              </h3>
              <p className="text-sm text-zinc-400 mb-4">
                The first 3 seconds determine 80% of your video's success
              </p>

              <div className="space-y-4">
                {[
                  { label: 'Pattern Interrupt', score: 85, suggestion: 'Strong visual hook detected' },
                  { label: 'Text Hook', score: 70, suggestion: 'Add text overlay in first second' },
                  { label: 'Retention Prediction', score: 78, suggestion: 'Good pacing, maintain energy' },
                ].map((factor) => (
                  <div key={factor.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-zinc-400">{factor.label}</span>
                      <span className="text-sm text-white">{factor.score}%</span>
                    </div>
                    <div className="h-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 via-pink-500 to-red-500 rounded-full shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                        style={{ width: `${factor.score}%` }}
                      />
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">{factor.suggestion}</p>
                  </div>
                ))}
              </div>

              {/* Content Formats */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-white mb-3">Content Format</h4>
                <div className="flex flex-wrap gap-2">
                  {['Tutorial', 'POV', 'Storytime', 'Transition', 'Duet', 'Green Screen'].map((format) => (
                    <button
                      key={format}
                      type="button"
                      className="px-3 py-1.5 bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-pink-500/30 rounded-full text-sm text-zinc-300 transition-all hover:shadow-[0_0_15px_rgba(236,72,153,0.2)]"
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Scores & Trends */}
          <div className="space-y-6">
            {/* Viral Score - Neumorphic */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.05),inset_0_1px_1px_rgba(255,255,255,0.1),0_0_40px_rgba(236,72,153,0.3)] rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 font-['Space_Grotesk']">
                Viral Score
              </h3>

              <div className="flex items-center justify-center mb-6">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="64" cy="64" r="56" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="url(#tiktokGradient)"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={`${viralScore * 3.52} 352`}
                      className="drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]"
                    />
                    <defs>
                      <linearGradient id="tiktokGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="50%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#ef4444" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-500 to-red-500">{viralScore}</span>
                    <span className="text-xs text-zinc-500">out of 100</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                <span className="text-sm text-zinc-400">FYP Potential</span>
                <span className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500">{fypPotential}%</span>
              </div>
            </div>

            {/* Trending Sounds */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 font-['Space_Grotesk']">
                Trending Sounds
              </h3>
              <div className="space-y-3">
                {sampleSounds.map((sound) => (
                  <button
                    key={sound.id}
                    type="button"
                    className="w-full flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-pink-500/30 rounded-xl transition-all text-left shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(236,72,153,0.2)]"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400/20 to-pink-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{sound.name}</p>
                      <p className="text-xs text-zinc-500">{sound.artist}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-zinc-400">{sound.usageCount}</p>
                      <span className={`text-xs ${getTrendColor(sound.trend)}`}>
                        {getTrendIcon(sound.trend)} {sound.trend}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Trending Hashtags */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 font-['Space_Grotesk']">
                Trending Hashtags
              </h3>
              <div className="space-y-2">
                {sampleHashtags.map((hashtag) => (
                  <button
                    key={hashtag.tag}
                    type="button"
                    className="w-full flex items-center justify-between p-3 bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-cyan-500/30 rounded-xl transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                  >
                    <span className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500">{hashtag.tag}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500">{hashtag.views} views</span>
                      <span className={`text-xs ${getTrendColor(hashtag.trend)}`}>
                        {getTrendIcon(hashtag.trend)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TikTokStudioView;
