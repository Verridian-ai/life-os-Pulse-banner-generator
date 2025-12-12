# Replicate API Key Setup

## The Issue
Your Replicate API key was missing or incorrect. The upscale, background removal, and magic refiner features require a valid Replicate API key to work.

## How to Get a Replicate API Key

1. **Sign up for Replicate**
   - Go to https://replicate.com/
   - Click "Sign up" or "Sign in"
   - Create an account (it's free to start)

2. **Get Your API Token**
   - Once logged in, go to https://replicate.com/account/api-tokens
   - Click "Create token" or copy your existing token
   - Your token will look like: `r8_xxxxxxxxxxxxxxxxxxxxx`

3. **Add the Key to Your App**
   - Open the app in your browser at http://localhost:5173
   - Click the Settings icon (gear icon in the top right)
   - Find the "Replicate API Key" field
   - Paste your API key
   - Click "Save"

   **OR**

   - Add it to `.env.local` file:
   ```
   VITE_REPLICATE_API_KEY=r8_your_actual_key_here
   ```
   - Restart the dev server

## Features That Need Replicate API Key

- **Upscale Image** - Enhance image resolution (2x, 4x)
- **Remove Background** - Remove image backgrounds
- **Magic Refiner** (Best, Balanced, Fast) - Enhance image quality

## Pricing

Replicate uses a pay-per-use model:
- You get some free credits to start
- After that, you pay only for what you use
- Most operations cost a few cents
- Check pricing at https://replicate.com/pricing

## Note

The keys were mixed up in your configuration. I've fixed the OpenRouter key, but you'll need to add a valid Replicate key for image processing features to work.
