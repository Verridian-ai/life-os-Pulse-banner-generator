import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { iPhoneMockup as IPhoneMockup } from './iPhoneMockup';
import { MacBookMockup } from './MacBookMockup';

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  // Unused parallax variables removed (y1, y2)

  // Parallax for devices
  const phoneY = useTransform(scrollY, [0, 500], [0, -80]);
  const laptopY = useTransform(scrollY, [0, 500], [0, 50]);

  return (
    <section
      ref={containerRef}
      className='relative min-h-[110vh] flex flex-col items-center justify-start pt-32 pb-20 overflow-hidden bg-black text-white selection:bg-purple-500/30'
    >
      {/* Dynamic Background - Ultra Dark Premium */}
      <div className='absolute inset-0 bg-black pointer-events-none'>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1a1a1a_0%,#000000_100%)]' />
        <div className='absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[800px] bg-purple-900/10 blur-[180px] rounded-full mix-blend-screen opacity-50 animate-pulse-slow' />
      </div>

      <div className='container relative z-10 px-4 md:px-6 mx-auto'>
        <div className='grid lg:grid-cols-2 gap-12 lg:gap-8 items-center'>
          {/* Left Column: Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className='flex flex-col items-center lg:items-start text-center lg:text-left max-w-2xl mx-auto lg:mx-0 order-2 lg:order-1'
          >
            {/* Badge - Titanium Style */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl mb-8 group cursor-pointer hover:bg-white/10 transition-all duration-300'
            >
              <span className='flex h-1.5 w-1.5 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.8)] animate-pulse'></span>
              <span className='text-sm font-medium text-zinc-300 tracking-wide'>
                NanoBanana Pro 2.0
              </span>
              <ArrowRight className='w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors ml-1' />
            </motion.div>

            {/* Headline - Apple SF Pro Display Style */}
            <h1 className='text-5xl sm:text-7xl md:text-8xl font-semibold tracking-tighter text-white mb-8 leading-[1.05]'>
              Designed for
              <span className='block bg-gradient-to-r from-purple-200 via-pink-200 to-white bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]'>
                Virality.
              </span>
            </h1>

            <p className='text-xl md:text-2xl text-zinc-400 mb-10 max-w-lg leading-relaxed font-medium tracking-tight'>
              The ultimate AI content engine. <br className='hidden md:block' />
              <span className='text-zinc-500'>Professional. Fast. Unstoppable.</span>
            </p>

            {/* CTA Buttons - Glassmorphism */}
            <div className='flex flex-col sm:flex-row gap-5 w-full sm:w-auto'>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className='group relative px-8 py-4 bg-white text-black rounded-full font-semibold text-lg shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)] transition-shadow duration-300 overflow-hidden'
                onClick={() =>
                  document.getElementById('get-started')?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                <span className='relative z-10 flex items-center gap-2'>Get Started</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
                whileTap={{ scale: 0.98 }}
                className='px-8 py-4 bg-transparent border border-zinc-700 rounded-full font-medium text-lg text-white hover:border-white transition-colors duration-300 flex items-center gap-2'
              >
                <Play className='w-4 h-4 fill-current' />
                See functionalities
              </motion.button>
            </div>

            {/* Social Proof - Minimalist */}
            <div className='mt-12 flex items-center gap-4 text-sm font-medium text-zinc-500'>
              <p>Trusted by world-class creators.</p>
            </div>
          </motion.div>

          {/* Right Column: Device Ecosystem - Precision Render */}
          <div className='relative perspective-[2000px] h-[600px] lg:h-[900px] w-full flex items-center justify-center order-1 lg:order-2'>
            {/* Laptop Mockup (Back Layer) */}
            <motion.div
              style={{ y: laptopY, rotateX: 5, rotateY: -12 }}
              className='absolute left-0 lg:left-0 w-[110%] lg:w-[140%] max-w-[1000px] z-10 grayscale-[0.2] hover:grayscale-0 transition-all duration-700'
            >
              <MacBookMockup
                src='/assets/screenshot-desktop.png'
                className='shadow-[0_0_100px_-20px_rgba(100,20,200,0.15)]'
              />
            </motion.div>

            {/* iPhone Mockup (Front Layer, Floating) - Titanium Glow */}
            <motion.div
              style={{ y: phoneY, rotateX: 0, rotateY: 15, rotateZ: -5 }}
              className='absolute right-4 lg:-right-4 bottom-12 z-20 w-[160px] lg:w-[320px]'
            >
              <IPhoneMockup
                src='/assets/screenshot-mobile.png'
                className='shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]'
              />
            </motion.div>

            {/* Volumetric Lights */}
            <motion.div style={{ y: y1 }} className='absolute top-0 right-0 -z-10 opacity-60'>
              <div className='w-[800px] h-[800px] bg-indigo-500/10 blur-[150px] rounded-full mix-blend-screen' />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
