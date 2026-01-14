/**
 * ResetPasswordPage - Handles password reset tokens from emails
 *
 * Extracts the reset token from URL parameters and redirects
 * to WorkOS AuthKit with the password reset context.
 */

import React, { useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';

export function ResetPasswordPage(): React.ReactElement {
  const { isLoading } = useAuth();

  // Extract reset token from URL (computed once, not in effect)
  const { resetToken, error } = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token') || params.get('reset_token') || params.get('code');

    if (!token) {
      return {
        resetToken: null,
        error: 'Invalid or missing password reset link. Please request a new one.',
      };
    }

    return { resetToken: token, error: null };
  }, []);

  useEffect(() => {
    // Only redirect if we have a valid token and auth state is known
    if (!isLoading && resetToken) {
      // WorkOS AuthKit handles password reset through a special flow
      // The token is passed to verify the reset request
      const authUrl = new URL('/api/auth/workos/authorize', window.location.origin);
      authUrl.searchParams.set('password_reset_token', resetToken);
      authUrl.searchParams.set('screen_hint', 'reset-password');

      window.location.href = authUrl.toString();
    }
  }, [isLoading, resetToken]);

  // Show error state
  if (error) {
    return (
      <div className='min-h-screen bg-zinc-950 flex flex-col items-center justify-center'>
        {/* Background gradient */}
        <div className='fixed inset-0 bg-gradient-to-br from-purple-900/20 via-zinc-950 to-pink-900/20 pointer-events-none' />

        {/* Logo and brand - top left */}
        <div className='absolute top-8 left-8 flex items-center gap-3 z-10'>
          <a href='/' className='flex items-center gap-2 hover:opacity-80 transition-opacity'>
            <div className='w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center'>
              <span className='text-white font-black text-lg'>N</span>
            </div>
            <span className='text-xl font-black text-white'>Nanobanna</span>
          </a>
        </div>

        {/* Error content */}
        <div className='relative z-10 text-center max-w-md mx-auto px-4'>
          {/* Error icon */}
          <div className='w-20 h-20 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-yellow-500/30'>
            <svg
              className='w-10 h-10 text-yellow-400'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z'
              />
            </svg>
          </div>

          {/* Error message */}
          <h1 className='text-xl font-semibold text-white mb-2'>Invalid Reset Link</h1>
          <p className='text-zinc-400 text-sm mb-6'>{error}</p>

          {/* Actions */}
          <div className='flex flex-col gap-3'>
            <a
              href='/forgot-password'
              className='inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity'
            >
              Request New Reset Link
            </a>
            <a
              href='/login'
              className='inline-flex items-center justify-center px-6 py-3 bg-white/5 text-white font-medium rounded-xl hover:bg-white/10 transition-colors border border-white/10'
            >
              Back to Sign In
            </a>
          </div>

          {/* Help text */}
          <p className='text-zinc-500 text-xs mt-6'>
            Password reset links expire after 1 hour for security reasons.
          </p>
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

  // Loading/redirecting state
  return (
    <div className='min-h-screen bg-zinc-950 flex flex-col items-center justify-center'>
      {/* Background gradient */}
      <div className='fixed inset-0 bg-gradient-to-br from-purple-900/20 via-zinc-950 to-pink-900/20 pointer-events-none' />

      {/* Logo and brand - top left */}
      <div className='absolute top-8 left-8 flex items-center gap-3 z-10'>
        <a href='/' className='flex items-center gap-2 hover:opacity-80 transition-opacity'>
          <div className='w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center'>
            <span className='text-white font-black text-lg'>N</span>
          </div>
          <span className='text-xl font-black text-white'>Nanobanna</span>
        </a>
      </div>

      {/* Loading content */}
      <div className='relative z-10 text-center'>
        {/* Animated icon */}
        <div className='w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-purple-500/30'>
          <svg
            className='w-10 h-10 text-purple-400 animate-pulse'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z'
            />
          </svg>
        </div>

        {/* Spinner */}
        <div className='w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4' />

        {/* Message */}
        <h1 className='text-xl font-semibold text-white mb-2'>Verifying Reset Link</h1>
        <p className='text-zinc-400 text-sm max-w-xs mx-auto'>
          We're verifying your password reset request...
        </p>

        {/* Fallback link */}
        {resetToken && (
          <div className='mt-8'>
            <a
              href={`/api/auth/workos/authorize?password_reset_token=${encodeURIComponent(resetToken)}&screen_hint=reset-password`}
              className='text-purple-400 hover:text-purple-300 text-sm underline transition-colors'
            >
              Click here if not redirected
            </a>
          </div>
        )}
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

export default ResetPasswordPage;
