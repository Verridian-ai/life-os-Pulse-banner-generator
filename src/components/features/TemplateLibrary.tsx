import React, { useState } from 'react';
import { BANNER_TEMPLATES, BannerTemplate } from '../../constants/templates';
import { useCanvas } from '../../context/CanvasContext';
import { useAI } from '../../context/AIContext';
import { useToast } from '../../hooks/useToast';
import { INPUT_NEU } from '../../styles';

interface TemplateLibraryProps {
  onClose?: () => void;
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ onClose }) => {
  const { setBgImage, setElements, setSelectedElementId } = useCanvas();
  const { setPrompt } = useAI();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const toast = useToast();

  const industries = ['All', ...new Set(BANNER_TEMPLATES.map((t) => t.industry))];
  const platforms = ['All', 'linkedin', 'facebook', 'x', 'instagram', 'youtube', 'tiktok'];

  const filteredTemplates = BANNER_TEMPLATES.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = selectedIndustry === 'All' || t.industry === selectedIndustry;
    // Safe check if template has platform property (for backward compatibility if data didn't fully update)
    const matchesPlatform =
      selectedPlatform === 'All' || (t.platform && t.platform === selectedPlatform);
    return matchesSearch && matchesIndustry && matchesPlatform;
  });

  const handleApplyTemplate = (template: BannerTemplate) => {
    // 1. Set background
    setBgImage(template.backgroundUrl);
    setPrompt(template.prompt); // Set the prompt for regeneration capability

    const elements = template.elements.map((el, i) => ({
      ...el,
      id: `template-${template.id}-${i}-${Date.now()}`,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    })) as any;

    setElements(elements);
    setSelectedElementId(null);

    toast.success(`Applied ${template.title} template`);
    if (onClose) onClose();
  };

  return (
    <div className='flex-1 flex flex-col min-h-0 bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl'>
      {/* Header */}
      <div className='p-6 border-b border-white/5 flex items-center justify-between bg-zinc-950/50'>
        <div>
          {/* Heading removed to prevent double-header with Studio Nav */}
          <p className='text-[10px] text-zinc-500 font-bold uppercase tracking-widest'>
            {BANNER_TEMPLATES.length} Professional Starting Points
          </p>
        </div>
        {onClose && (
          <button onClick={onClose} className='text-zinc-500 hover:text-white transition p-2'>
            <span className='material-icons'>close</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className='p-6 space-y-4 border-b border-white/5'>
        {/* Search */}
        <input
          type='text'
          placeholder='Search templates...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`${INPUT_NEU} w-full h-12 px-4 text-sm mb-4`}
        />

        {/* Platform Filter */}
        <div className='flex gap-2 overflow-x-auto pb-1 scrollbar-hide mb-2 border-b border-white/5 pb-4'>
          {platforms.map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPlatform(p)}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap transition flex items-center gap-2 ${
                selectedPlatform === p
                  ? 'bg-white text-black'
                  : 'bg-black/40 text-zinc-500 hover:text-white border border-white/10'
              }`}
            >
              {p === 'All' ? 'ALL PLATFORMS' : p}
            </button>
          ))}
        </div>

        {/* Industry Filter */}
        <div className='flex gap-2 overflow-x-auto pb-1 scrollbar-hide'>
          {industries.map((ind) => (
            <button
              key={ind}
              onClick={() => setSelectedIndustry(ind)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition ${
                selectedIndustry === ind
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {ind}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className='flex-1 overflow-y-auto p-6'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-10'>
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className='group bg-zinc-950/50 border border-white/5 hover:border-blue-500/30 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer flex flex-col'
              onClick={() => handleApplyTemplate(template)}
            >
              <div className='aspect-video w-full relative overflow-hidden bg-zinc-900'>
                <img
                  src={template.thumbnailUrl}
                  alt={template.title}
                  className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                />
                <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                  <div className='bg-blue-600 text-white px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest shadow-lg'>
                    Apply Template
                  </div>
                </div>
                <div className='absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[8px] font-black text-blue-400 uppercase border border-blue-500/20'>
                  {template.industry}
                </div>
              </div>
              <div className='p-4'>
                <h3 className='text-sm font-black text-white uppercase mb-1'>{template.title}</h3>
                <p className='text-[11px] text-zinc-500 line-clamp-2 leading-relaxed'>
                  {template.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
