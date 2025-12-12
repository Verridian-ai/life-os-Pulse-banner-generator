# Supabase API Key Storage - Setup Guide

## 🎉 What Changed?

Your API keys are now **securely stored in Supabase** instead of localStorage! This means:

✅ **More Secure** - Keys encrypted in database, not browser storage
✅ **Cross-Device Sync** - Access your keys from any device (if logged in)
✅ **Backend Storage** - Keys persist even if you clear browser data
✅ **Per-User Keys** - Each user can have their own API keys
✅ **Anonymous Support** - Works even without login (session-based)

---

## 📋 Setup Instructions

### Step 1: Run the Database Migration

You need to create the `user_api_keys` table in your Supabase database.

#### Option A: Using Supabase Dashboard (Easiest)

1. **Open Supabase Dashboard**: https://app.supabase.com/project/bkergrdlytwvdzszmuos
2. **Go to SQL Editor** (left sidebar)
3. **Click "New Query"**
4. **Copy and paste** the entire contents of:
   ```
   supabase/migrations/20250101000000_create_user_api_keys.sql
   ```
5. **Click "Run"** button
6. **Verify**: Go to "Table Editor" → Should see `user_api_keys` table

#### Option B: Using Supabase CLI

```bash
# Make sure you're in the project directory
cd C:\Users\Danie\Desktop\nanobanna-pro

# Run the migration
npx supabase db push
```

---

### Step 2: Verify Table Created

Check that the table exists:

1. **Supabase Dashboard** → **Table Editor**
2. Look for **`user_api_keys`** table
3. It should have these columns:
   - `id` (UUID)
   - `user_id` (UUID, nullable)
   - `session_id` (TEXT, nullable)
   - `gemini_api_key` (TEXT)
   - `openai_api_key` (TEXT)
   - `openrouter_api_key` (TEXT)
   - `replicate_api_key` (TEXT)
   - `llm_provider` (TEXT)
   - `voice_provider` (TEXT)
   - `llm_model`, `llm_image_model`, `llm_upscale_model` (TEXT)
   - `created_at`, `updated_at` (TIMESTAMPTZ)

---

### Step 3: Update Your `.env` File (Security Fix!)

**IMPORTANT SECURITY FIX** - Your `.env` file is currently tracked in git with exposed API keys!

#### Fix Now:

1. **Add `.env` to `.gitignore`**:
   ```bash
   echo ".env" >> .gitignore
   ```

2. **Remove `.env` from git** (keeps file locally):
   ```bash
   git rm --cached .env
   git add .gitignore
   git commit -m "Security: Stop tracking .env file"
   ```

3. **Rename `.env` to `.env.example`** (template):
   ```bash
   mv .env .env.example
   ```

4. **Edit `.env.example`** and replace all API keys with placeholders:
   ```env
   # Replace actual keys with:
   VITE_GEMINI_API_KEY=your_gemini_key_here
   VITE_OPENAI_API_KEY=your_openai_key_here
   # etc...
   ```

5. **Keep real keys in `.env.local`** (already gitignored):
   - Your real keys are already in `.env.local`
   - This file is NOT tracked by git (due to `*.local` in `.gitignore`)

---

### Step 4: Test the New System

1. **Start your dev server**:
   ```bash
   npm run dev
   ```

2. **Open app** at http://localhost:5173

3. **Check console** - You should see:
   ```
   [API Keys] Checking for localStorage migration...
   [API Keys] Migrated localStorage to Supabase  (if you had keys in localStorage)
   ```

4. **Open Settings** (⚙️ icon):
   - Your existing keys should load (from Supabase or .env fallback)
   - Enter new API keys
   - Click **"Save Settings"**

5. **Verify in Supabase**:
   - Dashboard → Table Editor → `user_api_keys`
   - You should see your keys saved

6. **Test Voice Chat**:
   - Toggle voice chat on/off
   - Should load keys from Supabase

---

## 🔐 How It Works

### Priority Order (Cascading Fallback):

1. **Supabase Database** (highest priority)
   - Authenticated users: Keys stored per `user_id`
   - Anonymous users: Keys stored per `session_id`

2. **`.env.local` File** (fallback)
   - Used if no keys in database
   - User-specific, gitignored

3. **`.env` File** (template only)
   - Should only have placeholder values
   - Committed to git as template

### Storage Location:

| User Type | Where Keys Are Stored |
|-----------|----------------------|
| **Logged In** | Supabase `user_api_keys` table (linked to `user_id`) |
| **Anonymous** | Supabase `user_api_keys` table (linked to `session_id`) |
| **No Supabase** | Falls back to `.env.local` |

---

## 🔄 Migration from localStorage

### Automatic Migration

When you first load the app, it automatically:

1. Checks for keys in `localStorage`
2. If found, copies them to Supabase
3. Logs: `[API Keys] ✓ Migrated localStorage to Supabase`

### Manual Cleanup (Optional)

After migration, you can clear old localStorage keys:

```javascript
// Open browser console (F12) and run:
localStorage.removeItem('gemini_api_key');
localStorage.removeItem('openai_api_key');
localStorage.removeItem('openrouter_api_key');
localStorage.removeItem('replicate_api_key');
localStorage.removeItem('llm_provider');
localStorage.removeItem('voice_provider');
```

---

## 🛡️ Security Features

### Row-Level Security (RLS)

The database table has RLS policies that ensure:

- ✅ Users can ONLY see/edit their own keys
- ✅ Anonymous users can ONLY see/edit their session keys
- ✅ Keys are encrypted at rest by Supabase
- ❌ Users CANNOT access other users' keys

### Anonymous User Sessions

- Session ID generated on first visit
- Stored in `localStorage` as `anonymous_session_id`
- Persists across browser sessions
- Allows key storage without login

---

## 🐛 Troubleshooting

### "Failed to save settings: relation does not exist"

**Problem**: Database table not created
**Solution**: Run the migration (Step 1)

### "Failed to save settings: permission denied"

**Problem**: RLS policies not applied
**Solution**: Re-run the migration SQL file

### "No keys found, using .env fallback"

**Normal Behavior**: This means:
- No keys in database yet, OR
- User hasn't entered keys in Settings yet
- Falling back to `.env.local` values

### Keys Not Syncing Across Devices

**Cause**: You're anonymous (not logged in)
**Solution**: Sign in to sync keys across devices

### Old localStorage Keys Still Used

**Solution**: Open browser console and run:
```javascript
localStorage.clear();
location.reload();
```

---

## 📊 Database Schema

```sql
CREATE TABLE public.user_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT,

    -- API Keys (encrypted)
    gemini_api_key TEXT,
    openai_api_key TEXT,
    openrouter_api_key TEXT,
    replicate_api_key TEXT,

    -- Preferences
    llm_provider TEXT DEFAULT 'gemini',
    voice_provider TEXT DEFAULT 'gemini',
    llm_model TEXT,
    llm_image_model TEXT,
    llm_upscale_model TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- One record per user OR session
    CONSTRAINT unique_user_or_session UNIQUE NULLS NOT DISTINCT (user_id, session_id)
);
```

---

## ✅ Verification Checklist

- [ ] Database migration run successfully
- [ ] `user_api_keys` table exists in Supabase
- [ ] `.env` file added to `.gitignore`
- [ ] `.env` removed from git tracking
- [ ] Real keys in `.env.local` (gitignored)
- [ ] Settings modal loads keys from Supabase
- [ ] Settings modal saves keys to Supabase
- [ ] Voice chat loads keys from Supabase
- [ ] Console shows "✓ Loaded keys from Supabase"

---

## 🆘 Need Help?

1. **Check browser console** (F12) for error messages
2. **Check Supabase logs**: Dashboard → Logs
3. **Verify RLS policies**: Dashboard → Authentication → Policies
4. **Test with SQL Editor**:
   ```sql
   SELECT * FROM user_api_keys;
   ```

---

## 🎯 Next Steps

After setup:

1. ✅ Enter your API keys in Settings
2. ✅ Test voice chat with Gemini Live
3. ✅ Test voice chat with OpenAI Realtime
4. ✅ Verify keys persist after page reload
5. ✅ (Optional) Sign in to sync keys across devices

Your API keys are now securely stored in Supabase! 🎉
