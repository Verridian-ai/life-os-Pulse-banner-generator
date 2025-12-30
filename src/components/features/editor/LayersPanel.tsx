import React, { useState } from 'react';
import { useCanvas } from '../../../context/CanvasContext';
import { BTN_NEU_SOLID } from '../../../styles';
import { FONT_OPTIONS_CATEGORIZED, FONT_CATEGORY_LABELS, FontCategory } from '../../../constants';

const FONT_WEIGHTS = [
  { value: '300', label: 'Light' },
  { value: '400', label: 'Regular' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'SemiBold' },
  { value: '700', label: 'Bold' },
  { value: '800', label: 'ExtraBold' },
  { value: '900', label: 'Black' },
];

// Group fonts by category for dropdown
const groupedFonts = FONT_OPTIONS_CATEGORIZED.reduce(
  (acc, font) => {
    if (!acc[font.category]) acc[font.category] = [];
    acc[font.category].push(font.name);
    return acc;
  },
  {} as Record<FontCategory, string[]>,
);

const LayersPanel: React.FC = () => {
  const {
    elements,
    selectedElementId,
    setSelectedElementId,
    addElement,
    updateElement,
    deleteElement,
    centerElement,
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack,
  } = useCanvas();

  // Expanded sections state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    typography: true,
    effects: false,
    shadow: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleAddText = () => {
    addElement({
      id: Date.now().toString(),
      type: 'text',
      content: 'NEW TEXT',
      x: 100,
      y: 100,
      fontSize: 60,
      fontWeight: '900',
      fontFamily: 'Inter',
      color: '#ffffff',
      textAlign: 'left',
      rotation: 0,
      opacity: 100,
      letterSpacing: 0,
      lineHeight: 1.2,
      fontStyle: 'normal',
      textTransform: 'none',
      textDecoration: 'none',
    });
  };

  return (
    <div className='bg-zinc-900/40 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-xl flex flex-col relative group'>
      <div className='absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition duration-500'></div>

      <div className='flex items-center justify-between mb-6 relative z-10'>
        <h3 className='font-black text-sm uppercase tracking-wider text-white flex items-center gap-2 drop-shadow-sm'>
          <span className='material-icons text-purple-400'>layers</span>
          Layers
        </h3>
        <button
          type='button'
          onClick={handleAddText}
          className={`min-h-[44px] h-11 px-4 text-[9px] sm:text-[10px] md:text-xs rounded-full ${BTN_NEU_SOLID}`}
        >
          + Add Text
        </button>
      </div>
      <div className='space-y-3 max-h-[350px] overflow-y-auto pr-2 relative z-10 scrollbar-hide'>
        {elements.map((el) => (
          <div
            key={el.id}
            onClick={(e) => {
              if (
                (e.target as HTMLElement).tagName !== 'INPUT' &&
                (e.target as HTMLElement).tagName !== 'SELECT' &&
                (e.target as HTMLElement).tagName !== 'BUTTON'
              ) {
                setSelectedElementId(el.id);
              }
            }}
            className={`bg-black/40 p-4 rounded-2xl border transition-all cursor-pointer ${selectedElementId === el.id ? 'border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.1)]' : 'border-white/5 hover:border-white/20'}`}
          >
            <div className='flex gap-3 items-center mb-3'>
              <span className='material-icons text-zinc-600 text-xs cursor-move'>
                drag_indicator
              </span>
              {el.type === 'image' ? (
                <div className='flex-1 flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-wide'>
                  <span className='material-icons text-sm text-blue-400'>image</span>
                  Image Layer
                </div>
              ) : (
                <input
                  value={el.content}
                  onChange={(e) => updateElement(el.id, { content: e.target.value })}
                  onFocus={() => setSelectedElementId(el.id)}
                  className='bg-transparent text-sm font-bold uppercase w-full outline-none text-white placeholder-zinc-600'
                  placeholder='ENTER TEXT...'
                />
              )}
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation();
                  deleteElement(el.id);
                }}
                className='text-zinc-600 hover:text-red-500 transition'
              >
                <span className='material-icons text-sm'>close</span>
              </button>
            </div>
            {selectedElementId === el.id && el.type === 'text' && (
              <div className='space-y-3 pt-3 border-t border-white/5'>
                {/* Format Toolbar */}
                <div className='flex gap-1 bg-white/5 rounded-lg p-1'>
                  <button
                    type='button'
                    onClick={() => updateElement(el.id, { fontWeight: el.fontWeight === '700' ? '400' : '700' })}
                    className={`flex-1 py-1.5 rounded-md transition-all flex items-center justify-center text-[11px] font-black ${
                      el.fontWeight === '700' || el.fontWeight === '800' || el.fontWeight === '900'
                        ? 'bg-purple-600 text-white'
                        : 'text-zinc-400 hover:text-white hover:bg-white/10'
                    }`}
                    title='Bold'
                  >
                    B
                  </button>
                  <button
                    type='button'
                    onClick={() => updateElement(el.id, { fontStyle: el.fontStyle === 'italic' ? 'normal' : 'italic' })}
                    className={`flex-1 py-1.5 rounded-md transition-all flex items-center justify-center text-[11px] italic ${
                      el.fontStyle === 'italic'
                        ? 'bg-purple-600 text-white'
                        : 'text-zinc-400 hover:text-white hover:bg-white/10'
                    }`}
                    title='Italic'
                  >
                    I
                  </button>
                  <button
                    type='button'
                    onClick={() => updateElement(el.id, { textDecoration: el.textDecoration === 'underline' ? 'none' : 'underline' })}
                    className={`flex-1 py-1.5 rounded-md transition-all flex items-center justify-center text-[11px] underline ${
                      el.textDecoration?.includes('underline')
                        ? 'bg-purple-600 text-white'
                        : 'text-zinc-400 hover:text-white hover:bg-white/10'
                    }`}
                    title='Underline'
                  >
                    U
                  </button>
                  <button
                    type='button'
                    onClick={() => updateElement(el.id, { textDecoration: el.textDecoration === 'line-through' ? 'none' : 'line-through' })}
                    className={`flex-1 py-1.5 rounded-md transition-all flex items-center justify-center text-[11px] line-through ${
                      el.textDecoration?.includes('line-through')
                        ? 'bg-purple-600 text-white'
                        : 'text-zinc-400 hover:text-white hover:bg-white/10'
                    }`}
                    title='Strikethrough'
                  >
                    S
                  </button>
                  <div className='w-px bg-white/10 mx-1'></div>
                  <button
                    type='button'
                    onClick={() => updateElement(el.id, { textTransform: 'uppercase' })}
                    className={`flex-1 py-1.5 rounded-md transition-all flex items-center justify-center text-[9px] font-bold ${
                      el.textTransform === 'uppercase'
                        ? 'bg-purple-600 text-white'
                        : 'text-zinc-400 hover:text-white hover:bg-white/10'
                    }`}
                    title='Uppercase'
                  >
                    AA
                  </button>
                  <button
                    type='button'
                    onClick={() => updateElement(el.id, { textTransform: 'capitalize' })}
                    className={`flex-1 py-1.5 rounded-md transition-all flex items-center justify-center text-[9px] font-bold ${
                      el.textTransform === 'capitalize'
                        ? 'bg-purple-600 text-white'
                        : 'text-zinc-400 hover:text-white hover:bg-white/10'
                    }`}
                    title='Capitalize'
                  >
                    Aa
                  </button>
                  <button
                    type='button'
                    onClick={() => updateElement(el.id, { textTransform: 'none' })}
                    className={`flex-1 py-1.5 rounded-md transition-all flex items-center justify-center text-[9px] font-bold ${
                      !el.textTransform || el.textTransform === 'none'
                        ? 'bg-purple-600 text-white'
                        : 'text-zinc-400 hover:text-white hover:bg-white/10'
                    }`}
                    title='Normal'
                  >
                    ab
                  </button>
                </div>

                {/* Typography Section */}
                <div className='bg-white/5 rounded-lg overflow-hidden'>
                  <button
                    type='button'
                    onClick={() => toggleSection('typography')}
                    className='w-full flex items-center justify-between px-2 py-1.5 hover:bg-white/5 transition'
                  >
                    <span className='text-[9px] font-bold text-zinc-400 uppercase tracking-wider'>Typography</span>
                    <span className='material-icons text-sm text-zinc-500'>
                      {expandedSections.typography ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>
                  {expandedSections.typography && (
                    <div className='p-2 pt-0 space-y-2'>
                      {/* Font Family - Grouped */}
                      <select
                        value={el.fontFamily || 'Inter'}
                        onChange={(e) => updateElement(el.id, { fontFamily: e.target.value })}
                        title='Font Family'
                        style={{ fontFamily: el.fontFamily || 'Inter' }}
                        className='w-full bg-zinc-800 text-[10px] font-bold text-zinc-300 rounded-lg px-2 py-1.5 focus:outline-none appearance-none cursor-pointer border border-white/10'
                      >
                        {(Object.keys(groupedFonts) as FontCategory[]).map((category) => (
                          <optgroup key={category} label={FONT_CATEGORY_LABELS[category]}>
                            {groupedFonts[category].map((font) => (
                              <option key={font} value={font} style={{ fontFamily: font }}>
                                {font}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>

                      <div className='grid grid-cols-2 gap-2'>
                        {/* Font Weight */}
                        <select
                          value={el.fontWeight || '700'}
                          onChange={(e) => updateElement(el.id, { fontWeight: e.target.value })}
                          title='Font Weight'
                          className='bg-zinc-800 text-[10px] font-bold text-zinc-300 rounded-lg px-2 py-1.5 focus:outline-none appearance-none cursor-pointer border border-white/10'
                        >
                          {FONT_WEIGHTS.map((weight) => (
                            <option key={weight.value} value={weight.value}>
                              {weight.label}
                            </option>
                          ))}
                        </select>

                        {/* Font Size */}
                        <div className='flex items-center gap-1 bg-zinc-800 rounded-lg px-2 border border-white/10'>
                          <span className='material-icons text-zinc-500 text-[12px]'>format_size</span>
                          <input
                            type='number'
                            min='8'
                            max='200'
                            title='Font Size'
                            value={el.fontSize || 60}
                            onChange={(e) => updateElement(el.id, { fontSize: Math.max(8, parseInt(e.target.value) || 60) })}
                            className='w-full bg-transparent text-[10px] font-bold text-zinc-300 py-1.5 text-center focus:outline-none'
                          />
                          <span className='text-[8px] text-zinc-600'>px</span>
                        </div>
                      </div>

                      {/* Letter Spacing & Line Height */}
                      <div className='grid grid-cols-2 gap-2'>
                        <div>
                          <label className='text-[8px] text-zinc-500 uppercase block mb-1'>Letter Spacing</label>
                          <div className='flex items-center gap-1 bg-zinc-800 rounded-lg px-2 border border-white/10'>
                            <input
                              type='range'
                              min='-10'
                              max='50'
                              value={el.letterSpacing || 0}
                              onChange={(e) => updateElement(el.id, { letterSpacing: parseInt(e.target.value) })}
                              className='flex-1 h-1 accent-purple-500'
                            />
                            <span className='text-[9px] text-zinc-400 w-6 text-right'>{el.letterSpacing || 0}</span>
                          </div>
                        </div>
                        <div>
                          <label className='text-[8px] text-zinc-500 uppercase block mb-1'>Line Height</label>
                          <div className='flex items-center gap-1 bg-zinc-800 rounded-lg px-2 border border-white/10'>
                            <input
                              type='range'
                              min='0.8'
                              max='3'
                              step='0.1'
                              value={el.lineHeight || 1.2}
                              onChange={(e) => updateElement(el.id, { lineHeight: parseFloat(e.target.value) })}
                              className='flex-1 h-1 accent-purple-500'
                            />
                            <span className='text-[9px] text-zinc-400 w-6 text-right'>{(el.lineHeight || 1.2).toFixed(1)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Color & Opacity */}
                      <div className='flex gap-2'>
                        <div className='flex items-center gap-2 flex-1'>
                          <input
                            type='color'
                            value={el.color || '#ffffff'}
                            onChange={(e) => updateElement(el.id, { color: e.target.value })}
                            className='w-8 h-8 rounded cursor-pointer bg-transparent border-0'
                            title='Text Color'
                          />
                          <span className='text-[8px] text-zinc-500 uppercase'>Color</span>
                        </div>
                        <div className='flex-1'>
                          <label className='text-[8px] text-zinc-500 uppercase block mb-1'>Opacity</label>
                          <div className='flex items-center gap-1 bg-zinc-800 rounded-lg px-2 border border-white/10'>
                            <input
                              type='range'
                              min='0'
                              max='100'
                              value={el.opacity ?? 100}
                              onChange={(e) => updateElement(el.id, { opacity: parseInt(e.target.value) })}
                              className='flex-1 h-1 accent-purple-500'
                            />
                            <span className='text-[9px] text-zinc-400 w-8 text-right'>{el.opacity ?? 100}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Text Alignment */}
                      <div className='flex bg-zinc-800 rounded-lg p-0.5 border border-white/10'>
                        {(['left', 'center', 'right'] as const).map((align) => (
                          <button
                            type='button'
                            key={align}
                            onClick={() => updateElement(el.id, { textAlign: align })}
                            className={`flex-1 py-1.5 rounded-md transition-all flex items-center justify-center ${
                              (el.textAlign || 'left') === align
                                ? 'bg-purple-600 text-white'
                                : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            <span className='material-icons text-[14px]'>format_align_{align}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Effects Section (Stroke & Background) */}
                <div className='bg-white/5 rounded-lg overflow-hidden'>
                  <button
                    type='button'
                    onClick={() => toggleSection('effects')}
                    className='w-full flex items-center justify-between px-2 py-1.5 hover:bg-white/5 transition'
                  >
                    <span className='text-[9px] font-bold text-zinc-400 uppercase tracking-wider'>Stroke & Background</span>
                    <span className='material-icons text-sm text-zinc-500'>
                      {expandedSections.effects ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>
                  {expandedSections.effects && (
                    <div className='p-2 pt-0 space-y-2'>
                      {/* Text Stroke */}
                      <div className='flex items-center gap-2'>
                        <input
                          type='color'
                          value={el.textStrokeColor || '#000000'}
                          onChange={(e) => updateElement(el.id, { textStrokeColor: e.target.value })}
                          className='w-6 h-6 rounded cursor-pointer bg-transparent'
                          title='Stroke Color'
                        />
                        <span className='text-[8px] text-zinc-500 uppercase'>Stroke</span>
                        <div className='flex-1 flex items-center gap-1 bg-zinc-800 rounded-lg px-2 border border-white/10'>
                          <input
                            type='range'
                            min='0'
                            max='20'
                            value={el.textStrokeWidth || 0}
                            onChange={(e) => updateElement(el.id, { textStrokeWidth: parseInt(e.target.value) })}
                            className='flex-1 h-1 accent-purple-500'
                          />
                          <span className='text-[9px] text-zinc-400 w-6 text-right'>{el.textStrokeWidth || 0}px</span>
                        </div>
                      </div>

                      {/* Text Background */}
                      <div className='flex items-center gap-2'>
                        <input
                          type='color'
                          value={el.backgroundColor || '#00000000'}
                          onChange={(e) => updateElement(el.id, { backgroundColor: e.target.value })}
                          className='w-6 h-6 rounded cursor-pointer bg-transparent'
                          title='Background Color'
                        />
                        <span className='text-[8px] text-zinc-500 uppercase'>BG</span>
                        <div className='flex-1 flex items-center gap-1 bg-zinc-800 rounded-lg px-2 border border-white/10'>
                          <span className='text-[8px] text-zinc-500'>Pad</span>
                          <input
                            type='range'
                            min='0'
                            max='20'
                            value={el.backgroundPadding || 0}
                            onChange={(e) => updateElement(el.id, { backgroundPadding: parseInt(e.target.value) })}
                            className='flex-1 h-1 accent-purple-500'
                          />
                          <span className='text-[9px] text-zinc-400 w-6 text-right'>{el.backgroundPadding || 0}px</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Shadow Section */}
                <div className='bg-white/5 rounded-lg overflow-hidden'>
                  <button
                    type='button'
                    onClick={() => toggleSection('shadow')}
                    className='w-full flex items-center justify-between px-2 py-1.5 hover:bg-white/5 transition'
                  >
                    <span className='text-[9px] font-bold text-zinc-400 uppercase tracking-wider'>Text Shadow</span>
                    <span className='material-icons text-sm text-zinc-500'>
                      {expandedSections.shadow ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>
                  {expandedSections.shadow && (
                    <div className='p-2 pt-0 space-y-2'>
                      <div className='flex items-center gap-2'>
                        <input
                          type='color'
                          value={el.textShadowColor || '#000000'}
                          onChange={(e) => updateElement(el.id, { textShadowColor: e.target.value })}
                          className='w-6 h-6 rounded cursor-pointer bg-transparent'
                          title='Shadow Color'
                        />
                        <span className='text-[8px] text-zinc-500 uppercase'>Color</span>
                        <div className='flex-1 flex items-center gap-1 bg-zinc-800 rounded-lg px-2 border border-white/10'>
                          <span className='text-[8px] text-zinc-500'>Blur</span>
                          <input
                            type='range'
                            min='0'
                            max='50'
                            value={el.textShadowBlur || 0}
                            onChange={(e) => updateElement(el.id, { textShadowBlur: parseInt(e.target.value) })}
                            className='flex-1 h-1 accent-purple-500'
                          />
                          <span className='text-[9px] text-zinc-400 w-6 text-right'>{el.textShadowBlur || 0}</span>
                        </div>
                      </div>
                      <div className='grid grid-cols-2 gap-2'>
                        <div>
                          <label className='text-[8px] text-zinc-500 uppercase block mb-1'>Offset X</label>
                          <div className='flex items-center gap-1 bg-zinc-800 rounded-lg px-2 border border-white/10'>
                            <input
                              type='range'
                              min='-50'
                              max='50'
                              value={el.textShadowOffsetX || 0}
                              onChange={(e) => updateElement(el.id, { textShadowOffsetX: parseInt(e.target.value) })}
                              className='flex-1 h-1 accent-purple-500'
                            />
                            <span className='text-[9px] text-zinc-400 w-8 text-right'>{el.textShadowOffsetX || 0}px</span>
                          </div>
                        </div>
                        <div>
                          <label className='text-[8px] text-zinc-500 uppercase block mb-1'>Offset Y</label>
                          <div className='flex items-center gap-1 bg-zinc-800 rounded-lg px-2 border border-white/10'>
                            <input
                              type='range'
                              min='-50'
                              max='50'
                              value={el.textShadowOffsetY || 0}
                              onChange={(e) => updateElement(el.id, { textShadowOffsetY: parseInt(e.target.value) })}
                              className='flex-1 h-1 accent-purple-500'
                            />
                            <span className='text-[9px] text-zinc-400 w-8 text-right'>{el.textShadowOffsetY || 0}px</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Position & Layer Controls */}
                <div className='grid grid-cols-2 gap-2'>
                  <div className='flex items-center justify-between bg-white/5 rounded-lg px-2 py-1'>
                    <span className='text-[8px] font-bold text-zinc-500 uppercase'>Center</span>
                    <div className='flex gap-1'>
                      <button
                        type='button'
                        onClick={() => centerElement(el.id, 'horizontal')}
                        className='p-1 hover:text-white text-zinc-400 transition'
                        title='Center Horizontally'
                      >
                        <span className='material-icons text-sm'>align_horizontal_center</span>
                      </button>
                      <button
                        type='button'
                        onClick={() => centerElement(el.id, 'vertical')}
                        className='p-1 hover:text-white text-zinc-400 transition'
                        title='Center Vertically'
                      >
                        <span className='material-icons text-sm'>align_vertical_center</span>
                      </button>
                    </div>
                  </div>
                  <div className='flex items-center justify-between bg-white/5 rounded-lg px-2 py-1'>
                    <span className='text-[8px] font-bold text-zinc-500 uppercase'>Order</span>
                    <div className='flex gap-0.5'>
                      <button type='button' onClick={() => sendToBack(el.id)} className='p-0.5 hover:text-white text-zinc-400 transition' title='Send to Back'>
                        <span className='material-icons text-[14px]'>vertical_align_bottom</span>
                      </button>
                      <button type='button' onClick={() => sendBackward(el.id)} className='p-0.5 hover:text-white text-zinc-400 transition' title='Send Backward'>
                        <span className='material-icons text-[14px]'>arrow_downward</span>
                      </button>
                      <button type='button' onClick={() => bringForward(el.id)} className='p-0.5 hover:text-white text-zinc-400 transition' title='Bring Forward'>
                        <span className='material-icons text-[14px]'>arrow_upward</span>
                      </button>
                      <button type='button' onClick={() => bringToFront(el.id)} className='p-0.5 hover:text-white text-zinc-400 transition' title='Bring to Front'>
                        <span className='material-icons text-[14px]'>vertical_align_top</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedElementId === el.id && el.type === 'image' && (
              <div className='pt-2 border-t border-white/5 mt-2 space-y-2'>
                <div className='flex items-center justify-between bg-white/5 rounded-lg px-2 py-1'>
                  <span className='text-[9px] font-bold text-zinc-500 uppercase tracking-wider'>
                    Snap to Center
                  </span>
                  <div className='flex gap-2'>
                    <button
                      type='button'
                      onClick={() => centerElement(el.id, 'horizontal')}
                      className='p-1 hover:text-white text-zinc-400 transition'
                      title='Center Horizontally'
                    >
                      <span className='material-icons text-base'>align_horizontal_center</span>
                    </button>
                    <div className='w-px bg-white/10 h-4 self-center'></div>
                    <button
                      type='button'
                      onClick={() => centerElement(el.id, 'vertical')}
                      className='p-1 hover:text-white text-zinc-400 transition'
                      title='Center Vertically'
                    >
                      <span className='material-icons text-base'>align_vertical_center</span>
                    </button>
                  </div>
                </div>
                {/* Layer Ordering for Images */}
                <div className='flex items-center justify-between bg-white/5 rounded-lg px-2 py-1'>
                  <span className='text-[9px] font-bold text-zinc-500 uppercase tracking-wider'>
                    Layer Order
                  </span>
                  <div className='flex gap-1'>
                    <button
                      type='button'
                      onClick={() => sendToBack(el.id)}
                      className='p-1 hover:text-white text-zinc-400 transition'
                      title='Send to Back'
                    >
                      <span className='material-icons text-sm'>vertical_align_bottom</span>
                    </button>
                    <button
                      type='button'
                      onClick={() => sendBackward(el.id)}
                      className='p-1 hover:text-white text-zinc-400 transition'
                      title='Send Backward'
                    >
                      <span className='material-icons text-sm'>arrow_downward</span>
                    </button>
                    <button
                      type='button'
                      onClick={() => bringForward(el.id)}
                      className='p-1 hover:text-white text-zinc-400 transition'
                      title='Bring Forward'
                    >
                      <span className='material-icons text-sm'>arrow_upward</span>
                    </button>
                    <button
                      type='button'
                      onClick={() => bringToFront(el.id)}
                      className='p-1 hover:text-white text-zinc-400 transition'
                      title='Bring to Front'
                    >
                      <span className='material-icons text-sm'>vertical_align_top</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {elements.length === 0 && (
          <div className='flex flex-col items-center justify-center py-10 opacity-50'>
            <span className='material-icons text-4xl text-zinc-600 mb-2'>layers_clear</span>
            <p className='text-[10px] font-bold uppercase tracking-wider text-zinc-500'>
              No active layers
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LayersPanel;
