# ⚠️ CRITICAL: REMOVE HARDCODED API KEYS BEFORE PRODUCTION ⚠️

## API Keys Currently Hardcoded (FOR TESTING ONLY)

The following files contain **hardcoded API keys** that must be removed before deploying to production:

### 1. `src/services/llm.ts` (Lines 14-16)

```typescript
// REMOVE THESE LINES:
const HARDCODED_GEMINI_KEY = 'your-test-key-here';
const HARDCODED_REPLICATE_KEY = 'your-test-key-here';
const HARDCODED_OPENROUTER_KEY = 'your-test-key-here';
```

### 2. `src/App.tsx` (Line 221)

```typescript
// REMOVE THIS LINE:
const HARDCODED_GEMINI_KEY = 'your-test-key-here';
```

---

## Before Production Deployment:

### Step 1: Remove Hardcoded Keys

Replace the hardcoded fallbacks with empty strings:

**In `src/services/llm.ts`:**

```typescript
const geminiKey =
  localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
const openRouterKey =
  localStorage.getItem('openrouter_api_key') || import.meta.env.VITE_OPENROUTER_API_KEY || '';
const replicateKey =
  localStorage.getItem('replicate_api_key') || import.meta.env.VITE_REPLICATE_API_KEY || '';
```

**In `src/App.tsx`:**

```typescript
const geminiKey = localStorage.getItem('gemini_api_key') || '';
```

### Step 2: Use Environment Variables

Create `.env.production`:

```env
VITE_GEMINI_API_KEY=your_production_key_here
VITE_REPLICATE_API_KEY=your_production_key_here
VITE_OPENROUTER_API_KEY=your_production_key_here
```

### Step 3: Regenerate API Keys

Since these keys are now exposed in code, **regenerate new keys** from:

- Gemini: https://aistudio.google.com/apikey
- Replicate: https://replicate.com/account/api-tokens
- OpenRouter: https://openrouter.ai/keys

---

## Why This Matters

🔴 **Security Risk:** Hardcoded API keys in source code can be:

- Stolen from GitHub/version control
- Extracted from deployed frontend code
- Used to drain your API credits
- Compromised if repository is public

✅ **Safe Alternative:** Use environment variables or backend proxy

---

## Automated Check Before Deploy

Add this to your deployment script:

```bash
#!/bin/bash
# Check for hardcoded keys before deploy
if grep -r "your-test-key" src/; then
  echo "❌ ERROR: Hardcoded API keys found! Remove before deploying."
  exit 1
fi
echo "✅ No hardcoded keys detected"
```
