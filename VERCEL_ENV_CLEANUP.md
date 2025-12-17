# Vercel Environment Variables Cleanup

## ⚠️ IMPORTANT: Remove These Environment Variables from Vercel

To prevent conflicts with the Supabase-based API key storage system, you **MUST** remove the following environment variables from your Vercel deployment settings:

### Variables to REMOVE:
- ❌ `VITE_GEMINI_API_KEY`
- ❌ `VITE_OPENROUTER_API_KEY`
- ❌ `VITE_REPLICATE_API_KEY`
- ❌ `VITE_OPENAI_API_KEY`

### Variables to KEEP:
- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_ANON_KEY`

## Why This is Necessary

The application now uses **Supabase database storage** for user API keys instead of environment variables. When both exist:

1. **Conflict**: Old env vars override user-saved keys from database
2. **Security Issue**: All users would share the same API keys
3. **Save Failures**: Upsert operations fail when env vars are present

## How to Remove from Vercel

### Method 1: Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your project: `life-os-Pulse-banner-generator`
3. Go to **Settings** → **Environment Variables**
4. Find each variable listed above
5. Click the **⋯** menu → **Delete**
6. Confirm deletion
7. **Redeploy** your application

### Method 2: Vercel CLI
```bash
vercel env rm VITE_GEMINI_API_KEY
vercel env rm VITE_OPENROUTER_API_KEY
vercel env rm VITE_REPLICATE_API_KEY
vercel env rm VITE_OPENAI_API_KEY
```

## After Cleanup

Once removed:
- ✅ Users will save API keys via Settings modal
- ✅ Keys stored securely in Supabase database
- ✅ Each user has their own keys
- ✅ No more save freezes or conflicts

## Local Development

For local development, you can still use a `.env.local` file, but only for:
- Supabase credentials (required)
- Optional fallback keys for testing (not recommended)

Example `.env.local`:
```bash
# Required - Supabase credentials
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional - Only use for local testing, DO NOT commit to git
# VITE_OPENROUTER_API_KEY=sk-or-...
```

## Verification

After removing env vars and redeploying, check the browser console. You should see:
```
[API Keys] No keys in database, using .env fallback
```

This will show when a new user first visits (no saved keys yet). Once they save keys in Settings:
```
[API Keys] ✓ Loaded keys from Supabase
```
