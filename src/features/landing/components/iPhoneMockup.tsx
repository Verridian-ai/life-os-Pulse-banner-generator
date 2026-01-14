import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface iPhoneMockupProps {
  children?: ReactNode;
  className?: string;
  orientation?: 'portrait' | 'landscape';
  src?: string;
}

export function iPhoneMockup({
  children,
  className = '',
  orientation = 'portrait',
  src,
}: iPhoneMockupProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`relative z-10 mx-auto ${className}`}
      style={{
        width: orientation === 'portrait' ? '360px' : '700px',
        maxWidth: '100%',
        aspectRatio: orientation === 'portrait' ? '360/780' : '780/360',
      }}
    >
      {/* Outer Titanium Frame (Natural Titanium Finish) */}
      <div
        className='absolute inset-0 rounded-[55px] shadow-2xl pointer-events-none z-20'
        style={{
          background: 'linear-gradient(145deg, #5b5b5b 0%, #2a2a2a 20%, #1a1a1a 100%)',
          boxShadow:
            '0 0 0 2px #3a3a3a, 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 80px -20px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Antenna Bands */}
        <div className='absolute top-[15%] left-0 w-[2px] h-[12px] bg-[#4a4a4a] opacity-60'></div>
        <div className='absolute top-[15%] right-0 w-[2px] h-[12px] bg-[#4a4a4a] opacity-60'></div>
        <div className='absolute bottom-[15%] left-0 w-[2px] h-[12px] bg-[#4a4a4a] opacity-60'></div>
        <div className='absolute bottom-[15%] right-0 w-[2px] h-[12px] bg-[#4a4a4a] opacity-60'></div>

        {/* Buttons */}
        <div className='absolute top-[120px] -left-[3px] w-[3px] h-[32px] bg-[#3a3a3a] rounded-l-md'></div>
        <div className='absolute top-[170px] -left-[3px] w-[3px] h-[60px] bg-[#3a3a3a] rounded-l-md'></div>
        <div className='absolute top-[240px] -left-[3px] w-[3px] h-[60px] bg-[#3a3a3a] rounded-l-md'></div>
        <div className='absolute top-[190px] -right-[3px] w-[3px] h-[90px] bg-[#3a3a3a] rounded-r-md'></div>
      </div>

      {/* Screen Bezel (Inner structural border) */}
      <div className='absolute inset-[3px] bg-black rounded-[52px] z-20 pointer-events-none border-[6px] border-black'></div>

      {/* Dynamic Island */}
      <div className='absolute top-[14px] left-1/2 -translate-x-1/2 w-[120px] h-[35px] bg-black rounded-[20px] z-40 flex items-center justify-center pointer-events-none'>
        <div className='w-[80px] h-[35px] bg-black rounded-[20px] flex items-center justify-end px-3 gap-2'>
          {/* Camera Lens effect */}
          <div className='w-3 h-3 rounded-full bg-[#1a1a1b] shadow-inner'></div>
        </div>
      </div>

      {/* Screen Content Area */}
      <div className='absolute inset-[10px] bg-black rounded-[46px] overflow-hidden z-10 flex flex-col'>
        {/* System Status Bar Area (Mock) */}
        <div className='h-[44px] w-full flex items-center justify-between px-6 pt-1 text-white text-[14px] font-medium z-30 select-none'>
          <span>9:41</span>
          <div className='flex items-center gap-2'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='18'
              height='18'
              viewBox='0 0 24 24'
              fill='currentColor'
              className='mt-[2px]'
            >
              <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm1.09-3.26c-.25.33-.29.58-.29 1.26h-1.6v-.63c0-.98.39-1.39.92-1.78.43-.33.73-.59.73-1.07 0-.58-.47-1.03-1.05-1.03-.57 0-1.04.44-1.04 1.02V10.99H9.41v-.47c0-1.31 1.06-2.39 2.38-2.39 1.34 0 2.37 1.06 2.37 2.38 0 .84-.42 1.29-.97 1.73z' />
            </svg>
            <div className='w-[26px] h-[13px] border border-white/30 rounded-[4px] relative'>
              <div className='absolute inset-0.5 bg-white rounded-[2px] w-[80%]'></div>
            </div>
          </div>
        </div>

        {/* Main Content Container (Scrollable) */}
        <div className='flex-1 w-full relative overflow-hidden bg-black'>
          {src ? (
            <img src={src} alt='iPhone Screen' className='w-full h-full object-cover' />
          ) : (
            children
          )}
        </div>

        {/* Home Indicator */}
        <div className='absolute bottom-1 left-1/2 -translate-x-1/2 w-[130px] h-[5px] bg-white/40 rounded-full z-40 mb-1'></div>
      </div>

      {/* Reflection / Shine Overlay */}
      <div
        className='absolute inset-0 rounded-[55px] pointer-events-none z-30 opacity-40 mix-blend-overlay'
        style={{
          background:
            'linear-gradient(25deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 60%)',
        }}
      ></div>
    </motion.div>
  );
}
