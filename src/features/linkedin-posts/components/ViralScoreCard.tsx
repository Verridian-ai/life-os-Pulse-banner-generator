import React, { useMemo, useRef, useEffect } from 'react';
import { calculateViralScore } from '../utils/viralAnalyzer';

interface ViralScoreCardProps {
  content: string;
}

const ProgressBar: React.FC<{ value: number; colorClass: string }> = ({ value, colorClass }) => {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (barRef.current) {
      barRef.current.style.width = `${value}%`;
    }
  }, [value]);

  return (
    <div className='h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden shadow-inner'>
      <div
        ref={barRef}
        className={`h-full bg-gradient-to-r ${colorClass} transition-all duration-1000 ease-out`}
      />
    </div>
  );
};

export const ViralScoreCard: React.FC<ViralScoreCardProps> = ({ content }) => {
  const score = useMemo(() => calculateViralScore(content), [content]);

  const getScoreColor = (value: number) => {
    if (value >= 80) return 'from-green-500 to-emerald-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]';
    if (value >= 60) return 'from-yellow-500 to-orange-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]';
    return 'from-orange-500 to-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
  };

  const getScoreLabel = (value: number) => {
    if (value >= 80) return 'Viral Potential';
    if (value >= 60) return 'Solid Impact';
    return 'Needs Improvement';
  };

  return (
    <div className='bg-zinc-900/50 backdrop-blur-md rounded-3xl border border-white/5 p-8 shadow-2xl space-y-8'>
      <div className='flex items-center justify-between'>
        <h3 className='text-[10px] font-black text-zinc-500 uppercase tracking-widest'>
          VIRAL ANALYSIS
        </h3>
        <span className='material-icons text-zinc-500 text-sm'>info</span>
      </div>

      {/* Main Score Area */}
      <div className='flex flex-col items-center justify-center py-4'>
        <div className='relative'>
          <div className='text-7xl font-black tracking-tighter text-white drop-shadow-2xl z-10 relative'>
            {score.overall}
          </div>
          <div
            className={`absolute inset-0 blur-2xl opacity-20 bg-gradient-to-br ${getScoreColor(score.overall)}`}
          />
        </div>
        <div className='text-xs font-bold text-zinc-400 mt-2 uppercase tracking-wide'>
          {getScoreLabel(score.overall)}
        </div>
      </div>

      {/* Sub-metrics */}
      <div className='space-y-4'>
        {[
          { label: 'Hook Impact', value: score.hook, icon: 'bolt' },
          { label: 'Readability', value: score.readability, icon: 'notes' },
          { label: 'Engagement', value: score.engagement, icon: 'favorite' },
          { label: 'Virality', value: score.virality, icon: 'trending_up' },
        ].map((metric) => (
          <div key={metric.label} className='space-y-1.5'>
            <div className='flex justify-between text-[10px] items-center'>
              <div className='flex items-center gap-1.5 text-zinc-400 font-bold'>
                <span className='material-icons text-xs'>{metric.icon}</span>
                {metric.label.toUpperCase()}
              </div>
              <span className='font-mono text-zinc-300'>{metric.value}%</span>
            </div>
            <ProgressBar value={metric.value} colorClass={getScoreColor(metric.value)} />
          </div>
        ))}
      </div>

      {/* Advice */}
      {score.overall > 0 && (
        <div className='bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 flex gap-3 items-start'>
          <span className='material-icons text-blue-500 text-sm mt-0.5'>lightbulb</span>
          <p className='text-[11px] text-zinc-400 leading-relaxed'>
            {score.overall < 70
              ? 'Try making your hook (first line) more punchy. Use a question or a bold statement.'
              : 'Your post is well-structured! Consider adding 2-3 niche hashtags to reach your target audience.'}
          </p>
        </div>
      )}
    </div>
  );
};
