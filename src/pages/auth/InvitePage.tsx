/**
 * InvitePage - Handles user invitation tokens from emails
 *
 * Extracts the invite token from URL parameters and redirects
 * to WorkOS AuthKit with the invitation context.
 */

import React, { useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';

export function InvitePage(): React.ReactElement {
  const { isLoading } = useAuth();

  // Extract invite token from URL (computed once, not in effect)
  const { inviteToken, error } = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token') || params.get('invitation_token') || params.get('code');

    if (!token) {
      return {
        inviteToken: null,
        error: 'Invalid or missing invitation link. Please check your email for the correct link.',
      };
    }

    return { inviteToken: token, error: null };
  }, []);

  useEffect(() => {
    // Only redirect if we have a valid token and auth state is known
    if (!isLoading && inviteToken) {
      // Redirect to AuthKit with the invitation token
      // WorkOS handles invitation acceptance through the callback
      const authUrl = new URL('/api/auth/workos/authorize', window.location.origin);
      authUrl.searchParams.set('invitation_token', inviteToken);
      authUrl.searchParams.set('screen_hint', 'sign-up');

      window.location.href = authUrl.toString();
    }
  }, [isLoading, inviteToken]);

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
          <div className='w-20 h-20 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/30'>
            <svg
              className='w-10 h-10 text-red-400'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
              />
            </svg>
          </div>

          {/* Error message */}
          <h1 className='text-xl font-semibold text-white mb-2'>Invalid Invitation</h1>
          <p className='text-zinc-400 text-sm mb-6'>{error}</p>

          {/* Actions */}
          <div className='flex flex-col gap-3'>
            <a
              href='/signup'
              className='inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity'
            >
              Create New Account
            </a>
            <a
              href='/login'
              className='inline-flex items-center justify-center px-6 py-3 bg-white/5 text-white font-medium rounded-xl hover:bg-white/10 transition-colors border border-white/10'
            >
              Sign In Instead
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
        {/* Animated logo */}
        <div className='w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse shadow-lg shadow-purple-500/25'>
          <span className='text-white font-black text-3xl'>N</span>
        </div>

        {/* Spinner */}
        <div className='w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4' />

        {/* Message */}
        <h1 className='text-xl font-semibold text-white mb-2'>Processing Invitation</h1>
        <p className='text-zinc-400 text-sm max-w-xs mx-auto'>
          We're setting up your account with this invitation...
        </p>

        {/* Fallback link */}
        {inviteToken && (
          <div className='mt-8'>
            <a
              href={`/api/auth/workos/authorize?invitation_token=${encodeURIComponent(inviteToken)}&screen_hint=sign-up`}
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

export default InvitePage;
