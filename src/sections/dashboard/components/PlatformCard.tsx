import React from 'react';

interface Platform {
  id: string;
  name: string;
  icon: React.ReactNode;
  gradient: string;
  description: string;
}

interface PlatformCardProps {
  platform: Platform;
  onClick: (platformId: string) => void;
}

export function PlatformCard({ platform, onClick }: PlatformCardProps) {
  return (
    <button
      onClick={() => onClick(platform.id)}
      className='group relative aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-sky-500/10'
    >
      {/* Background Gradient */}
      <div
        className={`absolute inset-0 ${platform.gradient} opacity-20 group-hover:opacity-30 transition-opacity`}
      />

      {/* Content */}
      <div className='relative h-full flex flex-col items-center justify-center p-4'>
        {/* Icon */}
        <div className='w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-zinc-800/80 backdrop-blur flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform'>
          {platform.icon}
        </div>

        {/* Name */}
        <h3 className="text-lg font-semibold text-white font-['Space_Grotesk']">{platform.name}</h3>

        {/* Description (shown on hover) */}
        <p className='text-xs text-zinc-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity'>
          {platform.description}
        </p>
      </div>

      {/* Hover Arrow */}
      <div className='absolute bottom-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
        <svg className='w-4 h-4 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M14 5l7 7m0 0l-7 7m7-7H3'
          />
        </svg>
      </div>
    </button>
  );
}

export default PlatformCard;
