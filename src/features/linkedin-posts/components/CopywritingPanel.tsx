import React, { useState } from 'react';
import { PostTemplate, EmotionalTone, CopywritingRequest } from '../types';
import { POST_TEMPLATES, EMOTIONAL_TONES } from '../constants';
import { BTN_PRIMARY } from '@/styles';
import { useToast } from '@/hooks/useToast';

interface CopywritingPanelProps {
    content: string;
    onContentChange: (content: string) => void;
    onGenerate?: (request: CopywritingRequest) => Promise<void>;
    isGenerating?: boolean;
}

export const CopywritingPanel: React.FC<CopywritingPanelProps> = ({
    content,
    onContentChange,
    onGenerate,
    isGenerating = false,
}) => {
    const [topic, setTopic] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<PostTemplate>('story');
    const [selectedTone, setSelectedTone] = useState<EmotionalTone>('professional');
    const [keyPoints, setKeyPoints] = useState<string[]>(['']);
    const toast = useToast();

    const handleAddPoint = () => {
        setKeyPoints([...keyPoints, '']);
    };

    const handleRemovePoint = (index: number) => {
        setKeyPoints(keyPoints.filter((_p: string, i: number) => i !== index));
    };

    const handleUpdatePoint = (index: number, value: string) => {
        const newPoints = [...keyPoints];
        newPoints[index] = value;
        setKeyPoints(newPoints);
    };

    const handleGenerate = async () => {
        if (!topic.trim()) {
            toast.error('Please enter a topic for your post');
            return;
        }

        if (onGenerate) {
            const request: CopywritingRequest = {
                topic,
                template: selectedTemplate,
                tone: selectedTone,
                keyPoints: keyPoints.filter((p: string) => p.trim() !== ''),
                includeHashtags: true,
            };
            await onGenerate(request);
        } else {
            // Mock generation for now
            toast.info('AI Generation starting...');
            setTimeout(() => {
                onContentChange(`🚀 MOCK GENERATED CONTENT for "${topic}"\n\nTemplate: ${selectedTemplate}\nTone: ${selectedTone}\n\nThis is a placeholder for actual AI content generation logic from the LLM service.\n\n#linkedin #branding #aigenerated`);
                toast.success('Content generated!');
            }, 2000);
        }
    };

    return (
        <div className='space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500'>
            {/* 1. Topic Input */}
            <div className='space-y-3'>
                <label className='text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2'>
                    <span className='material-icons text-xs'>topic</span>
                    Core Topic or Headline
                </label>
                <input
                    type='text'
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder='E.g., How AI is changing personal branding in 2026...'
                    className='w-full bg-zinc-900/50 border border-white/10 rounded-2xl p-4 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-sm font-medium'
                />
            </div>

            {/* 2. Template Selector */}
            <div className='space-y-3'>
                <label className='text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2'>
                    <span className='material-icons text-xs'>layout</span>
                    Post Format Template
                </label>
                <div
                    className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'
                    role='listbox'
                    aria-label='Post templates'
                >
                    {POST_TEMPLATES.map((tmpl) => {
                        const isSelected = selectedTemplate === tmpl.id;
                        const commonClasses = `
                            p-4 rounded-2xl border transition-all text-left group relative
                            ${isSelected
                                ? 'bg-blue-500/10 border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                                : 'bg-zinc-900/30 border-white/5 hover:border-white/20 hover:bg-zinc-800/40'
                            }
                        `;

                        return isSelected ? (
                            <button
                                key={tmpl.id}
                                onClick={() => setSelectedTemplate(tmpl.id)}
                                role='option'
                                aria-selected='true'
                                className={commonClasses}
                                type='button'
                            >
                                <div className='flex items-center gap-3 mb-1'>
                                    <span className='material-icons text-sm text-blue-500'>
                                        {tmpl.icon}
                                    </span>
                                    <span className='text-xs font-bold text-white'>{tmpl.label}</span>
                                    <div className='ml-auto w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse' />
                                </div>
                                <p className='text-[10px] text-zinc-500 leading-tight'>{tmpl.description}</p>
                            </button>
                        ) : (
                            <button
                                key={tmpl.id}
                                onClick={() => setSelectedTemplate(tmpl.id)}
                                role='option'
                                aria-selected='false'
                                className={commonClasses}
                                type='button'
                            >
                                <div className='flex items-center gap-3 mb-1'>
                                    <span className='material-icons text-sm text-zinc-500'>
                                        {tmpl.icon}
                                    </span>
                                    <span className='text-xs font-bold text-white'>{tmpl.label}</span>
                                </div>
                                <p className='text-[10px] text-zinc-500 leading-tight'>{tmpl.description}</p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 3. Tone Selector */}
            <div className='space-y-3'>
                <label className='text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2'>
                    <span className='material-icons text-xs'>palette</span>
                    Emotional Tone
                </label>
                <div
                    className='flex flex-wrap gap-2'
                    role='radiogroup'
                    aria-label='Content tone'
                >
                    {EMOTIONAL_TONES.map((tone) => {
                        const isSelected = selectedTone === tone.id;
                        const commonClasses = `
                            px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all
                            ${isSelected
                                ? 'bg-zinc-800 text-white border-zinc-500 shadow-lg'
                                : 'bg-zinc-900 text-zinc-600 border-white/5 hover:text-white hover:bg-zinc-800'
                            }
                        `;

                        return isSelected ? (
                            <button
                                key={tone.id}
                                onClick={() => setSelectedTone(tone.id)}
                                role='radio'
                                aria-checked='true'
                                className={commonClasses}
                                type='button'
                            >
                                {tone.label}
                            </button>
                        ) : (
                            <button
                                key={tone.id}
                                onClick={() => setSelectedTone(tone.id)}
                                role='radio'
                                aria-checked='false'
                                className={commonClasses}
                                type='button'
                            >
                                {tone.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 4. Key Points (New) */}
            <div className='space-y-3'>
                <div className='flex justify-between items-center'>
                    <label className='text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2'>
                        <span className='material-icons text-xs'>list</span>
                        Key Points to Include
                    </label>
                    <button
                        onClick={handleAddPoint}
                        className='text-[9px] font-black text-blue-500 hover:text-blue-400 flex items-center gap-1 uppercase tracking-widest transition-colors'
                        type='button'
                    >
                        <span className='material-icons text-[10px]'>add</span>
                        Add Point
                    </button>
                </div>
                <div className='space-y-2'>
                    {keyPoints.map((point: string, idx: number) => (
                        <div key={idx} className='flex gap-2'>
                            <input
                                type='text'
                                value={point}
                                onChange={(e) => handleUpdatePoint(idx, e.target.value)}
                                placeholder='E.g., 2026 Strategy...'
                                className='flex-1 bg-zinc-900/40 border border-white/5 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-700 focus:border-blue-500/30'
                            />
                            {keyPoints.length > 1 && (
                                <button
                                    onClick={() => handleRemovePoint(idx)}
                                    className='p-2 text-zinc-600 hover:text-red-400 transition-colors'
                                    type='button'
                                    aria-label='Remove point'
                                >
                                    <span className='material-icons text-sm'>delete</span>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* 5. Content Editor */}
            <div className='space-y-3'>
                <div className='flex justify-between items-center'>
                    <label className='text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2'>
                        <span className='material-icons text-xs'>edit_note</span>
                        Post Content
                    </label>
                    <div className='flex gap-2'>
                        <button
                            onClick={() => onContentChange('')}
                            className='text-[9px] font-bold text-zinc-600 hover:text-red-400 flex items-center gap-1 uppercase tracking-widest transition-colors'
                            type='button'
                        >
                            Clear
                        </button>
                    </div>
                </div>
                <textarea
                    value={content}
                    onChange={(e) => onContentChange(e.target.value)}
                    placeholder="Craft your post or click generate to start..."
                    className='w-full bg-zinc-900/50 border border-white/10 rounded-3xl p-6 text-white placeholder-zinc-800 focus:outline-none focus:border-zinc-700/50 min-h-[300px] text-sm leading-relaxed font-medium resize-none shadow-inner'
                />
            </div>

            {/* Action Bar */}
            <div className='pt-6 border-t border-white/5 flex items-center justify-between gap-4'>
                <div className='text-[10px] text-zinc-600 font-bold uppercase tracking-widest'>
                    {content.length} CHARACTERS
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !topic}
                    className={`${BTN_PRIMARY} px-8 py-4 flex items-center gap-2 shadow-2xl shadow-purple-900/30 relative overflow-hidden group`}
                    type='button'
                >
                    {isGenerating ? (
                        <div className='flex items-center gap-2'>
                            <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                            <span>Generating...</span>
                        </div>
                    ) : (
                        <>
                            <span className='material-icons text-sm'>sparkles</span>
                            <span>AI GENERATE CONTENT</span>
                            <div className='absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300' />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
