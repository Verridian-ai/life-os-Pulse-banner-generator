import React, { useState } from 'react';
import { CTRScoreCard, TitleAnalyzer } from './components';

const sampleCTRScore = {
  score: 6.8,
  factors: [
    {
      id: 'text',
      name: 'Text Readability',
      score: 85,
      maxScore: 100,
      suggestion: 'Good contrast and size',
    },
    {
      id: 'face',
      name: 'Face Presence',
      score: 90,
      maxScore: 100,
      suggestion: 'Clear face with expression',
    },
    {
      id: 'contrast',
      name: 'Color Contrast',
      score: 70,
      maxScore: 100,
      suggestion: 'Could be more vibrant',
    },
    {
      id: 'relevance',
      name: 'Title Relevance',
      score: 65,
      maxScore: 100,
      suggestion: 'Improve title-thumbnail match',
    },
    {
      id: 'brand',
      name: 'Brand Consistency',
      score: 80,
      maxScore: 100,
      suggestion: 'Matches channel style',
    },
  ],
};

export function YouTubeStudioView() {
  const [title, setTitle] = useState('10 AI Tools That Will 10x Your Productivity in 2024');

  return (
    <div className='min-h-screen bg-zinc-950 p-4 md:p-6 lg:p-8 relative overflow-hidden'>
      {/* Ambient Background Effects */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        {/* Primary red glow - top right */}
        <div className='absolute -top-32 -right-32 w-96 h-96 bg-red-600/20 rounded-full blur-3xl' />
        {/* Secondary rose glow - bottom left */}
        <div className='absolute -bottom-48 -left-48 w-[500px] h-[500px] bg-rose-500/15 rounded-full blur-3xl' />
        {/* Accent glow - center */}
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/10 rounded-full blur-3xl' />
      </div>

      <div className='max-w-7xl mx-auto relative z-10'>
        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white font-['Space_Grotesk']">
              YouTube Studio
            </h1>
            <p className='text-zinc-400 mt-1'>Optimize thumbnails and titles for higher CTR</p>
          </div>

          <div className='flex gap-3'>
            <button
              type='button'
              className='px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] hover:bg-white/10 text-white rounded-xl transition-all'
            >
              A/B Test
            </button>
            <button
              type='button'
              className='px-6 py-3 bg-gradient-to-r from-red-600 via-red-500 to-rose-400 text-white font-semibold rounded-xl hover:from-red-500 hover:to-rose-300 transition-all shadow-[0_0_40px_rgba(239,68,68,0.3)] hover:shadow-[0_0_50px_rgba(239,68,68,0.4)]'
            >
              Export Thumbnail
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Left Column - Thumbnail Preview */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Thumbnail Canvas */}
            <div className='bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-2xl p-6'>
              <h3 className="text-lg font-semibold text-white mb-4 font-['Space_Grotesk']">
                Thumbnail Preview
              </h3>

              {/* YouTube Thumbnail */}
              <div className='aspect-video bg-zinc-800/50 backdrop-blur-sm rounded-xl overflow-hidden relative group border border-white/5'>
                {/* Placeholder */}
                <div className='absolute inset-0 flex flex-col items-center justify-center text-zinc-500'>
                  <svg
                    className='w-16 h-16 mb-4 opacity-50'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={1}
                      d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                    />
                  </svg>
                  <p className='text-sm'>1280 × 720</p>
                </div>

                {/* Safe Zone Overlay */}
                <div className='absolute inset-4 border-2 border-dashed border-red-500/30 rounded pointer-events-none'>
                  <span className='absolute -top-6 left-0 text-xs text-red-400'>Safe Zone</span>
                </div>

                {/* Duration Badge */}
                <div className='absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 backdrop-blur-sm rounded text-xs text-white'>
                  12:34
                </div>

                {/* Hover Overlay */}
                <div className='absolute inset-0 bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                  <button
                    type='button'
                    className='px-6 py-3 bg-gradient-to-r from-red-600 via-red-500 to-rose-400 text-white font-medium rounded-lg shadow-[0_0_30px_rgba(239,68,68,0.4)]'
                  >
                    Generate Thumbnail
                  </button>
                </div>
              </div>

              {/* Format Presets */}
              <div className='mt-4 flex gap-2'>
                {['Standard (1280×720)', 'HD (1920×1080)', 'Max (2560×1440)'].map((format) => (
                  <button
                    key={format}
                    type='button'
                    className='px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 rounded-lg text-sm text-zinc-400 hover:text-white transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>

            {/* Title Analyzer */}
            <TitleAnalyzer title={title} onChange={setTitle} />
          </div>

          {/* Right Column - CTR Score */}
          <div className='space-y-6'>
            <CTRScoreCard score={sampleCTRScore.score} factors={sampleCTRScore.factors} />

            {/* Keyword Suggestions */}
            <div className='bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-2xl p-6'>
              <h3 className="text-lg font-semibold text-white mb-4 font-['Space_Grotesk']">
                Keyword Suggestions
              </h3>
              <div className='space-y-3'>
                {[
                  { keyword: 'AI tools', volume: '450K', competition: 'High' },
                  { keyword: 'productivity apps', volume: '320K', competition: 'Medium' },
                  { keyword: '2024 tools', volume: '180K', competition: 'Low' },
                  { keyword: 'automation', volume: '290K', competition: 'Medium' },
                ].map((item) => (
                  <div
                    key={item.keyword}
                    className='flex items-center justify-between p-3 bg-white/5 backdrop-blur-sm border border-white/5 rounded-xl'
                  >
                    <span className='text-sm text-white'>{item.keyword}</span>
                    <div className='flex items-center gap-3'>
                      <span className='text-xs text-zinc-500'>{item.volume}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          item.competition === 'Low'
                            ? 'bg-green-500/20 text-green-400'
                            : item.competition === 'Medium'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {item.competition}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default YouTubeStudioView;
