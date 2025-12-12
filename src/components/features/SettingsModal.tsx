
import React, { useState, useEffect } from 'react';
import { BTN_NEU_SOLID, BTN_NEU_WHITE } from '../../styles';
import { getUserAPIKeys, saveUserAPIKeys } from '../../services/apiKeyStorage';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    // State for form fields
    const [provider, setProvider] = useState<'gemini' | 'openrouter'>('gemini');
    const [geminiKey, setGeminiKey] = useState(localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '');
    const [openRouterKey, setOpenRouterKey] = useState(localStorage.getItem('openrouter_api_key') || import.meta.env.VITE_OPENROUTER_API_KEY || '');
    const [replicateKey, setReplicateKey] = useState(localStorage.getItem('replicate_api_key') || import.meta.env.VITE_REPLICATE_API_KEY || '');
    const [model, setModel] = useState('');
    const [imageModel, setImageModel] = useState('');
    const [upscaleModel, setUpscaleModel] = useState(''); // Replicate Upscale Model
    const [customModel, setCustomModel] = useState('');

    // Status
    const [saved, setSaved] = useState(false);
    const [testStatus, setTestStatus] = useState<{ [key: string]: 'idle' | 'testing' | 'success' | 'failure' }>({});

    // Common OpenRouter Models (Text) - Updated with Latest Models (Dec 2025)
    const COMMON_MODELS = [
        { id: 'nano-banana-pro', name: '🍌 Nano Banana Pro (Best for Voice/Prompt)' }, // Maps to gemini-2.0-flash
        { id: 'zhipu/glm-4.6-plus', name: 'GLM 4.6 Plus (Top Ranked, 13.1% traffic)' },
        { id: 'minimax/minimax-m2-plus', name: 'MiniMax M2 Plus (Coding & Agentic)' },
        { id: 'openai/gpt-5.1', name: 'GPT-5.1 (Latest from OpenAI)' },
        { id: 'openai/gpt-5-mini', name: 'GPT-5 Mini (Fast & Affordable)' },
        { id: 'google/gemini-3-pro-preview', name: 'Gemini 3 Pro Preview (Advanced Reasoning)' },
        { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash (Free)' },
        { id: 'deepseek/deepseek-chat-v3', name: 'DeepSeek V3 (Top Tier)' },
        { id: 'anthropic/claude-3.7-sonnet', name: 'Claude 3.7 Sonnet (Latest)' },
        { id: 'meta-llama/llama-4-scout', name: 'Llama 4 Scout (Latest Meta)' },
    ];

    // Replicate Upscale Models
    const UPSCALE_MODELS = [
        { id: 'nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73ab241b637189a1445ad', name: 'Real-ESRGAN (General/Fast)' },
        { id: 'jingyunliang/swinir:660d922d3312f51a4c0905772274443a516087828062df157e382d5cc707e71f', name: 'SwinIR (Restoration)' },
        { id: 'sczhou/codeformer:7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56', name: 'CodeFormer (Face Enhance)' },
    ];

    // Common Image Models
    const IMAGE_MODELS = [
        { id: 'gemini-3-pro-image-preview', name: '🍌 Nano Banana Pro (4K, Best Quality)' },
        { id: 'gemini-2.5-flash-image', name: '🍌 Nano Banana (2K, Fast)' },
        { id: 'black-forest-labs/flux-1-schnell', name: 'Flux 1 Schnell (Fast/Cheap)' },
        { id: 'black-forest-labs/flux-1-dev', name: 'Flux 1 Dev (High Quality)' },
        { id: 'recraft-ai/recraft-v3', name: 'Recraft V3 (vector-like)' },
        { id: 'stabilityai/stable-diffusion-xl-base-1.0', name: 'SDXL 1.0' },
    ];

    // Load settings on mount
    useEffect(() => {
        if (!isOpen) return;

        // Load settings from Supabase (with .env fallback)
        const loadSettings = async () => {
            const keys = await getUserAPIKeys();

            // Batch state updates to avoid cascading renders
            if (keys.llm_provider) setProvider(keys.llm_provider);

            setGeminiKey(keys.gemini_api_key || '');
            setOpenRouterKey(keys.openrouter_api_key || '');
            setReplicateKey(keys.replicate_api_key || '');

            const storedModel = keys.llm_model || 'google/gemini-2.0-flash-exp:free';
            const storedImageModel = keys.llm_image_model || 'black-forest-labs/flux-1-schnell';
            const storedUpscaleModel = keys.llm_upscale_model || UPSCALE_MODELS[0].id;

            if (COMMON_MODELS.find(m => m.id === storedModel)) {
                setModel(storedModel);
            } else {
                setModel('custom');
                setCustomModel(storedModel);
            }
            setImageModel(storedImageModel);
            setUpscaleModel(storedUpscaleModel);
            setSaved(false);
        };

        loadSettings();
    }, [isOpen]);

    const handleSave = async () => {
        const finalModel = model === 'custom' ? customModel : model;

        // Save to Supabase
        const result = await saveUserAPIKeys({
            gemini_api_key: geminiKey,
            openrouter_api_key: openRouterKey,
            replicate_api_key: replicateKey,
            llm_provider: provider,
            llm_model: finalModel,
            llm_image_model: imageModel,
            llm_upscale_model: upscaleModel,
        });

        if (result.success) {
            console.log('[Settings] ✓ API keys saved to Supabase');
            setSaved(true);
            setTimeout(() => {
                setSaved(false);
                onClose();
                // Reload to apply new settings
                window.location.reload();
            }, 1000);
        } else {
            console.error('[Settings] Failed to save:', result.error);
            alert(`Failed to save settings: ${result.error}\n\nTip: Check your Supabase connection.`);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-white transition"
                >
                    <span className="material-icons">close</span>
                </button>

                <h2 className="text-xl font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                    <span className="material-icons text-purple-500">settings</span>
                    AI Settings
                </h2>

                <div className="space-y-6">
                    {/* Provider Selection */}
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                            AI Provider
                        </label>
                        <div className="flex bg-zinc-950 p-1 rounded-xl border border-white/5">
                            <button
                                onClick={() => setProvider('gemini')}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${provider === 'gemini' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                Google Gemini
                            </button>
                            <button
                                onClick={() => setProvider('openrouter')}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${provider === 'openrouter' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                OpenRouter
                            </button>
                        </div>
                    </div>

                    {/* Gemini Configuration */}
                    {provider === 'gemini' && (
                        <div className="animate-fade-in">
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                                Gemini API Key
                            </label>
                            <input
                                type="password"
                                value={geminiKey}
                                onChange={(e) => setGeminiKey(e.target.value)}
                                placeholder="AIzaSy..."
                                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-medium focus:outline-none focus:border-purple-500/50 transition placeholder-zinc-700"
                            />
                            <p className="text-[9px] text-zinc-600 mt-2">
                                Leave blank to use default environment variable if configured.
                                <br />
                                <a
                                    href="https://aistudio.google.com/apikey"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-purple-400 hover:text-purple-300 underline inline-flex items-center gap-1"
                                >
                                    Get your Gemini API key
                                    <span className="material-icons text-[10px]">open_in_new</span>
                                </a>
                            </p>
                        </div>
                    )}

                    {/* OpenRouter Configuration */}
                    {provider === 'openrouter' && (
                        <div className="space-y-4 animate-fade-in">
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                                    OpenRouter API Key
                                </label>
                                <input
                                    type="password"
                                    value={openRouterKey}
                                    onChange={(e) => setOpenRouterKey(e.target.value)}
                                    placeholder="sk-or-..."
                                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-medium focus:outline-none focus:border-purple-500/50 transition placeholder-zinc-700"
                                />
                                <p className="text-[9px] text-zinc-600 mt-2">
                                    <a
                                        href="https://openrouter.ai/keys"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-purple-400 hover:text-purple-300 underline inline-flex items-center gap-1"
                                    >
                                        Get your OpenRouter API key
                                        <span className="material-icons text-[10px]">open_in_new</span>
                                    </a>
                                    {' • '}
                                    <a
                                        href="https://openrouter.ai/auth?sign_up=true"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-purple-400 hover:text-purple-300 underline"
                                    >
                                        Sign up
                                    </a>
                                </p>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                                    Model Selection
                                </label>
                                <select
                                    value={model}
                                    onChange={(e) => setModel(e.target.value)}
                                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-medium focus:outline-none focus:border-purple-500/50 transition appearance-none mb-2"
                                >
                                    {COMMON_MODELS.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                    <option value="custom">+ Custom Model ID</option>
                                </select>

                                {model === 'custom' && (
                                    <input
                                        type="text"
                                        value={customModel}
                                        onChange={(e) => setCustomModel(e.target.value)}
                                        placeholder="e.g. google/gemini-exp-1114"
                                        className="w-full bg-zinc-800 border border-purple-500/30 rounded-xl px-4 py-3 text-white text-xs font-medium focus:outline-none focus:border-purple-500 transition placeholder-zinc-500"
                                    />
                                )}
                            </div>
                        </div>
                    )}


                    {/* Replicate Configuration */}
                    <div className="animate-fade-in border-t border-white/10 pt-4 mt-4">
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex justify-between items-center">
                            <span>Replicate API (Upscaling, Rembg)</span>
                            <span className="text-[9px] text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded">Optional</span>
                        </label>
                        <input
                            type="password"
                            value={replicateKey}
                            onChange={(e) => setReplicateKey(e.target.value)}
                            placeholder="r8_..."
                            className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-medium focus:outline-none focus:border-purple-500/50 transition placeholder-zinc-700"
                        />
                        <p className="text-[9px] text-zinc-600 mt-2">
                            <a
                                href="https://replicate.com/account/api-tokens"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-400 hover:text-purple-300 underline inline-flex items-center gap-1"
                            >
                                Get your Replicate API token
                                <span className="material-icons text-[10px]">open_in_new</span>
                            </a>
                            {' • '}
                            <a
                                href="https://replicate.com/signin?next=/account/api-tokens"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-400 hover:text-purple-300 underline"
                            >
                                Sign up
                            </a>
                        </p>
                    </div>

                    {/* Replicate Upscale Model Selection */}
                    <div className="animate-fade-in mt-4">
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                            Upscale Model
                        </label>
                        <select
                            value={upscaleModel}
                            onChange={(e) => setUpscaleModel(e.target.value)}
                            className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-medium focus:outline-none focus:border-purple-500/50 transition appearance-none"
                        >
                            {UPSCALE_MODELS.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Image Generation Model Selection */}
                    <div className="animate-fade-in mt-4">
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                            Image Generation Model
                        </label>
                        <select
                            value={imageModel}
                            onChange={(e) => setImageModel(e.target.value)}
                            className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-medium focus:outline-none focus:border-purple-500/50 transition appearance-none"
                        >
                            {IMAGE_MODELS.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                        <p className="text-[9px] text-zinc-600 mt-2">
                            Nano Banana Pro requires preview access. Falls back to Nano Banana if unavailable.
                        </p>
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full h-12 rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 bg-white text-black hover:bg-zinc-200 active:scale-[0.98]"
                    >
                        {saved ? (
                            <>
                                <span className="material-icons text-green-600">check_circle</span>
                                Saved!
                            </>
                        ) : (
                            'Save Settings'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
