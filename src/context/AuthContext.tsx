// Auth Context - Global authentication state management

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import type { AppUser, AppSession } from '../services/auth';
import {
  signUp as authSignUp,
  signIn as authSignIn,
  signInWithGoogle as authSignInWithGoogle,
  signInWithGitHub as authSignInWithGitHub,
  signInWithMicrosoft as authSignInWithMicrosoft,
  signInWithSSO as authSignInWithSSO,
  sendMagicLink as authSendMagicLink,
  getWorkosStatus,
  signOut as authSignOut,
  onAuthStateChange,
  getCurrentUser,
  getCurrentUserProfile,
} from '../services/auth';
import { getUserPreferences, updateUserPreferences } from '../services/database';
import type { User } from '../types/database';
import type { UserPreferences as ApiUserPreferences } from '../types/api';
import { IdleTimeoutWarning } from '../components/auth/IdleTimeoutWarning';
import { useToast } from '../hooks/useToast';

// WorkOS status type
interface WorkosStatus {
  enabled: boolean;
  providers: string[];
  ssoEnabled: boolean;
  magicLinkEnabled: boolean;
}

interface AuthContextType {
  // Auth user (from session)
  authUser: AppUser | null;
  // User profile (from database)
  user: User | null;
  session: AppSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;

  // WorkOS status
  workosStatus: WorkosStatus;
  isSSOUser: boolean;

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
  signInWithGoogle: (returnTo?: string) => Promise<{ error: Error | null }>;
  signInWithGitHub: (returnTo?: string) => Promise<{ error: Error | null }>;
  signInWithMicrosoft: (returnTo?: string) => Promise<{ error: Error | null }>;
  signInWithSSO: (domain?: string, returnTo?: string) => Promise<{ error: Error | null }>;
  sendMagicLink: (email: string, returnTo?: string) => Promise<{ success: boolean; error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  markOnboardingComplete: () => Promise<void>;

  // Timeout settings
  updateTimeoutSettings: (minutes: number) => Promise<void>;
  timeoutDuration: number; // in minutes
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
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // WorkOS state
  const [workosStatus, setWorkosStatus] = useState<WorkosStatus>({
    enabled: false,
    providers: [],
    ssoEnabled: false,
    magicLinkEnabled: false,
  });

  // Timeout state
  const [timeoutDuration, setTimeoutDuration] = useState<number>(30); // Default 30 min
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const toast = useToast();

  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load user profile from database
  const loadUserProfile = async (_userId: string) => {
    try {
      const { data: profile, error } = await getCurrentUserProfile();
      if (error) {
        console.error('Failed to load user profile:', error);
        setUser(null);
        setHasCompletedOnboarding(false);
        return;
      }
      setUser(profile as User | null);

      // Check if onboarding is complete (user has selected a plan or has any subscription)
      // For now, check localStorage for onboarding completion flag
      const onboardingComplete = localStorage.getItem('onboarding_complete') === 'true';
      setHasCompletedOnboarding(onboardingComplete);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      setUser(null);
      setHasCompletedOnboarding(false);
    }
  };

  // Mark onboarding as complete
  const markOnboardingComplete = async () => {
    localStorage.setItem('onboarding_complete', 'true');
    setHasCompletedOnboarding(true);
  };

  // Fetch timeout preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (!authUser) return;
      try {
        const prefs = await getUserPreferences();
        if (prefs && prefs.preferences) {
          const apiPrefs = prefs.preferences as unknown as ApiUserPreferences;
          if (apiPrefs.session_timeout !== undefined) {
            setTimeoutDuration(apiPrefs.session_timeout);
          }
        }
      } catch (e) {
        console.error('Failed to load preferences', e);
      }
    };
    loadPreferences();
  }, [authUser]);

  // Sign out (internal helper)
  const performSignOut = useCallback(async (reason?: string) => {
    // Clear timers
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);

    const { error } = await authSignOut();
    if (!error) {
      setAuthUser(null);
      setUser(null);
      setSession(null);
      setShowTimeoutWarning(false);
      if (reason) {
        toast.info(reason);
      }
    }
    return { error };
  }, [toast]);

  // Reset timers
  const resetTimers = useCallback(() => {
    if (!authUser || timeoutDuration <= 0) {
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        return;
    }

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);

    const durationMs = timeoutDuration * 60 * 1000;
    const warningTimeMs = Math.max(0, durationMs - (2 * 60 * 1000)); // 2 mins before

    // Only set warning timer if duration is sufficient (> 2 mins)
    if (durationMs > 2 * 60 * 1000) {
      warningTimerRef.current = setTimeout(() => {
        setShowTimeoutWarning(true);
      }, warningTimeMs);
    }

    idleTimerRef.current = setTimeout(() => {
      performSignOut('You were logged out due to inactivity');
    }, durationMs);
  }, [authUser, timeoutDuration, performSignOut]);

  // Activity listeners
  useEffect(() => {
    if (!authUser || timeoutDuration <= 0) return;

    let throttleTimeout: NodeJS.Timeout | null = null;

    const handleActivity = () => {
      // If modal is open, ignore activity (user must click button)
      if (showTimeoutWarning) return;

      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          resetTimers();
          throttleTimeout = null;
        }, 1000); // Throttle 1s
      }
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    // Initial reset
    resetTimers();

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      if (throttleTimeout) clearTimeout(throttleTimeout);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    };
  }, [authUser, timeoutDuration, resetTimers, showTimeoutWarning]);

  // Load WorkOS status on mount
  useEffect(() => {
    const loadWorkosStatus = async () => {
      try {
        const status = await getWorkosStatus();
        setWorkosStatus(status);
      } catch (error) {
        console.error('Failed to load WorkOS status:', error);
      }
    };
    loadWorkosStatus();
  }, []);

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

  // Update timeout settings
  const updateTimeoutSettings = async (minutes: number) => {
    setTimeoutDuration(minutes);
    try {
        // Optimistic update
        const currentPrefs = await getUserPreferences();
        const existingApiPrefs = (currentPrefs?.preferences || {}) as unknown as ApiUserPreferences;
        
        await updateUserPreferences({
            preferences: {
                ...existingApiPrefs,
                session_timeout: minutes
            }
        });
        
        toast.success(`Session timeout set to ${minutes === 0 ? 'Disabled' : minutes + ' minutes'}`);
    } catch (e) {
        console.error('Failed to save timeout settings', e);
        toast.error('Failed to save timeout settings');
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

  // Sign in with Google (WorkOS OAuth)
  const signInWithGoogle = async (returnTo?: string): Promise<{ error: Error | null }> => {
    const result = await authSignInWithGoogle(returnTo);
    return { error: result.error };
  };

  // Sign in with GitHub (WorkOS OAuth)
  const signInWithGitHub = async (returnTo?: string): Promise<{ error: Error | null }> => {
    const result = await authSignInWithGitHub(returnTo);
    return { error: result.error };
  };

  // Sign in with Microsoft (WorkOS OAuth)
  const signInWithMicrosoft = async (returnTo?: string): Promise<{ error: Error | null }> => {
    const result = await authSignInWithMicrosoft(returnTo);
    return { error: result.error };
  };

  // Sign in with Enterprise SSO
  const signInWithSSO = async (domain?: string, returnTo?: string): Promise<{ error: Error | null }> => {
    const result = await authSignInWithSSO(domain, returnTo);
    return { error: result.error };
  };

  // Send Magic Link
  const sendMagicLink = async (email: string, returnTo?: string): Promise<{ success: boolean; error: Error | null }> => {
    const result = await authSendMagicLink(email, returnTo);
    return { success: result.success, error: result.error };
  };

  // Sign out (Public)
  const signOut = async (): Promise<{ error: Error | null }> => {
    return performSignOut();
  };

  // Check if current user is an SSO user
  const isSSOUser = authUser?.app_metadata?.provider
    ? ['google', 'github', 'microsoft', 'sso'].includes(authUser.app_metadata.provider as string)
    : false;

  const value: AuthContextType = {
    authUser,
    user,
    session,
    isLoading,
    isAuthenticated: !!authUser,
    hasCompletedOnboarding,
    workosStatus,
    isSSOUser,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithGitHub,
    signInWithMicrosoft,
    signInWithSSO,
    sendMagicLink,
    signOut,
    refreshProfile,
    markOnboardingComplete,
    updateTimeoutSettings,
    timeoutDuration,
  };

  return (
    <AuthContext.Provider value={value}>
        {children}
        <IdleTimeoutWarning 
            isOpen={showTimeoutWarning} 
            onStayLoggedIn={() => {
                setShowTimeoutWarning(false);
                resetTimers();
            }}
        />
    </AuthContext.Provider>
  );
};
