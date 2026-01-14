import React, { useState } from 'react';

interface ApiKeys {
  gemini?: string;
  openrouter?: string;
  replicate?: string;
}

interface ApiSetupProps {
  onNext: (keys: ApiKeys) => void;
  onSkip: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export function ApiSetup({ onNext, onSkip, onBack, currentStep, totalSteps }: ApiSetupProps) {
  const [keys, setKeys] = useState<ApiKeys>({});
  const [showKeys, setShowKeys] = useState({
    gemini: false,
    openrouter: false,
    replicate: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(keys);
  };

  return (
    <div className='min-h-screen flex flex-col p-6'>
      {/* Progress Dots with Neumorphic Effect */}
      <div className='flex justify-center gap-3 mb-8'>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i <= currentStep
                ? 'bg-gradient-to-br from-sky-500 via-teal-500 to-cyan-400 shadow-[0_0_12px_rgba(20,184,166,0.5),2px_2px_4px_rgba(0,0,0,0.3),-2px_-2px_4px_rgba(255,255,255,0.05)]'
                : 'bg-zinc-800 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.05)]'
            }`}
          />
        ))}
      </div>

      <div className='flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full'>
        {/* Glass Card */}
        <div className='bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-2xl p-8 w-full'>
          {/* Header */}
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-2 font-['Space_Grotesk']">
            Connect your AI
          </h2>
          <p className='text-zinc-400 text-center mb-8'>
            Add API keys to enable AI features (optional)
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className='w-full space-y-4'>
            {/* Gemini */}
            <div>
              <div className='flex items-center justify-between mb-2'>
                <label className='text-sm text-zinc-400'>Google Gemini API Key</label>
                <a
                  href='https://makersuite.google.com/app/apikey'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-xs text-teal-400 hover:text-teal-300 transition-colors'
                >
                  Get key
                </a>
              </div>
              <div className='relative'>
                <input
                  type={showKeys.gemini ? 'text' : 'password'}
                  value={keys.gemini || ''}
                  onChange={(e) => setKeys({ ...keys, gemini: e.target.value })}
                  className='w-full px-4 py-3 pr-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500/50 focus:shadow-[0_0_20px_rgba(20,184,166,0.2)] transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] font-mono text-sm'
                  placeholder='AIza...'
                />
                <button
                  type='button'
                  onClick={() => setShowKeys({ ...showKeys, gemini: !showKeys.gemini })}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors'
                >
                  {showKeys.gemini ? (
                    <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
                      />
                    </svg>
                  ) : (
                    <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                      />
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* OpenRouter */}
            <div>
              <div className='flex items-center justify-between mb-2'>
                <label className='text-sm text-zinc-400'>OpenRouter API Key</label>
                <a
                  href='https://openrouter.ai/keys'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-xs text-teal-400 hover:text-teal-300 transition-colors'
                >
                  Get key
                </a>
              </div>
              <div className='relative'>
                <input
                  type={showKeys.openrouter ? 'text' : 'password'}
                  value={keys.openrouter || ''}
                  onChange={(e) => setKeys({ ...keys, openrouter: e.target.value })}
                  className='w-full px-4 py-3 pr-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500/50 focus:shadow-[0_0_20px_rgba(20,184,166,0.2)] transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] font-mono text-sm'
                  placeholder='sk-or-...'
                />
                <button
                  type='button'
                  onClick={() => setShowKeys({ ...showKeys, openrouter: !showKeys.openrouter })}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors'
                >
                  {showKeys.openrouter ? (
                    <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
                      />
                    </svg>
                  ) : (
                    <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                      />
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Replicate */}
            <div>
              <div className='flex items-center justify-between mb-2'>
                <label className='text-sm text-zinc-400'>Replicate API Key</label>
                <a
                  href='https://replicate.com/account/api-tokens'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-xs text-teal-400 hover:text-teal-300 transition-colors'
                >
                  Get key
                </a>
              </div>
              <div className='relative'>
                <input
                  type={showKeys.replicate ? 'text' : 'password'}
                  value={keys.replicate || ''}
                  onChange={(e) => setKeys({ ...keys, replicate: e.target.value })}
                  className='w-full px-4 py-3 pr-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500/50 focus:shadow-[0_0_20px_rgba(20,184,166,0.2)] transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] font-mono text-sm'
                  placeholder='r8_...'
                />
                <button
                  type='button'
                  onClick={() => setShowKeys({ ...showKeys, replicate: !showKeys.replicate })}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors'
                >
                  {showKeys.replicate ? (
                    <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
                      />
                    </svg>
                  ) : (
                    <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                      />
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Info Card with Glass Effect */}
            <div className='p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'>
              <p className='text-sm text-zinc-400'>
                Your API keys are stored securely and only used to power AI features. You can add or
                update them later in Settings.
              </p>
            </div>

            {/* Actions */}
            <div className='flex gap-3 pt-4'>
              <button
                type='button'
                onClick={onBack}
                className='px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all duration-300 shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.05)]'
              >
                Back
              </button>
              <button
                type='button'
                onClick={onSkip}
                className='flex-1 px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/20 text-zinc-300 rounded-xl hover:bg-white/10 hover:text-white transition-all duration-300 shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.05)]'
              >
                Skip for now
              </button>
              <button
                type='submit'
                className='flex-1 px-6 py-3 bg-gradient-to-r from-sky-500 via-teal-500 to-cyan-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-[0_0_30px_rgba(20,184,166,0.3),4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.05)] hover:shadow-[0_0_40px_rgba(20,184,166,0.4)]'
              >
                Continue
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ApiSetup;
