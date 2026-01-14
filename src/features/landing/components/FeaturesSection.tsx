import { motion } from 'framer-motion';
import { Wand2, Mic, Palette, Layout, Zap, Globe2 } from 'lucide-react';
import React from 'react';

const FEATURES = [
  {
    icon: Wand2,
    title: 'AI Generation',
    description: 'Text-to-design technology that understands your brand voice.',
    className: 'md:col-span-2 md:row-span-2',
    gradient: 'from-purple-500 to-indigo-600',
  },
  {
    icon: Mic,
    title: 'Voice Control',
    description: 'Speak your changes: "Make it pop more"',
    className: 'md:col-span-1 md:row-span-1',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    icon: Palette,
    title: 'Smart Branding',
    description: 'Auto-applies your logo, colors, and fonts.',
    className: 'md:col-span-1 md:row-span-1',
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    icon: Globe2,
    title: 'Multi-lingual',
    description: 'Generate content in 30+ languages instantly.',
    className: 'md:col-span-1 md:row-span-1',
    gradient: 'from-green-400 to-emerald-600',
  },
  {
    icon: Layout,
    title: 'Responsive',
    description: 'Auto-resize for IG, LinkedIn, and Twitter.',
    className: 'md:col-span-1 md:row-span-1',
    gradient: 'from-blue-400 to-cyan-500',
  },
  {
    icon: Zap,
    title: 'Batch Mode',
    description: 'Create 100 variations in seconds.',
    className: 'md:col-span-2 md:row-span-1',
    gradient: 'from-violet-500 to-fuchsia-600',
  },
];

export function FeaturesSection() {
  return (
    <section className='py-24 bg-stone-50 dark:bg-zinc-950 relative overflow-hidden' id='features'>
      {/* Decorative blob */}
      <div className='absolute top-1/2 left-0 w-[500px] h-[500px] bg-purple-500/5 dark:bg-purple-900/10 rounded-full blur-[120px] -translate-y-1/2' />

      <div className='container px-4 md:px-6 mx-auto relative z-10'>
        <div className='text-center max-w-2xl mx-auto mb-16'>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='text-3xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white mb-4'
          >
            Everything you need.
            <br />
            <span className='text-zinc-500 dark:text-zinc-400'>Nothing you don't.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className='text-lg text-zinc-600 dark:text-zinc-400'
          >
            A complete suite of tools designed for the modern creator economy.
          </motion.p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[200px]'>
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`relative group overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 flex flex-col justify-between ${feature.className}`}
            >
              <div
                className={`absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-br ${feature.gradient} opacity-5 group-hover:opacity-10 transition-opacity blur-3xl`}
              />

              <div className='relative z-10'>
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white shadow-lg mb-6`}
                >
                  <feature.icon className='w-6 h-6' />
                </div>
                <h3 className='text-xl font-bold text-zinc-900 dark:text-white mb-2'>
                  {feature.title}
                </h3>
                <p className='text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed'>
                  {feature.description}
                </p>
              </div>

              {/* Hover effect overlay */}
              <div className='absolute inset-0 border-2 border-transparent group-hover:border-purple-500/10 rounded-3xl transition-colors pointer-events-none' />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
