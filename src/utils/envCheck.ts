/**
 * Environment Variable Checker
 * Helps debug environment variable issues in production
 */

export const checkEnvVars = () => {
  const requiredEnvVars = {
    VITE_GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
    VITE_OPENROUTER_API_KEY: import.meta.env.VITE_OPENROUTER_API_KEY,
    VITE_REPLICATE_API_KEY: import.meta.env.VITE_REPLICATE_API_KEY,
    VITE_OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
  };

  const missing: string[] = [];
  const present: string[] = [];

  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (!value || value === 'undefined' || value === '') {
      missing.push(key);
      console.warn(`❌ ${key}: NOT SET`);
    } else {
      present.push(key);
      // Show first 10 chars for security
      const preview = value.substring(0, 10) + '...';
      console.log(`✅ ${key}: ${preview}`);
    }
  });

  if (missing.length > 0) {
    console.error('⚠️ Missing environment variables:', missing);
    return {
      status: 'missing',
      missing,
      present,
    };
  }

  console.log('✅ All required environment variables are set!');
  return {
    status: 'ok',
    missing,
    present,
  };
};

// Auto-run in development
if (import.meta.env.DEV) {
  console.log('🔍 Checking environment variables...');
  checkEnvVars();
}
