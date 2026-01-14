import { useState } from 'react';

interface ThreadTweet {
  id: string;
  content: string;
  charCount: number;
}

type NumberingStyle = 'none' | 'simple' | 'total' | 'emoji';

export function XStudioView() {
  const [tweets, setTweets] = useState<ThreadTweet[]>([
    {
      id: '1',
      content:
        "I've been building AI products for 3 years.\n\nHere are 10 lessons that changed everything:",
      charCount: 82,
    },
    {
      id: '2',
      content:
        "1. Ship before you're ready\n\nPerfection is the enemy of progress. Your users will tell you what they actually need.",
      charCount: 113,
    },
    {
      id: '3',
      content:
        "2. Talk to users every single day\n\nNot surveys. Real conversations. You'll be surprised what you learn.",
      charCount: 98,
    },
  ]);
  const [numberingStyle, setNumberingStyle] = useState<NumberingStyle>('simple');
  const [engagementScore] = useState(74);

  const addTweet = () => {
    const newTweet: ThreadTweet = {
      id: Date.now().toString(),
      content: '',
      charCount: 0,
    };
    setTweets([...tweets, newTweet]);
  };

  const updateTweet = (id: string, content: string) => {
    setTweets(tweets.map((t) => (t.id === id ? { ...t, content, charCount: content.length } : t)));
  };

  const removeTweet = (id: string) => {
    if (tweets.length > 1) {
      setTweets(tweets.filter((t) => t.id !== id));
    }
  };

  const getNumbering = (index: number) => {
    switch (numberingStyle) {
      case 'simple':
        return `${index + 1}/`;
      case 'total':
        return `${index + 1}/${tweets.length}`;
      case 'emoji':
        return `🧵${index + 1}/`;
      default:
        return '';
    }
  };

  return (
    <div className='min-h-screen bg-zinc-950 p-4 md:p-6 lg:p-8 relative overflow-hidden'>
      {/* Ambient Background Effects */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-20 left-1/4 w-96 h-96 bg-gradient-to-br from-white/5 to-zinc-400/5 rounded-full blur-3xl' />
        <div className='absolute bottom-40 right-1/4 w-80 h-80 bg-gradient-to-br from-zinc-300/5 to-white/3 rounded-full blur-3xl' />
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-white/3 to-transparent rounded-full blur-3xl' />
      </div>

      <div className='max-w-7xl mx-auto relative z-10'>
        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white font-['Space_Grotesk']">
              X (Twitter) Studio
            </h1>
            <p className='text-zinc-400 mt-1'>Build engaging threads and optimize for engagement</p>
          </div>

          <div className='flex gap-3'>
            <button
              type='button'
              className='px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] hover:bg-white/10 text-white rounded-xl transition-all'
            >
              Save Draft
            </button>
            <button
              type='button'
              className='px-6 py-3 bg-gradient-to-r from-zinc-200 to-white hover:from-white hover:to-zinc-100 text-black font-semibold rounded-xl transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.3)]'
            >
              Post Thread
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Left Column - Thread Builder */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Thread Settings */}
            <div className='bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-2xl p-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-zinc-400'>Numbering Style</span>
                <div className='flex gap-1'>
                  {[
                    { id: 'none', label: 'None' },
                    { id: 'simple', label: '1/' },
                    { id: 'total', label: '1/10' },
                    { id: 'emoji', label: '🧵1/' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      type='button'
                      onClick={() => setNumberingStyle(style.id as NumberingStyle)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                        numberingStyle === style.id
                          ? 'bg-gradient-to-r from-zinc-200 to-white text-black shadow-[0_0_20px_rgba(255,255,255,0.15)]'
                          : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Thread Tweets */}
            <div className='space-y-4'>
              {tweets.map((tweet, index) => (
                <div
                  key={tweet.id}
                  className='bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-2xl p-4 relative group'
                >
                  {/* Tweet Number */}
                  <div className='absolute -left-3 top-4 w-6 h-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-xs text-zinc-300'>
                    {index + 1}
                  </div>

                  {/* Connection Line */}
                  {index < tweets.length - 1 && (
                    <div className='absolute left-0 top-10 w-0.5 h-[calc(100%+1rem)] bg-gradient-to-b from-white/20 to-white/5' />
                  )}

                  <div className='flex gap-3'>
                    {/* Avatar */}
                    <div className='w-10 h-10 rounded-full bg-gradient-to-br from-zinc-300 to-white flex-shrink-0 shadow-[0_0_20px_rgba(255,255,255,0.2)]' />

                    {/* Content */}
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-2'>
                        <span className='text-sm font-medium text-white'>Your Name</span>
                        <span className='text-sm text-zinc-500'>@handle</span>
                        {numberingStyle !== 'none' && (
                          <span className='text-sm text-zinc-300'>{getNumbering(index)}</span>
                        )}
                      </div>

                      <textarea
                        value={tweet.content}
                        onChange={(e) => updateTweet(tweet.id, e.target.value)}
                        rows={3}
                        className='w-full bg-transparent text-white placeholder-zinc-500 focus:outline-none resize-none'
                        placeholder="What's happening?"
                      />

                      {/* Character Count */}
                      <div className='flex items-center justify-between mt-2'>
                        <div className='flex items-center gap-2'>
                          <button
                            type='button'
                            className='w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors'
                          >
                            <svg
                              className='w-5 h-5'
                              fill='none'
                              viewBox='0 0 24 24'
                              stroke='currentColor'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                              />
                            </svg>
                          </button>
                          <button
                            type='button'
                            className='w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors'
                          >
                            <svg
                              className='w-5 h-5'
                              fill='none'
                              viewBox='0 0 24 24'
                              stroke='currentColor'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                              />
                            </svg>
                          </button>
                        </div>

                        <div className='flex items-center gap-3'>
                          <span
                            className={`text-sm ${tweet.charCount > 280 ? 'text-red-400' : 'text-zinc-500'}`}
                          >
                            {tweet.charCount}/280
                          </span>
                          {tweets.length > 1 && (
                            <button
                              type='button'
                              onClick={() => removeTweet(tweet.id)}
                              className='w-8 h-8 rounded-lg hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors opacity-0 group-hover:opacity-100'
                            >
                              <svg
                                className='w-4 h-4'
                                fill='none'
                                viewBox='0 0 24 24'
                                stroke='currentColor'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Tweet Button */}
              <button
                type='button'
                onClick={addTweet}
                className='w-full py-4 border-2 border-dashed border-white/10 hover:border-white/20 bg-white/5 backdrop-blur-sm rounded-2xl text-zinc-500 hover:text-zinc-300 transition-all flex items-center justify-center gap-2'
              >
                <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 4v16m8-8H4'
                  />
                </svg>
                Add Tweet
              </button>
            </div>
          </div>

          {/* Right Column - Analytics */}
          <div className='space-y-6'>
            {/* Engagement Score - Neumorphic Style */}
            <div className='bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.05),inset_0_1px_1px_rgba(255,255,255,0.1)]'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className="text-lg font-semibold text-white font-['Space_Grotesk']">
                  Engagement Score
                </h3>
                <span className='text-3xl font-bold bg-gradient-to-r from-zinc-200 to-white bg-clip-text text-transparent'>
                  {engagementScore}
                </span>
              </div>

              <div className='space-y-3'>
                {[
                  { label: 'Hook Strength', score: 85, color: 'from-zinc-400 to-white' },
                  { label: 'Thread Structure', score: 70, color: 'from-zinc-500 to-zinc-300' },
                  { label: 'Engagement Drivers', score: 75, color: 'from-zinc-400 to-zinc-200' },
                  { label: 'Post Timing', score: 65, color: 'from-zinc-500 to-zinc-400' },
                ].map((factor) => (
                  <div key={factor.label}>
                    <div className='flex items-center justify-between mb-1'>
                      <span className='text-sm text-zinc-400'>{factor.label}</span>
                      <span className='text-sm text-white'>{factor.score}%</span>
                    </div>
                    <div className='h-2 bg-white/10 rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]'>
                      <div
                        className={`h-full bg-gradient-to-r ${factor.color} rounded-full shadow-[0_0_10px_rgba(255,255,255,0.3)]`}
                        style={{ width: `${factor.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Best Times */}
            <div className='bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-2xl p-6'>
              <h3 className="text-lg font-semibold text-white mb-4 font-['Space_Grotesk']">
                Best Time to Post
              </h3>
              <div className='space-y-2'>
                {[
                  { time: '8:00 AM', day: 'Weekdays', engagement: 'High' },
                  { time: '12:00 PM', day: 'Weekdays', engagement: 'Medium' },
                  { time: '6:00 PM', day: 'All Days', engagement: 'High' },
                ].map((slot, i) => (
                  <button
                    key={i}
                    type='button'
                    className='w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl transition-all'
                  >
                    <div>
                      <p className='text-sm font-medium text-white'>{slot.time}</p>
                      <p className='text-xs text-zinc-500'>{slot.day}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        slot.engagement === 'High'
                          ? 'bg-gradient-to-r from-zinc-300/20 to-white/20 text-white border border-white/20'
                          : 'bg-zinc-500/20 text-zinc-300 border border-zinc-500/20'
                      }`}
                    >
                      {slot.engagement}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quote Tweet Angles */}
            <div className='bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-2xl p-6'>
              <h3 className="text-lg font-semibold text-white mb-4 font-['Space_Grotesk']">
                Quote Tweet Angles
              </h3>
              <div className='space-y-2'>
                {[
                  'Agree & Expand',
                  'Add Context',
                  'Ask Question',
                  'Disagree',
                  'Humor',
                  'Summarize',
                ].map((angle) => (
                  <button
                    key={angle}
                    type='button'
                    className='w-full px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl text-sm text-zinc-300 text-left transition-all hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                  >
                    {angle}
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

export default XStudioView;
