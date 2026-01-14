// Model Selector - Hybrid model selection with auto-select and manual override

import React, { useState, useEffect } from 'react';
import { useAI } from '../../context/AIContext';
import { fetchOpenRouterModels } from '../../services/openrouter';
import { getUserAPIKeys } from '../../services/apiKeyStorage';
import { MODELS } from '../../constants';

interface ModelSelectorProps {
  onModelChange?: (modelId: string) => void;
}

import { compareModelPerformance } from '../../services/modelRouter'; // Updated import
import { useModelMetrics } from '../../hooks/useModelMetrics'; // Updated import

// ...

export const ModelSelector: React.FC<ModelSelectorProps> = ({ onModelChange }) => {
  const { modelOverride, setModelOverride } = useAI();
  const [autoSelect, setAutoSelect] = useState(true);
  const [provider, setProvider] = useState<'gemini' | 'openrouter'>('gemini');
  const [openrouterModels, setOpenrouterModels] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  // Get real-world metrics for intelligent recommendation
  const { stats } = useModelMetrics();

  // Load OpenRouter models when provider changes
  useEffect(() => {
    if (provider === 'openrouter') {
      loadOpenRouterModels();
    }
  }, [provider]);

  const loadOpenRouterModels = async () => {
    setIsLoadingModels(true);
    try {
      const keys = await getUserAPIKeys();
      const apiKey = keys.openrouter_api_key || '';
      if (!apiKey) {
        console.warn('OpenRouter API key not found');
        return;
      }
      const models = await fetchOpenRouterModels(apiKey);
      setOpenrouterModels(models);
    } catch (error) {
      console.error('Failed to load OpenRouter models:', error);
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleAutoSelectToggle = (enabled: boolean) => {
    setAutoSelect(enabled);
    if (enabled) {
      setModelOverride(null);
      onModelChange?.('auto');
    }
  };

  const handleProviderChange = (newProvider: 'gemini' | 'openrouter') => {
    setProvider(newProvider);
    setModelOverride(null);
  };

  const handleModelSelect = (modelId: string) => {
    setModelOverride(modelId);
    onModelChange?.(modelId);
  };

  // Get featured models for quick selection
  const getFeaturedModels = () => {
    let models = [];
    if (provider === 'gemini') {
      models = [
        { id: MODELS.textBasic, name: 'Gemini 3.0 Pro', description: 'Fast, cost-effective' },
        {
          id: MODELS.textThinking,
          name: 'Gemini 3 Pro Preview',
          description: 'Advanced reasoning',
        },
        { id: MODELS.imageGen, name: 'Gemini 3 Pro Image', description: '4K image generation' },
        { id: MODELS.imageEdit, name: 'Gemini 2.5 Flash Image', description: 'Fast image editing' },
      ];
    } else {
      models = [
        {
          id: MODELS.openrouter.gpt52,
          name: 'GPT-5.2',
          description: 'Latest from OpenAI (Dec 2025)',
        },
        {
          id: MODELS.openrouter.gpt52Pro,
          name: 'GPT-5.2 Pro',
          description: 'High-performance reasoning',
        },
        {
          id: MODELS.openrouter.claude45Sonnet,
          name: 'Claude 4.5 Sonnet',
          description: 'Advanced reasoning & coding',
        },
        {
          id: MODELS.openrouter.minimaxM2,
          name: 'MiniMax M2 Plus',
          description: 'Coding & agentic tasks',
        },
      ];
    }

    // Enhance with recommendation data if stats are available
    if (stats && !autoSelect) {
      // Compare models based on balanced criteria
      const comparison = compareModelPerformance(
        models.map((m) => m.id),
        stats,
        'balanced',
      );

      // Find best model
      const bestModelId = comparison[0]?.modelId;

      return models.map((model) => {
        const result = comparison.find((c) => c.modelId === model.id);
        return {
          ...model,
          isRecommended: model.id === bestModelId,
          reason: result?.reason,
        };
      });
    }

    return models;
  };

  return (
    <div className='bg-black/40 p-5 rounded-3xl border border-white/5'>
      <h4 className='text-xs font-bold text-zinc-400 uppercase mb-4 flex items-center gap-2'>
        <span className='material-icons text-sm'>psychology</span>
        Model Selection
      </h4>

      {/* Auto-Select Toggle */}
      <div className='bg-zinc-900/50 rounded-xl p-3 mb-4'>
        <label className='flex items-center justify-between cursor-pointer'>
          <div>
            <span className='text-sm text-white font-bold'>Auto-Select Best Model</span>
            <p className='text-[10px] text-zinc-500 mt-1'>
              AI automatically picks the optimal model for each task
            </p>
          </div>
          <div className='relative'>
            <input
              type='checkbox'
              checked={autoSelect}
              onChange={(e) => handleAutoSelectToggle(e.target.checked)}
              className='sr-only peer'
            />
            <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </div>
        </label>
      </div>

      {/* Manual Selection */}
      {!autoSelect && (
        <div className='space-y-4'>
          {/* Provider Selector */}
          <div className='bg-zinc-900/50 rounded-xl p-3'>
            <label className='text-[10px] text-zinc-500 mb-2 block font-bold'>PROVIDER</label>
            <div className='flex gap-2'>
              {['gemini', 'openrouter'].map((p) => (
                <button
                  key={p}
                  type='button'
                  onClick={() => handleProviderChange(p as 'gemini' | 'openrouter')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition ${
                    provider === p
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {p === 'gemini' ? 'Google Gemini' : 'OpenRouter'}
                </button>
              ))}
            </div>
          </div>

          {/* Model Selector */}
          <div className='bg-zinc-900/50 rounded-xl p-3'>
            <label className='text-[10px] text-zinc-500 mb-2 block font-bold'>MODEL</label>
            {isLoadingModels ? (
              <div className='text-center py-4'>
                <div className='w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto'></div>
                <p className='text-xs text-zinc-500 mt-2'>Loading models...</p>
              </div>
            ) : (
              <div className='space-y-2'>
                {getFeaturedModels().map((model) => (
                  <button
                    key={model.id}
                    type='button'
                    onClick={() => handleModelSelect(model.id)}
                    className={`w-full text-left p-3 rounded-lg transition relative overflow-hidden ${
                      modelOverride === model.id
                        ? 'bg-blue-600 border border-blue-500'
                        : 'bg-zinc-800 border border-white/10 hover:bg-zinc-700'
                    }`}
                  >
                    {/* Recommended Badge */}
                    {/* @ts-expect-error - property explicitly added in enhancement step */}
                    {model.isRecommended && (
                      <div className='absolute top-0 right-0 bg-green-500 text-black text-[9px] font-bold px-2 py-0.5 rounded-bl-lg'>
                        RECOMMENDED
                      </div>
                    )}

                    <div className='flex items-center justify-between'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2'>
                          <h5 className='text-sm font-bold text-white'>{model.name}</h5>
                          {/* @ts-expect-error - property explicitly added in enhancement step */}
                          {model.reason && (
                            <span className='text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 border border-white/5'>
                              {/* @ts-expect-error - property explicitly added in enhancement step */}
                              {model.reason}
                            </span>
                          )}
                        </div>
                        <p className='text-[10px] text-zinc-400 mt-0.5'>{model.description}</p>
                      </div>
                      {modelOverride === model.id && (
                        <span className='material-icons text-sm text-blue-300'>check_circle</span>
                      )}
                    </div>
                  </button>
                ))}

                {/* Browse All Models */}
                {provider === 'openrouter' && openrouterModels.length > 4 && (
                  <details className='mt-2'>
                    <summary className='text-xs text-blue-400 cursor-pointer hover:text-blue-300 font-bold'>
                      Browse all {openrouterModels.length} models →
                    </summary>
                    <div className='mt-2 space-y-1 max-h-64 overflow-y-auto'>
                      {openrouterModels.slice(4).map((model) => (
                        <button
                          key={model.id}
                          type='button'
                          onClick={() => handleModelSelect(model.id)}
                          className={`w-full text-left p-2 rounded text-xs transition ${
                            modelOverride === model.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                          }`}
                        >
                          {model.name}
                        </button>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            )}
          </div>

          {/* Current Selection Info */}
          {modelOverride && (
            <div className='bg-blue-900/20 border border-blue-500/30 rounded-lg p-3'>
              <div className='flex items-start gap-2'>
                <span className='material-icons text-sm text-blue-400'>info</span>
                <div>
                  <p className='text-xs font-bold text-blue-300'>Manual Override Active</p>
                  <p className='text-[10px] text-blue-200 mt-1'>
                    All operations will use: <span className='font-mono'>{modelOverride}</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Auto-Select Status */}
      {autoSelect && (
        <div className='bg-green-900/20 border border-green-500/30 rounded-lg p-3'>
          <div className='flex items-start gap-2'>
            <span className='material-icons text-sm text-green-400'>auto_awesome</span>
            <div>
              <p className='text-xs font-bold text-green-300'>Auto-Selection Enabled</p>
              <p className='text-[10px] text-green-200 mt-1'>
                System will automatically choose the best model based on:
              </p>
              <ul className='text-[9px] text-green-200/80 mt-2 space-y-1 ml-4'>
                <li>• Task type (reasoning, vision, coding, image generation)</li>
                <li>• Real-world performance stats (Success Rate, Speed)</li>
                <li>• Cost efficiency</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Info Text */}
      <p className='text-[9px] text-zinc-600 text-center mt-4'>
        Manual override useful for testing specific models or controlling costs
      </p>
    </div>
  );
};
