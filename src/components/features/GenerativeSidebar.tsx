import React, { useState, useEffect, memo } from 'react';
import { BTN_BASE, BTN_NEU_SOLID } from '../../styles';
import { ImageToolsPanel } from './ImageToolsPanel';
import { EnhanceButton } from '../ui/EnhanceButton';

import { IMAGE_MODELS } from '../../constants';

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
  isEnhancing?: boolean;
  onEnhancePrompt?: () => void;
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

// Mode type for the sidebar
export type SidebarMode = 'generate' | 'edit' | 'tools';

const GenerativeSidebarComponent: React.FC<GenerativeSidebarProps> = ({
  refImages,
  genPrompt,
  setGenPrompt,
  genSize,
  setGenSize,
  isGenerating,
  onGenerate,
  isMagicPrompting,
  onMagicPrompt,
  isEnhancing = false,
  onEnhancePrompt,
  editPrompt,
  setEditPrompt,
  isEditing,
  onEdit,
  magicEditSuggestions = [],
  generationSuggestions = [],
  bgImage: _bgImage,
  onImageUpdate: _onImageUpdate,
  onRemoveBg: _onRemoveBg,
  onUpscale: _onUpscale,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isCompact, setIsCompact] = useState(window.innerWidth < 400); // Extra compact for small phones
  const [selectedModelId, setSelectedModelId] = useState(() => {
    return localStorage.getItem('nanobanna-image-model') || 'gemini-3-pro';
  });
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false); // Collapsible advanced options
  const [activeMode, setActiveMode] = useState<SidebarMode>(() => {
    return (localStorage.getItem('nanobanna-sidebar-mode') as SidebarMode) || 'generate';
  });

  // Save mode selection to localStorage
  useEffect(() => {
    localStorage.setItem('nanobanna-sidebar-mode', activeMode);
  }, [activeMode]);

  // Get selected model details
  const selectedModel = IMAGE_MODELS.find((m) => m.id === selectedModelId) || IMAGE_MODELS[0];

  // Save model selection to localStorage
  useEffect(() => {
    localStorage.setItem('nanobanna-image-model', selectedModelId);
  }, [selectedModelId]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsCompact(window.innerWidth < 400);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <div className='space-y-4 md:space-y-6'>
      {/* Header - Compact on mobile */}
      <div className='flex items-center justify-between gap-2'>
        <h3 className='font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 text-white drop-shadow-sm shrink-0'>
          <span className='material-icons text-pink-500 text-base sm:text-lg'>auto_fix_high</span>
          <span className={isCompact ? 'hidden' : ''}>AI Studio</span>
        </h3>
        <div className='flex items-center gap-1.5 sm:gap-2'>
          {/* Model Selector Dropdown - Ultra compact on small screens */}
          <div className='relative'>
            <button
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className={`min-h-[44px] bg-pink-500/10 text-pink-400 rounded-full border border-pink-500/20 font-black uppercase shadow-[0_0_10px_rgba(236,72,153,0.2)] hover:bg-pink-500/20 transition flex items-center touch-manipulation active:scale-95 ${
                isCompact
                  ? 'w-11 justify-center'
                  : 'px-2 sm:px-3 py-2 gap-1 text-[9px] sm:text-[10px] tracking-wide sm:tracking-widest'
              }`}
              title={selectedModel.name}
            >
              <span className='material-icons text-sm'>{selectedModel.icon}</span>
              {!isCompact && (
                <>
                  <span className='hidden sm:inline'>{selectedModel.name}</span>
                  <span className='sm:hidden'>{selectedModel.name.split(' ')[0]}</span>
                  <span className='material-icons text-xs'>
                    {showModelDropdown ? 'expand_less' : 'expand_more'}
                  </span>
                </>
              )}
            </button>

            {/* Dropdown Menu */}
            {showModelDropdown && (
              <div className='absolute top-full right-0 mt-2 w-56 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden'>
                {IMAGE_MODELS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModelId(model.id);
                      setShowModelDropdown(false);
                    }}
                    className={`w-full px-3 py-2.5 text-left hover:bg-white/5 transition flex items-center gap-2 ${selectedModelId === model.id ? 'bg-pink-500/10 border-l-2 border-pink-500' : ''
                      }`}
                  >
                    <span className='material-icons text-sm text-pink-400'>{model.icon}</span>
                    <div className='flex-1 min-w-0'>
                      <div className='text-[11px] font-bold text-white truncate'>{model.name}</div>
                      <div className='text-[9px] text-zinc-500'>{model.description}</div>
                    </div>
                    {selectedModelId === model.id && (
                      <span className='material-icons text-sm text-pink-500'>check</span>
                    )}
                  </button>
                ))}
              </div>
            )}
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

      {/* Mode Selector Toggle - Icons only on compact, text on larger */}
      <div className='flex bg-zinc-900/80 rounded-2xl p-1 border border-white/10 shadow-inner gap-0.5 sm:gap-1'>
        <button
          onClick={() => setActiveMode('generate')}
          className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 min-h-[44px] px-1.5 sm:px-3 md:px-4 rounded-xl text-[9px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-wide sm:tracking-wider transition-all touch-manipulation active:scale-95 ${activeMode === 'generate'
            ? 'bg-gradient-to-br from-pink-600 to-pink-700 text-white shadow-lg shadow-pink-500/30'
            : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          title="Generate"
        >
          <span className='material-icons text-base sm:text-lg'>draw</span>
          <span className={isCompact ? 'hidden' : 'hidden xs:inline'}>Generate</span>
          <span className={isCompact ? 'hidden' : 'xs:hidden'}>Gen</span>
        </button>
        <button
          onClick={() => setActiveMode('edit')}
          className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 min-h-[44px] px-1.5 sm:px-3 md:px-4 rounded-xl text-[9px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-wide sm:tracking-wider transition-all touch-manipulation active:scale-95 ${activeMode === 'edit'
            ? 'bg-gradient-to-br from-yellow-600 to-amber-700 text-white shadow-lg shadow-yellow-500/30'
            : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          title="Edit"
        >
          <span className='material-icons text-base sm:text-lg'>auto_fix_normal</span>
          <span className={isCompact ? 'hidden' : ''}>Edit</span>
        </button>
        <button
          onClick={() => setActiveMode('tools')}
          className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 min-h-[44px] px-1.5 sm:px-3 md:px-4 rounded-xl text-[9px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-wide sm:tracking-wider transition-all touch-manipulation active:scale-95 ${activeMode === 'tools'
            ? 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white shadow-lg shadow-cyan-500/30'
            : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          title="Tools"
        >
          <span className='material-icons text-base sm:text-lg'>tune</span>
          <span className={isCompact ? 'hidden' : ''}>Tools</span>
        </button>
      </div>

      {/* Generation Card - Only show in generate mode */}
      {activeMode === 'generate' && (
        <div className='bg-black/40 p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-white/5 hover:border-pink-500/30 transition-colors group relative overflow-hidden'>
          <div className='absolute top-0 right-0 w-24 h-24 bg-pink-500/10 blur-2xl rounded-full -mr-10 -mt-10 pointer-events-none'></div>

          <label className='flex justify-between text-[9px] sm:text-[10px] font-black text-zinc-400 mb-3 sm:mb-4 uppercase tracking-widest relative z-10'>
            <span>Background Gen</span>
          </label>

          {/* Prompt Enhancement Buttons Row - Responsive: stack on mobile, row on sm+ */}
          <div className='flex flex-col xs:flex-row gap-2 sm:gap-3 mb-3 sm:mb-4'>
            {/* Enhance Prompt Button */}
            <button
              onClick={onEnhancePrompt}
              disabled={isEnhancing || !genPrompt.trim()}
              className={`flex-1 ${BTN_BASE} ${genPrompt.trim() ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/20' : 'bg-black/20 text-zinc-600 border border-white/5 cursor-not-allowed shadow-none'}`}
            >
              {isEnhancing ? (
                <>
                  <div className='w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                  <span>Enhancing...</span>
                </>
              ) : (
                <>
                  <span className='material-icons text-sm sm:text-base'>auto_fix_high</span>
                  <span>Prompt Enhance</span>
                </>
              )}
            </button>

            {/* Magic Prompt Button */}
            <button
              onClick={onMagicPrompt}
              disabled={isMagicPrompting || refImages.length === 0}
              className={`flex-1 ${BTN_BASE} ${refImages.length > 0 ? BTN_NEU_SOLID : 'bg-black/20 text-zinc-600 border border-white/5 cursor-not-allowed shadow-none'}`}
            >
              {isMagicPrompting ? (
                <>
                  <div className='w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span className='material-icons text-sm sm:text-base'>auto_awesome</span>
                  <span>Magic Prompt</span>
                </>
              )}
            </button>
          </div>

          <textarea
            className='w-full bg-zinc-900/50 border border-white/10 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 md:p-4 text-xs md:text-sm font-medium text-white focus:border-pink-500 focus:outline-none resize-none h-20 sm:h-24 md:h-32 mb-3 sm:mb-4 placeholder-zinc-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] transition-all relative z-10'
            placeholder={isCompact ? "Describe your vision..." : "Describe your vision (e.g., 'A futuristic city skyline in purple and teal')..."}
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
                  className='min-h-[44px] flex items-center text-[10px] sm:text-[11px] bg-pink-500/20 text-pink-300 border border-pink-500/30 px-3 py-2 rounded-lg hover:bg-pink-500/30 transition text-left cursor-pointer touch-manipulation active:scale-95'
                >
                  <span className='opacity-70 mr-1.5'>✨</span>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Quality Options - Collapsible on mobile */}
          {isMobile ? (
            <div className='mb-3 sm:mb-4 relative z-10'>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className='flex items-center justify-between w-full text-[9px] sm:text-[10px] text-zinc-500 font-black uppercase tracking-widest py-2 touch-manipulation'
              >
                <span className='flex items-center gap-1.5'>
                  <span className='material-icons text-xs'>tune</span>
                  Quality: {genSize}
                </span>
                <span className='material-icons text-xs transition-transform' style={{ transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  expand_more
                </span>
              </button>
              {showAdvanced && (
                <div className='flex bg-zinc-900 rounded-xl p-1 border border-white/5 shadow-inner mt-2'>
                  {(['1K', '2K', '4K'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setGenSize(s)}
                      className={`flex-1 text-[10px] sm:text-[11px] font-black min-h-[40px] rounded-lg transition-all touch-manipulation active:scale-95 ${genSize === s ? 'bg-zinc-700 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className='flex justify-between items-center mb-4 md:mb-6 relative z-10 gap-3'>
              <span className='text-[10px] sm:text-[11px] md:text-xs text-zinc-500 font-black uppercase tracking-widest shrink-0'>
                Quality
              </span>
              <div className='flex bg-zinc-900 rounded-xl p-1 border border-white/5 shadow-inner'>
                {(['1K', '2K', '4K'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setGenSize(s)}
                    className={`text-[10px] sm:text-[11px] md:text-xs font-black px-3 sm:px-4 md:px-5 min-h-[44px] rounded-lg transition-all touch-manipulation active:scale-95 ${genSize === s ? 'bg-zinc-700 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Generate button - Hidden on mobile (shown in sticky footer instead) */}
          {!isMobile && (
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
          )}
        </div>
      )}

      {/* Editing Card - Only show in edit mode */}
      {activeMode === 'edit' && (
        <div className='bg-black/40 p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-white/5 hover:border-yellow-500/30 transition-colors relative overflow-hidden group'>
          <div className='absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 blur-2xl rounded-full -mr-10 -mt-10 pointer-events-none'></div>

          <div className='flex items-center justify-between mb-3 sm:mb-4 relative z-10'>
            <label className='text-[9px] sm:text-[10px] font-black text-zinc-400 uppercase tracking-widest'>
              Magic Edit
            </label>
            <EnhanceButton
              prompt={editPrompt}
              onEnhanced={setEditPrompt}
              size="xs"
              variant="secondary"
              showLabel={true}
            />
          </div>

          <textarea
            className='w-full bg-zinc-900/50 border border-white/10 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 text-xs sm:text-sm font-medium text-white focus:border-yellow-500 focus:outline-none resize-none h-20 sm:h-24 mb-3 sm:mb-4 placeholder-zinc-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] relative z-10'
            placeholder={isCompact ? "Describe your edit..." : "E.g., 'Add a laptop to the desk', 'Make the lighting warmer'..."}
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
                  className='min-h-[44px] flex items-center text-[10px] sm:text-[11px] bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-3 py-2 rounded-lg hover:bg-yellow-500/30 transition text-left cursor-pointer touch-manipulation active:scale-95'
                >
                  <span className='opacity-70 mr-1.5'>🪄</span>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Edit button - Hidden on mobile (shown in sticky footer instead) */}
          {!isMobile && (
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
          )}
        </div>
      )}

      {/* Image Tools Panel - Only show in tools mode */}
      {activeMode === 'tools' && (
        <ImageToolsPanel />
      )}
    </div>
  );

  // Mobile expanded: Bottom sheet with optimized layout
  if (isMobile) {
    return (
      <div className='fixed inset-x-0 bottom-0 z-50 bg-zinc-900 rounded-t-3xl border-t border-white/10 shadow-2xl safe-area-bottom flex flex-col' style={{ maxHeight: '80vh' }}>
        {/* Drag handle indicator & Close Area - More compact */}
        <div className='flex items-center justify-between px-4 pt-3 pb-1 shrink-0'>
          <div className='w-8 h-8 opacity-0'></div> {/* Spacer */}
          <div className='w-10 h-1 bg-zinc-700 rounded-full'></div>
          <button
            onClick={() => setIsExpanded(false)}
            className='min-w-[40px] min-h-[40px] flex items-center justify-center bg-zinc-800 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-700 transition touch-manipulation'
          >
            <span className='material-icons text-base'>close</span>
          </button>
        </div>

        {/* Scrollable content area */}
        <div className='flex-1 overflow-y-auto px-3 sm:px-4 pb-4 scrollbar-hide'>
          {content}
        </div>

        {/* Sticky action button at bottom - only show primary action */}
        {activeMode === 'generate' && (
          <div className='shrink-0 px-3 sm:px-4 py-3 bg-zinc-900/95 backdrop-blur border-t border-white/5'>
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
                  Generate
                </>
              )}
            </button>
          </div>
        )}
        {activeMode === 'edit' && (
          <div className='shrink-0 px-3 sm:px-4 py-3 bg-zinc-900/95 backdrop-blur border-t border-white/5'>
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
        )}
      </div>
    );
  }

  // Desktop expanded: Sidebar
  return (
    <div className='w-full md:w-[320px] lg:w-[400px] bg-zinc-900 border-l border-white/5 p-4 lg:p-6 flex flex-col gap-6 overflow-y-auto shrink-0 z-20 shadow-2xl relative scrollbar-styled'>
      {content}
    </div>
  );
};

// Wrap with memo for performance optimization
const GenerativeSidebar = memo(GenerativeSidebarComponent);

export default GenerativeSidebar;
