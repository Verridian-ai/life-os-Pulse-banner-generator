// API Key Storage Service using Neon via Backend API
// Manages secure storage and retrieval of user API keys

import { api } from './api';
import type { ApiKeysResponse } from '@/types/api';

export interface UserAPIKeys {
  gemini_api_key?: string; // Masked (****xxxx) - for display only
  openai_api_key?: string; // Masked (****xxxx) - for display only
  openrouter_api_key?: string; // Masked (****xxxx) - for display only
  replicate_api_key?: string; // Masked (****xxxx) - for display only
  llm_provider?: 'gemini' | 'openrouter';
  llm_model?: string; // Chat/Assistant model
  llm_image_model?: string; // Image generation model
  llm_magic_edit_model?: string; // Magic edit model
  llm_upscale_model?: string; // Upscale model
  // Boolean flags to indicate if a key exists (server stores actual keys)
  hasGeminiKey?: boolean;
  hasOpenaiKey?: boolean;
  hasOpenrouterKey?: boolean;
  hasReplicateKey?: boolean;
  // Flag indicating product (server) has API keys - users can use features without BYOK
  hasProductKeys?: boolean;
}



/**
 * Get user's API keys from Neon via Backend API
 * SECURITY: Keys are masked (****xxxx) for display. Server uses actual keys for API calls.
 */
export async function getUserAPIKeys(): Promise<UserAPIKeys> {
  console.log('[API Keys] getUserAPIKeys() called');

  try {
    // Call the backend API to get user's API keys
    const response = await api.get<{ apiKeys: ApiKeysResponse; hasProductKeys?: boolean }>('/api/user/api-keys');

    if (response) {
      console.log('[API Keys] ✓ Loaded keys from Neon (masked for display)');

      // Map camelCase from DB to snake_case used by frontend
      // Note: Keys are masked (****xxxx) - server handles actual API calls
      const dbKeys = response.apiKeys || {};
      const hasProductKeys = response.hasProductKeys || false;
      return {
        gemini_api_key: dbKeys.geminiApiKey || undefined,
        openai_api_key: dbKeys.openaiApiKey || undefined,
        openrouter_api_key: dbKeys.openrouterApiKey || undefined,
        replicate_api_key: dbKeys.replicateApiKey || undefined,
        llm_provider: dbKeys.llmProvider || 'openrouter',
        llm_model: dbKeys.llmModel || undefined,
        llm_image_model: dbKeys.llmImageModel || undefined,
        llm_magic_edit_model: dbKeys.llmMagicEditModel || undefined,
        llm_upscale_model: dbKeys.llmUpscaleModel || undefined,
        // Boolean flags for UI to check if keys are configured
        hasGeminiKey: dbKeys.hasGeminiKey || false,
        hasOpenaiKey: dbKeys.hasOpenaiKey || false,
        hasOpenrouterKey: dbKeys.hasOpenrouterKey || false,
        hasReplicateKey: dbKeys.hasReplicateKey || false,
        // Product keys flag - AI features work without user BYOK keys
        hasProductKeys,
      };
    }

    console.log('[API Keys] No keys found in database');
    return getEnvFallbackKeys();

  } catch (error) {
    console.error('[API Keys] Unexpected error:', error);
    return getEnvFallbackKeys();
  }
}

/**
 * Get Voice API Key (actual OpenAI key for voice WebSocket connection)
 * SECURITY: This returns the ACTUAL key, not masked. Only use for voice connection.
 */
/**
 * Get Voice API Key (Ephemeral Token)
 * SECURITY: Fetches a short-lived ephemeral token for real-time API.
 */
export async function getVoiceAPIKey(): Promise<{ voiceKey: string } | { error: string; requiresKey?: boolean }> {
  console.log('[API Keys] getVoiceAPIKey() called');

  try {
    // Call the backend API to get an ephemeral token
    const response = await api.get<{ token?: string; error?: string }>('/api/ai/voice/token');

    if (response.token) {
      console.log('[API Keys] ✓ Ephemeral voice token retrieved');
      return { voiceKey: response.token };
    }

    return { error: response.error || 'Voice token not found' };
  } catch (error: unknown) {
    console.error('[API Keys] Voice token error:', error);
    const message = error instanceof Error ? error.message : 'Failed to get voice token';
    return { error: message };
  }
}

/**
 * Save user's API keys to Neon via Backend API
 */
export async function saveUserAPIKeys(
  keys: UserAPIKeys,
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[API Keys] Saving API keys...');

    // Map snake_case from frontend to camelCase expected by DB
    const dbKeys = {
      geminiApiKey: keys.gemini_api_key,
      openaiApiKey: keys.openai_api_key,
      openrouterApiKey: keys.openrouter_api_key,
      replicateApiKey: keys.replicate_api_key,
      llmProvider: keys.llm_provider,
      llmModel: keys.llm_model,
      llmImageModel: keys.llm_image_model,
      llmMagicEditModel: keys.llm_magic_edit_model,
      llmUpscaleModel: keys.llm_upscale_model,
    };

    // Call the backend API to save user's API keys
    const response = await api.post<{ success?: boolean; error?: string }>('/api/user/api-keys', dbKeys);

    if (response && (response.success === true || !response.error)) {
      console.log('[API Keys] ✓ Saved to Neon');
      return { success: true };
    }

    return { success: false, error: response?.error || 'Failed to save API keys' };
  } catch (error: unknown) {
    console.error('[API Keys] Unexpected error saving:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Delete user's API keys from Neon via Backend API
 */
export async function deleteUserAPIKeys(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[API Keys] Deleting API keys...');

    // Call the backend API to delete user's API keys
    const response = await api.delete<{ success?: boolean; error?: string }>('/api/user/api-keys');

    if (response && (response.success === true || !response.error)) {
      console.log('[API Keys] ✓ Deleted from Neon');
      return { success: true };
    }

    return { success: false, error: response?.error || 'Failed to delete API keys' };
  } catch (error: unknown) {
    console.error('[API Keys] Unexpected error deleting:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Get fallback keys (empty - no env exposure for security)
 * SECURITY: Never expose API keys in client bundle via VITE_* environment variables.
 * All API keys must be stored server-side in the database.
 */
function getEnvFallbackKeys(): UserAPIKeys {
  // SECURITY FIX: Removed import.meta.env.VITE_* references
  // API keys must be stored in the database, not exposed in client bundle
  return {
    llm_provider: 'openrouter',
  };
}

/**
 * Migrate localStorage keys to Neon (one-time migration helper)
 */
/**
 * Force clear legacy localStorage keys (Security)
 */
export function forceClearLegacyKeys(): void {
  const keysToRemove = [
    'gemini_api_key',
    'openai_api_key',
    'openrouter_api_key',
    'replicate_api_key',
    'llm_provider',
    'llm_model',
    'llm_image_model',
    'llm_magic_edit_model',
    'llm_upscale_model'
  ];

  keysToRemove.forEach(key => localStorage.removeItem(key));
  console.log('[API Keys] ✓ Cleared legacy keys from localStorage');
}

/**
 * Migrate localStorage keys to Neon (one-time migration helper)
 */
export async function migrateLocalStorageToNeon(): Promise<void> {
  console.log('[API Keys] Checking for localStorage migration...');

  const hasLocalStorage =
    localStorage.getItem('gemini_api_key') ||
    localStorage.getItem('openrouter_api_key') ||
    localStorage.getItem('replicate_api_key');

  if (!hasLocalStorage) {
    console.log('[API Keys] No localStorage keys to migrate');
    return;
  }

  const keys: UserAPIKeys = {
    gemini_api_key: localStorage.getItem('gemini_api_key') || undefined,
    openai_api_key: localStorage.getItem('openai_api_key') || undefined,
    openrouter_api_key: localStorage.getItem('openrouter_api_key') || undefined,
    replicate_api_key: localStorage.getItem('replicate_api_key') || undefined,
    llm_provider: (localStorage.getItem('llm_provider') as 'gemini' | 'openrouter') || 'openrouter',
    llm_model: localStorage.getItem('llm_model') || undefined,
    llm_image_model: localStorage.getItem('llm_image_model') || undefined,
    llm_magic_edit_model: localStorage.getItem('llm_magic_edit_model') || undefined,
    llm_upscale_model: localStorage.getItem('llm_upscale_model') || undefined,
  };

  const result = await saveUserAPIKeys(keys);

  if (result.success) {
    console.log('[API Keys] ✓ Migrated localStorage to database');
    forceClearLegacyKeys();
  } else {
    console.error('[API Keys] Migration failed:', result.error);
    // SECURITY: If save fails, we normally don't clear to avoid data loss.
    // However, if strict security is required, one might force clear.
    // For now, we trust the user will retry or keys will be cleared on next success.
  }
}
