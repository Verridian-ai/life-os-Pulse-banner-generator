// Auth Context - Global authentication state management

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import {
  signUp as authSignUp,
  signIn as authSignIn,
  signInWithGoogle as authSignInWithGoogle,
  signInWithGitHub as authSignInWithGitHub,
  signOut as authSignOut,
  onAuthStateChange,
  getCurrentSupabaseUser,
  getCurrentUserProfile,
} from '../services/auth';
import type { User } from '../types/database';

interface AuthContextType {
  // Supabase user (auth layer)
  supabaseUser: SupabaseUser | null;
  // Neon user profile (database layer)
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Auth methods
  signUp: (
    email: string,
    password: string,
    metadata?: { name?: string },
  ) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithGitHub: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user profile from Neon database
  const loadUserProfile = async (_supabaseUserId: string) => {
    try {
      const profile = await getCurrentUserProfile();
      setUser(profile);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      setUser(null);
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await getCurrentSupabaseUser();
        setSupabaseUser(currentUser);

        if (currentUser) {
          await loadUserProfile(currentUser.id);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen to auth state changes
    const {
      data: { subscription },
    } = onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      setSession(session);
      setSupabaseUser(session?.user || null);

      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setUser(null);
      }

      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Refresh user profile
  const refreshProfile = async () => {
    if (supabaseUser) {
      await loadUserProfile(supabaseUser.id);
    }
  };

  // Sign up
  const signUp = async (
    email: string,
    password: string,
    metadata?: { name?: string },
  ): Promise<{ error: Error | null }> => {
    const { user: newUser, error } = await authSignUp(email, password, metadata);
    if (!error && newUser) {
      setSupabaseUser(newUser);
      await loadUserProfile(newUser.id);
    }
    return { error };
  };

  // Sign in
  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    const { user: signedInUser, session: newSession, error } = await authSignIn(email, password);
    if (!error && signedInUser) {
      setSupabaseUser(signedInUser);
      setSession(newSession);
      await loadUserProfile(signedInUser.id);
    }
    return { error };
  };

  // Sign in with Google
  const signInWithGoogle = async (): Promise<{ error: Error | null }> => {
    return authSignInWithGoogle();
  };

  // Sign in with GitHub
  const signInWithGitHub = async (): Promise<{ error: Error | null }> => {
    return authSignInWithGitHub();
  };

  // Sign out
  const signOut = async (): Promise<{ error: Error | null }> => {
    const { error } = await authSignOut();
    if (!error) {
      setSupabaseUser(null);
      setUser(null);
      setSession(null);
    }
    return { error };
  };

  const value: AuthContextType = {
    supabaseUser,
    user,
    session,
    isLoading,
    isAuthenticated: !!supabaseUser,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithGitHub,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
