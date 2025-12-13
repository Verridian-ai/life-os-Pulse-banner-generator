# Image Generation Functionality Test Report

**Application:** NanoBanna Pro
**URL:** http://localhost:3002/
**Test Date:** December 12, 2025

---

## Testing Overview

This document provides a comprehensive testing plan for the image generation functionality in NanoBanna Pro. The testing covers:

1. Initial state verification
2. Image generation with different prompts
3. Loading state behavior
4. Resolution switching (1K, 2K, 4K)
5. Fallback system verification
6. Console log monitoring
7. Error handling

---

## Test Environment Setup

Before testing, ensure:

- [ ] Application is running on http://localhost:3002/
- [ ] Browser Developer Tools are open (F12)
- [ ] Console tab is selected in DevTools
- [ ] API keys are configured in Settings (Gemini API key required)

---

## Test Cases

### Test Case 1: Initial State Verification

**Steps:**

1. Navigate to http://localhost:3002/
2. Verify the Studio tab is active (default)
3. Check the AI Studio sidebar is visible on the right

**Expected Results:**

- [ ] Homepage loads without errors
- [ ] Studio tab is highlighted/active
- [ ] AI Studio sidebar shows:
  - Background Gen section with textarea
  - Quality selector (1K, 2K, 4K) - default should be "1K"
  - "Generate Background" button
  - Magic Edit section
  - Tools section (Remove BG, Upscale)

---

### Test Case 2: Basic Image Generation

**Steps:**

1. Enter prompt: "Professional LinkedIn banner with blue gradient background"
2. Ensure resolution is set to "1K"
3. Click "Generate Background" button
4. Monitor console for [Image Gen] logs
5. Wait for generation to complete

**Expected Console Logs (in order):**

```
[App] Generating with Nano Banana Pro (gemini-3-pro-image-preview)
[Image Gen] Starting generation with: {provider: 'gemini', model: 'gemini-3-pro-image-preview', ...}
[Image Gen] Calling Gemini API with model: gemini-3-pro-image-preview, size: 1K
[Image Gen] API response received, extracting image...
[Image Gen] Image found in candidate X, part Y
```

**Expected Results:**

- [ ] Button text changes to "CREATING..." with spinner
- [ ] Button is disabled during generation
- [ ] After completion, background image appears on canvas
- [ ] Notification shows "GENERATED WITH NANO BANANA PRO" (or fallback model)

---

### Test Case 3: Loading State Verification

**Steps:**

1. Start a new generation
2. Immediately observe the button state

**Expected Results:**

- [ ] Button shows spinner animation
- [ ] Button text shows "CREATING..."
- [ ] Button has opacity-50 styling (disabled state)
- [ ] All other generation buttons are disabled
- [ ] Loading state persists until API response

---

### Test Case 4: Resolution Changes

**Test 4a: Generate at 2K**

1. Change quality selector to "2K"
2. Enter prompt: "Abstract geometric patterns in purple and orange"
3. Click Generate Background
4. Monitor console for size parameter

**Expected Console Log:**

```
[Image Gen] Starting generation with: {..., size: '2K', ...}
[Image Gen] Calling Gemini API with model: ..., size: 2K
```

**Test 4b: Generate at 4K**

1. Change quality selector to "4K"
2. Enter prompt: "Modern office with city skyline view"
3. Click Generate Background
4. Note: 4K may fallback to 2K if Nano Banana Pro not available

**Expected Results:**

- [ ] Console shows correct size parameter
- [ ] Higher resolution images have more detail
- [ ] Generation may take longer at higher resolutions

---

### Test Case 5: Fallback System Testing

**Scenario A: Model Not Available**
The fallback chain is:

1. gemini-3-pro-image-preview (Nano Banana Pro)
2. gemini-2.5-flash-image (Nano Banana)
3. Replicate FLUX.1-schnell (requires Replicate API key)

**Expected Console Logs (if fallback triggers):**

```
[Image Gen] Nano Banana Pro (gemini-3-pro-image-preview) not available
[Image Gen] Auto-fallback to Nano Banana (gemini-2.5-flash-image)
[Image Gen] Fallback to Nano Banana successful!
```

Or if both Gemini models fail:

```
[Image Gen] All Gemini models failed
[Image Gen] Final fallback to Replicate FLUX.1-schnell
[Image Gen] Calling Replicate FLUX.1-schnell...
[Image Gen] Replicate FLUX fallback successful!
```

**To Test Fallback:**

1. If you have access to modify localStorage:
   - Open DevTools Console
   - Run: `localStorage.setItem('llm_image_model', 'invalid-model')`
   - Try generating - should trigger fallback

---

### Test Case 6: Empty Prompt Handling

**Steps:**

1. Clear the prompt textarea (leave empty)
2. Click "Generate Background"

**Expected Results:**

- [ ] Warning notification appears: "PLEASE ENTER A PROMPT"
- [ ] No API call is made
- [ ] Button does not enter loading state

---

### Test Case 7: Magic Edit Functionality

**Prerequisites:** Have a background image already generated or loaded

**Steps:**

1. Generate or upload a background image first
2. In Magic Edit section, enter: "Add a laptop to the desk"
3. Click "Magic Edit" button

**Expected Results:**

- [ ] Button shows "EDITING..." with spinner
- [ ] Console shows [Image Edit] logs
- [ ] Modified image replaces original
- [ ] Notification confirms success

---

### Test Case 8: Error Handling

**Test Various Error Scenarios:**

1. **No API Key:**
   - Remove Gemini API key from settings
   - Try generating
   - Expected: "MISSING API KEY - CHECK SETTINGS"

2. **Quota Exceeded:**
   - If quota is exceeded
   - Expected: "API QUOTA EXCEEDED"

3. **Safety Filter:**
   - Try prompt that might trigger safety filters
   - Expected: "PROMPT BLOCKED - TRY DIFFERENT WORDING"

---

## Browser Console Test Script

Copy and paste this into the browser console to run automated checks:

```javascript
// NanoBanna Pro - Image Generation Test Script
(function () {
  console.log('========================================');
  console.log('NanoBanna Pro Image Generation Tests');
  console.log('========================================');

  // Check localStorage settings
  console.log('\n--- Current Settings ---');
  console.log('Provider:', localStorage.getItem('llm_provider') || 'gemini (default)');
  console.log(
    'Image Model:',
    localStorage.getItem('llm_image_model') || 'gemini-3-pro-image-preview (default)',
  );
  console.log('Has Gemini Key:', !!localStorage.getItem('gemini_api_key'));
  console.log('Has Replicate Key:', !!localStorage.getItem('replicate_api_key'));
  console.log('Last Fallback:', localStorage.getItem('llm_image_fallback') || 'none');

  // Check for Generate button
  const generateBtn =
    document.querySelector('button:has(.material-icons:contains("draw"))') ||
    Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent.includes('Generate Background') || b.textContent.includes('CREATING'),
    );

  console.log('\n--- UI Elements ---');
  console.log('Generate Button Found:', !!generateBtn);

  // Check resolution buttons
  const resButtons = document.querySelectorAll('button');
  const res1K = Array.from(resButtons).find((b) => b.textContent.trim() === '1K');
  const res2K = Array.from(resButtons).find((b) => b.textContent.trim() === '2K');
  const res4K = Array.from(resButtons).find((b) => b.textContent.trim() === '4K');

  console.log('1K Button Found:', !!res1K);
  console.log('2K Button Found:', !!res2K);
  console.log('4K Button Found:', !!res4K);

  // Check textarea
  const textarea =
    document.querySelector('textarea[placeholder*="vision"]') || document.querySelector('textarea');
  console.log('Prompt Textarea Found:', !!textarea);

  // Monitor console for [Image Gen] messages
  console.log('\n--- Monitoring Console ---');
  console.log('Watch for [Image Gen] messages during generation...');

  // Override console.log to capture [Image Gen] messages
  const originalLog = console.log;
  const imageGenLogs = [];
  console.log = function (...args) {
    if (args.some((a) => typeof a === 'string' && a.includes('[Image Gen]'))) {
      imageGenLogs.push(args.join(' '));
    }
    originalLog.apply(console, args);
  };

  // Function to print captured logs
  window.printImageGenLogs = function () {
    console.log('\n--- Captured [Image Gen] Logs ---');
    imageGenLogs.forEach((log, i) => console.log(`${i + 1}. ${log}`));
    console.log(`Total: ${imageGenLogs.length} messages`);
  };

  console.log('Run printImageGenLogs() after generation to see all [Image Gen] messages');
  console.log('========================================\n');
})();
```

---

## Manual Testing Checklist

### Before Testing

- [ ] Open http://localhost:3002/ in Chrome
- [ ] Open Developer Tools (F12)
- [ ] Go to Console tab
- [ ] Clear console
- [ ] Run the test script above

### During Generation

- [ ] Screenshot the initial state
- [ ] Screenshot the loading state (button says "CREATING...")
- [ ] Screenshot console logs during generation
- [ ] Screenshot the final result

### After Each Test

- [ ] Run `printImageGenLogs()` in console
- [ ] Document any errors
- [ ] Note which model was used (check notification)

---

## Screenshots to Capture

1. **Initial State** - Homepage with Studio tab and empty canvas
2. **Prompt Entry** - Textarea filled with test prompt
3. **Loading State** - Button showing "CREATING..." spinner
4. **Console Logs** - All [Image Gen] messages
5. **Generated Result** - Canvas with generated background
6. **Fallback Notification** - If fallback occurred
7. **Error States** - Any error notifications

---

## Expected Behavior Summary

| Action                  | Expected Behavior                      |
| ----------------------- | -------------------------------------- |
| Empty prompt generation | Warning notification, no API call      |
| Valid prompt generation | Loading state, API call, image appears |
| Resolution change       | Console shows correct size parameter   |
| Model unavailable       | Auto-fallback to next model in chain   |
| API key missing         | Clear error message                    |
| Quota exceeded          | Quota exceeded notification            |
| Safety filter triggered | Prompt blocked notification            |

---

## Fallback Chain Reference

```
1. gemini-3-pro-image-preview (Nano Banana Pro)
   |
   v (if fails)
2. gemini-2.5-flash-image (Nano Banana)
   |
   v (if fails)
3. Replicate FLUX.1-schnell (requires Replicate key)
   |
   v (if fails)
4. Error: "All image generation providers failed"
```

---

## Known Limitations

1. 4K resolution may automatically downgrade to 2K during fallback
2. Replicate fallback requires separate API key
3. Rate limiting may cause temporary failures
4. Some prompts may be blocked by safety filters

---

## Test Results Template

Copy this for each test run:

```
## Test Run: [Date/Time]

### Test Case: [Name]
- **Prompt Used:**
- **Resolution:**
- **Model Used:**
- **Result:** SUCCESS / FAILURE
- **Time to Generate:**
- **Console Logs:**
- **Notes:**
```
