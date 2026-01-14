import React, { useState, useEffect, useCallback, memo, useRef, useLayoutEffect } from 'react';
import { useSpring } from '../../hooks/useSpring';
import { useToast } from '../../hooks/useToast';
import { api } from '../../services/api';
import { PromptLibrary } from './PromptLibrary';
import {
  BTN_BASE,
  BTN_NEU_SOLID,
  BTN_PINK_GLASS,
  BTN_PINK_ACTIVE,
  DROPDOWN_PANEL,
} from '../../styles';
import { getDropdownAria, getOptionAria, getListboxAria } from '../../utils/a11y';
import { ImageToolsPanel } from './ImageToolsPanel';
import { EnhanceButton } from '../ui/EnhanceButton';
import { usePromptEnhance } from '../../hooks/usePromptEnhance';
import type { PromptEnhanceContext } from '../../services/llm-types';
import { useDropdownKeyboard } from '../../hooks/useDropdownKeyboard';
import { formatTooltip } from '../../utils/stringUtils';
import { useIsMobile } from '../../hooks/useBreakpoint';
import { useMediaQuery } from '../../hooks/useMediaQuery';

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
  onEnhancePrompt: _onEnhancePrompt,
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
  const isMobile = useIsMobile();
  const isCompact = useMediaQuery('(max-width: 399px)'); // Extra compact for small phones
  const [selectedModelId, setSelectedModelId] = useState(() => {
    return localStorage.getItem('nanobanna-image-model') || 'gemini-3-pro';
  });
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false); // Collapsible advanced options
  const [activeMode, setActiveMode] = useState<SidebarMode>(() => {
    return (localStorage.getItem('nanobanna-sidebar-mode') as SidebarMode) || 'generate';
  });
  const [showPromptLibrary, setShowPromptLibrary] = useState(false);
  const [isSavingPrompt, setIsSavingPrompt] = useState(false);
  const toast = useToast();

  const handleSavePrompt = useCallback(async () => {
    if (!genPrompt.trim()) return;
    setIsSavingPrompt(true);
    try {
      await api.post('/api/prompts', {
        prompt: genPrompt,
        title: genPrompt.substring(0, 20) + '...',
        category: 'general',
      });
      toast.info('✓ PROMPT SAVED TO LIBRARY');
    } catch {
      toast.error('Failed to save prompt');
    } finally {
      setIsSavingPrompt(false);
    }
  }, [genPrompt, toast]);

  // Save mode selection to localStorage
  useEffect(() => {
    localStorage.setItem('nanobanna-sidebar-mode', activeMode);
  }, [activeMode]);

  const { focusedIndex, handleKeyDown, menuRef, buttonRef, itemRefs } = useDropdownKeyboard(
    showModelDropdown,
    setShowModelDropdown,
    IMAGE_MODELS.length,
    (index) => {
      setSelectedModelId(IMAGE_MODELS[index].id);
      setShowModelDropdown(false);
    },
  );

  const setItemRef = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      itemRefs.current[index] = el;
    },
    [itemRefs],
  );

  // Get selected model details
  const selectedModel = IMAGE_MODELS.find((m) => m.id === selectedModelId) || IMAGE_MODELS[0];

  // Derive target model for prompt enhancement context
  const targetModel = React.useMemo<PromptEnhanceContext['targetModel']>(() => {
    if (selectedModelId.includes('flux')) return 'flux';
    if (selectedModelId.includes('ideogram')) return 'ideogram';
    if (selectedModelId.includes('sd3')) return 'sd3';
    return 'imagen-3'; // Default to Nano Banana Pro (Gemini/Imagen)
  }, [selectedModelId]);

  // Use the enhancement hook
  const { enhance, isEnhancing: isLocalEnhancing } = usePromptEnhance();

  const handleEnhanceClick = async () => {
    if (!genPrompt.trim()) return;

    const result = await enhance(genPrompt, {
      targetModel,
      // We could add other context here like style/industry if available in UI
    });

    if (result) {
      setGenPrompt(result);
      toast.success('Prompt optimized for ' + selectedModel.name);
    }
  };

  // Save model selection to localStorage
  useEffect(() => {
    localStorage.setItem('nanobanna-image-model', selectedModelId);
  }, [selectedModelId]);

  // isMobile and isCompact now provided by useIsMobile and useMediaQuery hooks

  // Swipe to dismiss logic
  const {
    value: sheetOffsetY,
    set: setSheetOffsetY,
    setImmediate: setSheetImmediate,
  } = useSpring(0, 'snappy');
  const dragStartY = useRef<number | null>(null);
  const dragStartTime = useRef<number>(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Apply spring animation via ref to avoid inline style lint errors
  useLayoutEffect(() => {
    if (sheetRef.current) {
      sheetRef.current.style.setProperty('--sheet-offset-y', `${sheetOffsetY}px`);
    }
  }, [sheetOffsetY]);

  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    dragStartTime.current = performance.now();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - dragStartY.current;

    // Only allow dragging down
    if (diff > 0) {
      setSheetImmediate(diff);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (dragStartY.current === null) return;

    const currentY = e.changedTouches[0].clientY;
    const diff = currentY - dragStartY.current;
    const time = performance.now() - dragStartTime.current;
    const velocity = diff / time;

    // Thresholds: >100px distance OR >0.5px/ms velocity
    if (diff > 100 || (diff > 50 && velocity > 0.5)) {
      setIsExpanded(false);
      setSheetImmediate(0);
    } else {
      setSheetOffsetY(0); // Snap back
    }

    dragStartY.current = null;
  };

  // Mobile collapsed: FAB button
  if (!isExpanded && isMobile) {
    return (
      <button
        type='button'
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
          type='button'
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
              ref={buttonRef}
              type='button'
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              onKeyDown={handleKeyDown}
              {...getDropdownAria(showModelDropdown, 'model-selector-listbox', 'Select AI Model')}
              className={`min-h-[44px] rounded-full font-black uppercase flex items-center touch-manipulation active:scale-95 transition-all ${BTN_PINK_GLASS} ${
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
              <div
                id='model-selector-listbox'
                ref={menuRef}
                {...getListboxAria('AI Models')}
                className={DROPDOWN_PANEL}
              >
                {IMAGE_MODELS.map((model, index) => (
                  <div
                    key={model.id}
                    ref={setItemRef(index)}
                    {...getOptionAria(selectedModelId === model.id)}
                    tabIndex={focusedIndex === index ? 0 : -1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedModelId(model.id);
                        setShowModelDropdown(false);
                      }
                      handleKeyDown(e);
                    }}
                    onClick={() => {
                      setSelectedModelId(model.id);
                      setShowModelDropdown(false);
                    }}
                    className={`w-full px-3 py-2.5 text-left transition flex items-center gap-2 ${
                      selectedModelId === model.id
                        ? `${BTN_PINK_ACTIVE} border-l-2 border-l-pink-500`
                        : 'hover:bg-white/5'
                    } ${focusedIndex === index ? 'bg-white/5 ring-1 ring-inset ring-pink-500/50' : ''}`}
                  >
                    <span className='material-icons text-sm text-pink-400'>{model.icon}</span>
                    <div className='flex-1 min-w-0'>
                      <div className='text-[11px] font-bold text-white truncate'>{model.name}</div>
                      <div className='text-[9px] text-zinc-500'>{model.description}</div>
                    </div>
                    {selectedModelId === model.id && (
                      <span className='material-icons text-sm text-pink-500'>check</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            type='button'
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
          type='button'
          onClick={() => setActiveMode('generate')}
          className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 min-h-[44px] px-1.5 sm:px-3 md:px-4 rounded-xl text-[9px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-wide sm:tracking-wider transition-all touch-manipulation active:scale-95 ${
            activeMode === 'generate'
              ? 'bg-gradient-to-br from-pink-600 to-pink-700 text-white shadow-lg shadow-pink-500/30'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
          title={formatTooltip('Generate', 'Ctrl+Enter')}
        >
          <span className='material-icons text-base sm:text-lg'>draw</span>
          <span className={isCompact ? 'hidden' : 'hidden xs:inline'}>Generate</span>
          <span className={isCompact ? 'hidden' : 'xs:hidden'}>Gen</span>
        </button>
        <button
          type='button'
          onClick={() => setActiveMode('edit')}
          className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-1.5 min-h-[44px] px-1.5 sm:px-3 md:px-4 rounded-xl text-[9px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-wide sm:tracking-wider transition-all touch-manipulation active:scale-[0.98] ${
            activeMode === 'edit'
              ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/30'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
          title='Edit'
        >
          <span className='material-icons text-base sm:text-lg'>auto_fix_normal</span>
          <span className={isCompact ? 'hidden' : ''}>Edit</span>
        </button>
        <button
          type='button'
          onClick={() => setActiveMode('tools')}
          className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 min-h-[44px] px-1.5 sm:px-3 md:px-4 rounded-xl text-[9px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-wide sm:tracking-wider transition-all touch-manipulation active:scale-95 ${
            activeMode === 'tools'
              ? 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white shadow-lg shadow-cyan-500/30'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
          title='Tools'
        >
          <span className='material-icons text-base sm:text-lg'>tune</span>
          <span className={isCompact ? 'hidden' : ''}>Tools</span>
        </button>
      </div>

      {/* Generation Card - Only show in generate mode */}
      {activeMode === 'generate' && (
        <div className='bg-black/40 p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-white/5 hover:border-pink-500/30 transition-colors group relative overflow-hidden flex flex-col'>
          <div className='absolute top-0 right-0 w-24 h-24 bg-pink-500/10 blur-2xl rounded-full -mr-10 -mt-10 pointer-events-none'></div>

          <div className='flex justify-between items-center mb-3 sm:mb-4 relative z-10'>
            <div className='flex items-baseline gap-2'>
              <label className='text-[9px] sm:text-[10px] font-black text-zinc-400 uppercase tracking-widest'>
                Background Gen
              </label>
              {genPrompt.length > 0 && (
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                    genPrompt.length < 15
                      ? 'text-yellow-500'
                      : genPrompt.length < 350
                        ? 'text-emerald-500'
                        : 'text-yellow-500'
                  }`}
                >
                  {genPrompt.length} chars
                </span>
              )}
            </div>
            <button
              type='button'
              onClick={() => setShowPromptLibrary(!showPromptLibrary)}
              className={`text-zinc-500 hover:text-purple-400 transition flex items-center gap-1 ${showPromptLibrary ? 'text-purple-400' : ''}`}
              title='Prompt Library'
            >
              <span className='material-icons text-sm'>auto_stories</span>
              <span className='text-[9px] font-bold uppercase'>Library</span>
            </button>
          </div>

          {showPromptLibrary ? (
            <div className='h-[350px] relative z-10'>
              <PromptLibrary
                onSelect={(p) => {
                  setGenPrompt(p);
                  setShowPromptLibrary(false);
                }}
                onClose={() => setShowPromptLibrary(false)}
              />
            </div>
          ) : (
            <>
              {/* Prompt Enhancement Buttons Row - Responsive: stack on mobile, row on sm+ */}
              <div className='flex flex-col xs:flex-row gap-2 sm:gap-3 mb-3 sm:mb-4 relative z-10'>
                {/* Enhance Prompt Button */}
                <button
                  type='button'
                  onClick={handleEnhanceClick}
                  disabled={isEnhancing || !genPrompt.trim()}
                  className={`flex-1 ${BTN_BASE} ${genPrompt.trim() ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/20' : 'bg-black/20 text-zinc-600 border border-white/5 cursor-not-allowed shadow-none'}`}
                >
                  {isEnhancing || isLocalEnhancing ? (
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
                  type='button'
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

              {/* Reference Images Preview */}
              {refImages.length > 0 && (
                <div className='mb-3 sm:mb-4 relative z-10'>
                  <div className='flex items-center justify-between mb-1.5'>
                    <label className='text-[9px] sm:text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5'>
                      <span className='material-icons text-purple-400 text-xs'>collections</span>
                      Reference Context
                    </label>
                    <span className='text-[9px] font-bold text-zinc-500 bg-zinc-900 border border-white/10 px-1.5 py-0.5 rounded'>
                      {refImages.length} Active
                    </span>
                  </div>
                  <div className='grid grid-cols-4 gap-2 bg-black/20 p-2 rounded-xl border border-white/5'>
                    {refImages.map((img, i) => (
                      <div
                        key={i}
                        className='aspect-square rounded-lg overflow-hidden border border-white/10 relative group bg-zinc-900 cursor-help shadow-sm hover:border-purple-500/50 transition-colors'
                        title='Reference image used for generation'
                      >
                        <img
                          src={img}
                          alt={`Reference ${i + 1}`}
                          className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
                        />
                        <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-1'>
                          <div className='w-1.5 h-1.5 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.8)] mb-1'></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className='relative z-10'>
                <textarea
                  className='w-full bg-zinc-900/50 border border-white/10 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 md:p-4 text-xs md:text-sm font-medium text-white focus:border-pink-500 focus-ring resize-none h-20 sm:h-24 md:h-32 mb-3 sm:mb-4 placeholder-zinc-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] transition-all'
                  placeholder={
                    isCompact
                      ? 'Describe your vision...'
                      : "Describe your vision (e.g., 'A futuristic city skyline in purple and teal')..."
                  }
                  value={genPrompt}
                  onChange={(e) => setGenPrompt(e.target.value)}
                />

                {/* Save Prompt Button Overlay */}
                {genPrompt.trim() && (
                  <button
                    type='button'
                    onClick={handleSavePrompt}
                    disabled={isSavingPrompt}
                    className='absolute bottom-6 right-2 p-2 text-zinc-500 hover:text-pink-400 transition bg-black/40 rounded-lg backdrop-blur-sm'
                    title='Save to Library'
                  >
                    <span
                      className={`material-icons text-sm ${isSavingPrompt ? 'animate-spin' : ''}`}
                    >
                      {isSavingPrompt ? 'sync' : 'bookmark_add'}
                    </span>
                  </button>
                )}
              </div>
            </>
          )}

          {/* Generation Suggestions */}
          {generationSuggestions.length > 0 && (
            <div className='flex flex-wrap gap-2 mb-4 relative z-10'>
              {generationSuggestions.map((s, i) => (
                <button
                  key={i}
                  type='button'
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
                type='button'
                onClick={() => setShowAdvanced(!showAdvanced)}
                className='flex items-center justify-between w-full text-[9px] sm:text-[10px] text-zinc-500 font-black uppercase tracking-widest py-2 touch-manipulation'
              >
                <span className='flex items-center gap-1.5'>
                  <span className='material-icons text-xs'>tune</span>
                  Quality: {genSize}
                </span>
                <span
                  className={`material-icons text-xs transition-transform ${showAdvanced ? 'rotate-180' : 'rotate-0'}`}
                >
                  expand_more
                </span>
              </button>
              {showAdvanced && (
                <div className='flex bg-zinc-900 rounded-xl p-1 border border-white/5 shadow-inner mt-2'>
                  {(['1K', '2K', '4K'] as const).map((s) => (
                    <button
                      key={s}
                      type='button'
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
                    type='button'
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
              type='button'
              onClick={() => onGenerate()}
              disabled={isGenerating}
              title={formatTooltip('Generate Background', 'Ctrl+Enter')}
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
            <div className='flex items-baseline gap-2'>
              <label className='text-[9px] sm:text-[10px] font-black text-zinc-400 uppercase tracking-widest'>
                Magic Edit
              </label>
              {editPrompt.length > 0 && (
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                    editPrompt.length < 15
                      ? 'text-yellow-500'
                      : editPrompt.length < 350
                        ? 'text-emerald-500'
                        : 'text-yellow-500'
                  }`}
                >
                  {editPrompt.length} chars
                </span>
              )}
            </div>
            <EnhanceButton
              prompt={editPrompt}
              onEnhanced={setEditPrompt}
              context={{ targetModel }}
              size='xs'
              variant='secondary'
              showLabel={true}
            />
          </div>

          <textarea
            className='w-full bg-zinc-900/50 border border-white/10 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 text-xs sm:text-sm font-medium text-white focus:border-yellow-500 focus-ring resize-none h-20 sm:h-24 mb-3 sm:mb-4 placeholder-zinc-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] relative z-10'
            placeholder={
              isCompact
                ? 'Describe your edit...'
                : "E.g., 'Add a laptop to the desk', 'Make the lighting warmer'..."
            }
            value={editPrompt}
            onChange={(e) => setEditPrompt(e.target.value)}
          />

          {/* Magic Edit Suggestions */}
          {magicEditSuggestions.length > 0 && (
            <div className='flex flex-wrap gap-2 mb-4 relative z-10'>
              {magicEditSuggestions.map((s, i) => (
                <button
                  key={i}
                  type='button'
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
              type='button'
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
      {activeMode === 'tools' && <ImageToolsPanel />}
    </div>
  );

  // Mobile expanded: Bottom sheet with optimized layout
  if (isMobile) {
    return (
      <div
        ref={sheetRef}
        className='fixed inset-x-0 bottom-0 z-50 bg-stone-900 rounded-t-3xl border-t border-white/10 shadow-2xl safe-area-bottom flex flex-col max-h-[80vh] transition-transform will-change-transform translate-y-[var(--sheet-offset-y)]'
      >
        {/* Drag handle indicator & Close Area - More compact */}
        <div
          className='flex items-center justify-between px-4 pt-3 pb-1 shrink-0 touch-none cursor-grab active:cursor-grabbing'
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className='w-8 h-8 opacity-0'></div> {/* Spacer */}
          <div className='w-10 h-1 bg-zinc-700 rounded-full'></div>
          <button
            type='button'
            onClick={() => setIsExpanded(false)}
            className='min-w-[40px] min-h-[40px] flex items-center justify-center bg-zinc-800 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-700 transition touch-manipulation'
          >
            <span className='material-icons text-base'>close</span>
          </button>
        </div>

        {/* Scrollable content area */}
        <div className='flex-1 overflow-y-auto px-3 sm:px-4 pb-4 scrollbar-hide'>{content}</div>

        {/* Sticky action button at bottom - only show primary action */}
        {activeMode === 'generate' && (
          <div className='shrink-0 px-3 sm:px-4 py-3 bg-zinc-900/95 backdrop-blur border-t border-white/5'>
            <button
              type='button'
              onClick={() => onGenerate()}
              disabled={isGenerating}
              title={formatTooltip('Generate', 'Ctrl+Enter')}
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
              type='button'
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
