// Tool Chain Builder - Create and execute multi-step AI workflows

import React, { useState } from 'react';
import { useAI } from '../../context/AIContext';
import type { ToolChain, ChainStep } from '../../types/ai';

interface ToolChainBuilderProps {
  currentImage: string | null;
  onChainComplete: (resultImage: string) => void;
}

type ToolType =
  | 'upscale'
  | 'removebg'
  | 'restore'
  | 'faceenhance'
  | 'edit'
  | 'generate'
  | 'inpaint'
  | 'outpaint';

const AVAILABLE_TOOLS: { type: ToolType; name: string; icon: string; description: string }[] = [
  {
    type: 'upscale',
    name: 'Upscale',
    icon: 'hd',
    description: 'Enhance resolution 2x or 4x',
  },
  {
    type: 'removebg',
    name: 'Remove Background',
    icon: 'layers_clear',
    description: 'Remove image background',
  },
  {
    type: 'restore',
    name: 'Restore',
    icon: 'auto_awesome',
    description: 'Fix low-quality images',
  },
  {
    type: 'faceenhance',
    name: 'Face Enhance',
    icon: 'face',
    description: 'Improve portrait quality',
  },
  {
    type: 'edit',
    name: 'Magic Edit',
    icon: 'auto_fix_normal',
    description: 'AI-powered editing',
  },
  {
    type: 'generate',
    name: 'Generate',
    icon: 'draw',
    description: 'Generate new image',
  },
];

const CHAIN_TEMPLATES = [
  {
    name: 'Professional Polish',
    description: 'Upscale, restore, and enhance',
    steps: [
      { tool: 'upscale' as ToolType, params: { quality: 'balanced' } },
      { tool: 'restore' as ToolType, params: {} },
      { tool: 'faceenhance' as ToolType, params: {} },
    ],
  },
  {
    name: 'Clean Background',
    description: 'Remove BG and upscale',
    steps: [
      { tool: 'removebg' as ToolType, params: {} },
      { tool: 'upscale' as ToolType, params: { quality: 'best' } },
    ],
  },
  {
    name: 'Quick Enhance',
    description: 'Fast upscale and restore',
    steps: [
      { tool: 'upscale' as ToolType, params: { quality: 'fast' } },
      { tool: 'restore' as ToolType, params: {} },
    ],
  },
];

export const ToolChainBuilder: React.FC<ToolChainBuilderProps> = ({
  currentImage,
  onChainComplete,
}) => {
  const { activeChain, setActiveChain, chainProgress } = useAI();
  const [chainSteps, setChainSteps] = useState<{ tool: ToolType; params: any }[]>([]);
  const [chainName, setChainName] = useState('Custom Chain');
  const [isExecuting, setIsExecuting] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const addStep = (tool: ToolType) => {
    const defaultParams: Record<ToolType, any> = {
      upscale: { quality: 'balanced' },
      removebg: {},
      restore: {},
      faceenhance: {},
      edit: { prompt: '' },
      generate: { prompt: '' },
      inpaint: { prompt: '', mask: '' },
      outpaint: { direction: 'right' },
    };

    setChainSteps([...chainSteps, { tool, params: defaultParams[tool] }]);
  };

  const removeStep = (index: number) => {
    setChainSteps(chainSteps.filter((_, i) => i !== index));
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === chainSteps.length - 1)
    ) {
      return;
    }

    const newSteps = [...chainSteps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    setChainSteps(newSteps);
  };

  const updateStepParam = (index: number, paramKey: string, value: any) => {
    const newSteps = [...chainSteps];
    newSteps[index].params[paramKey] = value;
    setChainSteps(newSteps);
  };

  const loadTemplate = (template: (typeof CHAIN_TEMPLATES)[0]) => {
    setChainSteps(template.steps);
    setChainName(template.name);
    setShowTemplates(false);
  };

  const executeChain = async () => {
    if (!currentImage) {
      alert('No image to process. Generate or upload an image first.');
      return;
    }

    if (chainSteps.length === 0) {
      alert('Add at least one step to the chain');
      return;
    }

    setIsExecuting(true);

    // Convert chain steps to ChainStep format
    const steps: ChainStep[] = chainSteps.map((step, idx) => ({
      id: `step-${idx}`,
      tool: step.tool,
      params: step.params,
      status: 'pending',
      order: idx,
    }));

    const chain: ToolChain = {
      id: Date.now().toString(),
      name: chainName,
      steps,
      currentStep: 0,
      status: 'running',
      startedAt: Date.now(),
    };

    setActiveChain(chain);

    try {
      // TODO: Implement actual chain execution
      // This would integrate with ReplicateService and LLM service
      // For now, we'll simulate execution
      const currentImageData = currentImage;

      for (let i = 0; i < steps.length; i++) {
        // Update step status
        steps[i].status = 'running';
        setActiveChain({ ...chain, steps: [...steps] });

        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Mark step as completed
        steps[i].status = 'completed';
        setActiveChain({ ...chain, steps: [...steps] });
      }

      chain.status = 'completed';
      setActiveChain(chain);

      onChainComplete(currentImageData);
      alert('Chain execution completed!');
    } catch (error: any) {
      chain.status = 'failed';
      setActiveChain(chain);
      alert(`Chain execution failed: ${error.message}`);
    } finally {
      setIsExecuting(false);
      setTimeout(() => setActiveChain(null), 3000);
    }
  };

  const clearChain = () => {
    if (confirm('Clear all steps?')) {
      setChainSteps([]);
      setChainName('Custom Chain');
    }
  };

  return (
    <div className="bg-black/40 p-5 rounded-3xl border border-white/5">
      <h4 className="text-xs font-bold text-zinc-400 uppercase mb-4 flex items-center gap-2">
        <span className="material-icons text-sm">account_tree</span>
        Tool Chain Builder
      </h4>

      {/* Chain Name */}
      <div className="bg-zinc-900/50 rounded-xl p-3 mb-4">
        <label className="text-[10px] text-zinc-500 mb-2 block font-bold">CHAIN NAME</label>
        <input
          type="text"
          value={chainName}
          onChange={(e) => setChainName(e.target.value)}
          className="w-full bg-zinc-800 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-blue-500 focus:outline-none"
          placeholder="Enter chain name..."
        />
      </div>

      {/* Templates */}
      <div className="mb-4">
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="w-full bg-zinc-900/50 hover:bg-zinc-800/50 border border-white/10 rounded-xl p-3 text-left transition flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <span className="material-icons text-sm text-zinc-400">bookmark</span>
            <span className="text-xs font-bold text-zinc-300">Load Template</span>
          </div>
          <span className="material-icons text-sm text-zinc-500">
            {showTemplates ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {showTemplates && (
          <div className="mt-2 space-y-2">
            {CHAIN_TEMPLATES.map((template, idx) => (
              <button
                key={idx}
                onClick={() => loadTemplate(template)}
                className="w-full bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-lg p-3 text-left transition"
              >
                <p className="text-sm font-bold text-white mb-1">{template.name}</p>
                <p className="text-[10px] text-zinc-400">{template.description}</p>
                <p className="text-[9px] text-zinc-600 mt-1">
                  {template.steps.length} steps
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chain Steps */}
      {chainSteps.length > 0 && (
        <div className="bg-zinc-900/50 rounded-xl p-4 mb-4">
          <label className="text-[10px] text-zinc-500 mb-3 block font-bold">
            WORKFLOW STEPS ({chainSteps.length})
          </label>
          <div className="space-y-2">
            {chainSteps.map((step, idx) => {
              const tool = AVAILABLE_TOOLS.find((t) => t.type === step.tool);
              return (
                <div
                  key={idx}
                  className="bg-zinc-800 border border-white/10 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-zinc-500">
                        #{idx + 1}
                      </span>
                      <span className="material-icons text-sm text-blue-400">
                        {tool?.icon}
                      </span>
                      <span className="text-sm font-bold text-white">{tool?.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => moveStep(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 hover:bg-zinc-700 rounded disabled:opacity-30"
                      >
                        <span className="material-icons text-sm text-zinc-400">
                          arrow_upward
                        </span>
                      </button>
                      <button
                        onClick={() => moveStep(idx, 'down')}
                        disabled={idx === chainSteps.length - 1}
                        className="p-1 hover:bg-zinc-700 rounded disabled:opacity-30"
                      >
                        <span className="material-icons text-sm text-zinc-400">
                          arrow_downward
                        </span>
                      </button>
                      <button
                        onClick={() => removeStep(idx)}
                        className="p-1 hover:bg-red-900/50 rounded"
                      >
                        <span className="material-icons text-sm text-red-400">delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Step Parameters */}
                  {step.tool === 'upscale' && (
                    <select
                      value={step.params.quality}
                      onChange={(e) => updateStepParam(idx, 'quality', e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded p-2 text-xs text-white"
                    >
                      <option value="fast">Fast</option>
                      <option value="balanced">Balanced</option>
                      <option value="best">Best</option>
                    </select>
                  )}

                  {(step.tool === 'edit' || step.tool === 'generate') && (
                    <input
                      type="text"
                      value={step.params.prompt}
                      onChange={(e) => updateStepParam(idx, 'prompt', e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded p-2 text-xs text-white"
                      placeholder="Enter prompt..."
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Step */}
      <div className="bg-zinc-900/50 rounded-xl p-4 mb-4">
        <label className="text-[10px] text-zinc-500 mb-3 block font-bold">ADD STEP</label>
        <div className="grid grid-cols-2 gap-2">
          {AVAILABLE_TOOLS.map((tool) => (
            <button
              key={tool.type}
              onClick={() => addStep(tool.type)}
              disabled={isExecuting}
              className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 border border-white/10 rounded-lg p-3 text-left transition group"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="material-icons text-sm text-blue-400 group-hover:text-blue-300">
                  {tool.icon}
                </span>
                <span className="text-xs font-bold text-white">{tool.name}</span>
              </div>
              <p className="text-[9px] text-zinc-500">{tool.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Execute/Clear Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={executeChain}
          disabled={isExecuting || chainSteps.length === 0 || !currentImage}
          className="flex-1 bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 text-white font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 text-sm"
        >
          {isExecuting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Executing...
            </>
          ) : (
            <>
              <span className="material-icons text-base">play_arrow</span>
              Execute Chain
            </>
          )}
        </button>

        {chainSteps.length > 0 && (
          <button
            onClick={clearChain}
            disabled={isExecuting}
            className="bg-red-900/50 hover:bg-red-900/70 disabled:opacity-50 text-red-300 font-bold py-3 px-4 rounded-xl transition text-sm"
          >
            Clear
          </button>
        )}
      </div>

      {/* Chain Progress */}
      {activeChain && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-300">Executing Chain</span>
            <span className="text-xs font-bold text-blue-400">{Math.round(chainProgress)}%</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${chainProgress}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-blue-200">
            Step {activeChain.steps.filter((s) => s.status === 'completed').length + 1} of{' '}
            {activeChain.steps.length}
          </p>
        </div>
      )}

      {/* Info Text */}
      <p className="text-[9px] text-zinc-600 text-center">
        Chain multiple AI operations together for powerful automated workflows
      </p>
    </div>
  );
};
