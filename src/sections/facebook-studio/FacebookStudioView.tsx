import { useState } from 'react';

type ContentFormat = 'post' | 'cover' | 'event' | 'story';

export function FacebookStudioView() {
  const [format, setFormat] = useState<ContentFormat>('post');
  const [content, setContent] = useState('');

  const formats = [
    { id: 'post', label: 'Post', size: '1200×630' },
    { id: 'cover', label: 'Cover', size: '820×312' },
    { id: 'event', label: 'Event', size: '1920×1080' },
    { id: 'story', label: 'Story', size: '1080×1920' },
  ];

  const ctaOptions = [
    { id: 'learn_more', label: 'Learn More' },
    { id: 'shop_now', label: 'Shop Now' },
    { id: 'sign_up', label: 'Sign Up' },
    { id: 'book_now', label: 'Book Now' },
    { id: 'contact_us', label: 'Contact Us' },
    { id: 'download', label: 'Download' },
  ];

  return (
    <div className='min-h-screen bg-zinc-950 p-4 md:p-6 lg:p-8 relative overflow-hidden'>
      {/* Background Ambient Effects */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-20 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl' />
        <div className='absolute bottom-40 right-1/4 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl' />
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-700/10 rounded-full blur-3xl' />
      </div>

      <div className='max-w-7xl mx-auto relative z-10'>
        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white font-['Space_Grotesk']">
              Facebook Studio
            </h1>
            <p className='text-zinc-400 mt-1'>Create posts, ads, and event covers</p>
          </div>

          <button
            type='button'
            className='px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-xl transition-all shadow-[0_0_40px_rgba(37,99,235,0.3)] hover:shadow-[0_0_50px_rgba(37,99,235,0.4)]'
          >
            Publish
          </button>
        </div>

        {/* Format Selector */}
        <div className='flex gap-2 mb-6'>
          {formats.map((f) => (
            <button
              key={f.id}
              type='button'
              onClick={() => setFormat(f.id as ContentFormat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                format === f.id
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]'
                  : 'bg-white/5 backdrop-blur-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Left Column - Preview & Content */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Preview */}
            <div className='bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-2xl p-6'>
              <h3 className="text-lg font-semibold text-white mb-4 font-['Space_Grotesk']">
                Preview
              </h3>

              <div
                className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden ${
                  format === 'story' ? 'aspect-[9/16] max-w-xs mx-auto' : 'aspect-video'
                }`}
              >
                <div className='w-full h-full flex flex-col items-center justify-center text-zinc-500'>
                  <svg
                    className='w-12 h-12 mb-2 opacity-50'
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
                  <p className='text-xs'>{formats.find((f) => f.id === format)?.size}</p>
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className='bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-2xl p-6'>
              <h3 className="text-lg font-semibold text-white mb-4 font-['Space_Grotesk']">
                Post Content
              </h3>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className='w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_20px_rgba(37,99,235,0.2)] transition-all resize-none'
                placeholder="What's on your mind?"
              />
              <div className='flex items-center justify-between mt-2'>
                <p className='text-xs text-zinc-500'>
                  Optimal: 40-80 characters for highest engagement
                </p>
                <p className='text-sm text-zinc-400'>{content.length} characters</p>
              </div>
            </div>
          </div>

          {/* Right Column - Settings */}
          <div className='space-y-6'>
            {/* CTA Selection */}
            <div className='bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-2xl p-6'>
              <h3 className="text-lg font-semibold text-white mb-4 font-['Space_Grotesk']">
                Call to Action
              </h3>
              <div className='grid grid-cols-2 gap-2'>
                {ctaOptions.map((cta) => (
                  <button
                    key={cta.id}
                    type='button'
                    className='px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-zinc-300 transition-all hover:border-blue-500/30'
                  >
                    {cta.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Boost Recommendation */}
            <div className='bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-2xl p-6'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='w-10 h-10 rounded-xl bg-green-500/20 backdrop-blur-sm border border-green-500/30 flex items-center justify-center'>
                  <svg
                    className='w-5 h-5 text-green-400'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white font-['Space_Grotesk']">
                    Boost Recommended
                  </h3>
                  <p className='text-sm text-zinc-500'>High engagement potential</p>
                </div>
              </div>

              <div className='space-y-3'>
                <div className='flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl'>
                  <span className='text-sm text-zinc-400'>Estimated Reach</span>
                  <span className='text-sm font-medium text-white'>25,000</span>
                </div>
                <div className='flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl'>
                  <span className='text-sm text-zinc-400'>Suggested Budget</span>
                  <span className='text-sm font-medium text-white'>$50/day</span>
                </div>
              </div>

              <button
                type='button'
                className='w-full mt-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium rounded-xl transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_40px_rgba(37,99,235,0.4)]'
              >
                Boost Post
              </button>
            </div>

            {/* Engagement Score - Neumorphic Feature Card */}
            <div className='bg-white/5 backdrop-blur-xl border border-white/10 shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.05),inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-2xl p-6'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className="text-lg font-semibold text-white font-['Space_Grotesk']">
                  Engagement Score
                </h3>
                <span className='text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300 drop-shadow-[0_0_10px_rgba(74,222,128,0.3)]'>
                  82
                </span>
              </div>

              <div className='space-y-3'>
                {[
                  { label: 'Content Type', score: 85 },
                  { label: 'Text Quality', score: 80 },
                  { label: 'Visual Quality', score: 75 },
                  { label: 'Timing', score: 90 },
                ].map((factor) => (
                  <div key={factor.label}>
                    <div className='flex items-center justify-between mb-1'>
                      <span className='text-sm text-zinc-400'>{factor.label}</span>
                      <span className='text-sm text-white'>{factor.score}%</span>
                    </div>
                    <div className='h-2 bg-white/5 border border-white/10 rounded-full overflow-hidden'>
                      <div
                        className='h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]'
                        style={{ width: `${factor.score}%` }}
                      />
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

export default FacebookStudioView;
