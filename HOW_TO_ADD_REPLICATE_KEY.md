# How to Add Replicate API Key - Quick Guide

## The Error You're Seeing
```
Operation Failed
Replicate API key not found. Please add it in Settings.
```

This means you need to add a Replicate API key to use:
- 🔍 **Upscale** - Enhance image resolution
- ✨ **Magic Refiner** (Best/Balanced/Fast) - Improve image quality
- 🎨 **Background Removal** - Remove image backgrounds

---

## Step 1: Get a Replicate API Key (Free!)

### Option A: Get it from Replicate.com
1. **Go to** https://replicate.com/
2. **Click "Sign In"** (top right)
3. **Sign up** with GitHub, Google, or email
4. **Go to API Tokens**: https://replicate.com/account/api-tokens
5. **Copy your token** - It looks like: `r8_xxxxxxxxxxxxxxxxxxxxx`

### Option B: Get Your Own Token
Get your own free Replicate API token at https://replicate.com/account/api-tokens

⚠️ **Note**: Never share your API keys publicly or commit them to git.

---

## Step 2: Add the Key to Your App

### Method A: Through the App Settings (Recommended ✅)

1. **Open your app** at http://localhost:5173
2. **Click the Settings icon** (⚙️ gear icon in the top right corner)
3. **Find "Replicate API Key"** field
4. **Paste your API key** (starts with `r8_`)
5. **Click "Save"**
6. **Done!** Try using Upscale or Magic Refiner again

### Method B: Add to .env.local File

1. **Open** `.env.local` file in your project
2. **Find the line** that says:
   ```
   VITE_REPLICATE_API_KEY=
   ```
3. **Add your key** after the `=`:
   ```
   VITE_REPLICATE_API_KEY=r8_your_actual_key_here
   ```
4. **Save the file**
5. **Restart the dev server**:
   - Stop the current server (Ctrl+C in terminal)
   - Run `npm run dev` again
6. **Done!**

---

## Step 3: Test It

1. **Generate an image** in the app
2. **Click "Upscale"** or choose a **Magic Refiner** option
3. **Should work!** 🎉

If you still get an error:
- Check the browser console (F12) for more details
- Make sure you saved the settings
- Try refreshing the page

---

## Pricing

Replicate uses pay-per-use:
- ✅ **Free credits** to start
- 💰 After that: **~$0.01 - $0.10 per operation**
- 📊 Most operations cost **a few cents**

Check pricing: https://replicate.com/pricing

---

## Troubleshooting

### "Invalid API key" error
- Make sure the key starts with `r8_`
- Check for extra spaces when copying
- Get a fresh token from Replicate

### "Quota exceeded" error
- You've used all free credits
- Add payment method on Replicate dashboard
- Or get a new free account

### Settings not saving
- Try Method B (add to .env.local)
- Restart the dev server
- Clear browser cache (Ctrl+Shift+R)

---

## Quick Commands

**Check if key is set:**
```bash
# In browser console (F12)
localStorage.getItem('replicate_api_key')
```

**Set key manually in browser:**
```javascript
// In browser console (F12)
localStorage.setItem('replicate_api_key', 'r8_your_key_here')
```

---

Need help? Check the main setup guide: `REPLICATE_API_KEY_SETUP.md`
