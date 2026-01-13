import React, { useState } from 'react';

type WizardStep = 'start' | 'prompt' | 'format' | 'generating' | 'results';

interface GeneratedVariant {
  id: string;
  imageUrl: string;
  selected: boolean;
}

export function QuickGenerateView() {
  const [step, setStep] = useState<WizardStep>('start');
  const [prompt, setPrompt] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [variants, setVariants] = useState<GeneratedVariant[]>([]);

  const platforms = [
    { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
    { id: 'youtube', name: 'YouTube', icon: '▶️' },
    { id: 'instagram', name: 'Instagram', icon: '📸' },
    { id: 'facebook', name: 'Facebook', icon: '👤' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵' },
    { id: 'x', name: 'X (Twitter)', icon: '𝕏' },
  ];

  const handleGenerate = () => {
    setStep('generating');
    // Simulate generation
    setTimeout(() => {
      setVariants([
        { id: '1', imageUrl: '', selected: true },
        { id: '2', imageUrl: '', selected: false },
        { id: '3', imageUrl: '', selected: false },
        { id: '4', imageUrl: '', selected: false },
        { id: '5', imageUrl: '', selected: false },
      ]);
      setStep('results');
    }, 3000);
  };

  const selectVariant = (id: string) => {
    setVariants(variants.map((v) => ({ ...v, selected: v.id === id })));
  };

  const steps = ['start', 'prompt', 'format', 'generating', 'results'];
  const currentStepIndex = steps.indexOf(step);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary teal orb - top right */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-teal-500/20 via-cyan-500/10 to-transparent rounded-full blur-3xl" />
        {/* Secondary teal orb - bottom left */}
        <div className="absolute -bottom-48 -left-48 w-[500px] h-[500px] bg-gradient-to-tr from-sky-500/15 via-teal-500/10 to-transparent rounded-full blur-3xl" />
        {/* Subtle center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-r from-teal-500/5 via-cyan-500/8 to-sky-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Progress Indicator with Neumorphic Style */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentStepIndex >= i
                    ? 'bg-gradient-to-r from-sky-500 via-teal-500 to-cyan-400 shadow-[0_0_12px_rgba(20,184,166,0.6)]'
                    : 'bg-zinc-800 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5),inset_-1px_-1px_2px_rgba(255,255,255,0.05)]'
                } ${
                  currentStepIndex >= i
                    ? 'shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.05),0_0_12px_rgba(20,184,166,0.4)]'
                    : 'shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.05)]'
                }`}
              />
              {i < 4 && (
                <div
                  className={`w-10 h-0.5 transition-all duration-300 ${
                    currentStepIndex > i
                      ? 'bg-gradient-to-r from-sky-500 via-teal-500 to-cyan-400'
                      : 'bg-zinc-800'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step: Start */}
        {step === 'start' && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),4px_4px_16px_rgba(0,0,0,0.4),-4px_-4px_16px_rgba(255,255,255,0.02)] rounded-2xl p-8 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500 via-teal-500 to-cyan-400 flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(20,184,166,0.3),4px_4px_12px_rgba(0,0,0,0.3)]">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-white mb-2 font-['Space_Grotesk']">
              Quick Generate
            </h1>
            <p className="text-zinc-400 mb-8">
              Create stunning designs in seconds with AI
            </p>

            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setStep('prompt')}
                className="w-full py-4 bg-gradient-to-r from-sky-500 via-teal-500 to-cyan-400 text-white font-semibold rounded-xl hover:from-sky-400 hover:via-teal-400 hover:to-cyan-300 transition-all shadow-[0_0_30px_rgba(20,184,166,0.3),4px_4px_12px_rgba(0,0,0,0.3)]"
              >
                Start from Scratch
              </button>
              <button type="button" className="w-full py-4 bg-white/5 backdrop-blur-sm border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.02)] hover:bg-white/10 text-white rounded-xl transition-all">
                Use a Template
              </button>
            </div>
          </div>
        )}

        {/* Step: Prompt */}
        {step === 'prompt' && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),4px_4px_16px_rgba(0,0,0,0.4),-4px_-4px_16px_rgba(255,255,255,0.02)] rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-2 font-['Space_Grotesk']">
              Describe your design
            </h2>
            <p className="text-zinc-400 mb-6">
              Be specific about what you want to create
            </p>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 shadow-[inset_2px_2px_6px_rgba(0,0,0,0.4),inset_-1px_-1px_2px_rgba(255,255,255,0.05)] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500/50 focus:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.4),inset_-1px_-1px_2px_rgba(255,255,255,0.05),0_0_20px_rgba(20,184,166,0.15)] transition-all resize-none mb-4"
              placeholder="A professional LinkedIn banner with abstract geometric shapes, using blue and teal gradient, modern and clean aesthetic..."
            />

            <button type="button" className="w-full py-3 bg-white/5 backdrop-blur-sm border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.02)] hover:bg-white/10 text-teal-400 rounded-xl transition-all mb-6 flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Enhance with AI
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('start')}
                className="flex-1 py-3 bg-white/5 backdrop-blur-sm border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.02)] hover:bg-white/10 text-white rounded-xl transition-all"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep('format')}
                disabled={!prompt}
                className="flex-1 py-3 bg-gradient-to-r from-sky-500 via-teal-500 to-cyan-400 text-white font-semibold rounded-xl hover:from-sky-400 hover:via-teal-400 hover:to-cyan-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(20,184,166,0.2),4px_4px_8px_rgba(0,0,0,0.3)]"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step: Format */}
        {step === 'format' && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),4px_4px_16px_rgba(0,0,0,0.4),-4px_-4px_16px_rgba(255,255,255,0.02)] rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-2 font-['Space_Grotesk']">
              Choose a platform
            </h2>
            <p className="text-zinc-400 mb-6">
              Select where this design will be used
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => setSelectedPlatform(platform.id)}
                  className={`p-4 rounded-xl transition-all backdrop-blur-sm ${
                    selectedPlatform === platform.id
                      ? 'bg-gradient-to-br from-teal-500/20 to-cyan-500/10 border border-teal-500/50 text-white shadow-[0_0_25px_rgba(20,184,166,0.25),inset_0_1px_1px_rgba(255,255,255,0.1)]'
                      : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),4px_4px_8px_rgba(0,0,0,0.3),-2px_-2px_6px_rgba(255,255,255,0.02)]'
                  }`}
                >
                  <span className="text-2xl mb-2 block">{platform.icon}</span>
                  <span className="text-sm">{platform.name}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('prompt')}
                className="flex-1 py-3 bg-white/5 backdrop-blur-sm border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.02)] hover:bg-white/10 text-white rounded-xl transition-all"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!selectedPlatform}
                className="flex-1 py-3 bg-gradient-to-r from-sky-500 via-teal-500 to-cyan-400 text-white font-semibold rounded-xl hover:from-sky-400 hover:via-teal-400 hover:to-cyan-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(20,184,166,0.2),4px_4px_8px_rgba(0,0,0,0.3)]"
              >
                Generate
              </button>
            </div>
          </div>
        )}

        {/* Step: Generating */}
        {step === 'generating' && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),4px_4px_16px_rgba(0,0,0,0.4),-4px_-4px_16px_rgba(255,255,255,0.02)] rounded-2xl p-8 text-center">
            <div className="w-20 h-20 rounded-full border-4 border-transparent bg-gradient-to-r from-sky-500 via-teal-500 to-cyan-400 animate-spin mx-auto mb-6 shadow-[0_0_40px_rgba(20,184,166,0.4)]" style={{ backgroundClip: 'padding-box', borderImage: 'linear-gradient(135deg, #0ea5e9, #14b8a6, #22d3ee) 1' }}>
              <div className="w-full h-full rounded-full bg-zinc-950" />
            </div>

            <h2 className="text-xl font-bold text-white mb-2 font-['Space_Grotesk']">
              Generating your designs...
            </h2>
            <p className="text-zinc-400">
              Creating 5 unique variants for you
            </p>

            <div className="mt-8 space-y-2">
              <div className="h-2 bg-white/5 backdrop-blur-sm shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4)] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-sky-500 via-teal-500 to-cyan-400 rounded-full animate-pulse shadow-[0_0_15px_rgba(20,184,166,0.5)]" style={{ width: '60%' }} />
              </div>
              <p className="text-sm text-zinc-500">This usually takes about 10-15 seconds</p>
            </div>
          </div>
        )}

        {/* Step: Results */}
        {step === 'results' && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),4px_4px_16px_rgba(0,0,0,0.4),-4px_-4px_16px_rgba(255,255,255,0.02)] rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-2 font-['Space_Grotesk']">
              Choose your favorite
            </h2>
            <p className="text-zinc-400 mb-6">
              Select the variant you like best, or regenerate
            </p>

            {/* Variants Grid with Glass Effect */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {variants.map((variant, index) => (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => selectVariant(variant.id)}
                  className={`aspect-video rounded-xl overflow-hidden relative transition-all backdrop-blur-sm ${
                    variant.selected
                      ? 'bg-gradient-to-br from-teal-500/20 to-cyan-500/10 border-2 border-teal-500/70 shadow-[0_0_30px_rgba(20,184,166,0.3),inset_0_1px_1px_rgba(255,255,255,0.1)]'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),4px_4px_8px_rgba(0,0,0,0.3),-2px_-2px_6px_rgba(255,255,255,0.02)]'
                  }`}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-sm">
                    Variant {index + 1}
                  </div>
                  {variant.selected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-gradient-to-r from-sky-500 via-teal-500 to-cyan-400 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.5)]">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('format')}
                className="flex-1 py-3 bg-white/5 backdrop-blur-sm border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.02)] hover:bg-white/10 text-white rounded-xl transition-all"
              >
                Regenerate All
              </button>
              <button type="button" className="flex-1 py-3 bg-gradient-to-r from-sky-500 via-teal-500 to-cyan-400 text-white font-semibold rounded-xl hover:from-sky-400 hover:via-teal-400 hover:to-cyan-300 transition-all shadow-[0_0_20px_rgba(20,184,166,0.2),4px_4px_8px_rgba(0,0,0,0.3)]">
                Open in Studio
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuickGenerateView;
