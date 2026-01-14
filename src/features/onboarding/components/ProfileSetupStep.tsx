/**
 * ProfileSetupStep
 *
 * Profile setup step for onboarding - collects basic user information.
 */

import React, { useState, useCallback, useEffect } from 'react';

import type { ProfileFormData } from '../types';

type ProfileSetupStepProps = {
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
  onProfileChange: (profile: ProfileFormData) => void;
  initialData?: ProfileFormData;
};

const INDUSTRIES = [
  'Technology',
  'Marketing',
  'Finance',
  'Healthcare',
  'Education',
  'E-commerce',
  'Creative Agency',
  'Consulting',
  'Other',
];

const ROLES = [
  'Marketing Manager',
  'Social Media Manager',
  'Founder/CEO',
  'Designer',
  'Content Creator',
  'Freelancer',
  'Student',
  'Other',
];

export function ProfileSetupStep({
  onNext,
  onSkip,
  onBack,
  onProfileChange,
  initialData,
}: ProfileSetupStepProps): React.ReactElement {
  const [formData, setFormData] = useState<ProfileFormData>(initialData || {});

  // Notify parent of changes
  useEffect(() => {
    onProfileChange(formData);
  }, [formData, onProfileChange]);

  const handleChange = useCallback((field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  return (
    <div className='w-full max-w-2xl mx-auto px-4'>
      {/* Glass Card Container */}
      <div className='relative bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-glass'>
        <div className='absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none' />

        <div className='relative z-10'>
          {/* Header */}
          <div className='text-center mb-8'>
            <div className='w-14 h-14 mx-auto mb-4 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20'>
              <span className='material-icons text-2xl text-cyan-400'>person</span>
            </div>
            <h2 className='text-2xl font-bold text-white mb-2'>Tell us about yourself</h2>
            <p className='text-zinc-400 text-sm'>Help us personalize your experience</p>
          </div>

          {/* Form */}
          <div className='space-y-5'>
            {/* Name Row */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-zinc-300 mb-1.5'>First Name</label>
                <input
                  type='text'
                  value={formData.firstName || ''}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder='John'
                  className='w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-zinc-300 mb-1.5'>Last Name</label>
                <input
                  type='text'
                  value={formData.lastName || ''}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder='Doe'
                  className='w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all'
                />
              </div>
            </div>

            {/* Company */}
            <div>
              <label className='block text-sm font-medium text-zinc-300 mb-1.5'>
                Company (Optional)
              </label>
              <input
                type='text'
                value={formData.company || ''}
                onChange={(e) => handleChange('company', e.target.value)}
                placeholder='Acme Inc.'
                className='w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all'
              />
            </div>

            {/* Role */}
            <div>
              <label className='block text-sm font-medium text-zinc-300 mb-1.5'>Your Role</label>
              <select
                value={formData.role || ''}
                onChange={(e) => handleChange('role', e.target.value)}
                className='w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all appearance-none cursor-pointer'
              >
                <option value='' className='bg-zinc-900'>
                  Select your role
                </option>
                {ROLES.map((role) => (
                  <option key={role} value={role} className='bg-zinc-900'>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* Industry */}
            <div>
              <label className='block text-sm font-medium text-zinc-300 mb-1.5'>Industry</label>
              <select
                value={formData.industry || ''}
                onChange={(e) => handleChange('industry', e.target.value)}
                className='w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all appearance-none cursor-pointer'
              >
                <option value='' className='bg-zinc-900'>
                  Select your industry
                </option>
                {INDUSTRIES.map((industry) => (
                  <option key={industry} value={industry} className='bg-zinc-900'>
                    {industry}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex items-center justify-between mt-8 pt-6 border-t border-zinc-800'>
            <button
              onClick={onBack}
              className='flex items-center gap-1 px-4 py-2 text-zinc-400 hover:text-white transition-colors'
            >
              <span className='material-icons text-lg'>arrow_back</span>
              Back
            </button>

            <div className='flex items-center gap-3'>
              <button
                onClick={onSkip}
                className='px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors'
              >
                Skip
              </button>
              <button
                onClick={onNext}
                className='px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:from-cyan-400 hover:to-blue-400 transition-all'
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
