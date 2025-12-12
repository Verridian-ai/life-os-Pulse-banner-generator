// Supabase Auth Service

import { createClient, type User as SupabaseUser, type Session } from '@supabase/supabase-js';
import { upsertUser, getCurrentUser } from './neon';
import type { User } from '../types/database';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const hasCredentials = supabaseUrl && supabaseAnonKey;

if (!hasCredentials) {
  console.warn('Supabase credentials not found. Auth features will be disabled.');
}

// Only create client if credentials are available
export const supabase = hasCredentials
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Sign up with email and password
 */
export const signUp = async (
  email: string,
  password: string,
  metadata?: { name?: string }
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
      },
    });

    if (error) throw error;

    // Create user profile in Neon
    if (data.user) {
      await upsertUser(data.user.id, email, metadata?.name);
    }

    return { user: data.user, error: null };
  } catch (error: any) {
    console.error('Sign up error:', error);
    return { user: null, error };
  }
};

/**
 * Sign in with email and password
 */
export const signIn = async (
  email: string,
  password: string
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

    // Update last login in Neon
    if (data.user) {
      await upsertUser(data.user.id, email);
    }

    return { user: data.user, session: data.session, error: null };
  } catch (error: any) {
    console.error('Sign in error:', error);
    return { user: null, session: null, error };
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
  } catch (error: any) {
    console.error('Google sign in error:', error);
    return { error };
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
  } catch (error: any) {
    console.error('GitHub sign in error:', error);
    return { error };
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
  } catch (error: any) {
    console.error('Sign out error:', error);
    return { error };
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
  } catch (error: any) {
    console.error('Reset password error:', error);
    return { error };
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
  } catch (error: any) {
    console.error('Update password error:', error);
    return { error };
  }
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (
  callback: (event: string, session: Session | null) => void
) => {
  if (!supabase) {
    return { data: { subscription: { unsubscribe: () => {} } } };
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
