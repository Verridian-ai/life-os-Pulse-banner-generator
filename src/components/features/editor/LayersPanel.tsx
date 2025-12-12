
import React from 'react';
import { useCanvas } from '../../../context/CanvasContext';
import { BTN_NEU_SOLID } from '../../../styles';
import { FONT_OPTIONS } from '../../../constants';
import { BannerElement } from '../../../types';

const LayersPanel: React.FC = () => {
    const {
        elements, selectedElementId, setSelectedElementId,
        addElement, updateElement, deleteElement, centerElement
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
            rotation: 0
        });
    };

    return (
        <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-xl flex flex-col relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition duration-500"></div>

            <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="font-black text-sm uppercase tracking-wider text-white flex items-center gap-2 drop-shadow-sm">
                    <span className="material-icons text-purple-400">layers</span>
                    Layers
                </h3>
                <button onClick={handleAddText} className={`h-8 px-4 text-[9px] rounded-full ${BTN_NEU_SOLID}`}>
                    + Add Text
                </button>
            </div>
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 relative z-10 scrollbar-hide">
                {elements.map((el) => (
                    <div
                        key={el.id}
                        onClick={(e) => {
                            if ((e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'SELECT' && (e.target as HTMLElement).tagName !== 'BUTTON') {
                                setSelectedElementId(el.id);
                            }
                        }}
                        className={`bg-black/40 p-4 rounded-2xl border transition-all cursor-pointer ${selectedElementId === el.id ? 'border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.1)]' : 'border-white/5 hover:border-white/20'}`}
                    >
                        <div className="flex gap-3 items-center mb-3">
                            <span className="material-icons text-zinc-600 text-xs cursor-move">drag_indicator</span>
                            {el.type === 'image' ? (
                                <div className="flex-1 flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-wide">
                                    <span className="material-icons text-sm text-blue-400">image</span>
                                    Image Layer
                                </div>
                            ) : (
                                <input
                                    value={el.content}
                                    onChange={(e) => updateElement(el.id, { content: e.target.value })}
                                    onFocus={() => setSelectedElementId(el.id)}
                                    className="bg-transparent text-sm font-bold uppercase w-full outline-none text-white placeholder-zinc-600"
                                    placeholder="ENTER TEXT..."
                                />
                            )}
                            <button onClick={(e) => {
                                e.stopPropagation();
                                deleteElement(el.id);
                            }} className="text-zinc-600 hover:text-red-500 transition">
                                <span className="material-icons text-sm">close</span>
                            </button>
                        </div>
                        {selectedElementId === el.id && el.type === 'text' && (
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                                <div className="relative">
                                    <select
                                        value={el.fontFamily || 'Inter'}
                                        onChange={(e) => updateElement(el.id, { fontFamily: e.target.value })}
                                        title="Font Family"
                                        className="w-full bg-white/5 text-[10px] font-bold text-zinc-300 rounded-lg px-2 py-1.5 focus:outline-none appearance-none cursor-pointer uppercase"
                                    >
                                        {FONT_OPTIONS.map(font => (
                                            <option key={font} value={font} className="bg-zinc-900 text-zinc-300" style={{ fontFamily: font }}>{font}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={el.color || '#ffffff'}
                                        onChange={(e) => updateElement(el.id, { color: e.target.value })}
                                        className="w-8 h-full rounded cursor-pointer bg-transparent"
                                        title="Text Color"
                                    />
                                    <div className="flex-1 flex items-center gap-2 bg-white/5 rounded-lg px-2 border border-white/5">
                                        <span className="material-icons text-zinc-500 text-[14px]">format_size</span>
                                        <input
                                            type="number"
                                            min="1"
                                            title="Font Size (px)"
                                            value={el.fontSize || 60}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                if (!isNaN(val) && val > 0) {
                                                    updateElement(el.id, { fontSize: val });
                                                }
                                            }}
                                            className="w-full bg-transparent text-[10px] font-bold text-zinc-300 py-1.5 text-center focus:outline-none appearance-none"
                                        />
                                    </div>
                                </div>
                                <div className="col-span-2 flex bg-white/5 rounded-lg p-0.5">
                                    {(['left', 'center', 'right'] as const).map(align => (
                                        <button
                                            key={align}
                                            onClick={() => updateElement(el.id, { textAlign: align })}
                                            className={`flex-1 py-1 rounded-md transition-all flex items-center justify-center ${(el.textAlign || 'left') === align
                                                ? 'bg-zinc-700 text-white'
                                                : 'text-zinc-500 hover:text-zinc-300'
                                                }`}
                                        >
                                            <span className="material-icons text-[14px]">format_align_{align}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="col-span-2 flex items-center justify-between bg-white/5 rounded-lg px-2 py-1 mt-1">
                                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Snap to Center</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => centerElement(el.id, 'horizontal')}
                                            className="p-1 hover:text-white text-zinc-400 transition"
                                            title="Center Horizontally"
                                        >
                                            <span className="material-icons text-base">align_horizontal_center</span>
                                        </button>
                                        <div className="w-px bg-white/10 h-4 self-center"></div>
                                        <button
                                            onClick={() => centerElement(el.id, 'vertical')}
                                            className="p-1 hover:text-white text-zinc-400 transition"
                                            title="Center Vertically"
                                        >
                                            <span className="material-icons text-base">align_vertical_center</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedElementId === el.id && el.type === 'image' && (
                            <div className="pt-2 border-t border-white/5 mt-2">
                                <div className="flex items-center justify-between bg-white/5 rounded-lg px-2 py-1">
                                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Snap to Center</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => centerElement(el.id, 'horizontal')}
                                            className="p-1 hover:text-white text-zinc-400 transition"
                                            title="Center Horizontally"
                                        >
                                            <span className="material-icons text-base">align_horizontal_center</span>
                                        </button>
                                        <div className="w-px bg-white/10 h-4 self-center"></div>
                                        <button
                                            onClick={() => centerElement(el.id, 'vertical')}
                                            className="p-1 hover:text-white text-zinc-400 transition"
                                            title="Center Vertically"
                                        >
                                            <span className="material-icons text-base">align_vertical_center</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {elements.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 opacity-50">
                        <span className="material-icons text-4xl text-zinc-600 mb-2">layers_clear</span>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">No active layers</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LayersPanel;
