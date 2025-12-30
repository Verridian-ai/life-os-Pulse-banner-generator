// Auth Context - Global authentication state management

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AppUser, AppSession } from '../services/auth';
import {
  signUp as authSignUp,
  signIn as authSignIn,
  signInWithGoogle as authSignInWithGoogle,
  signInWithGitHub as authSignInWithGitHub,
  signOut as authSignOut,
  onAuthStateChange,
  getCurrentUser,
  getCurrentUserProfile,
} from '../services/auth';
import type { User } from '../types/database';

interface AuthContextType {
  // Auth user (from session)
  authUser: AppUser | null;
  // User profile (from database)
  user: User | null;
  session: AppSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Auth methods
  signUp: (
    email: string,
    password: string,
    metadata?: {
      first_name?: string;
      last_name?: string;
      username?: string;
    },
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
  const [authUser, setAuthUser] = useState<AppUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AppSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user profile from database
  const loadUserProfile = async (_userId: string) => {
    try {
      const { data: profile, error } = await getCurrentUserProfile();
      if (error) {
        console.error('Failed to load user profile:', error);
        setUser(null);
        return;
      }
      setUser(profile as User | null);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      setUser(null);
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setAuthUser(currentUser);

        if (currentUser) {
          await loadUserProfile(currentUser.id);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn('[Auth] Initialization timeout - forcing loading to complete');
      setIsLoading(false);
    }, 10000); // 10 second timeout

    initAuth().finally(() => clearTimeout(timeoutId));

    // Listen to auth state changes
    const {
      data: { subscription },
    } = onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      setSession(session);
      setAuthUser(session?.user || null);

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
    if (authUser) {
      await loadUserProfile(authUser.id);
    }
  };

  // Sign up
  const signUp = async (
    email: string,
    password: string,
    metadata?: {
      first_name?: string;
      last_name?: string;
      username?: string;
    },
  ): Promise<{ error: Error | null }> => {
    const { user: newUser, error } = await authSignUp(email, password, metadata);
    if (!error && newUser) {
      setAuthUser(newUser);

      // Load user profile from database
      try {
        await loadUserProfile(newUser.id);
      } catch (profileError) {
        console.warn('[Auth] Could not load user profile from database:', profileError);
      }
    }
    return { error };
  };

  // Sign in
  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    const { user: signedInUser, session: newSession, error } = await authSignIn(email, password);
    if (!error && signedInUser) {
      setAuthUser(signedInUser);
      setSession(newSession);

      // Load user profile from database
      try {
        await loadUserProfile(signedInUser.id);
      } catch (profileError) {
        console.warn('[Auth] Could not load user profile from database:', profileError);
      }
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
      setAuthUser(null);
      setUser(null);
      setSession(null);
    }
    return { error };
  };

  const value: AuthContextType = {
    authUser,
    user,
    session,
    isLoading,
    isAuthenticated: !!authUser,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithGitHub,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};