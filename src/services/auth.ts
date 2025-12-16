// Supabase Auth Service

import { type User as SupabaseUser, type Session } from '@supabase/supabase-js';
import { upsertUser, getCurrentUser } from './db-api';
import type { User } from '../types/database';

import { supabase } from './supabase';

// Re-export supabase client for backward compatibility
export { supabase };

/**
 * Sign up with email and password
 */
export const signUp = async (
  email: string,
  password: string,
  metadata?: { name?: string },
): Promise<{ user: SupabaseUser | null; error: Error | null }> => {
  if (!supabase) {
    return { user: null, error: new Error('Supabase not configured') };
  }
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: 'https://life-os-banner.verridian.ai/auth/callback',
      },
    });

    if (error) throw error;

    // Create user profile in database (non-blocking - don't fail signup if this fails)
    if (data.user) {
      try {
        console.log('[auth.signUp] Calling upsertUser for user:', data.user.id);
        await upsertUser(data.user.id, email, metadata?.name);
        console.log('[auth.signUp] upsertUser succeeded');
      } catch (dbError) {
        console.error('[auth.signUp] upsertUser failed (non-critical):', dbError);
        // Continue with signup even if database save fails - this is NOT blocking
      }
    }

    return { user: data.user, error: null };
  } catch (error: unknown) {
    console.error('Sign up error:', error);
    return { user: null, error: error instanceof Error ? error : new Error('Sign up failed') };
  }
};

/**
 * Sign in with email and password
 */
export const signIn = async (
  email: string,
  password: string,
): Promise<{ user: SupabaseUser | null; session: Session | null; error: Error | null }> => {
  if (!supabase) {
    return { user: null, session: null, error: new Error('Supabase not configured') };
  }
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Update last login in Neon (non-blocking)
    if (data.user) {
      try {
        await upsertUser(data.user.id, email);
      } catch (dbError) {
        console.warn('Failed to update user profile in database (non-critical):', dbError);
        // Continue with signin even if database save fails
      }
    }

    return { user: data.user, session: data.session, error: null };
  } catch (error: unknown) {
    console.error('Sign in error:', error);
    return {
      user: null,
      session: null,
      error: error instanceof Error ? error : new Error('Sign in failed'),
    };
  }
};

/**
 * Sign in with Google OAuth
 */
export const signInWithGoogle = async (): Promise<{ error: Error | null }> => {
  if (!supabase) {
    return { error: new Error('Supabase not configured') };
  }
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
    return { error: null };
  } catch (error: unknown) {
    console.error('Google sign in error:', error);
    return { error: error instanceof Error ? error : new Error('Google sign in failed') };
  }
};

/**
 * Sign in with GitHub OAuth
 */
export const signInWithGitHub = async (): Promise<{ error: Error | null }> => {
  if (!supabase) {
    return { error: new Error('Supabase not configured') };
  }
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
    return { error: null };
  } catch (error: unknown) {
    console.error('GitHub sign in error:', error);
    return { error: error instanceof Error ? error : new Error('GitHub sign in failed') };
  }
};

/**
 * Sign out
 */
export const signOut = async (): Promise<{ error: Error | null }> => {
  if (!supabase) {
    return { error: new Error('Supabase not configured') };
  }
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    // Clear local storage
    localStorage.removeItem('supabase.auth.token');

    return { error: null };
  } catch (error: unknown) {
    console.error('Sign out error:', error);
    return { error: error instanceof Error ? error : new Error('Sign out failed') };
  }
};

/**
 * Get current session
 */
export const getSession = async (): Promise<Session | null> => {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
};

/**
 * Get current user from Supabase
 */
export const getCurrentSupabaseUser = async (): Promise<SupabaseUser | null> => {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
};

/**
 * Get current user profile from Neon database
 */
export const getCurrentUserProfile = async (): Promise<User | null> => {
  const supabaseUser = await getCurrentSupabaseUser();
  if (!supabaseUser) return null;

  try {
    return await getCurrentUser(supabaseUser.id);
  } catch (error) {
    console.error('Failed to get user profile:', error);
    return null;
  }
};

/**
 * Reset password
 */
export const resetPassword = async (email: string): Promise<{ error: Error | null }> => {
  try {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) throw error;
    return { error: null };
  } catch (error: unknown) {
    console.error('Reset password error:', error);
    return { error: error instanceof Error ? error : new Error('Reset password failed') };
  }
};

/**
 * Update password
 */
export const updatePassword = async (newPassword: string): Promise<{ error: Error | null }> => {
  try {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return { error: null };
  } catch (error: unknown) {
    console.error('Update password error:', error);
    return { error: error instanceof Error ? error : new Error('Update password failed') };
  }
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback: (event: string, session: Session | null) => void) => {
  if (!supabase) {
    return { data: { subscription: { unsubscribe: () => { } } } };
  }
  return supabase.auth.onAuthStateChange(callback);
};

/**
 * Verify if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const session = await getSession();
  return !!session;
};

/**
 * Get auth token for API requests
 */
export const getAuthToken = async (): Promise<string | null> => {
  const session = await getSession();
  return session?.access_token || null;
};
