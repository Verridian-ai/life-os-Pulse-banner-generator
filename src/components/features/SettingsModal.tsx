import React, { useState, useEffect } from 'react';
import { getUserAPIKeys, saveUserAPIKeys } from '../../services/apiKeyStorage';
import { testOpenRouterKey, testReplicateKey } from '../../services/apiKeyValidator';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useAuth } from '../../context/AuthContext';
import { SubscriptionStatus } from '../../features/billing/components/SubscriptionStatus';
import { PricingCards } from '../../features/billing/components/PricingCards';
import { BillingHistory } from '../../features/billing/components/BillingHistory';
import { getSubscription, type SubscriptionResponse } from '../../features/billing/services/billingApi';

// Credit types
interface UserCredits {
  balance: number;
  lifetimeUsed: number;
  lifetimeGranted: number;
  lastRefillAt: string | null;
  nextRefillAt: string | null;
}

interface CreditTier {
  id: string;
  name: string;
  displayName: string;
  monthlyCredits: number;
  priceUsd: string;
  features: Record<string, unknown>;
}

interface CreditTransaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  balanceAfter: number;
  createdAt: string;
}

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
  // OpenRouter Models (Gemini)
  { id: 'google/gemini-3-pro-image-preview', name: 'Nano Banana Pro (4K, Best Quality)', provider: 'openrouter' },
  { id: 'google/gemini-2.5-flash-image', name: 'Nano Banana (2K, Fast)', provider: 'openrouter' },

  // Replicate Models - Latest 2025
  { id: 'ideogram-ai/ideogram-v3', name: 'Ideogram V3 (Best for Text)', provider: 'replicate' },
  { id: 'stability-ai/stable-diffusion-3-large', name: 'SD3 Large (High Quality)', provider: 'replicate' },
  { id: 'stability-ai/stable-diffusion-3-medium', name: 'SD3 Medium (Balanced)', provider: 'replicate' },
  { id: 'adirik/flux-cinestill', name: 'FLUX Cinestill (Cinematic)', provider: 'replicate' },
  { id: 'fofr/flux-realism', name: 'FLUX Realism (Photorealistic)', provider: 'replicate' },
  { id: 'black-forest-labs/flux-1.1-pro', name: 'FLUX 1.1 Pro (Premium)', provider: 'replicate' },
  { id: 'black-forest-labs/flux-1-schnell', name: 'FLUX Schnell (Fast)', provider: 'replicate' },
  { id: 'black-forest-labs/flux-1-dev', name: 'FLUX Dev (Community)', provider: 'replicate' },
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
  // Auth Context for Timeout
  const { updateTimeoutSettings, timeoutDuration } = useAuth();

  // Settings tab
  const [activeTab, setActiveTab] = useState<'credits' | 'billing' | 'api-keys'>('credits');

  // Billing state
  const [billingData, setBillingData] = useState<SubscriptionResponse | null>(null);
  const [isLoadingBilling, setIsLoadingBilling] = useState(false);

  // Credits state
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [tier, setTier] = useState<CreditTier | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<CreditTransaction[]>([]);
  const [isLoadingCredits, setIsLoadingCredits] = useState(false);

  // API Keys
  const [openRouterKey, setOpenRouterKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [replicateKey, setReplicateKey] = useState('');

  // Model selections
  const [chatModel, setChatModel] = useState('nano-banana-pro');
  const [imageGenModel, setImageGenModel] = useState('gemini-3-pro-image-preview');
  const [magicEditModel, setMagicEditModel] = useState('gemini-3-pro-image-preview');
  const [upscaleModel, setUpscaleModel] = useState('');
  const [customChatModel, setCustomChatModel] = useState('');
  const [sessionTimeout, setSessionTimeout] = useState<number>(30);

  // Validation states
  const [openRouterStatus, setOpenRouterStatus] = useState<
    'untested' | 'testing' | 'valid' | 'invalid'
  >('untested');
  const [openaiStatus, setOpenaiStatus] = useState<
    'untested' | 'testing' | 'valid' | 'invalid'
  >('untested');
  const [replicateStatus, setReplicateStatus] = useState<
    'untested' | 'testing' | 'valid' | 'invalid'
  >('untested');
  const [testError, setTestError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Use Focus Trap
  const modalRef = useFocusTrap(isOpen, onClose);

  // Load credits when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchCredits = async () => {
      setIsLoadingCredits(true);
      try {
        const response = await fetch('/api/user/credits', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setCredits(data.credits);
          setTier(data.tier);
          setRecentTransactions(data.recentTransactions || []);
        } else {
          console.error('[Settings] Failed to fetch credits:', response.status);
        }
      } catch (error) {
        console.error('[Settings] Credits fetch error:', error);
      } finally {
        setIsLoadingCredits(false);
      }
    };

    fetchCredits();
  }, [isOpen]);

  // Load billing data when modal opens or billing tab is selected
  useEffect(() => {
    if (!isOpen || activeTab !== 'billing') return;
    if (billingData) return; // Already loaded

    const fetchBilling = async () => {
      setIsLoadingBilling(true);
      try {
        const data = await getSubscription();
        setBillingData(data);
      } catch (error) {
        console.error('[Settings] Failed to fetch billing:', error);
      } finally {
        setIsLoadingBilling(false);
      }
    };

    fetchBilling();
  }, [isOpen, activeTab, billingData]);

  // Load settings on mount
  useEffect(() => {
    if (!isOpen) return;

    const loadSettings = async () => {
      try {
        const keys = await getUserAPIKeys();

        // Set API keys
        setOpenRouterKey(keys.openrouter_api_key || '');
        setOpenaiKey(keys.openai_api_key || '');
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
        setSessionTimeout(timeoutDuration);

        // Reset validation status
        setOpenRouterStatus('untested');
        setOpenaiStatus('untested');
        setReplicateStatus('untested');
        setTestError('');
        setSaved(false);
      } catch (error) {
        console.error('[Settings] Failed to load:', error);
        setTestError('Failed to load saved settings');
      }
    };

    loadSettings();
    if (isOpen) {
      setSessionTimeout(timeoutDuration);
    }
  }, [isOpen, timeoutDuration]);

  const handleTestOpenRouter = async () => {
    setOpenRouterStatus('testing');
    setTestError('');

    try {
      const result = await testOpenRouterKey(openRouterKey);

      if (result.valid) {
        setOpenRouterStatus('valid');
        console.log(`[Settings] ✓ OpenRouter connected (${result.modelCount} models)`);
      } else {
        setOpenRouterStatus('invalid');
        setTestError(result.error || 'Connection failed');
      }
    } catch (error) {
      console.error('[Settings] OpenRouter test error:', error);
      setOpenRouterStatus('invalid');
      setTestError(error instanceof Error ? error.message : 'Connection test failed');
    }
  };

  const handleTestOpenAI = async () => {
    if (!openaiKey) return;

    setOpenaiStatus('testing');
    setTestError('');

    try {
      // Test OpenAI key by making a simple API call
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
        },
      });

      if (response.ok) {
        setOpenaiStatus('valid');
        console.log('[Settings] ✓ OpenAI connected');
      } else {
        setOpenaiStatus('invalid');
        const error = await response.json();
        setTestError(error.error?.message || 'Invalid API key');
      }
    } catch (error) {
      console.error('[Settings] OpenAI test error:', error);
      setOpenaiStatus('invalid');
      setTestError(error instanceof Error ? error.message : 'Connection test failed');
    }
  };

  const handleTestReplicate = async () => {
    if (!replicateKey) return;

    setReplicateStatus('testing');
    setTestError('');

    try {
      const result = await testReplicateKey(replicateKey);

      if (result.valid) {
        setReplicateStatus('valid');
        console.log('[Settings] ✓ Replicate connected');
      } else {
        setReplicateStatus('invalid');
        setTestError(result.error || 'Connection failed');
      }
    } catch (error) {
      console.error('[Settings] Replicate test error:', error);
      setReplicateStatus('invalid');
      setTestError(error instanceof Error ? error.message : 'Connection test failed');
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

      // Update timeout settings (fire and forget, it handles its own toast/error but we catch generic errors here)
      updateTimeoutSettings(sessionTimeout).catch(console.error);

      // Save to database via backend API
      const result = await saveUserAPIKeys({
        openrouter_api_key: openRouterKey,
        openai_api_key: openaiKey || undefined,
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
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4'
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div
        ref={modalRef}
        className='bg-zinc-900 border border-white/10 rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative'
      >
        <button
          type='button'
          onClick={onClose}
          className='absolute top-4 right-4 min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 rounded-full transition focus-ring'
          aria-label="Close settings"
        >
          <span className='material-icons'>close</span>
        </button>

        <h2
          id="settings-modal-title"
          className='text-xl font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2'
        >
          <span className='material-icons text-purple-500'>settings</span>
          Settings
        </h2>

        {/* Tab Navigation */}
        <div className='flex gap-2 mb-6'>
          <button
            type='button'
            onClick={() => setActiveTab('credits')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition ${activeTab === 'credits'
              ? 'bg-purple-600 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
          >
            <span className='material-icons text-sm mr-1 align-middle'>payments</span>
            Credits
          </button>
          <button
            type='button'
            onClick={() => setActiveTab('billing')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition ${activeTab === 'billing'
              ? 'bg-purple-600 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
          >
            <span className='material-icons text-sm mr-1 align-middle'>credit_card</span>
            Billing
          </button>
          <button
            type='button'
            onClick={() => setActiveTab('api-keys')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition ${activeTab === 'api-keys'
              ? 'bg-purple-600 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
          >
            <span className='material-icons text-sm mr-1 align-middle'>key</span>
            Keys
          </button>
        </div>

        {/* Credits Tab */}
        {activeTab === 'credits' && (
          <div className='space-y-6'>
            {isLoadingCredits ? (
              <div className='flex items-center justify-center py-8'>
                <span className='material-icons animate-spin text-purple-500'>sync</span>
                <span className='ml-2 text-zinc-400 text-sm'>Loading credits...</span>
              </div>
            ) : credits ? (
              <>
                {/* Balance Card */}
                <div className='bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <span className='text-[10px] font-bold text-zinc-400 uppercase tracking-widest'>
                      Credit Balance
                    </span>
                    {tier && (
                      <span className='px-2 py-1 bg-purple-600/30 border border-purple-500/50 rounded-full text-[9px] font-bold text-purple-300 uppercase'>
                        {tier.displayName || tier.name}
                      </span>
                    )}
                  </div>
                  <div className='flex items-baseline gap-2'>
                    <span className='text-4xl font-black text-white'>{credits.balance}</span>
                    <span className='text-zinc-400 text-sm'>credits</span>
                  </div>

                  {/* Usage Bar */}
                  <div className='mt-4'>
                    <div className='flex justify-between text-[9px] text-zinc-500 mb-1'>
                      <span>Used: {credits.lifetimeUsed}</span>
                      <span>Total granted: {credits.lifetimeGranted}</span>
                    </div>
                    <div className='h-2 bg-zinc-800 rounded-full overflow-hidden'>
                      <div
                        className='h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 usage-bar'
                        data-usage-percent={Math.min(
                          100,
                          (credits.lifetimeUsed / Math.max(1, credits.lifetimeGranted)) * 100
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Credit Costs Info */}
                <div className='bg-zinc-800/50 border border-white/5 rounded-xl p-4'>
                  <h3 className='text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3'>
                    Credit Costs
                  </h3>
                  <div className='grid grid-cols-2 gap-2 text-[10px]'>
                    <div className='flex justify-between'>
                      <span className='text-zinc-500'>Image Generate</span>
                      <span className='text-white font-bold'>10</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-zinc-500'>HD Generate</span>
                      <span className='text-white font-bold'>20</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-zinc-500'>Magic Edit</span>
                      <span className='text-white font-bold'>15</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-zinc-500'>Upscale</span>
                      <span className='text-white font-bold'>5</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-zinc-500'>Remove BG</span>
                      <span className='text-white font-bold'>3</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-zinc-500'>Chat Message</span>
                      <span className='text-white font-bold'>1</span>
                    </div>
                  </div>
                </div>

                {/* Recent Transactions */}
                {recentTransactions.length > 0 && (
                  <div>
                    <h3 className='text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3'>
                      Recent Activity
                    </h3>
                    <div className='space-y-2 max-h-40 overflow-y-auto'>
                      {recentTransactions.slice(0, 5).map((tx) => (
                        <div
                          key={tx.id}
                          className='flex items-center justify-between py-2 border-b border-white/5 last:border-0'
                        >
                          <div className='flex items-center gap-2'>
                            <span
                              className={`material-icons text-sm ${tx.amount > 0 ? 'text-green-500' : 'text-red-400'
                                }`}
                            >
                              {tx.amount > 0 ? 'add_circle' : 'remove_circle'}
                            </span>
                            <span className='text-[10px] text-zinc-400 truncate max-w-[150px]'>
                              {tx.description}
                            </span>
                          </div>
                          <span
                            className={`text-xs font-bold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'
                              }`}
                          >
                            {tx.amount > 0 ? '+' : ''}{tx.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tier Info */}
                {tier && (
                  <div className='bg-zinc-800/30 border border-white/5 rounded-xl p-4'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-[10px] text-zinc-500 uppercase tracking-widest'>Current Plan</p>
                        <p className='text-white font-bold'>{tier.displayName || tier.name}</p>
                        <p className='text-[10px] text-zinc-500'>
                          {tier.monthlyCredits} credits/month
                        </p>
                      </div>
                      {tier.priceUsd && Number(tier.priceUsd) > 0 && (
                        <div className='text-right'>
                          <p className='text-lg font-bold text-white'>${tier.priceUsd}</p>
                          <p className='text-[9px] text-zinc-500'>/month</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className='text-center py-8 text-zinc-500 text-sm'>
                Unable to load credits. Please try again.
              </div>
            )}
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className='space-y-6'>
            {isLoadingBilling ? (
              <div className='flex items-center justify-center py-12'>
                <span className='material-icons animate-spin text-purple-500'>sync</span>
                <span className='ml-2 text-zinc-400 text-sm'>Loading billing...</span>
              </div>
            ) : (
              <>
                {/* Subscription Status */}
                <SubscriptionStatus
                  subscription={billingData?.subscription || null}
                  credits={billingData?.credits || { balance: 0, tier: 'free' }}
                  onRefresh={() => {
                    setBillingData(null); // Force refresh
                  }}
                />

                {/* Pricing Cards */}
                <div>
                  <h3 className='text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4'>
                    Available Plans
                  </h3>
                  <PricingCards
                    currentTier={billingData?.credits?.tier || 'free'}
                    onError={(error) => {
                      console.error('[Settings] Billing error:', error);
                    }}
                  />
                </div>

                {/* Billing History */}
                <BillingHistory limit={5} />
              </>
            )}
          </div>
        )}

        {/* API Keys Tab */}
        {activeTab === 'api-keys' && (
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
                className='w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-medium focus-ring transition placeholder-zinc-700'
              />
              <div className='flex items-center justify-between mt-2'>
                <button
                  type='button'
                  onClick={handleTestOpenRouter}
                  disabled={!openRouterKey || openRouterStatus === 'testing'}
                  className='text-xs px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded transition disabled:opacity-50 disabled:cursor-not-allowed focus-ring'
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
                  className='text-purple-400 hover:text-purple-300 underline inline-flex items-center gap-1 focus-ring rounded-sm'
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
              <div className='relative'>
                <select
                  id='chat-model-select'
                  value={chatModel}
                  onChange={(e) => setChatModel(e.target.value)}
                  className='w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white text-xs font-medium focus-ring transition appearance-none cursor-pointer'
                >
                  {COMMON_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                  <option value='custom'>+ Custom Model ID</option>
                </select>
                <span className='absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none material-icons text-sm'>expand_more</span>
              </div>
              {chatModel === 'custom' && (
                <input
                  type='text'
                  value={customChatModel}
                  onChange={(e) => setCustomChatModel(e.target.value)}
                  placeholder='e.g., openai/gpt-4'
                  className='w-full px-4 py-2 mt-2 bg-zinc-800 border border-purple-500/30 rounded-xl text-white text-xs font-medium focus-ring transition placeholder-zinc-500'
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
              <div className='relative'>
                <select
                  id='image-gen-model-select'
                  value={imageGenModel}
                  onChange={(e) => setImageGenModel(e.target.value)}
                  className='w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white text-xs font-medium focus-ring transition appearance-none cursor-pointer'
                >
                  {IMAGE_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <span className='absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none material-icons text-sm'>expand_more</span>
              </div>
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
              <div className='relative'>
                <select
                  id='magic-edit-model-select'
                  value={magicEditModel}
                  onChange={(e) => setMagicEditModel(e.target.value)}
                  className='w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white text-xs font-medium focus-ring transition appearance-none cursor-pointer'
                >
                  {MAGIC_EDIT_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <span className='absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none material-icons text-sm'>expand_more</span>
              </div>
            </div>

            {/* Session Timeout */}
            <div>
              <label
                htmlFor='session-timeout-select'
                className='block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2'
              >
                Session Idle Timeout
              </label>
              <div className='relative'>
                <select
                  id='session-timeout-select'
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(Number(e.target.value))}
                  className='w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white text-xs font-medium focus-ring transition appearance-none cursor-pointer'
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes (Default)</option>
                  <option value={60}>1 Hour</option>
                  <option value={120}>2 Hours</option>
                  <option value={0.5}>Test Mode (30s)</option>
                  <option value={0}>Disabled</option>
                </select>
                <span className='absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none material-icons text-sm'>expand_more</span>
              </div>
              <p className='text-[9px] text-zinc-600 mt-2'>
                Automatically logout after inactivity to protect your account.
              </p>
            </div>

            {/* Divider */}
            <div className='border-t border-white/10' />

            {/* OpenAI Section (Optional - for Voice Chat) */}
            <div>
              <label
                htmlFor='openai-key'
                className='block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex justify-between items-center'
              >
                <span>OpenAI API (Optional)</span>
                <span className='text-[9px] text-zinc-600'>For voice chat / live assistant</span>
              </label>
              <input
                id='openai-key'
                type='password'
                value={openaiKey}
                onChange={(e) => {
                  setOpenaiKey(e.target.value);
                  setOpenaiStatus('untested');
                }}
                placeholder='sk-...'
                className='w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-medium focus-ring transition placeholder-zinc-700'
              />
              {openaiKey && (
                <div className='flex items-center justify-between mt-2'>
                  <button
                    type='button'
                    onClick={handleTestOpenAI}
                    disabled={openaiStatus === 'testing'}
                    className='text-xs px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded transition disabled:opacity-50 disabled:cursor-not-allowed focus-ring'
                  >
                    {openaiStatus === 'testing' ? 'Testing...' : 'Test Connection'}
                  </button>
                  <ConnectionStatus status={openaiStatus} />
                </div>
              )}
              <p className='text-[9px] text-zinc-600 mt-2'>
                <a
                  href='https://platform.openai.com/api-keys'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-purple-400 hover:text-purple-300 underline inline-flex items-center gap-1 focus-ring rounded-sm'
                >
                  Get your OpenAI API key
                  <span className='material-icons text-[10px]'>open_in_new</span>
                </a>
              </p>
            </div>

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
                className='w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-medium focus-ring transition placeholder-zinc-700'
              />
              {replicateKey && (
                <div className='flex items-center justify-between mt-2'>
                  <button
                    type='button'
                    onClick={handleTestReplicate}
                    disabled={replicateStatus === 'testing'}
                    className='text-xs px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded transition disabled:opacity-50 disabled:cursor-not-allowed focus-ring'
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
                  className='text-purple-400 hover:text-purple-300 underline inline-flex items-center gap-1 focus-ring rounded-sm'
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
                  <div className='relative'>
                    <select
                      id='upscale-model-select'
                      value={upscaleModel}
                      onChange={(e) => setUpscaleModel(e.target.value)}
                      className='w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white text-xs font-medium focus-ring transition appearance-none cursor-pointer'
                    >
                      {UPSCALE_MODELS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                    <span className='absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none material-icons text-sm'>expand_more</span>
                  </div>
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
        )}
      </div>
    </div>
  );
};