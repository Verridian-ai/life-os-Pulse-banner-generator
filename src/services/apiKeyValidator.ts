// API Key Validator Service
// Tests API keys by making lightweight API calls to verify they work

/**
 * Test OpenRouter API key by fetching the models list
 * This is a lightweight check that validates the key without making expensive calls
 */
export async function testOpenRouterKey(apiKey: string): Promise<{
  valid: boolean;
  error?: string;
  modelCount?: number;
}> {
  // Validate key format
  if (!apiKey) {
    return { valid: false, error: 'API key is required' };
  }

  if (!apiKey.startsWith('sk-or-')) {
    return { valid: false, error: 'Invalid key format (should start with sk-or-)' };
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin, // Required by OpenRouter
        'X-Title': 'NanoBanna Pro', // Required by OpenRouter
      },
    });

    if (response.ok) {
      const data = await response.json();
      const modelCount = data.data?.length || 0;
      console.log(`[API Validator] ✓ OpenRouter key valid (${modelCount} models available)`);
      return { valid: true, modelCount };
    }

    if (response.status === 401 || response.status === 403) {
      return { valid: false, error: 'Invalid API key or unauthorized' };
    }

    return { valid: false, error: `API error: ${response.status}` };
  } catch (error) {
    console.error('[API Validator] OpenRouter test failed:', error);
    return {
      valid: false,
      error: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Test Replicate API key by checking authentication
 * Uses the models endpoint which is lightweight
 */
export async function testReplicateKey(apiKey: string): Promise<{
  valid: boolean;
  error?: string;
}> {
  // Validate key format
  if (!apiKey) {
    return { valid: false, error: 'API key is required' };
  }

  if (!apiKey.startsWith('r8_')) {
    return { valid: false, error: 'Invalid key format (should start with r8_)' };
  }

  try {
    // Use the proxy for CORS (development) or direct API (production)
    const response = await fetch('/api/replicate/v1/models', {
      method: 'GET',
      headers: {
        'X-Replicate-Token': apiKey, // Dev proxy header
      },
    });

    if (response.ok) {
      console.log('[API Validator] ✓ Replicate key valid');
      return { valid: true };
    }

    if (response.status === 401 || response.status === 403) {
      return { valid: false, error: 'Invalid API key or unauthorized' };
    }

    return { valid: false, error: `API error: ${response.status}` };
  } catch (error) {
    console.error('[API Validator] Replicate test failed:', error);
    return {
      valid: false,
      error: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Validate API key format without making API calls
 * Useful for quick client-side validation before testing
 */
export function validateKeyFormat(provider: 'openrouter' | 'replicate', apiKey: string): {
  valid: boolean;
  error?: string;
} {
  if (!apiKey) {
    return { valid: false, error: 'API key is required' };
  }

  if (provider === 'openrouter') {
    if (!apiKey.startsWith('sk-or-')) {
      return { valid: false, error: 'OpenRouter keys should start with sk-or-' };
    }
    if (apiKey.length < 20) {
      return { valid: false, error: 'Key appears too short' };
    }
  } else if (provider === 'replicate') {
    if (!apiKey.startsWith('r8_')) {
      return { valid: false, error: 'Replicate keys should start with r8_' };
    }
    if (apiKey.length < 20) {
      return { valid: false, error: 'Key appears too short' };
    }
  }

  return { valid: true };
}
