// API Key Storage Service using Supabase
// Manages secure storage and retrieval of user API keys

import { supabase } from './supabase';

export interface UserAPIKeys {
  gemini_api_key?: string; // Keep for backward compatibility
  openrouter_api_key?: string;
  replicate_api_key?: string;
  llm_provider?: 'gemini' | 'openrouter';
  llm_model?: string; // Chat/Assistant model
  llm_image_model?: string; // Image generation model
  llm_magic_edit_model?: string; // Magic edit model
  llm_upscale_model?: string; // Upscale model
}

// Generate or retrieve session ID for anonymous users
function getSessionId(): string {
  let sessionId = localStorage.getItem('anonymous_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('anonymous_session_id', sessionId);
  }
  return sessionId;
}

/**
 * Get user's API keys from Supabase
 * Falls back to .env variables if not found in database
 */
export async function getUserAPIKeys(): Promise<UserAPIKeys> {
  // Use imported supabase client
  if (!supabase) {
    console.warn('[API Keys] Supabase not configured, using .env fallback');
    return getEnvFallbackKeys();
  }

  try {
    // Check if user is authenticated (use getSession for instant local check)
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user || null;

    let query = supabase.from('user_api_keys').select('*');

    if (user) {
      // Authenticated user
      query = query.eq('user_id', user.id);
    } else {
      // Anonymous user with session
      const sessionId = getSessionId();
      query = query.eq('session_id', sessionId);
    }

    const { data, error } = await query.limit(1).single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = not found
      console.error('[API Keys] Error fetching keys:', error);
      return getEnvFallbackKeys();
    }

    if (!data) {
      console.log('[API Keys] No keys in database, using .env fallback');
      return getEnvFallbackKeys();
    }

    console.log('[API Keys] ✓ Loaded keys from Supabase');

    // Return database keys with ENV fallback if they are missing in DB
    return {
      gemini_api_key: data.gemini_api_key || import.meta.env.VITE_GEMINI_API_KEY,
      openrouter_api_key: data.openrouter_api_key || import.meta.env.VITE_OPENROUTER_API_KEY,
      replicate_api_key: data.replicate_api_key || import.meta.env.VITE_REPLICATE_API_KEY,
      llm_provider: (data.llm_provider as 'gemini' | 'openrouter') || 'openrouter',
      llm_model: data.llm_model || undefined,
      llm_image_model: data.llm_image_model || undefined,
      llm_magic_edit_model: data.llm_magic_edit_model || undefined,
      llm_upscale_model: data.llm_upscale_model || undefined,
    };
  } catch (error) {
    console.error('[API Keys] Unexpected error:', error);
    return getEnvFallbackKeys();
  }
}

/**
 * Save user's API keys to Supabase
 */
export async function saveUserAPIKeys(
  keys: UserAPIKeys,
): Promise<{ success: boolean; error?: string }> {
  // Use imported supabase client
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    // Check if user is authenticated (use getSession with timeout)
    console.log('[API Keys] Checking auth session...');
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Session check timeout - please refresh the page')), 3000)
    );

    const {
      data: { session },
    } = await Promise.race([sessionPromise, timeoutPromise]);
    const user = session?.user || null;
    console.log('[API Keys] Session check:', user ? 'authenticated' : 'anonymous');

    const payload: {
      gemini_api_key: string | null;
      openrouter_api_key: string | null;
      replicate_api_key: string | null;
      llm_provider: string;
      llm_model: string | null;
      llm_image_model: string | null;
      llm_magic_edit_model: string | null; // NEW
      llm_upscale_model: string | null;
      user_id?: string | null;
      session_id?: string | null;
    } = {
      gemini_api_key: keys.gemini_api_key || null,
      openrouter_api_key: keys.openrouter_api_key || null,
      replicate_api_key: keys.replicate_api_key || null,
      llm_provider: keys.llm_provider || 'openrouter',
      llm_model: keys.llm_model || null,
      llm_image_model: keys.llm_image_model || null,
      llm_magic_edit_model: keys.llm_magic_edit_model || null, // NEW
      llm_upscale_model: keys.llm_upscale_model || null,
    };

    if (user) {
      // Authenticated user
      payload.user_id = user.id;
      payload.session_id = null;
    } else {
      // Anonymous user
      payload.user_id = null;
      payload.session_id = getSessionId();
    }

    // Upsert (insert or update)
    // Use the appropriate unique constraint based on user type
    const { error } = await supabase.from('user_api_keys').upsert(payload, {
      onConflict: user ? 'user_id' : 'session_id',
      ignoreDuplicates: false,
    });

    if (error) {
      console.error('[API Keys] Error saving keys:', error);
      return { success: false, error: error.message };
    }

    console.log('[API Keys] ✓ Saved to Supabase');
    return { success: true };
  } catch (error: unknown) {
    console.error('[API Keys] Unexpected error saving:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Delete user's API keys from Supabase
 */
export async function deleteUserAPIKeys(): Promise<{ success: boolean; error?: string }> {
  // Use imported supabase client
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    // Check if user is authenticated (use getSession for instant local check)
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user || null;

    let query = supabase.from('user_api_keys').delete();

    if (user) {
      query = query.eq('user_id', user.id);
    } else {
      const sessionId = getSessionId();
      query = query.eq('session_id', sessionId);
    }

    const { error } = await query;

    if (error) {
      console.error('[API Keys] Error deleting keys:', error);
      return { success: false, error: error.message };
    }

    console.log('[API Keys] ✓ Deleted from Supabase');
    return { success: true };
  } catch (error: unknown) {
    console.error('[API Keys] Unexpected error deleting:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Get fallback keys from environment variables
 */
function getEnvFallbackKeys(): UserAPIKeys {
  return {
    gemini_api_key: import.meta.env.VITE_GEMINI_API_KEY,
    openrouter_api_key: import.meta.env.VITE_OPENROUTER_API_KEY,
    replicate_api_key: import.meta.env.VITE_REPLICATE_API_KEY,
    llm_provider: 'openrouter',
  };
}

/**
 * Migrate localStorage keys to Supabase (one-time migration helper)
 */
export async function migrateLocalStorageToSupabase(): Promise<void> {
  console.log('[API Keys] Checking for localStorage migration...');

  // Check if we have keys in localStorage
  const hasLocalStorage =
    localStorage.getItem('gemini_api_key') ||
    localStorage.getItem('openrouter_api_key') ||
    localStorage.getItem('replicate_api_key');

  if (!hasLocalStorage) {
    console.log('[API Keys] No localStorage keys to migrate');
    return;
  }

  // Get all keys from localStorage
  const keys: UserAPIKeys = {
    gemini_api_key: localStorage.getItem('gemini_api_key') || undefined,
    openrouter_api_key: localStorage.getItem('openrouter_api_key') || undefined,
    replicate_api_key: localStorage.getItem('replicate_api_key') || undefined,
    llm_provider: (localStorage.getItem('llm_provider') as 'gemini' | 'openrouter') || 'openrouter',
    llm_model: localStorage.getItem('llm_model') || undefined,
    llm_image_model: localStorage.getItem('llm_image_model') || undefined,
    llm_magic_edit_model: localStorage.getItem('llm_magic_edit_model') || undefined, // NEW
    llm_upscale_model: localStorage.getItem('llm_upscale_model') || undefined,
  };

  // Save to Supabase
  const result = await saveUserAPIKeys(keys);

  if (result.success) {
    console.log('[API Keys] ✓ Migrated localStorage to Supabase');

    // Optionally clear localStorage after successful migration
    // Uncomment these lines if you want to remove from localStorage after migration
    // localStorage.removeItem('gemini_api_key');
    // localStorage.removeItem('openai_api_key');
    // localStorage.removeItem('openrouter_api_key');
    // localStorage.removeItem('replicate_api_key');
    // localStorage.removeItem('llm_provider');
    // localStorage.removeItem('voice_provider');
    // localStorage.removeItem('llm_model');
    // localStorage.removeItem('llm_image_model');
    // localStorage.removeItem('llm_upscale_model');
  } else {
    console.error('[API Keys] Migration failed:', result.error);
  }
}
