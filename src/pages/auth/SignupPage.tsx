/**
 * SignupPage - Email/Password Registration
 *
 * Simple signup form using Lucia session-based auth with Neon PostgreSQL.
 * WorkOS integration is disabled until reconfigured.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function SignupPage(): React.ReactElement {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, signUp, signInWithGoogle, workosStatus } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: signUpError } = await signUp(email, password, {
        first_name: firstName || undefined,
        last_name: lastName || undefined,
      });

      if (signUpError) {
        setError(signUpError.message || 'Failed to create account');
      } else {
        navigate('/dashboard');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    setIsOAuthLoading(true);
    try {
      const { error: googleError } = await signInWithGoogle('/dashboard');
      if (googleError) {
        setError(googleError.message || 'Failed to sign up with Google');
        setIsOAuthLoading(false);
      }
      // If successful, the page will redirect - no need to reset loading state
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setIsOAuthLoading(false);
    }
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className='min-h-screen bg-zinc-950 flex items-center justify-center'>
        <div className='w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin' />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 py-12'>
      {/* Background gradient */}
      <div className='fixed inset-0 bg-gradient-to-br from-cyan-900/20 via-zinc-950 to-orange-900/20 pointer-events-none' />

      {/* Logo and brand - top left */}
      <div className='absolute top-8 left-8 flex items-center gap-3 z-10'>
        <a href='/' className='flex items-center gap-2 hover:opacity-80 transition-opacity'>
          <img
            src='/assets/logo.png'
            alt='VOX Logo'
            className='h-16 md:h-20 w-auto object-contain'
          />
        </a>
      </div>

      {/* Signup form container */}
      <div className='relative z-10 w-full max-w-md'>
        {/* Glass card */}
        <div className='bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] rounded-2xl p-8 shadow-glass-lg'>
          {/* Header */}
          <div className='text-center mb-8'>
            <img
              src='/assets/logo.png'
              alt='VOX Logo'
              className='h-24 md:h-28 w-auto object-contain mx-auto mb-4'
            />
            <h1 className='text-2xl font-bold text-white mb-2'>Create your account</h1>
            <p className='text-zinc-400 text-sm'>Start creating stunning banners today</p>
          </div>

          {/* Error message */}
          {error && (
            <div className='mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl'>
              <p className='text-red-400 text-sm text-center'>{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* Name fields */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label htmlFor='firstName' className='block text-sm font-medium text-zinc-300 mb-2'>
                  First name
                </label>
                <input
                  id='firstName'
                  type='text'
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete='given-name'
                  className='w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all'
                  placeholder='John'
                />
              </div>
              <div>
                <label htmlFor='lastName' className='block text-sm font-medium text-zinc-300 mb-2'>
                  Last name
                </label>
                <input
                  id='lastName'
                  type='text'
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete='family-name'
                  className='w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all'
                  placeholder='Doe'
                />
              </div>
            </div>

            {/* Email field */}
            <div>
              <label htmlFor='email' className='block text-sm font-medium text-zinc-300 mb-2'>
                Email address
              </label>
              <input
                id='email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete='email'
                className='w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all'
                placeholder='you@example.com'
              />
            </div>

            {/* Password field */}
            <div>
              <label htmlFor='password' className='block text-sm font-medium text-zinc-300 mb-2'>
                Password
              </label>
              <input
                id='password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete='new-password'
                className='w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all'
                placeholder='••••••••'
              />
              <p className='mt-1 text-xs text-zinc-500'>Must be at least 8 characters</p>
            </div>

            {/* Confirm password field */}
            <div>
              <label
                htmlFor='confirmPassword'
                className='block text-sm font-medium text-zinc-300 mb-2'
              >
                Confirm password
              </label>
              <input
                id='confirmPassword'
                type='password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete='new-password'
                className='w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all'
                placeholder='••••••••'
              />
            </div>

            {/* Terms notice */}
            <p className='text-xs text-zinc-500 text-center'>
              By creating an account, you agree to our{' '}
              <a href='/terms' className='text-cyan-400 hover:text-cyan-300'>
                Terms of Service
              </a>{' '}
              and{' '}
              <a href='/privacy' className='text-cyan-400 hover:text-cyan-300'>
                Privacy Policy
              </a>
            </p>

            {/* Submit button */}
            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full py-3 px-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl hover:from-red-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-[48px] shadow-lg shadow-red-500/25'
            >
              {isSubmitting ? (
                <span className='flex items-center justify-center gap-2'>
                  <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                  Creating account...
                </span>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          {/* OAuth Providers */}
          {workosStatus.enabled && workosStatus.providers.includes('google') && (
            <>
              {/* Divider */}
              <div className='relative my-6'>
                <div className='absolute inset-0 flex items-center'>
                  <div className='w-full border-t border-white/[0.1]' />
                </div>
                <div className='relative flex justify-center text-sm'>
                  <span className='px-4 bg-zinc-950/50 text-zinc-500'>Or sign up with</span>
                </div>
              </div>

              {/* Google Sign Up Button */}
              <button
                type='button'
                onClick={handleGoogleSignUp}
                disabled={isOAuthLoading || isSubmitting}
                className='w-full py-3 px-4 flex items-center justify-center gap-3 bg-white/[0.05] border border-white/[0.1] text-white font-medium rounded-xl hover:bg-white/[0.1] hover:border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-[48px]'
              >
                {isOAuthLoading ? (
                  <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                ) : (
                  <>
                    {/* Google Icon */}
                    <svg className='w-5 h-5' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                      <path
                        fill='#4285F4'
                        d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                      />
                      <path
                        fill='#34A853'
                        d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                      />
                      <path
                        fill='#FBBC05'
                        d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                      />
                      <path
                        fill='#EA4335'
                        d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            </>
          )}

          {/* Divider */}
          <div className='relative my-6'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-white/[0.1]' />
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-4 bg-zinc-950/50 text-zinc-500'>Already have an account?</span>
            </div>
          </div>

          {/* Sign in link */}
          <a
            href='/login'
            className='block w-full py-3 px-4 text-center bg-white/[0.05] border border-white/[0.1] text-cyan-400 font-medium rounded-xl hover:bg-white/[0.1] hover:border-cyan-500/30 transition-all min-h-[48px]'
          >
            Sign in instead
          </a>
        </div>
      </div>

      {/* Back to home link */}
      <div className='absolute bottom-8 left-1/2 -translate-x-1/2 z-10'>
        <a
          href='/'
          className='text-zinc-500 hover:text-zinc-300 text-sm transition-colors flex items-center gap-2'
        >
          <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M10 19l-7-7m0 0l7-7m-7 7h18'
            />
          </svg>
          Back to home
        </a>
      </div>
    </div>
  );
}

export default SignupPage;
