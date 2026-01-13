import React, { useState } from 'react';
import { HashtagOptimizer } from './components/HashtagOptimizer';

type ContentFormat = 'post' | 'story' | 'reel' | 'carousel';

export function InstagramStudioView() {
  const [format, setFormat] = useState<ContentFormat>('post');
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>(['#AI', '#Design']);

  const formats = [
    { id: 'post', label: 'Post', aspect: '1:1', size: '1080x1080' },
    { id: 'story', label: 'Story', aspect: '9:16', size: '1080x1920' },
    { id: 'reel', label: 'Reel', aspect: '9:16', size: '1080x1920' },
    { id: 'carousel', label: 'Carousel', aspect: '1:1', size: '1080x1080' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-6 lg:p-8 relative overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Purple orb - top left */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px]" />
        {/* Pink orb - center right */}
        <div className="absolute top-1/3 -right-24 w-80 h-80 bg-pink-500/20 rounded-full blur-[100px]" />
        {/* Orange orb - bottom left */}
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-orange-400/15 rounded-full blur-[96px]" />
        {/* Secondary purple orb - bottom right */}
        <div className="absolute -bottom-24 right-1/3 w-64 h-64 bg-purple-500/15 rounded-full blur-[80px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white font-['Space_Grotesk']">
              Instagram Studio
            </h1>
            <p className="text-zinc-400 mt-1">
              Create engaging content with hashtag optimization
            </p>
          </div>

          <button type="button" className="px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-[0_0_40px_rgba(236,72,153,0.3)] hover:shadow-[0_0_60px_rgba(236,72,153,0.4)]">
            Schedule Post
          </button>
        </div>

        {/* Format Selector */}
        <div className="flex gap-2 mb-6">
          {formats.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFormat(f.id as ContentFormat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                format === f.id
                  ? 'bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white shadow-[0_0_20px_rgba(236,72,153,0.3)]'
                  : 'bg-white/5 backdrop-blur-xl border border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Preview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Content Preview */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 font-['Space_Grotesk']">
                Content Preview
              </h3>

              {/* Preview Container */}
              <div className="flex justify-center">
                <div
                  className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden relative ${
                    format === 'post' || format === 'carousel' ? 'aspect-square w-80' : 'aspect-[9/16] w-48'
                  }`}
                >
                  {/* Placeholder */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500">
                    <svg className="w-12 h-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs">{formats.find(f => f.id === format)?.size}</p>
                  </div>

                  {/* Carousel Indicators */}
                  {format === 'carousel' && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                      {[1, 2, 3, 4, 5].map((_, i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-zinc-600'}`} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Carousel Controls */}
              {format === 'carousel' && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button type="button" className="px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 rounded-lg text-sm text-white transition-all">
                    + Add Slide
                  </button>
                  <span className="text-sm text-zinc-500">5/10 slides</span>
                </div>
              )}
            </div>

            {/* Engagement Score - Neumorphic Style */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.05)] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white font-['Space_Grotesk']">
                  Engagement Score
                </h3>
                <span className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">78</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Reach', value: '~12K', color: 'text-sky-400', glow: 'shadow-[0_0_20px_rgba(56,189,248,0.2)]' },
                  { label: 'Likes', value: '~850', color: 'text-pink-400', glow: 'shadow-[0_0_20px_rgba(236,72,153,0.2)]' },
                  { label: 'Comments', value: '~45', color: 'text-purple-400', glow: 'shadow-[0_0_20px_rgba(168,85,247,0.2)]' },
                  { label: 'Saves', value: '~120', color: 'text-teal-400', glow: 'shadow-[0_0_20px_rgba(45,212,191,0.2)]' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className={`text-center p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] ${stat.glow}`}
                  >
                    <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-zinc-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Hashtags */}
          <div className="space-y-6">
            <HashtagOptimizer
              selectedHashtags={selectedHashtags}
              onAdd={(tag) => setSelectedHashtags([...selectedHashtags, tag])}
              onRemove={(tag) => setSelectedHashtags(selectedHashtags.filter((t) => t !== tag))}
            />

            {/* Best Time to Post - Glass Effect */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 font-['Space_Grotesk']">
                Best Time to Post
              </h3>
              <div className="space-y-3">
                {[
                  { day: 'Today', time: '6:00 PM', score: 95 },
                  { day: 'Tomorrow', time: '12:00 PM', score: 88 },
                  { day: 'Wednesday', time: '9:00 AM', score: 82 },
                ].map((slot) => (
                  <button
                    key={`${slot.day}-${slot.time}`}
                    type="button"
                    className="w-full flex items-center justify-between p-3 bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-xl transition-all group"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{slot.day}</p>
                      <p className="text-xs text-zinc-500">{slot.time}</p>
                    </div>
                    <span className="text-sm font-medium bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent group-hover:drop-shadow-[0_0_8px_rgba(74,222,128,0.4)]">{slot.score}%</span>
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

export default InstagramStudioView;
