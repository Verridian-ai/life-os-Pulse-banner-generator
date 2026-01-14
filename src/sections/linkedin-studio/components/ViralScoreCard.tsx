import React from 'react';

interface ScoreFactor {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  weight: number;
  suggestion?: string;
}

interface ViralScoreCardProps {
  score: number;
  factors: ScoreFactor[];
}

export function ViralScoreCard({ score, factors }: ViralScoreCardProps) {
  const getScoreColor = (value: number) => {
    if (value >= 80) return 'text-green-400';
    if (value >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getProgressGradient = (value: number) => {
    if (value >= 80) return 'from-green-500 to-emerald-400';
    if (value >= 60) return 'from-yellow-500 to-amber-400';
    return 'from-red-500 to-orange-400';
  };

  return (
    <div className='bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.05)] rounded-2xl p-6'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <h3 className="text-lg font-semibold text-white font-['Space_Grotesk']">Viral Score</h3>
        <div className='flex items-baseline gap-1'>
          <span className={`text-4xl font-bold ${getScoreColor(score)}`}>{score}</span>
          <span className='text-zinc-500 text-lg'>/100</span>
        </div>
      </div>

      {/* Score Ring */}
      <div className='relative w-32 h-32 mx-auto mb-6'>
        {/* Glow effect behind the ring */}
        <div className='absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 opacity-20 blur-xl' />
        <svg className='w-full h-full transform -rotate-90 relative z-10'>
          {/* Background Circle */}
          <circle
            cx='64'
            cy='64'
            r='56'
            fill='none'
            stroke='currentColor'
            strokeWidth='8'
            className='text-white/10'
          />
          {/* Progress Circle with gradient */}
          <defs>
            <linearGradient id='scoreGradient' x1='0%' y1='0%' x2='100%' y2='0%'>
              <stop offset='0%' stopColor='#2563eb' />
              <stop offset='50%' stopColor='#3b82f6' />
              <stop offset='100%' stopColor='#22d3ee' />
            </linearGradient>
          </defs>
          <circle
            cx='64'
            cy='64'
            r='56'
            fill='none'
            stroke='url(#scoreGradient)'
            strokeWidth='8'
            strokeLinecap='round'
            strokeDasharray={`${(score / 100) * 352} 352`}
            className='drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]'
          />
        </svg>
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='text-center'>
            <span className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</span>
            <p className='text-xs text-zinc-400'>Score</p>
          </div>
        </div>
      </div>

      {/* Factors */}
      <div className='space-y-4'>
        {factors.map((factor) => (
          <div key={factor.id}>
            <div className='flex items-center justify-between mb-1'>
              <span className='text-sm text-zinc-400'>{factor.name}</span>
              <span className='text-sm font-medium text-white'>
                {factor.score}/{factor.maxScore}
              </span>
            </div>
            <div className='h-2 bg-white/5 rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]'>
              <div
                className={`h-full rounded-full transition-all bg-gradient-to-r ${getProgressGradient((factor.score / factor.maxScore) * 100)}`}
                style={{ width: `${(factor.score / factor.maxScore) * 100}%` }}
              />
            </div>
            {factor.suggestion && <p className='text-xs text-zinc-500 mt-1'>{factor.suggestion}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ViralScoreCard;
