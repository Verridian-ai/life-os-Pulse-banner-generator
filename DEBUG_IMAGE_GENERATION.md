# 🔧 Image Generation Debugging Guide

## Quick Diagnosis

If image generation is failing, follow these steps to identify the problem:

### Step 1: Check Console Logs

Open your browser's Developer Console (F12) and look for messages starting with `[Image Gen]` or `[Image Edit]`.

**What to look for:**

- `[Image Gen] Starting generation with:` - Shows configuration
- `[Image Gen] Calling Gemini API with model:` - Shows the model being used
- `[Image Gen] ✓ Image found` - Success!
- `[Image Gen] FAILED:` - Error details

### Step 2: Verify API Key

1. Open **Settings** (gear icon)
2. Check that your **Gemini API Key** is entered
3. Click **Test Connection** to verify it works

**Common Issues:**

- API key not saved (check localStorage: `gemini_api_key`)
- Invalid API key format
- API key has expired or been revoked

### Step 3: Check Model ID

The model ID must be exact. Current default: `gemini-3-pro-image-preview`

**If this model doesn't work, try these alternatives:**

1. Open Settings
2. In "Image Generation Model" field, try:
   - `imagen-3.0-generate-001` (Imagen 3.0 - reliable fallback)
   - `imagen-3.0-fast-generate-001` (Faster, lower quality)
   - `gemini-2.0-flash-exp` (Experimental)

### Step 4: Use the Test Tool

Open `test-image-gen.html` in your browser (located in project root):

1. **Enter your API key**
2. **Click "Test Connection"** - Should show ✓ API Key Valid
3. **Click "List Available Models"** - See what models you have access to
4. **Try generating a test image** - Use the default prompt

This will show detailed error messages in the Error Log section.

---

## Common Errors & Fixes

### Error: "Gemini API key not found"

**Cause:** No API key configured

**Fix:**

1. Go to Settings
2. Enter your Gemini API key
3. Click Save

**Get an API key:**
https://aistudio.google.com/app/apikey

---

### Error: "Model 'gemini-3-pro-image-preview' not found"

**Cause:** This model may not be available yet or your API key doesn't have access

**Fix:**

1. Open Settings
2. Change "Image Generation Model" to: `imagen-3.0-generate-001`
3. Try generating again

---

### Error: "API returned no candidates"

**Cause:** Content blocked by safety filters or API error

**Fix:**

- Try a different, more professional prompt
- Avoid words like "violent", "graphic", etc.
- Check API quota at: https://aistudio.google.com/app/apikey

---

### Error: "No image data in API response"

**Cause:** Model returned text instead of image, or API change

**Fix:**

1. Check console logs for full response
2. Try a different model (see Step 3 above)
3. Verify your API key has image generation permissions

---

### Error: "API quota exceeded"

**Cause:** You've hit your free tier limit

**Fix:**

- Wait until quota resets (daily/monthly)
- Or upgrade to paid tier at: https://console.cloud.google.com/

---

## Browser Console Commands

Open DevTools Console (F12) and run these to diagnose:

### Check Current Settings

```javascript
console.log({
  provider: localStorage.getItem('llm_provider'),
  geminiKey: localStorage.getItem('gemini_api_key') ? '✓ Set' : '✗ Missing',
  imageModel: localStorage.getItem('llm_image_model'),
  openrouterKey: localStorage.getItem('openrouter_api_key') ? '✓ Set' : '✗ Missing',
  replicateKey: localStorage.getItem('replicate_api_key') ? '✓ Set' : '✗ Missing',
});
```

### Reset to Default Model

```javascript
localStorage.setItem('llm_image_model', 'imagen-3.0-generate-001');
location.reload();
```

### Clear All Settings (Nuclear Option)

```javascript
localStorage.clear();
alert('Settings cleared. Page will reload.');
location.reload();
```

---

## Code-Level Debugging

### File: `src/services/llm.ts`

**Recent Fixes Applied:**

1. **Line 566:** Now uses `modelToUse` from settings instead of hardcoded `MODELS.imageGen`
   - **Before:** `model: MODELS.imageGen`
   - **After:** `model: modelToUse`

2. **Lines 525-554:** Improved MIME type detection for reference images
   - Now properly extracts MIME type from data URIs
   - Handles both `data:image/png;base64,...` and raw base64

3. **Lines 457-464:** Added detailed console logging
   - Shows which provider, model, and configuration is being used
   - Helps identify configuration issues immediately

4. **Lines 579-598:** Better error detection
   - Checks if candidates array is empty
   - Provides specific error for safety filter blocks
   - Shows partial response for debugging

5. **Lines 603-613:** Improved error messages
   - Specific messages for API key issues
   - Quota exceeded detection
   - Model not found detection

### Testing Individual Functions

You can test the functions directly in the browser console:

```javascript
// Import the function
import { generateImage } from './src/services/llm.ts';

// Test basic generation
const result = await generateImage(
  'A professional blue background',
  [], // no reference images
  '2K', // size
  [], // no edit history
);

console.log('Result:', result);
```

---

## Known Issues & Workarounds

### Issue 1: "gemini-3-pro-image-preview" Not Available

**Status:** This is a new model that may not be publicly available yet

**Workaround:** Use `imagen-3.0-generate-001` instead

- Open Settings
- Set Image Generation Model to: `imagen-3.0-generate-001`

### Issue 2: Reference Images Not Working

**Status:** Investigating - may be due to MIME type or size limits

**Workaround:**

- Use smaller reference images (< 5MB each)
- Ensure images are in PNG or JPEG format
- Maximum 14 reference images

### Issue 3: 4K Generation Fails

**Status:** May not be supported on all models

**Workaround:**

- Use 2K size instead
- Check if your model supports 4K (Imagen 3.0 does)

---

## API Reference

### Gemini Image Generation Models

| Model ID                       | Features                | Status                  |
| ------------------------------ | ----------------------- | ----------------------- |
| `gemini-3-pro-image-preview`   | 4K, 14 refs, multi-turn | ⚠️ Limited availability |
| `imagen-3.0-generate-001`      | High quality, reliable  | ✅ Stable               |
| `imagen-3.0-fast-generate-001` | Faster, lower quality   | ✅ Stable               |
| `gemini-2.0-flash-exp`         | Experimental            | ⚠️ May change           |

### Image Sizes

| Size | Resolution | Best For                       |
| ---- | ---------- | ------------------------------ |
| 1K   | ~1024x256  | Quick previews                 |
| 2K   | ~2048x512  | Standard quality               |
| 4K   | ~4096x1024 | High resolution (if supported) |

**Note:** Actual resolution depends on aspect ratio (16:9 for LinkedIn)

---

## Still Having Issues?

### 1. Open an Issue

Go to: https://github.com/Verridian-ai/life-os-Pulse-banner-generator/issues

Include:

- Browser console logs (screenshots or copy/paste)
- Your settings configuration (hide API key!)
- Steps to reproduce the error
- Expected vs actual behavior

### 2. Check Recent Changes

Look at the latest commits to see if there are known issues:
https://github.com/Verridian-ai/life-os-Pulse-banner-generator/commits/main

### 3. Join Community Support

Discord: [Link to your Discord]
Email: support@careersy.com

---

## For Developers

### Debug Mode

Enable verbose logging by running in console:

```javascript
localStorage.setItem('debug_mode', 'true');
location.reload();
```

### Inspect API Requests

In DevTools Network tab:

1. Filter by "generative-language" or "googleapis"
2. Look for POST requests
3. Check Request Payload and Response

### TypeScript Type Checking

Run type check to ensure no type errors:

```bash
npm run type-check
```

### Build Test

Test if the app builds without errors:

```bash
npm run build
```

---

**Last Updated:** 2025-12-12
**Version:** 1.0.0
