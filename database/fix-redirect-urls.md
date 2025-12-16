# Fix Email Confirmation Redirect URLs

## Problem
Email confirmation links are redirecting to the wrong URL instead of `https://life-os-banner.verridian.ai`.

## Solution

### 1. Update Supabase Dashboard Settings

Go to your Supabase Dashboard → Authentication → URL Configuration:

**Site URL**:
```
https://life-os-banner.verridian.ai
```

**Redirect URLs** (add these to the allowlist):
```
https://life-os-banner.verridian.ai/auth/callback
https://life-os-banner.verridian.ai/auth/reset-password
https://life-os-banner.verridian.ai/**
```

### 2. Code Changes (Already Applied)

✅ Updated `src/services/auth.ts` to include `emailRedirectTo` in the signUp options:
```typescript
emailRedirectTo: 'https://life-os-banner.verridian.ai/auth/callback'
```

### 3. Deploy Code Changes

The code fix has been applied and needs to be pushed to Vercel:
```bash
git add src/services/auth.ts database/fix-redirect-urls.md
git commit -m "fix: set correct email confirmation redirect URL"
git push origin main
```

### 4. Test Email Confirmation Flow

1. Sign up with a new test email
2. Check your email inbox for confirmation link
3. Click the confirmation link
4. Verify it redirects to: `https://life-os-banner.verridian.ai/auth/callback`
5. You should be automatically signed in

## Notes

- The OAuth redirects (Google, GitHub) already use `window.location.origin` which will work correctly on production
- Password reset already uses `window.location.origin` so it will work correctly too
- Only email confirmation needed the hardcoded production URL
