import React from 'react';

interface TitleAnalyzerProps {
  title: string;
  onChange: (title: string) => void;
}

export function TitleAnalyzer({ title, onChange }: TitleAnalyzerProps) {
  const charCount = title.length;
  const optimalMin = 50;
  const optimalMax = 60;

  const powerWords = ['Ultimate', 'Secret', 'Proven', 'Essential', 'Powerful', 'Revolutionary'];
  const foundPowerWords = powerWords.filter((word) =>
    title.toLowerCase().includes(word.toLowerCase()),
  );

  const hasNumber = /\d/.test(title);
  const hasEmotionalTrigger = /!|\?|wow|amazing|incredible|shocking/i.test(title);

  const getCharCountColor = () => {
    if (charCount >= optimalMin && charCount <= optimalMax) return 'text-green-400';
    if (charCount > optimalMax) return 'text-red-400';
    return 'text-zinc-400';
  };

  return (
    <div className='bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-2xl p-6'>
      <h3 className="text-lg font-semibold text-white mb-4 font-['Space_Grotesk']">
        Title Analyzer
      </h3>

      {/* Title Input */}
      <div className='mb-4'>
        <input
          type='text'
          value={title}
          onChange={(e) => onChange(e.target.value)}
          placeholder='Enter your video title...'
          className='w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-500/50 focus:shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-all text-lg shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
        />
        <div className='flex items-center justify-between mt-2'>
          <p className='text-xs text-zinc-500'>
            Optimal: {optimalMin}-{optimalMax} characters
          </p>
          <p className={`text-sm font-medium ${getCharCountColor()}`}>
            {charCount}/{optimalMax}
          </p>
        </div>
      </div>

      {/* Analysis Badges */}
      <div className='grid grid-cols-2 gap-3 mb-4'>
        <div
          className={`p-3 rounded-xl border backdrop-blur-sm ${hasNumber ? 'bg-green-500/10 border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'bg-white/5 border-white/10'}`}
        >
          <div className='flex items-center gap-2'>
            {hasNumber ? (
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
                  d='M5 13l4 4L19 7'
                />
              </svg>
            ) : (
              <svg
                className='w-5 h-5 text-zinc-500'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            )}
            <span className={`text-sm ${hasNumber ? 'text-green-400' : 'text-zinc-500'}`}>
              Has Number
            </span>
          </div>
        </div>

        <div
          className={`p-3 rounded-xl border backdrop-blur-sm ${hasEmotionalTrigger ? 'bg-green-500/10 border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'bg-white/5 border-white/10'}`}
        >
          <div className='flex items-center gap-2'>
            {hasEmotionalTrigger ? (
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
                  d='M5 13l4 4L19 7'
                />
              </svg>
            ) : (
              <svg
                className='w-5 h-5 text-zinc-500'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            )}
            <span className={`text-sm ${hasEmotionalTrigger ? 'text-green-400' : 'text-zinc-500'}`}>
              Emotion Trigger
            </span>
          </div>
        </div>
      </div>

      {/* Power Words */}
      <div>
        <p className='text-sm text-zinc-400 mb-2'>
          Power Words Found: {foundPowerWords.length > 0 ? foundPowerWords.join(', ') : 'None'}
        </p>
        <div className='flex flex-wrap gap-2'>
          {powerWords.map((word) => (
            <button
              key={word}
              onClick={() => onChange(title + ' ' + word)}
              className='px-3 py-1 bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-gradient-to-r hover:from-red-600/20 hover:to-rose-400/20 hover:border-red-500/30 rounded-lg text-xs text-zinc-400 hover:text-white transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
            >
              + {word}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TitleAnalyzer;
