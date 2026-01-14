import React from 'react';
import { useCanvas } from '../../../context/CanvasContext';
import { BTN_NEU_SOLID } from '../../../styles';
import { FONT_OPTIONS_CATEGORIZED, FONT_CATEGORY_LABELS, FontCategory } from '../../../constants';

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
    bringToFront,
    sendToBack,
  } = useCanvas();

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
    <div className='bg-zinc-900/40 backdrop-blur-md p-3 sm:p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white/10 shadow-xl flex flex-col relative group'>
      <div className='absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-2xl md:rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition duration-500'></div>

      <div className='flex items-center justify-between mb-3 sm:mb-4 md:mb-6 relative z-10'>
        <h3 className='font-black text-xs sm:text-sm uppercase tracking-wider text-white flex items-center gap-2 drop-shadow-sm'>
          <span className='material-icons text-purple-400 text-lg sm:text-xl'>layers</span>
          Layers
        </h3>
        <button
          type='button'
          onClick={handleAddText}
          className={`min-h-[40px] sm:min-h-[44px] h-10 sm:h-11 px-3 sm:px-4 text-[9px] sm:text-[10px] md:text-xs rounded-full ${BTN_NEU_SOLID}`}
        >
          + Add Text
        </button>
      </div>
      <div className='space-y-2 sm:space-y-3 max-h-[200px] sm:max-h-[250px] md:max-h-[350px] overflow-y-auto pr-1 sm:pr-2 relative z-10 scrollbar-hide'>
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
              <div className='space-y-2 sm:space-y-3 pt-2 sm:pt-3 border-t border-white/5'>
                {/* Row 1: Format buttons (B/I/U) + Color */}
                <div className='flex gap-1.5 sm:gap-2'>
                  <div className='flex gap-0.5 bg-white/5 rounded-lg p-0.5'>
                    <button
                      type='button'
                      onClick={() =>
                        updateElement(el.id, {
                          fontWeight: el.fontWeight === '700' ? '400' : '700',
                        })
                      }
                      className={`min-w-[36px] sm:min-w-[40px] min-h-[36px] sm:min-h-[40px] rounded-md flex items-center justify-center text-sm sm:text-base font-black ${
                        el.fontWeight === '700' ||
                        el.fontWeight === '800' ||
                        el.fontWeight === '900'
                          ? 'bg-purple-600 text-white'
                          : 'text-zinc-400 active:bg-white/10'
                      }`}
                    >
                      B
                    </button>
                    <button
                      type='button'
                      onClick={() =>
                        updateElement(el.id, {
                          fontStyle: el.fontStyle === 'italic' ? 'normal' : 'italic',
                        })
                      }
                      className={`min-w-[36px] sm:min-w-[40px] min-h-[36px] sm:min-h-[40px] rounded-md flex items-center justify-center text-sm sm:text-base italic ${
                        el.fontStyle === 'italic'
                          ? 'bg-purple-600 text-white'
                          : 'text-zinc-400 active:bg-white/10'
                      }`}
                    >
                      I
                    </button>
                    <button
                      type='button'
                      onClick={() =>
                        updateElement(el.id, {
                          textDecoration: el.textDecoration === 'underline' ? 'none' : 'underline',
                        })
                      }
                      className={`min-w-[36px] sm:min-w-[40px] min-h-[36px] sm:min-h-[40px] rounded-md flex items-center justify-center text-sm sm:text-base underline ${
                        el.textDecoration?.includes('underline')
                          ? 'bg-purple-600 text-white'
                          : 'text-zinc-400 active:bg-white/10'
                      }`}
                    >
                      U
                    </button>
                  </div>
                  <input
                    type='color'
                    value={el.color || '#ffffff'}
                    onChange={(e) => updateElement(el.id, { color: e.target.value })}
                    className='w-9 h-9 sm:w-10 sm:h-10 rounded-lg cursor-pointer bg-zinc-800 border border-white/10'
                    title='Color'
                  />
                  {/* Alignment */}
                  <div className='flex gap-0.5 bg-white/5 rounded-lg p-0.5 ml-auto'>
                    {(['left', 'center', 'right'] as const).map((align) => (
                      <button
                        type='button'
                        key={align}
                        onClick={() => updateElement(el.id, { textAlign: align })}
                        className={`min-w-[36px] sm:min-w-[40px] min-h-[36px] sm:min-h-[40px] rounded-md flex items-center justify-center ${
                          (el.textAlign || 'left') === align
                            ? 'bg-purple-600 text-white'
                            : 'text-zinc-400 active:bg-white/10'
                        }`}
                      >
                        <span className='material-icons text-base sm:text-lg'>
                          format_align_{align}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Row 2: Font + Size */}
                <div className='flex gap-1.5 sm:gap-2'>
                  <select
                    value={el.fontFamily || 'Inter'}
                    onChange={(e) => updateElement(el.id, { fontFamily: e.target.value })}
                    className='flex-1 min-h-[36px] sm:min-h-[40px] bg-zinc-800 text-[10px] sm:text-xs font-bold text-zinc-300 rounded-lg px-2 border border-white/10'
                  >
                    {(Object.keys(groupedFonts) as FontCategory[]).map((category) => (
                      <optgroup key={category} label={FONT_CATEGORY_LABELS[category]}>
                        {groupedFonts[category].map((font) => (
                          <option key={font} value={font}>
                            {font}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <div className='flex items-center bg-zinc-800 rounded-lg border border-white/10 w-20 sm:w-24'>
                    <input
                      type='number'
                      min='8'
                      max='200'
                      value={el.fontSize || 60}
                      onChange={(e) =>
                        updateElement(el.id, {
                          fontSize: Math.max(8, parseInt(e.target.value) || 60),
                        })
                      }
                      className='w-full min-h-[36px] sm:min-h-[40px] bg-transparent text-[10px] sm:text-xs font-bold text-zinc-300 text-center focus:outline-none'
                    />
                    <span className='text-[8px] sm:text-[9px] text-zinc-500 pr-2'>px</span>
                  </div>
                </div>

                {/* Row 3: Quick actions */}
                <div className='flex gap-1.5 sm:gap-2'>
                  <button
                    type='button'
                    onClick={() => centerElement(el.id, 'horizontal')}
                    className='flex-1 min-h-[36px] sm:min-h-[40px] bg-zinc-800 rounded-lg flex items-center justify-center gap-1 text-zinc-400 active:bg-zinc-700 border border-white/5'
                  >
                    <span className='material-icons text-base sm:text-lg'>
                      align_horizontal_center
                    </span>
                    <span className='text-[9px] sm:text-[10px] font-bold hidden sm:inline'>
                      Center H
                    </span>
                  </button>
                  <button
                    type='button'
                    onClick={() => centerElement(el.id, 'vertical')}
                    className='flex-1 min-h-[36px] sm:min-h-[40px] bg-zinc-800 rounded-lg flex items-center justify-center gap-1 text-zinc-400 active:bg-zinc-700 border border-white/5'
                  >
                    <span className='material-icons text-base sm:text-lg'>
                      align_vertical_center
                    </span>
                    <span className='text-[9px] sm:text-[10px] font-bold hidden sm:inline'>
                      Center V
                    </span>
                  </button>
                  <button
                    type='button'
                    onClick={() => bringToFront(el.id)}
                    className='min-w-[36px] sm:min-w-[40px] min-h-[36px] sm:min-h-[40px] bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-400 active:bg-zinc-700 border border-white/5'
                    title='Bring to Front'
                  >
                    <span className='material-icons text-base sm:text-lg'>vertical_align_top</span>
                  </button>
                  <button
                    type='button'
                    onClick={() => sendToBack(el.id)}
                    className='min-w-[36px] sm:min-w-[40px] min-h-[36px] sm:min-h-[40px] bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-400 active:bg-zinc-700 border border-white/5'
                    title='Send to Back'
                  >
                    <span className='material-icons text-base sm:text-lg'>
                      vertical_align_bottom
                    </span>
                  </button>
                </div>
              </div>
            )}

            {selectedElementId === el.id && el.type === 'image' && (
              <div className='space-y-2 sm:space-y-3 pt-2 sm:pt-3 border-t border-white/5'>
                {/* Image controls - mobile-first row layout */}
                <div className='flex gap-1.5 sm:gap-2'>
                  <button
                    type='button'
                    onClick={() => centerElement(el.id, 'horizontal')}
                    className='flex-1 min-h-[36px] sm:min-h-[40px] bg-zinc-800 rounded-lg flex items-center justify-center gap-1 text-zinc-400 active:bg-zinc-700 border border-white/5'
                  >
                    <span className='material-icons text-base sm:text-lg'>
                      align_horizontal_center
                    </span>
                    <span className='text-[9px] sm:text-[10px] font-bold hidden sm:inline'>
                      Center H
                    </span>
                  </button>
                  <button
                    type='button'
                    onClick={() => centerElement(el.id, 'vertical')}
                    className='flex-1 min-h-[36px] sm:min-h-[40px] bg-zinc-800 rounded-lg flex items-center justify-center gap-1 text-zinc-400 active:bg-zinc-700 border border-white/5'
                  >
                    <span className='material-icons text-base sm:text-lg'>
                      align_vertical_center
                    </span>
                    <span className='text-[9px] sm:text-[10px] font-bold hidden sm:inline'>
                      Center V
                    </span>
                  </button>
                  <button
                    type='button'
                    onClick={() => bringToFront(el.id)}
                    className='min-w-[36px] sm:min-w-[40px] min-h-[36px] sm:min-h-[40px] bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-400 active:bg-zinc-700 border border-white/5'
                    title='Bring to Front'
                  >
                    <span className='material-icons text-base sm:text-lg'>vertical_align_top</span>
                  </button>
                  <button
                    type='button'
                    onClick={() => sendToBack(el.id)}
                    className='min-w-[36px] sm:min-w-[40px] min-h-[36px] sm:min-h-[40px] bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-400 active:bg-zinc-700 border border-white/5'
                    title='Send to Back'
                  >
                    <span className='material-icons text-base sm:text-lg'>
                      vertical_align_bottom
                    </span>
                  </button>
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
