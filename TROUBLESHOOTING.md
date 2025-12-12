# Troubleshooting "FAILED TO FETCH" Errors

## Error: "EXCEPTION TYPEERROR: FAILED TO FETCH SENDING REQUEST"

This error occurs when the browser blocks API requests. Here are the solutions:

---

## Solution 1: Verify API Keys ✅

1. Click the **Settings (⚙️)** button in the app
2. Check that you have valid API keys entered:
   - **Gemini API Key** (required for image generation and chat)
   - **Replicate API Token** (optional, for upscaling/background removal)
   - **OpenRouter API Key** (optional alternative to Gemini)
3. Use the help links in Settings to get API keys:
   - [Get Gemini API Key](https://aistudio.google.com/apikey)
   - [Get Replicate Token](https://replicate.com/account/api-tokens)
   - [Get OpenRouter Key](https://openrouter.ai/keys)
4. Click **Save Settings** and reload the page

---

## Solution 2: CORS Browser Extension (Quick Fix)

Install a CORS browser extension to allow cross-origin requests:

**Chrome/Edge:**
- [Allow CORS: Access-Control-Allow-Origin](https://chrome.google.com/webstore/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf)

**Firefox:**
- [CORS Everywhere](https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/)

⚠️ **Warning:** Only use CORS extensions for development. Disable after testing.

---

## Solution 3: Run with CORS Proxy (Recommended for Development)

Add a proxy to your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/gemini': {
        target: 'https://generativelanguage.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/gemini/, '')
      },
      '/api/replicate': {
        target: 'https://api.replicate.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/replicate/, '')
      }
    }
  }
})
```

Then update API calls to use `/api/gemini` and `/api/replicate` instead of full URLs.

---

## Solution 4: Check Network Issues

1. **Open Browser DevTools** (F12)
2. Go to **Console** tab
3. Look for red errors that say:
   - `blocked by CORS policy`
   - `net::ERR_FAILED`
   - `401 Unauthorized`
   - `403 Forbidden`
4. Check **Network** tab to see which requests are failing

Common causes:
- ❌ Corporate firewall blocking external APIs
- ❌ Antivirus blocking requests
- ❌ Invalid/expired API key
- ❌ No internet connection

---

## Solution 5: Environment Variables (Production)

Instead of entering API keys in Settings, use environment variables:

1. Create `.env.local` file:
```env
VITE_GEMINI_API_KEY=your_gemini_key_here
VITE_REPLICATE_API_KEY=your_replicate_key_here
VITE_OPENROUTER_API_KEY=your_openrouter_key_here
```

2. Restart dev server: `npm run dev`

The app will automatically use these keys if Settings is empty.

---

## Solution 6: Backend Proxy (Production Recommended)

For production deployments, create a backend API proxy:

### Option A: Vercel Serverless Functions

Create `api/gemini.ts`:
```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { endpoint, ...body } = req.body;

  const response = await fetch(`https://generativelanguage.googleapis.com${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  res.json(data);
}
```

### Option B: Express Backend

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/gemini/*', async (req, res) => {
  const response = await fetch(`https://generativelanguage.googleapis.com${req.path.replace('/api/gemini', '')}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`
    },
    body: JSON.stringify(req.body)
  });

  const data = await response.json();
  res.json(data);
});

app.listen(3001, () => console.log('Proxy running on port 3001'));
```

---

## Specific Error Messages

### "Invalid Gemini API key"
- Your API key is wrong or expired
- Get a new key: https://aistudio.google.com/apikey

### "Gemini API key not found"
- You haven't entered an API key in Settings
- Enter your key in Settings → Gemini API Key

### "blocked by CORS policy"
- Browser is blocking cross-origin requests
- Use CORS extension or backend proxy

### "net::ERR_FAILED"
- Network connectivity issue
- Check internet connection
- Check if firewall is blocking requests

---

## Still Having Issues?

1. Open browser DevTools (F12)
2. Check Console tab for detailed error
3. Check Network tab to see which request failed
4. Share the error message for more specific help
