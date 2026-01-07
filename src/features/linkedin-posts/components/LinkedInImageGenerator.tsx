import React, { useState } from 'react';
import type { LinkedInImageGeneratorProps, ImageGenerationRequest } from '../types';
import { BTN_PRIMARY } from '@/styles';

/**
 * LinkedInImageGenerator - Specialized AI image generation for post assets.
 * Features aspect-ratio toggles and style presets.
 */
export const LinkedInImageGenerator: React.FC<LinkedInImageGeneratorProps> = ({
    topic,
    isLoading,
    onGenerate,
}) => {
    const [style, setStyle] = useState<'professional' | 'creative' | 'bold' | 'minimalist'>('professional');
    const [aspect, setAspect] = useState<'landscape' | 'square' | 'portrait'>('landscape');
    const [customPrompt, setCustomPrompt] = useState('');

    const handleGenerate = () => {
        const dimensions = {
            landscape: { width: 1200, height: 627 },
            square: { width: 1080, height: 1080 },
            portrait: { width: 1080, height: 1350 },
        }[aspect];

        const generateRequest: ImageGenerationRequest = {
            prompt: customPrompt || `A professional LinkedIn featured image about ${topic}, ${style} style, high quality, 4k.`,
            dimensions,
            style,
        };

        onGenerate(generateRequest);
    };

    return (
        <div className='bg-zinc-900/50 backdrop-blur-md rounded-3xl border border-white/5 p-8 shadow-2xl space-y-8'>
            <div className='flex items-center justify-between'>
                <h3 className='text-[10px] font-black text-zinc-500 uppercase tracking-widest'>
                    ASSET GENERATOR
                </h3>
                <div className='flex items-center gap-2'>
                    <span className='w-2 h-2 rounded-full bg-indigo-500 animate-pulse' />
                    <span className='text-[9px] font-bold text-indigo-400 uppercase tracking-wider'>Ideogram V3</span>
                </div>
            </div>

            <div className='space-y-6'>
                {/* Style selection */}
                <div className='space-y-3'>
                    <label className='text-[10px] font-black text-zinc-600 uppercase tracking-widest'>Visual Style</label>
                    <div className='grid grid-cols-2 gap-2'>
                        {['professional', 'creative', 'bold', 'minimalist'].map((s) => (
                            <button
                                key={s}
                                onClick={() => setStyle(s as 'professional' | 'creative' | 'bold' | 'minimalist')}
                                className={`
                  p-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all
                  ${style === s
                                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                                        : 'bg-black/20 border-white/5 text-zinc-600 hover:text-zinc-400'}
                `}
                                type='button'
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Aspect Ratio */}
                <div className='space-y-3'>
                    <label className='text-[10px] font-black text-zinc-600 uppercase tracking-widest'>Aspect Ratio</label>
                    <div className='flex gap-2'>
                        {([
                            { id: 'landscape', icon: 'rectangle', label: '1.91:1' },
                            { id: 'square', icon: 'square', label: '1:1' },
                            { id: 'portrait', icon: 'rectangle', label: '4:5' },
                        ] as const).map((a) => (
                            <button
                                key={a.id}
                                onClick={() => setAspect(a.id)}
                                className={`
                                  flex-1 p-3 rounded-xl flex flex-col items-center gap-1 border transition-all
                                  ${aspect === a.id
                                        ? 'bg-zinc-800 border-white/20 text-white'
                                        : 'bg-black/20 border-white/5 text-zinc-600 hover:text-zinc-400'}
                                `}
                                type='button'
                                title={a.id}
                            >
                                <span className={`material-icons text-sm ${a.id === 'portrait' ? 'rotate-90' : ''}`}>{a.icon}</span>
                                <span className='text-[8px] font-bold'>{a.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Custom refinement */}
                <div className='space-y-3'>
                    <label className='text-[10px] font-black text-zinc-600 uppercase tracking-widest'>Custom Modification</label>
                    <input
                        type='text'
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        placeholder='Add specific details (e.g. "with neon accents")'
                        className='w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-700 focus:border-indigo-500/50 outline-none transition-all'
                    />
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !topic}
                    className={`${BTN_PRIMARY} w-full py-4 bg-gradient-to-br from-indigo-600 to-purple-700 shadow-indigo-900/20`}
                    type='button'
                >
                    {isLoading ? (
                        <div className='flex items-center gap-2'>
                            <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                            <span>CRAFTING ASSET...</span>
                        </div>
                    ) : (
                        <div className='flex items-center gap-2'>
                            <span className='material-icons text-sm'>photo_filter</span>
                            <span>GENERATE POST IMAGE</span>
                        </div>
                    )}
                </button>
            </div>
        </div >
    );
};
