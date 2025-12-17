import React, { useState, useEffect } from 'react';
import { getUserAPIKeys, saveUserAPIKeys } from '../../services/apiKeyStorage';
import { testOpenRouterKey, testReplicateKey } from '../../services/apiKeyValidator';

// Common OpenRouter Models (Text) - Updated with Latest Models (Dec 2025)
// Moved outside component to avoid useEffect dependency issues
const COMMON_MODELS = [
  { id: 'nano-banana-pro', name: 'Nano Banana Pro (Best for Voice/Prompt)' }, // Maps to gemini-2.0-flash
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

// Replicate Upscale Models - Moved outside component to avoid useEffect dependency issues
const UPSCALE_MODELS = [
  {
    id: 'nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73ab241b637189a1445ad',
    name: 'Real-ESRGAN (General/Fast)',
  },
  {
    id: 'jingyunliang/swinir:660d922d3312f51a4c0905772274443a516087828062df157e382d5cc707e71f',
    name: 'SwinIR (Restoration)',
  },
  {
    id: 'sczhou/codeformer:7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56',
    name: 'CodeFormer (Face Enhance)',
  },
];

// Common Image Models - Moved outside component for consistency
const IMAGE_MODELS = [
  { id: 'google/gemini-3-pro-image-preview', name: 'Nano Banana Pro (4K, Best Quality)' },
  { id: 'google/gemini-2.5-flash-image', name: 'Nano Banana (2K, Fast)' },
  { id: 'black-forest-labs/flux-1-schnell', name: 'Flux 1 Schnell (Fast/Cheap)' },
  { id: 'black-forest-labs/flux-1-dev', name: 'Flux 1 Dev (High Quality)' },
  { id: 'recraft-ai/recraft-v3', name: 'Recraft V3 (vector-like)' },
  { id: 'stabilityai/stable-diffusion-xl-base-1.0', name: 'SDXL 1.0' },
];

// Magic Edit Models (same as image generation for now)
const MAGIC_EDIT_MODELS = IMAGE_MODELS;

// Connection Status Component
const ConnectionStatus = ({
  status,
}: {
  status: 'untested' | 'testing' | 'valid' | 'invalid';
}) => {
  const statusConfig = {
    untested: { icon: 'help_outline', color: 'text-zinc-500', text: 'Not tested' },
    testing: { icon: 'sync', color: 'text-yellow-500 animate-spin', text: 'Testing...' },
    valid: { icon: 'check_circle', color: 'text-green-500', text: '✓ Connected' },
    invalid: { icon: 'error', color: 'text-red-500', text: '✗ Invalid' },
  };

  const config = statusConfig[status];

  return (
    <span className={`flex items-center gap-1 text-xs ${config.color}`}>
      <span className='material-icons text-sm'>{config.icon}</span>
      {config.text}
    </span>
  );
};

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  // API Keys
  const [openRouterKey, setOpenRouterKey] = useState('');
  const [replicateKey, setReplicateKey] = useState('');

  // Model selections
  const [chatModel, setChatModel] = useState('nano-banana-pro');
  const [imageGenModel, setImageGenModel] = useState('gemini-3-pro-image-preview');
  const [magicEditModel, setMagicEditModel] = useState('gemini-3-pro-image-preview');
  const [upscaleModel, setUpscaleModel] = useState('');
  const [customChatModel, setCustomChatModel] = useState('');

  // Validation states
  const [openRouterStatus, setOpenRouterStatus] = useState<
    'untested' | 'testing' | 'valid' | 'invalid'
  >('untested');
  const [replicateStatus, setReplicateStatus] = useState<
    'untested' | 'testing' | 'valid' | 'invalid'
  >('untested');
  const [testError, setTestError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load settings on mount
  useEffect(() => {
    if (!isOpen) return;

    const loadSettings = async () => {
      try {
        const keys = await getUserAPIKeys();

        // Set API keys
        setOpenRouterKey(keys.openrouter_api_key || '');
        setReplicateKey(keys.replicate_api_key || '');

        // Set models with defaults
        const chatModelValue = keys.llm_model || 'nano-banana-pro';
        const imageGenValue = keys.llm_image_model || 'google/gemini-3-pro-image-preview';
        const magicEditValue = keys.llm_magic_edit_model || 'google/gemini-3-pro-image-preview';
        const upscaleValue = keys.llm_upscale_model || UPSCALE_MODELS[0].id;

        // Handle custom chat model
        if (COMMON_MODELS.find((m) => m.id === chatModelValue)) {
          setChatModel(chatModelValue);
        } else {
          setChatModel('custom');
          setCustomChatModel(chatModelValue);
        }

        setImageGenModel(imageGenValue);
        setMagicEditModel(magicEditValue);
        setUpscaleModel(upscaleValue);

        // Reset validation status
        setOpenRouterStatus('untested');
        setReplicateStatus('untested');
        setTestError('');
        setSaved(false);
      } catch (error) {
        console.error('[Settings] Failed to load:', error);
        setTestError('Failed to load saved settings');
      }
    };

    loadSettings();
  }, [isOpen]);

  const handleTestOpenRouter = async () => {
    setOpenRouterStatus('testing');
    setTestError('');

    const result = await testOpenRouterKey(openRouterKey);

    if (result.valid) {
      setOpenRouterStatus('valid');
      console.log(`[Settings] ✓ OpenRouter connected (${result.modelCount} models)`);
    } else {
      setOpenRouterStatus('invalid');
      setTestError(result.error || 'Connection failed');
    }
  };

  const handleTestReplicate = async () => {
    if (!replicateKey) return;

    setReplicateStatus('testing');
    setTestError('');

    const result = await testReplicateKey(replicateKey);

    if (result.valid) {
      setReplicateStatus('valid');
      console.log('[Settings] ✓ Replicate connected');
    } else {
      setReplicateStatus('invalid');
      setTestError(result.error || 'Connection failed');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setTestError('');

    try {
      // Validate
      if (!openRouterKey) {
        throw new Error('OpenRouter API key is required');
      }

      if (openRouterStatus === 'invalid') {
        throw new Error('Please fix invalid OpenRouter key');
      }

      const finalChatModel = chatModel === 'custom' ? customChatModel : chatModel;

      // Save to Supabase
      const result = await saveUserAPIKeys({
        openrouter_api_key: openRouterKey,
        replicate_api_key: replicateKey || undefined,
        llm_provider: 'openrouter', // Always OpenRouter now
        llm_model: finalChatModel,
        llm_image_model: imageGenModel,
        llm_magic_edit_model: magicEditModel,
        llm_upscale_model: upscaleModel,
      });

      if (result.success) {
        console.log('[Settings] ✓ Settings saved');
        setSaved(true);

        // Close after 1 second without reload
        setTimeout(() => {
          setSaved(false);
          onClose();
          // Dispatch event instead of reload
          window.dispatchEvent(new CustomEvent('settings-updated'));
        }, 1000);
      } else {
        throw new Error(result.error || 'Failed to save');
      }
    } catch (error) {
      console.error('[Settings] Save failed:', error);
      setTestError(error instanceof Error ? error.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4'>
      <div className='bg-zinc-900 border border-white/10 rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative'>
        <button
          type='button'
          onClick={onClose}
          className='absolute top-4 right-4 text-zinc-500 hover:text-white transition'
        >
          <span className='material-icons'>close</span>
        </button>

        <h2 className='text-xl font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2'>
          <span className='material-icons text-purple-500'>settings</span>
          AI Settings
        </h2>

        <div className='space-y-6'>
          {/* OpenRouter Section */}
          <div>
            <label
              htmlFor='openrouter-key'
              className='block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2'
            >
              OpenRouter API Key
            </label>
            <input
              id='openrouter-key'
              type='password'
              value={openRouterKey}
              onChange={(e) => {
                setOpenRouterKey(e.target.value);
                setOpenRouterStatus('untested');
              }}
              placeholder='sk-or-...'
              className='w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-medium focus:outline-none focus:border-purple-500/50 transition placeholder-zinc-700'
            />
            <div className='flex items-center justify-between mt-2'>
              <button
                type='button'
                onClick={handleTestOpenRouter}
                disabled={!openRouterKey || openRouterStatus === 'testing'}
                className='text-xs px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded transition disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {openRouterStatus === 'testing' ? 'Testing...' : 'Test Connection'}
              </button>
              <ConnectionStatus status={openRouterStatus} />
            </div>
            <p className='text-[9px] text-zinc-600 mt-2'>
              <a
                href='https://openrouter.ai/keys'
                target='_blank'
                rel='noopener noreferrer'
                className='text-purple-400 hover:text-purple-300 underline inline-flex items-center gap-1'
              >
                Get your OpenRouter API key
                <span className='material-icons text-[10px]'>open_in_new</span>
              </a>
            </p>
          </div>

          {/* Chat Model Dropdown */}
          <div>
            <label
              htmlFor='chat-model-select'
              className='block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2'
            >
              Chat/Assistant Model
            </label>
            <select
              id='chat-model-select'
              value={chatModel}
              onChange={(e) => setChatModel(e.target.value)}
              className='w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-medium focus:outline-none focus:border-purple-500/50 transition appearance-none'
            >
              {COMMON_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
              <option value='custom'>+ Custom Model ID</option>
            </select>
            {chatModel === 'custom' && (
              <input
                type='text'
                value={customChatModel}
                onChange={(e) => setCustomChatModel(e.target.value)}
                placeholder='e.g., openai/gpt-4'
                className='w-full px-4 py-2 mt-2 bg-zinc-800 border border-purple-500/30 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-purple-500 transition placeholder-zinc-500'
              />
            )}
          </div>

          {/* Image Generation Model Dropdown */}
          <div>
            <label
              htmlFor='image-gen-model-select'
              className='block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2'
            >
              Image Generation Model
            </label>
            <select
              id='image-gen-model-select'
              value={imageGenModel}
              onChange={(e) => setImageGenModel(e.target.value)}
              className='w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-medium focus:outline-none focus:border-purple-500/50 transition appearance-none'
            >
              {IMAGE_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <p className='text-[9px] text-zinc-600 mt-2'>
              Nano Banana Pro requires preview access. Falls back to Nano Banana if unavailable.
            </p>
          </div>

          {/* Magic Edit Model Dropdown (NEW) */}
          <div>
            <label
              htmlFor='magic-edit-model-select'
              className='block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2'
            >
              Magic Edit Model
            </label>
            <select
              id='magic-edit-model-select'
              value={magicEditModel}
              onChange={(e) => setMagicEditModel(e.target.value)}
              className='w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-medium focus:outline-none focus:border-purple-500/50 transition appearance-none'
            >
              {MAGIC_EDIT_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Divider */}
          <div className='border-t border-white/10' />

          {/* Replicate Section (Optional) */}
          <div>
            <label
              htmlFor='replicate-key'
              className='block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex justify-between items-center'
            >
              <span>Replicate API (Optional)</span>
              <span className='text-[9px] text-zinc-600'>For upscaling, background removal</span>
            </label>
            <input
              id='replicate-key'
              type='password'
              value={replicateKey}
              onChange={(e) => {
                setReplicateKey(e.target.value);
                setReplicateStatus('untested');
              }}
              placeholder='r8_...'
              className='w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-medium focus:outline-none focus:border-purple-500/50 transition placeholder-zinc-700'
            />
            {replicateKey && (
              <div className='flex items-center justify-between mt-2'>
                <button
                  type='button'
                  onClick={handleTestReplicate}
                  disabled={replicateStatus === 'testing'}
                  className='text-xs px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded transition disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {replicateStatus === 'testing' ? 'Testing...' : 'Test Connection'}
                </button>
                <ConnectionStatus status={replicateStatus} />
              </div>
            )}
            <p className='text-[9px] text-zinc-600 mt-2'>
              <a
                href='https://replicate.com/account/api-tokens'
                target='_blank'
                rel='noopener noreferrer'
                className='text-purple-400 hover:text-purple-300 underline inline-flex items-center gap-1'
              >
                Get your Replicate API token
                <span className='material-icons text-[10px]'>open_in_new</span>
              </a>
            </p>

            {/* Upscale Model Selection - shown when Replicate key is provided */}
            {replicateKey && (
              <div className='mt-4'>
                <label
                  htmlFor='upscale-model-select'
                  className='block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2'
                >
                  Upscale Model (Replicate)
                </label>
                <select
                  id='upscale-model-select'
                  value={upscaleModel}
                  onChange={(e) => setUpscaleModel(e.target.value)}
                  className='w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-medium focus:outline-none focus:border-purple-500/50 transition appearance-none'
                >
                  {UPSCALE_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <p className='text-[9px] text-zinc-600 mt-2'>
                  Real-ESRGAN for general upscaling, SwinIR for restoration, CodeFormer for faces
                </p>
              </div>
            )}
          </div>

          {/* Error Display */}
          {testError && (
            <div className='p-3 bg-red-500/10 border border-red-500/30 rounded-lg'>
              <p className='text-xs text-red-400 flex items-center gap-2'>
                <span className='material-icons text-sm'>error</span>
                {testError}
              </p>
            </div>
          )}

          {/* Save Button */}
          <button
            type='button'
            onClick={handleSave}
            disabled={isSaving}
            className='w-full h-12 rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'
          >
            {isSaving ? (
              <>
                <span className='material-icons animate-spin'>sync</span>
                Saving...
              </>
            ) : saved ? (
              <>
                <span className='material-icons text-white'>check_circle</span>
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
