import React, { useState, useEffect } from 'react';
import { BTN_BASE, BTN_NEU_SOLID } from '../../styles';
import { ImageToolsPanel } from './ImageToolsPanel';
import { useCanvas } from '../../context/CanvasContext';

interface GenerativeSidebarProps {
  refImages: string[];
  genPrompt: string;
  setGenPrompt: (prompt: string) => void;
  genSize: '1K' | '2K' | '4K';
  setGenSize: (size: '1K' | '2K' | '4K') => void;
  isGenerating: boolean;
  onGenerate: (override?: string) => void;
  isMagicPrompting: boolean;
  onMagicPrompt: () => void;
  editPrompt: string;
  setEditPrompt: (prompt: string) => void;
  isEditing: boolean;
  onEdit: () => void;
  onRemoveBg: () => void;
  onUpscale: () => void;
  bgImage: string | null;
  onImageUpdate: (newImage: string) => void;
  magicEditSuggestions?: string[];
  generationSuggestions?: string[];
}

const GenerativeSidebar: React.FC<GenerativeSidebarProps> = ({
  refImages,
  genPrompt,
  setGenPrompt,
  genSize,
  setGenSize,
  isGenerating,
  onGenerate,
  isMagicPrompting,
  onMagicPrompt,
  editPrompt,
  setEditPrompt,
  isEditing,
  onEdit,
  onRemoveBg: _onRemoveBg,
  onUpscale: _onUpscale,
  bgImage,
  onImageUpdate,
  magicEditSuggestions = [],
  generationSuggestions = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const { setElements } = useCanvas();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handler for updating layer images
  const handleLayerImageUpdate = (layerId: string, newImage: string) => {
    setElements((prevElements) =>
      prevElements.map((el) => (el.id === layerId ? { ...el, content: newImage } : el)),
    );
    console.log('[GenerativeSidebar] Updated layer image:', layerId);
  };

  // Mobile collapsed: FAB button
  if (!isExpanded && isMobile) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className='fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-pink-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-pink-500/50 hover:scale-110 transition-all duration-200 flex items-center justify-center'
        title='Open AI Studio'
        aria-label='Expand AI Studio'
      >
        <span className='material-icons text-3xl'>auto_fix_high</span>
      </button>
    );
  }

  // Desktop collapsed: Side button
  if (!isExpanded && !isMobile) {
    return (
      <div className='absolute right-0 top-20 z-30'>
        <button
          onClick={() => setIsExpanded(true)}
          className='min-w-[56px] min-h-[56px] bg-zinc-900 border border-white/10 text-white p-3 rounded-l-xl shadow-2xl hover:bg-zinc-800 transition'
          title='Open AI Studio'
          aria-label='Expand AI Studio sidebar'
        >
          <span className='material-icons text-base'>auto_fix_high</span>
        </button>
      </div>
    );
  }

  // Shared content for both mobile and desktop
  const content = (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h3 className='font-black text-sm uppercase tracking-wider flex items-center gap-2 text-white drop-shadow-sm'>
          <span className='material-icons text-pink-500'>auto_fix_high</span>
          AI Studio
        </h3>
        <div className='flex items-center gap-2'>
          <div className='text-[9px] bg-pink-500/10 text-pink-400 px-2 py-1 rounded-full border border-pink-500/20 font-black tracking-widest uppercase shadow-[0_0_10px_rgba(236,72,153,0.2)]'>
            Gemini 3 Pro
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className='text-zinc-500 hover:text-white transition'
            title='Collapse'
            aria-label={isMobile ? 'Close AI Studio' : 'Collapse Sidebar'}
          >
            <span className='material-icons'>{isMobile ? 'expand_more' : 'chevron_right'}</span>
          </button>
        </div>
      </div>

        {/* Generation Card */}
        <div className='bg-black/40 p-5 rounded-3xl border border-white/5 hover:border-pink-500/30 transition-colors group relative overflow-hidden'>
          <div className='absolute top-0 right-0 w-24 h-24 bg-pink-500/10 blur-2xl rounded-full -mr-10 -mt-10 pointer-events-none'></div>

          <label className='flex justify-between text-[10px] font-black text-zinc-400 mb-4 uppercase tracking-widest relative z-10'>
            <span>Background Gen</span>
          </label>

          {/* Magic Prompt Button */}
          <button
            onClick={onMagicPrompt}
            disabled={isMagicPrompting || refImages.length === 0}
            className={`w-full mb-4 ${BTN_BASE} ${refImages.length > 0 ? BTN_NEU_SOLID : 'bg-black/20 text-zinc-600 border border-white/5 cursor-not-allowed shadow-none'}`}
          >
            {isMagicPrompting ? (
              <span className='animate-pulse'>ANALYZING ASSETS...</span>
            ) : (
              <>
                <span className='material-icons text-sm'>auto_awesome</span>
                Auto-Prompt from Assets
              </>
            )}
          </button>

          <textarea
            className='w-full bg-zinc-900/50 border border-white/10 rounded-2xl p-3 md:p-4 text-xs md:text-sm font-medium text-white focus:border-pink-500 focus:outline-none resize-none h-24 md:h-32 mb-4 placeholder-zinc-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] transition-all relative z-10'
            placeholder="Describe your vision (e.g., 'A futuristic city skyline in purple and teal')..."
            value={genPrompt}
            onChange={(e) => setGenPrompt(e.target.value)}
          />

          {/* Generation Suggestions */}
          {generationSuggestions.length > 0 && (
            <div className='flex flex-wrap gap-2 mb-4 relative z-10'>
              {generationSuggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setGenPrompt(s)}
                  className='text-[9px] bg-pink-500/20 text-pink-300 border border-pink-500/30 px-2 py-1 rounded-md hover:bg-pink-500/30 transition text-left cursor-pointer'
                >
                  <span className='opacity-70 mr-1'>✨</span>
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className='flex justify-between items-center mb-4 md:mb-6 relative z-10 gap-2'>
            <span className='text-[9px] md:text-[10px] text-zinc-500 font-black uppercase tracking-widest shrink-0'>
              Quality
            </span>
            <div className='flex bg-zinc-900 rounded-lg md:rounded-xl p-0.5 md:p-1 border border-white/5 shadow-inner'>
              {(['1K', '2K', '4K'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setGenSize(s)}
                  className={`text-[9px] md:text-[10px] font-black px-2 md:px-4 py-1 md:py-1.5 rounded-md md:rounded-lg transition-all ${genSize === s ? 'bg-zinc-700 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => onGenerate()}
            disabled={isGenerating}
            className={`w-full ${BTN_BASE} bg-white text-black hover:bg-zinc-200 disabled:opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.2)]`}
          >
            {isGenerating ? (
              <>
                <div className='w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin'></div>
                CREATING...
              </>
            ) : (
              <>
                <span className='material-icons text-sm'>draw</span>
                Generate Background
              </>
            )}
          </button>
        </div>

        {/* Editing Card */}
        <div className='bg-black/40 p-5 rounded-3xl border border-white/5 hover:border-yellow-500/30 transition-colors relative overflow-hidden group'>
          <div className='absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 blur-2xl rounded-full -mr-10 -mt-10 pointer-events-none'></div>

          <label className='block text-[10px] font-black text-zinc-400 mb-4 uppercase tracking-widest relative z-10'>
            Magic Edit
          </label>

          <textarea
            className='w-full bg-zinc-900/50 border border-white/10 rounded-2xl p-4 text-sm font-medium text-white focus:border-yellow-500 focus:outline-none resize-none h-24 mb-4 placeholder-zinc-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] relative z-10'
            placeholder="E.g., 'Add a laptop to the desk', 'Make the lighting warmer'..."
            value={editPrompt}
            onChange={(e) => setEditPrompt(e.target.value)}
          />

          {/* Magic Edit Suggestions */}
          {magicEditSuggestions.length > 0 && (
            <div className='flex flex-wrap gap-2 mb-4 relative z-10'>
              {magicEditSuggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setEditPrompt(s)}
                  className='text-[9px] bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-2 py-1 rounded-md hover:bg-yellow-500/30 transition text-left cursor-pointer'
                >
                  <span className='opacity-70 mr-1'>🪄</span>
                  {s}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={onEdit}
            disabled={isEditing || isGenerating}
            className={`w-full ${BTN_BASE} bg-white text-black hover:bg-zinc-200 disabled:opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.2)]`}
          >
            {isEditing ? (
              <>
                <div className='w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin'></div>
                EDITING...
              </>
            ) : (
              <>
                <span className='material-icons text-sm'>auto_fix_normal</span>
                Magic Edit
              </>
            )}
          </button>
        </div>

      {/* Advanced Image Tools Panel */}
      <ImageToolsPanel
        bgImage={bgImage}
        onImageUpdate={onImageUpdate}
        onLayerImageUpdate={handleLayerImageUpdate}
      />
    </div>
  );

  // Mobile expanded: Bottom sheet
  if (isMobile) {
    return (
      <div className='fixed inset-x-0 bottom-0 z-40 bg-zinc-900 rounded-t-3xl border-t border-white/10 shadow-2xl'>
        {/* Drag handle indicator */}
        <div className='flex justify-center pt-3 pb-2'>
          <div className='w-12 h-1 bg-zinc-700 rounded-full'></div>
        </div>
        <div className='max-h-[60vh] overflow-y-auto p-4'>
          {content}
        </div>
      </div>
    );
  }

  // Desktop expanded: Sidebar
  return (
    <div className='w-full lg:w-[400px] bg-zinc-900 border-l border-white/5 p-6 flex flex-col gap-6 overflow-y-auto shrink-0 z-20 shadow-2xl relative'>
      {content}
    </div>
  );
};

export default GenerativeSidebar;
