import React, { useState } from 'react';

interface APIKeyInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const APIKeyInstructionsModal: React.FC<APIKeyInstructionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeService, setActiveService] = useState<'openrouter' | 'replicate'>('openrouter');

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto'>
      <div className='bg-zinc-900 border border-white/10 rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 w-full max-w-lg md:max-w-2xl shadow-2xl relative my-4 md:my-8 max-h-[95vh] overflow-y-auto'>
        <button
          onClick={onClose}
          className='absolute top-3 right-3 md:top-4 md:right-4 text-zinc-500 hover:text-white transition z-10 min-w-[44px] min-h-[44px] flex items-center justify-center'
          aria-label='Close instructions'
        >
          <span className='material-icons text-xl md:text-2xl'>close</span>
        </button>

        <div className='text-center mb-4 md:mb-6 pr-12'>
          <div className='inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl md:rounded-2xl mb-3 md:mb-4'>
            <span className='material-icons text-2xl md:text-3xl text-white'>key</span>
          </div>
          <h2 className='text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-wider mb-2'>
            Get Your Free API Keys
          </h2>
          <p className='text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto px-2'>
            This app uses AI services that require API keys. Follow these simple steps to get started
            with <span className='text-purple-400 font-bold'>free credits</span>!
          </p>
        </div>

        {/* Service Tabs */}
        <div className='flex bg-zinc-950 p-1 rounded-lg md:rounded-xl border border-white/5 mb-4 md:mb-6 max-w-md mx-auto'>
          <button
            onClick={() => setActiveService('openrouter')}
            className={`flex-1 py-2 md:py-3 rounded-md md:rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition min-h-[44px] ${
              activeService === 'openrouter'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span className='material-icons text-sm align-middle mr-1'>auto_awesome</span>
            <span className='hidden sm:inline'>OpenRouter</span>
            <span className='sm:hidden'>OpenR.</span>
          </button>
          <button
            onClick={() => setActiveService('replicate')}
            className={`flex-1 py-2 md:py-3 rounded-md md:rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition min-h-[44px] ${
              activeService === 'replicate'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span className='material-icons text-sm align-middle mr-1'>photo_filter</span>
            Replicate
          </button>
        </div>

        {/* OpenRouter Instructions */}
        {activeService === 'openrouter' && (
          <div className='space-y-6'>
            {/* What it's for */}
            <div className='bg-purple-500/10 border border-purple-500/20 rounded-xl md:rounded-2xl p-3 md:p-4'>
              <div className='flex items-start gap-2 md:gap-3'>
                <span className='material-icons text-purple-400 text-lg md:text-xl mt-0.5 shrink-0'>info</span>
                <div>
                  <h3 className='text-xs sm:text-sm font-bold text-purple-400 uppercase tracking-wide mb-1'>
                    What OpenRouter Does
                  </h3>
                  <p className='text-[11px] sm:text-xs text-zinc-300 leading-relaxed'>
                    Powers <span className='font-bold'>AI image generation</span> using Google's{' '}
                    <span className='font-bold text-purple-400'>Nano Banana Pro</span> (Gemini 2.5
                    Flash Image) model. Generates your LinkedIn banners and profile backgrounds.
                  </p>
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className='space-y-3 md:space-y-4'>
              <h3 className='text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2'>
                <span className='material-icons text-purple-400 text-base md:text-lg'>list</span>
                Step-by-Step Instructions
              </h3>

              {/* Step 1 */}
              <div className='bg-zinc-950 border border-white/5 rounded-lg md:rounded-xl p-3 md:p-4'>
                <div className='flex items-start gap-2 md:gap-3'>
                  <div className='flex-shrink-0 w-7 h-7 md:w-8 md:h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm'>
                    1
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h4 className='text-xs sm:text-sm font-bold text-white mb-1 md:mb-2'>
                      Visit OpenRouter and Sign Up
                    </h4>
                    <p className='text-[11px] sm:text-xs text-zinc-400 mb-2 md:mb-3 leading-relaxed'>
                      Go to{' '}
                      <a
                        href='https://openrouter.ai'
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-purple-400 hover:text-purple-300 underline font-mono text-[10px] sm:text-xs break-all'
                      >
                        openrouter.ai
                      </a>{' '}
                      and create a free account. You can sign up with Google, GitHub, or email.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className='bg-zinc-950 border border-white/5 rounded-lg md:rounded-xl p-3 md:p-4'>
                <div className='flex items-start gap-2 md:gap-3'>
                  <div className='flex-shrink-0 w-7 h-7 md:w-8 md:h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm'>
                    2
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h4 className='text-xs sm:text-sm font-bold text-white mb-1 md:mb-2'>Add Free Credits ($5)</h4>
                    <p className='text-[11px] sm:text-xs text-zinc-400 mb-2 md:mb-3 leading-relaxed'>
                      Click <span className='font-bold'>Credits</span> in the top menu, then{' '}
                      <span className='font-bold'>Add Credit</span>. You'll get{' '}
                      <span className='text-green-400 font-bold'>$5 free credits</span> to start (no
                      credit card required for testing).
                    </p>
                    <div className='bg-green-500/10 border border-green-500/20 rounded-md md:rounded-lg p-2 md:p-3 flex items-start gap-2'>
                      <span className='material-icons text-green-400 text-sm shrink-0 mt-0.5'>
                        monetization_on
                      </span>
                      <p className='text-[10px] sm:text-xs text-green-300 leading-relaxed'>
                        <span className='font-bold'>Cost:</span> ~$0.01-0.05 per image generation
                        with Nano Banana Pro. Your $5 credits = ~100-500 images!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className='bg-zinc-950 border border-white/5 rounded-lg md:rounded-xl p-3 md:p-4'>
                <div className='flex items-start gap-2 md:gap-3'>
                  <div className='flex-shrink-0 w-7 h-7 md:w-8 md:h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm'>
                    3
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h4 className='text-xs sm:text-sm font-bold text-white mb-1 md:mb-2'>Get Your API Key</h4>
                    <p className='text-[11px] sm:text-xs text-zinc-400 mb-2 md:mb-3 leading-relaxed'>
                      Click <span className='font-bold'>Keys</span> in the top menu, then{' '}
                      <span className='font-bold'>Create Key</span>. Give it a name like "Nano Banana
                      Pro App" and copy the key.
                    </p>
                    <div className='bg-amber-500/10 border border-amber-500/20 rounded-md md:rounded-lg p-2 md:p-3 flex items-start gap-2'>
                      <span className='material-icons text-amber-400 text-sm shrink-0 mt-0.5'>warning</span>
                      <p className='text-[10px] sm:text-xs text-amber-300 leading-relaxed'>
                        Your key starts with <span className='font-mono break-all'>sk-or-v1-</span>. Keep it
                        secure and never share it publicly!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className='bg-zinc-950 border border-white/5 rounded-xl p-4'>
                <div className='flex items-start gap-3'>
                  <div className='flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm'>
                    4
                  </div>
                  <div className='flex-1'>
                    <h4 className='text-sm font-bold text-white mb-2'>Add Key to This App</h4>
                    <p className='text-xs text-zinc-400 mb-3'>
                      Click the <span className='material-icons text-xs align-middle'>settings</span>{' '}
                      Settings icon in the top right corner, paste your OpenRouter API key, and click{' '}
                      <span className='font-bold'>Save</span>.
                    </p>
                    <div className='bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-start gap-2'>
                      <span className='material-icons text-blue-400 text-sm mt-0.5'>check_circle</span>
                      <p className='text-xs text-blue-300'>
                        Your key is stored securely and only you can access it. Start generating
                        beautiful LinkedIn banners!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Replicate Instructions */}
        {activeService === 'replicate' && (
          <div className='space-y-6'>
            {/* What it's for */}
            <div className='bg-blue-500/10 border border-blue-500/20 rounded-xl md:rounded-2xl p-3 md:p-4'>
              <div className='flex items-start gap-2 md:gap-3'>
                <span className='material-icons text-blue-400 text-lg md:text-xl mt-0.5 shrink-0'>info</span>
                <div>
                  <h3 className='text-xs sm:text-sm font-bold text-blue-400 uppercase tracking-wide mb-1'>
                    What Replicate Does
                  </h3>
                  <p className='text-[11px] sm:text-xs text-zinc-300 leading-relaxed'>
                    Powers <span className='font-bold'>image enhancement tools</span>: upscaling,
                    background removal, restoration, and face enhancement. Makes your images look
                    professional.
                  </p>
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className='space-y-3 md:space-y-4'>
              <h3 className='text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2'>
                <span className='material-icons text-blue-400 text-base md:text-lg'>list</span>
                Step-by-Step Instructions
              </h3>

              {/* Step 1 */}
              <div className='bg-zinc-950 border border-white/5 rounded-lg md:rounded-xl p-3 md:p-4'>
                <div className='flex items-start gap-2 md:gap-3'>
                  <div className='flex-shrink-0 w-7 h-7 md:w-8 md:h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm'>
                    1
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h4 className='text-xs sm:text-sm font-bold text-white mb-1 md:mb-2'>Visit Replicate and Sign Up</h4>
                    <p className='text-[11px] sm:text-xs text-zinc-400 mb-2 md:mb-3 leading-relaxed'>
                      Go to{' '}
                      <a
                        href='https://replicate.com'
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-blue-400 hover:text-blue-300 underline font-mono text-[10px] sm:text-xs break-all'
                      >
                        replicate.com
                      </a>{' '}
                      and create a free account using GitHub or email.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className='bg-zinc-950 border border-white/5 rounded-lg md:rounded-xl p-3 md:p-4'>
                <div className='flex items-start gap-2 md:gap-3'>
                  <div className='flex-shrink-0 w-7 h-7 md:w-8 md:h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm'>
                    2
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h4 className='text-xs sm:text-sm font-bold text-white mb-1 md:mb-2'>Add Billing (Get Free Credits)</h4>
                    <p className='text-[11px] sm:text-xs text-zinc-400 mb-2 md:mb-3 leading-relaxed'>
                      Click <span className='font-bold'>Billing</span> in the settings. Add a payment
                      method to unlock{' '}
                      <span className='text-green-400 font-bold'>$5 free credits</span> (enough for
                      ~100-200 operations).
                    </p>
                    <div className='bg-green-500/10 border border-green-500/20 rounded-md md:rounded-lg p-2 md:p-3 flex items-start gap-2'>
                      <span className='material-icons text-green-400 text-sm shrink-0 mt-0.5'>
                        monetization_on
                      </span>
                      <p className='text-[10px] sm:text-xs text-green-300 leading-relaxed'>
                        <span className='font-bold'>Cost:</span> ~$0.02-0.05 per image upscale/enhancement.
                        Very affordable for professional results!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className='bg-zinc-950 border border-white/5 rounded-lg md:rounded-xl p-3 md:p-4'>
                <div className='flex items-start gap-2 md:gap-3'>
                  <div className='flex-shrink-0 w-7 h-7 md:w-8 md:h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm'>
                    3
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h4 className='text-xs sm:text-sm font-bold text-white mb-1 md:mb-2'>Get Your API Token</h4>
                    <p className='text-[11px] sm:text-xs text-zinc-400 mb-2 md:mb-3 leading-relaxed'>
                      Go to{' '}
                      <a
                        href='https://replicate.com/account/api-tokens'
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-blue-400 hover:text-blue-300 underline text-[10px] sm:text-xs break-all'
                      >
                        Account → API Tokens
                      </a>
                      , then click <span className='font-bold'>Create Token</span>. Copy the token.
                    </p>
                    <div className='bg-amber-500/10 border border-amber-500/20 rounded-md md:rounded-lg p-2 md:p-3 flex items-start gap-2'>
                      <span className='material-icons text-amber-400 text-sm shrink-0 mt-0.5'>warning</span>
                      <p className='text-[10px] sm:text-xs text-amber-300 leading-relaxed'>
                        Your token starts with <span className='font-mono break-all'>r8_</span>. Keep it secure!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className='bg-zinc-950 border border-white/5 rounded-lg md:rounded-xl p-3 md:p-4'>
                <div className='flex items-start gap-2 md:gap-3'>
                  <div className='flex-shrink-0 w-7 h-7 md:w-8 md:h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm'>
                    4
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h4 className='text-xs sm:text-sm font-bold text-white mb-1 md:mb-2'>Add Token to This App</h4>
                    <p className='text-[11px] sm:text-xs text-zinc-400 mb-2 md:mb-3 leading-relaxed'>
                      Click the <span className='material-icons text-xs align-middle'>settings</span>{' '}
                      Settings icon, paste your Replicate API token, and click{' '}
                      <span className='font-bold'>Save</span>.
                    </p>
                    <div className='bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-start gap-2'>
                      <span className='material-icons text-blue-400 text-sm mt-0.5'>check_circle</span>
                      <p className='text-xs text-blue-300'>
                        You can now upscale images, remove backgrounds, and enhance faces with AI!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className='mt-8 pt-6 border-t border-white/5'>
          <div className='bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-6 text-center'>
            <h3 className='text-lg font-bold text-white mb-2 flex items-center justify-center gap-2'>
              <span className='material-icons text-purple-400'>celebration</span>
              You're Almost Ready!
            </h3>
            <p className='text-sm text-zinc-300 mb-4'>
              Get both API keys to unlock the full power of Nano Banana Pro. Total setup time:{' '}
              <span className='font-bold text-white'>~5 minutes</span>.
            </p>
            <div className='flex flex-col sm:flex-row gap-3 justify-center'>
              <a
                href='https://openrouter.ai'
                target='_blank'
                rel='noopener noreferrer'
                className='px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-sm uppercase tracking-wide transition inline-flex items-center justify-center gap-2'
              >
                <span className='material-icons text-lg'>open_in_new</span>
                Get OpenRouter Key
              </a>
              <a
                href='https://replicate.com'
                target='_blank'
                rel='noopener noreferrer'
                className='px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm uppercase tracking-wide transition inline-flex items-center justify-center gap-2'
              >
                <span className='material-icons text-lg'>open_in_new</span>
                Get Replicate Token
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
