import React, { useState } from 'react';

interface ProfileSetupProps {
  onNext: (profile: { firstName: string; lastName: string; username?: string }) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export function ProfileSetup({ onNext, onBack, currentStep, totalSteps }: ProfileSetupProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ firstName, lastName, username: username || undefined });
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
            Set up your profile
          </h2>
          <p className='text-zinc-400 text-center mb-8'>Tell us a bit about yourself</p>

          {/* Avatar Upload with Glass Effect */}
          <div className='mb-8 flex flex-col items-center'>
            <div className='w-24 h-24 rounded-full bg-white/5 backdrop-blur-xl border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-teal-500/50 hover:bg-white/10 transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'>
              <svg
                className='w-8 h-8 text-zinc-500'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                />
              </svg>
            </div>
            <p className='text-xs text-zinc-500 text-center mt-2'>Add photo</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className='w-full space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm text-zinc-400 mb-2'>First name *</label>
                <input
                  type='text'
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className='w-full px-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500/50 focus:shadow-[0_0_20px_rgba(20,184,166,0.2)] transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                  placeholder='John'
                />
              </div>
              <div>
                <label className='block text-sm text-zinc-400 mb-2'>Last name *</label>
                <input
                  type='text'
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className='w-full px-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500/50 focus:shadow-[0_0_20px_rgba(20,184,166,0.2)] transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                  placeholder='Doe'
                />
              </div>
            </div>

            <div>
              <label className='block text-sm text-zinc-400 mb-2'>Username (optional)</label>
              <input
                type='text'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className='w-full px-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500/50 focus:shadow-[0_0_20px_rgba(20,184,166,0.2)] transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                placeholder='@johndoe'
              />
            </div>

            <div className='flex gap-3 pt-4'>
              <button
                type='button'
                onClick={onBack}
                className='flex-1 px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all duration-300 shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.05)]'
              >
                Back
              </button>
              <button
                type='submit'
                disabled={!firstName || !lastName}
                className='flex-1 px-6 py-3 bg-gradient-to-r from-sky-500 via-teal-500 to-cyan-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-[0_0_30px_rgba(20,184,166,0.3),4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.05)] hover:shadow-[0_0_40px_rgba(20,184,166,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none'
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

export default ProfileSetup;
