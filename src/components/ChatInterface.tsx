import React, { useState, useRef, useEffect } from 'react';
import { generateDesignChatResponse, generateSearchResponse } from '../services/llm';
import { ChatMessage, Part } from '../types';
import { optimizeImage } from '../utils';
import { SettingsModal } from './features/SettingsModal';

interface ChatInterfaceProps {
    onGenerateFromPrompt: (prompt: string) => void;
}

// Reusable Neumorphic Button Styles (Matched with App.tsx Responsive Base)
const BTN_BASE = "h-10 md:h-12 px-4 md:px-6 rounded-full font-black uppercase tracking-wider text-[10px] md:text-xs transition-all flex items-center justify-center gap-2 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] whitespace-nowrap";

const BTN_BLUE_INACTIVE = "bg-zinc-900 text-blue-500 shadow-[4px_4px_8px_rgba(0,0,0,0.5),-4px_-4px_8px_rgba(255,255,255,0.05)] border border-blue-500/20 hover:text-blue-400 hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]";
const BTN_BLUE_ACTIVE = "bg-gradient-to-br from-blue-600 to-cyan-700 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-blue-400/30 scale-[1.02]";

const BTN_NEU_SOLID = "bg-zinc-800 text-zinc-400 shadow-[3px_3px_6px_rgba(0,0,0,0.5),-3px_-3px_6px_rgba(255,255,255,0.05)] border border-white/5 hover:text-white hover:scale-[1.02] active:scale-[0.98]";
const BTN_NEU_WHITE = "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:bg-zinc-200 active:scale-[0.98]";

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onGenerateFromPrompt }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', text: 'HELLO! I AM NANO, YOUR PRO LINKEDIN BANNER STRATEGIST. \n\nUPLOAD YOUR LOGO, PROFILE PICTURE, OR ANY REFERENCE IMAGES, AND WE CAN DISCUSS A DESIGN THAT PERFECTLY MATCHES YOUR BRAND COLORS AND STYLE.' }
    ]);
    const [input, setInput] = useState('');
    const [attachedImages, setAttachedImages] = useState<string[]>([]);
    const [mode, setMode] = useState<'design' | 'search'>('design');
    const [loading, setLoading] = useState(false);
    const [processingFiles, setProcessingFiles] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setProcessingFiles(true);
            const files: File[] = Array.from(e.target.files);
            try {
                // Resize for Gemini API (1024 max dimension is usually safe and efficient for token usage)
                const optimizedPromises = files.map(file => optimizeImage(file, 1024, 1024));
                const results = await Promise.all(optimizedPromises);
                // Map the result objects to just the base64 strings needed for the chat state
                const base64Images = results.map(r => r.base64);
                setAttachedImages(prev => [...prev, ...base64Images]);
            } catch (err) {
                console.error("Failed to process chat images", err);
            } finally {
                setProcessingFiles(false);
            }
        }
    };

    const removeImage = (index: number) => {
        setAttachedImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSend = async () => {
        if ((!input.trim() && attachedImages.length === 0) || loading) return;

        const userMsg = input;
        const currentImages = [...attachedImages];

        // Clear inputs immediately
        setInput('');
        setAttachedImages([]);

        // Add user message to state
        setMessages(prev => [...prev, { role: 'user', text: userMsg, images: currentImages.length > 0 ? currentImages : undefined }]);
        setLoading(true);

        try {
            // Build history
            const history = messages.map(m => {
                const parts: Part[] = [{ text: m.text }];
                if (m.images) {
                    m.images.forEach(img => {
                        const base64Data = img.split(',')[1] || img;
                        const mimeType = img.substring(img.indexOf(':') + 1, img.indexOf(';')) || 'image/png';
                        parts.push({ inlineData: { mimeType, data: base64Data } });
                    });
                }
                return { role: m.role, parts };
            });

            let response;
            if (mode === 'design') {
                response = await generateDesignChatResponse(userMsg, currentImages, history);
            } else {
                response = await generateSearchResponse(userMsg, history);
            }

            // Extract URLs if search
            const groundings: { title: string, url: string }[] = [];
            if (mode === 'search' && response.groundingMetadata?.groundingChunks) {
                response.groundingMetadata.groundingChunks.forEach((chunk: { web?: { uri?: string, title?: string } }) => {
                    if (chunk.web?.uri) {
                        groundings.push({ title: chunk.web.title || 'Source', url: chunk.web.uri });
                    }
                });
            }

            setMessages(prev => [...prev, {
                role: 'model',
                text: response.text,
                isThinking: mode === 'design',
                groundingUrls: groundings.length > 0 ? groundings : undefined
            }]);
        } catch (e) {
            console.error(e);
            setMessages(prev => [...prev, { role: 'model', text: 'SORRY, I ENCOUNTERED AN ERROR ANALYSING YOUR REQUEST. PLEASE TRY AGAIN.' }]);
        } finally {
            setLoading(false);
        }
    };

    const extractPrompts = (text: string) => {
        const regex = /PROMPT:(.*?)(?=\n|$)/g;
        const matches = [];
        let match;
        while ((match = regex.exec(text)) !== null) {
            matches.push(match[1].trim());
        }
        return matches;
    };

    return (
        <div className="flex flex-col h-full bg-zinc-900/40 backdrop-blur-md rounded-3xl border border-white/5 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50"></div>

            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/5 bg-black/20">
                <div className="flex space-x-2 md:space-x-4">
                    <button
                        onClick={() => setMode('design')}
                        className={`${BTN_BASE} ${mode === 'design' ? BTN_BLUE_ACTIVE : BTN_BLUE_INACTIVE}`}
                    >
                        <span className="material-icons text-sm md:text-base drop-shadow-md">psychology</span>
                        Designer Logic
                    </button>
                    <button
                        onClick={() => setMode('search')}
                        className={`${BTN_BASE} ${mode === 'search' ? BTN_BLUE_ACTIVE : BTN_BLUE_INACTIVE}`}
                    >
                        <span className="material-icons text-sm md:text-base drop-shadow-md">public</span>
                        Trend Search
                    </button>
                </div>

                <button
                    onClick={() => setShowSettings(true)}
                    className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-zinc-800 border border-white/5 text-zinc-400 hover:text-white transition flex items-center justify-center hover:bg-zinc-700"
                    title="AI Settings"
                >
                    <span className="material-icons">settings</span>
                </button>
            </div>

            <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-hide">
                {messages.map((m, i) => {
                    const detectedPrompts = m.role === 'model' ? extractPrompts(m.text) : [];
                    return (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-6 shadow-sm ${m.role === 'user' ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-br-sm shadow-[0_0_15px_rgba(37,99,235,0.2)]' : 'bg-white/5 text-zinc-200 rounded-bl-sm border border-white/5 shadow-lg'}`}>
                                {/* Images in message */}
                                {m.images && m.images.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {m.images.map((img, idx) => (
                                            <img key={idx} src={img} alt="attachment" className="w-24 h-24 object-cover rounded-xl border border-white/10 shadow-md" />
                                        ))}
                                    </div>
                                )}

                                <div className="whitespace-pre-wrap leading-relaxed text-sm font-medium drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                                    {m.text.split('PROMPT:').map((part, partIdx) => {
                                        if (partIdx === 0) return <span key={partIdx}>{part}</span>;
                                        return <span key={partIdx} className="hidden"> PROMPT: {part}</span>
                                    })}
                                </div>

                                {/* Detected Prompts Actions */}
                                {detectedPrompts.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        {detectedPrompts.map((prompt, pIdx) => (
                                            <div key={pIdx} className="bg-black/30 p-4 rounded-xl border border-purple-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 group hover:border-purple-500/40 transition shadow-inner">
                                                <div className="text-xs text-purple-300 italic line-clamp-2 flex-1 font-medium">"{prompt}"</div>
                                                <button
                                                    onClick={() => onGenerateFromPrompt(prompt)}
                                                    className={`${BTN_BASE} ${BTN_NEU_WHITE} h-8 px-4 text-[10px] w-full md:w-auto`}
                                                >
                                                    <span className="material-icons text-xs">auto_awesome</span>
                                                    Generate
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {m.isThinking && <div className="mt-4 text-[10px] text-zinc-500 font-black uppercase tracking-widest flex items-center gap-2 opacity-70">
                                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></span>
                                    Gemini 3 Pro Reasoning
                                </div>}

                                {m.groundingUrls && (
                                    <div className="mt-4 pt-4 border-t border-white/10">
                                        <p className="text-[10px] font-black mb-2 text-zinc-500 uppercase tracking-widest">References</p>
                                        <ul className="space-y-2">
                                            {m.groundingUrls.map((g, idx) => (
                                                <li key={idx}><a href={g.url} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline truncate block flex items-center gap-2 bg-black/20 p-2 rounded-lg border border-white/5 transition hover:bg-black/40"><span className="material-icons text-[12px]">link</span> {g.title}</a></li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white/5 border border-white/5 rounded-2xl rounded-bl-sm p-4 flex items-center gap-2 shadow-lg">
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-6 bg-black/20 border-t border-white/5 backdrop-blur-md">
                {/* Attached Image Preview */}
                {attachedImages.length > 0 && (
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                        {attachedImages.map((img, idx) => (
                            <div key={idx} className="relative group shrink-0">
                                <img src={img} alt="preview" className="h-20 w-20 object-cover rounded-xl border border-white/10 shadow-md" />
                                <button onClick={() => removeImage(idx)} className="absolute -top-2 -right-2 bg-zinc-800 text-white border border-zinc-700 rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg hover:bg-red-500 transition">×</button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex gap-4 items-end">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={processingFiles}
                        className="h-12 w-12 rounded-full bg-zinc-800 border border-white/5 text-zinc-400 hover:text-white transition disabled:opacity-50 shrink-0 flex items-center justify-center shadow-[4px_4px_8px_rgba(0,0,0,0.5),-4px_-4px_8px_rgba(255,255,255,0.05)] hover:scale-[1.05] active:scale-[0.95]"
                        title="Upload references"
                    >
                        {processingFiles ? <span className="material-icons animate-spin text-lg">refresh</span> : <span className="material-icons text-xl drop-shadow-md">add_photo_alternate</span>}
                    </button>
                    <input
                        type="file"
                        multiple
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                    />

                    <div className="flex-1 relative">
                        <textarea
                            className="w-full bg-black/40 border border-white/10 rounded-3xl px-6 py-3.5 text-white font-bold placeholder-zinc-500 focus:outline-none focus:border-white/20 focus:bg-black/60 resize-none h-[52px] max-h-[120px] shadow-[inset_0_2px_6px_rgba(0,0,0,0.5)] transition-all"
                            placeholder={mode === 'design' ? "CHAT WITH NANO..." : "SEARCH TRENDS..."}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                        />
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={loading || (!input.trim() && attachedImages.length === 0)}
                        className={`h-12 w-12 rounded-full font-bold transition flex items-center justify-center shrink-0 ${loading ? 'bg-zinc-700 opacity-50' : 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:scale-[1.05] active:scale-[0.95]'}`}
                    >
                        <span className="material-icons drop-shadow-sm">arrow_upward</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
