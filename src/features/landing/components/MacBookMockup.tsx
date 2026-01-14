import { ReactNode } from 'react';

interface MacBookMockupProps {
  src?: string;
  children?: ReactNode;
  className?: string;
}

export function MacBookMockup({ src, children, className = '' }: MacBookMockupProps) {
  return (
    <div className={`relative ${className}`} style={{ perspective: '1000px' }}>
      {/* Lid / Screen Housing */}
      <div
        className='relative bg-[#0d0d0d] rounded-t-[20px] p-[2px] shadow-2xl origin-bottom transition-transform duration-500'
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Lid Border/Bezel */}
        <div className='absolute inset-0 bg-[#272729] rounded-t-[18px]'></div>

        {/* Screen Area */}
        <div className='relative bg-black rounded-t-[14px] overflow-hidden aspect-[16/10] border-[4px] border-[#0d0d0d]'>
          {/* Notch */}
          <div className='absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[18px] bg-[#0d0d0d] rounded-b-md z-20 flex justify-center items-center'>
            <div className='w-2 h-2 bg-[#1a1a1a] rounded-full shadow-inner'></div>
          </div>

          {/* Content */}
          {src ? (
            <img src={src} alt='MacBook Screen' className='w-full h-full object-cover' />
          ) : (
            children
          )}

          {/* Screen Gloss/Reflection */}
          <div className='absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-10 mix-blend-overlay'></div>
        </div>
      </div>

      {/* Bottom Base */}
      <div className='relative h-[12px] bg-[#1a1a1a] rounded-b-[16px] shadow-xl flex items-center justify-center'>
        {/* Thumb Indent */}
        <div className='w-[100px] h-[4px] bg-[#2a2a2a] rounded-b-md opacity-50'></div>
      </div>
    </div>
  );
}
