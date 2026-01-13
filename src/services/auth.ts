import { api } from './api';
import type { ProfileWithPreferences } from '@/types/api';

// Auth types
export interface AppUser {
  id: string;
  email?: string;
  app_metadata: {
    provider?: string;
    [key: string]: string | Record<string, unknown> | undefined;
  };
  user_metadata: {
    [key: string]: string | Record<string, unknown> | undefined;
  };
  aud: string;
  created_at: string;
}

export interface AppSession {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at?: number;
  refresh_token: string;
  user: AppUser;
}

// Global types
export type User = AppUser;
export type Session = AppSession;

// Auth events
type AuthChangeEvent = 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED' | 'PASSWORD_RECOVERY';

type AuthStateChangeCallback = (event: AuthChangeEvent, session: Session | null) => void;

const listeners: AuthStateChangeCallback[] = [];

function notifyListeners(event: AuthChangeEvent, session: Session | null) {
  listeners.forEach((l) => l(event, session));
}

// --- API IMPLEMENTATION ---

export const signUp = async (
  email: string,
  password: string,
  metadata?: { first_name?: string; last_name?: string; username?: string }
) => {
  try {
    const res = await api.post<{ success: true; userId: string; error?: string }>('/api/auth/signup', {
      email,
      password,
      metadata,
    });
    if (res.error) throw new Error(res.error);

    // In Lucia + this flow, user is logged in via cookie.
    const user = await getCurrentUser();
    const session = await getSession();

    if (user && session) {
      notifyListeners('SIGNED_IN', session);
      return { user, error: null };
    }
    return { user: { id: res.userId, email } as User, error: null };

  } catch (error) {
    return { user: null, error: error as Error };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const res = await api.post<{ success: true; user: { id: string; email: string }; error?: string }>('/api/auth/login', { email, password });
    if (res.error) throw new Error(res.error);

    const fullUser = await getCurrentUser();
    const session = await getSession();

    notifyListeners('SIGNED_IN', session);
    return { user: fullUser, session, error: null };
  } catch (error) {
    return { user: null, session: null, error: error as Error };
  }
};

export const signOut = async () => {
  try {
    await api.post('/api/auth/logout', {});
    notifyListeners('SIGNED_OUT', null);
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};

export const getSession = async (): Promise<Session | null> => {
  try {
    const res = await api.get<{ user: AppUser | null }>('/api/auth/me');
    if (!res.user) return null;

    // Construct a fake "Session" object to satisfy the app's type expectations
    // The actual auth is handled by HttpOnly cookies, so the token here is dummy.
    const session: AppSession = {
      access_token: 'dummy-cookie-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'dummy-refresh',
      user: res.user
    };

    return session as unknown as Session;
  } catch {
    return null;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  const session = await getSession();
  return session?.user ?? null;
};

export const onAuthStateChange = (callback: AuthStateChangeCallback) => {
  listeners.push(callback);
  return {
    data: {
      subscription: {
        unsubscribe: () => {
          const index = listeners.indexOf(callback);
          if (index > -1) listeners.splice(index, 1);
        },
      },
    },
  };
};

// ============================================================================
// WORKOS OAUTH METHODS
// ============================================================================

/**
 * Get WorkOS status (enabled providers)
 */
export const getWorkosStatus = async (): Promise<{
  enabled: boolean;
  providers: string[];
  ssoEnabled: boolean;
  magicLinkEnabled: boolean;
}> => {
  try {
    const res = await api.get<{
      enabled: boolean;
      providers: string[];
      ssoEnabled: boolean;
      magicLinkEnabled: boolean;
    }>('/api/auth/workos/status');
    return res;
  } catch {
    return {
      enabled: false,
      providers: [],
      ssoEnabled: false,
      magicLinkEnabled: false,
    };
  }
};

/**
 * Sign in with Google (WorkOS OAuth)
 */
export const signInWithGoogle = async (returnTo?: string) => {
  try {
    const status = await getWorkosStatus();
    if (!status.enabled || !status.providers.includes('google')) {
      return {
        data: null,
        error: new Error('Google Sign-In is not available')
      };
    }

    // Redirect to OAuth flow
    const params = new URLSearchParams({
      provider: 'google',
      ...(returnTo && { returnTo }),
    });
    window.location.href = `/api/auth/workos/authorize?${params.toString()}`;

    return { data: null, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

/**
 * Sign in with GitHub (WorkOS OAuth)
 */
export const signInWithGitHub = async (returnTo?: string) => {
  try {
    const status = await getWorkosStatus();
    if (!status.enabled || !status.providers.includes('github')) {
      return {
        data: null,
        error: new Error('GitHub Sign-In is not available')
      };
    }

    const params = new URLSearchParams({
      provider: 'github',
      ...(returnTo && { returnTo }),
    });
    window.location.href = `/api/auth/workos/authorize?${params.toString()}`;

    return { data: null, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

/**
 * Sign in with Microsoft (WorkOS OAuth)
 */
export const signInWithMicrosoft = async (returnTo?: string) => {
  try {
    const status = await getWorkosStatus();
    if (!status.enabled || !status.providers.includes('microsoft')) {
      return {
        data: null,
        error: new Error('Microsoft Sign-In is not available')
      };
    }

    const params = new URLSearchParams({
      provider: 'microsoft',
      ...(returnTo && { returnTo }),
    });
    window.location.href = `/api/auth/workos/authorize?${params.toString()}`;

    return { data: null, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

/**
 * Start enterprise SSO flow
 */
export const signInWithSSO = async (domain?: string, returnTo?: string) => {
  try {
    const status = await getWorkosStatus();
    if (!status.ssoEnabled) {
      return {
        data: null,
        error: new Error('SSO is not available')
      };
    }

    const params = new URLSearchParams({
      ...(domain && { domain }),
      ...(returnTo && { returnTo }),
    });
    window.location.href = `/api/auth/sso/authorize?${params.toString()}`;

    return { data: null, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

/**
 * Send magic link for passwordless login
 */
export const sendMagicLink = async (email: string, returnTo?: string) => {
  try {
    const res = await api.post<{ success: boolean; message: string; error?: string }>(
      '/api/auth/magic-link',
      { email, returnTo }
    );

    if (res.error) {
      return { success: false, error: new Error(res.error) };
    }

    return { success: true, message: res.message, error: null };
  } catch (error) {
    return { success: false, error: error as Error };
  }
};

/**
 * Get available auth providers for a domain
 */
export const getAuthProviders = async (domain?: string): Promise<string[]> => {
  try {
    const params = domain ? `?domain=${encodeURIComponent(domain)}` : '';
    const res = await api.get<{ providers: string[] }>(`/api/auth/providers${params}`);
    return res.providers || ['password'];
  } catch {
    return ['password'];
  }
};

// Profile Helper
export const getCurrentUserProfile = async () => {
  try {
    const res = await api.get<ProfileWithPreferences>('/api/user/profile');
    if (!res.profile) return { data: null, error: new Error('Profile not found') };
    return { data: res.profile, error: null };
  } catch (e) {
    return { data: null, error: e as Error };
  }
};

// Password Reset
export const resetPassword = async (email: string) => {
  try {
    const res = await api.post<{ success: true; error?: string }>('/api/auth/reset-password', { email });
    if (res.error) throw new Error(res.error);
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};

// Username Validation
export const validateUsernameFormat = (username: string): { isValid: boolean; error?: string } => {
  // Username should be 3-20 characters, alphanumeric and underscores only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

  if (!username) {
    return { isValid: false, error: 'Username is required' };
  }

  if (username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters' };
  }

  if (username.length > 20) {
    return { isValid: false, error: 'Username must be at most 20 characters' };
  }

  if (!usernameRegex.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }

  return { isValid: true };
};

// Check Username Availability
export const checkUsernameAvailability = async (username: string): Promise<{ available: boolean; error?: string }> => {
  try {
    const res = await api.get<{ available: boolean; error?: string }>(`/api/auth/check-username?username=${encodeURIComponent(username)}`);
    return { available: res.available ?? false, error: res.error };
  } catch (error) {
    return { available: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
