/**
 * LoginPage - Redirects to WorkOS AuthKit for authentication
 *
 * Shows a brief loading state with Nanobanna branding,
 * then redirects to the AuthKit hosted login UI.
 */

import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export function LoginPage(): React.ReactElement {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (!isLoading && isAuthenticated) {
      window.location.href = '/';
      return;
    }

    // Once auth state is known, redirect to AuthKit
    if (!isLoading && !isAuthenticated) {
      // Redirect to backend which initiates WorkOS AuthKit flow
      window.location.href = '/api/auth/workos/authorize';
    }
  }, [isAuthenticated, isLoading]);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-zinc-950 to-pink-900/20 pointer-events-none" />

      {/* Logo and brand - top left */}
      <div className="absolute top-8 left-8 flex items-center gap-3 z-10">
        <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-lg">N</span>
          </div>
          <span className="text-xl font-black text-white">Nanobanna</span>
        </a>
      </div>

      {/* Loading content */}
      <div className="relative z-10 text-center">
        {/* Animated logo */}
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse shadow-lg shadow-purple-500/25">
          <span className="text-white font-black text-3xl">N</span>
        </div>

        {/* Spinner */}
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />

        {/* Message */}
        <h1 className="text-xl font-semibold text-white mb-2">
          Redirecting to Sign In
        </h1>
        <p className="text-zinc-400 text-sm max-w-xs mx-auto">
          You'll be redirected to our secure login page in a moment...
        </p>

        {/* Fallback link */}
        <div className="mt-8">
          <a
            href="/api/auth/workos/authorize"
            className="text-purple-400 hover:text-purple-300 text-sm underline transition-colors"
          >
            Click here if not redirected
          </a>
        </div>
      </div>

      {/* Back to home link */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <a
          href="/"
          className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to home
        </a>
      </div>
    </div>
  );
}

export default LoginPage;
