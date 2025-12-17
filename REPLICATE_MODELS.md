# Replicate Models Integration Guide

## Table of Contents
1. [Overview](#overview)
2. [Quick Setup](#quick-setup)
3. [Available Features](#available-features)
4. [Model Catalog](#model-catalog)
5. [Pricing Breakdown](#pricing-breakdown)
6. [Integration Examples](#integration-examples)
7. [Troubleshooting](#troubleshooting)
8. [API Reference](#api-reference)
9. [Advanced Configuration](#advanced-configuration)
10. [Performance Optimization](#performance-optimization)
11. [Related Documentation](#related-documentation)

## Overview

Nanobanna Pro integrates with [Replicate](https://replicate.com) for professional image processing operations. Replicate provides access to state-of-the-art AI models for image enhancement, restoration, and manipulation.

### Key Points

- **Used for:** Image upscaling, background removal, restoration, face enhancement
- **NOT used for:** Primary image generation (OpenRouter is better for this - see below)
- **Free credits:** $5 free when billing added
- **Typical cost:** $0.002-$0.025 per operation
- **Processing time:** 3-15 seconds depending on operation
- **Image formats:** PNG, JPEG, WebP (automatically handled)

### Why Replicate for Enhancement vs OpenRouter for Generation?

**OpenRouter for Image Generation:**
- Nano Banana Pro costs ~$0.02-0.05 per image on OpenRouter
- Same model costs $0.134-$0.24 per image on Replicate (5-12x more expensive)
- OpenRouter has generous free tier
- Better for high-volume generation workflows

**Replicate for Enhancement:**
- Specialized models not available on OpenRouter
- Industry-leading upscaling (Real-ESRGAN, Recraft Clarity)
- Professional restoration and face enhancement
- Worth the cost for final polish and professional output

## Quick Setup

### 1. Create Replicate Account

1. Visit [replicate.com](https://replicate.com)
2. Click "Sign Up" (free account)
3. Verify your email

### 2. Add Billing (Unlock Free Credits)

1. Go to [replicate.com/billing](https://replicate.com/billing)
2. Click "Add Payment Method"
3. Enter card details
4. **Get $5 in free credits** (200-2500 operations)

### 3. Get API Token

1. Visit [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)
2. Click "Create Token"
3. Name it (e.g., "Nanobanna Pro")
4. Copy the token (starts with `r8_`)

### 4. Add to Nanobanna Pro

**Method 1: Settings UI (Recommended)**
1. Open Settings (⚙️ icon in top right)
2. Scroll to "Replicate API (Optional)"
3. Paste your token
4. Click "Save Settings"

**Method 2: Environment Variable**
Add to `.env.local`:
```bash
VITE_REPLICATE_API_KEY=r8_your_token_here
```

**Note:** Settings UI takes precedence over .env.local

### 5. Test It Out

1. Generate or upload a background image in Studio
2. Click "Upscale" button
3. Select "Fast" quality
4. Wait ~5 seconds
5. View before/after comparison slider

## Available Features

### 1. Image Upscaling (3 Quality Tiers)

Upscale images 2x with AI-powered super-resolution.

#### Fast Tier: Real-ESRGAN

**Model:** `nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73ab241b637189a1445ad`

- **Speed:** ~5 seconds
- **Cost:** ~$0.0025 per upscale
- **Best for:** Quick previews, web images, fast iteration
- **Quality Score:** 85/100
- **Output:** 2x resolution (1024x1024 → 2048x2048)

**Usage in app:**
1. Click "Upscale" button in Advanced Tools panel
2. Select "Fast - Real-ESRGAN (~2s, good quality)"
3. Wait for processing
4. View before/after comparison

**When to use:**
- Drafts and previews
- Web-only content
- Quick client mockups
- Testing compositions

**Code example:**
```typescript
import { getReplicateService } from '@/services/replicate';

const service = await getReplicateService();
const upscaledUrl = await service.upscale(imageUrl, 'fast');
console.log('Upscaled image:', upscaledUrl);
```

#### Balanced Tier: Recraft Crisp Upscaler

**Model:** `recraft-ai/recraft-crisp-upscale:31c70d9026bbd25ee2b751825e19101e0321b8814c33863c88fe5d0d63c00c82`

- **Speed:** ~10 seconds
- **Cost:** ~$0.01 per upscale
- **Best for:** Professional results, print quality, marketing materials
- **Quality Score:** 92/100
- **Output:** 2x resolution with enhanced clarity

**Usage in app:**
1. Select "Balanced - Recraft Crisp (recommended)"
2. Wait for processing
3. High-quality result suitable for print

**When to use:**
- Client deliverables
- Print materials (brochures, posters)
- Social media graphics
- Portfolio pieces

#### Best Tier: Magic Image Refiner

**Model:** `fermatresearch/magic-image-refiner:507ddf6f977a7e30e46c0daefd30de7d563c72322f9e4cf7cbac52ef0f667b13`

- **Speed:** ~15 seconds
- **Cost:** ~$0.12 per upscale
- **Best for:** Ultra high-quality, detailed textures, commercial use
- **Quality Score:** 96/100
- **Output:** 2x resolution with maximum detail preservation

**Usage in app:**
1. Select "Best - Magic Refiner (highest quality)"
2. Wait for processing
3. Professional-grade output

**When to use:**
- Final client deliverables
- Commercial photography
- Large format prints
- Award submissions

### 2. Background Removal

Remove backgrounds with precision AI segmentation.

**Model:** `cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003`

- **Speed:** ~3 seconds
- **Cost:** ~$0.002 per operation
- **Output:** Transparent PNG with alpha channel
- **Accuracy:** 95%+ for clear subjects

**Usage:**
1. Click "Remove BG" button in Advanced Tools panel
2. Automatically detects foreground subjects
3. Returns transparent PNG for compositing

**Best results with:**
- Clear subject separation
- Contrasting backgrounds
- Well-lit photos
- Portraits and products

**Common use cases:**
- Profile pictures
- Product photography
- Marketing materials
- Design compositing

**Code example:**
```typescript
const service = await getReplicateService();
const transparentUrl = await service.removeBg(imageUrl);
// Returns data URI with transparent background
```

### 3. Image Restoration

Repair damaged, blurry, or degraded photos using CodeFormer.

**Model:** `sczhou/codeformer:7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56`

- **Speed:** ~10 seconds
- **Cost:** ~$0.01 per operation
- **Best for:** Old photos, compression artifacts, noise reduction
- **Quality Score:** 88/100

**Usage:**
1. Click "Restore" button in Advanced Tools panel
2. Upload degraded or damaged photo
3. Wait for processing
4. Receive restored version

**Fixes:**
- JPEG compression artifacts
- Blur and motion blur
- Noise and grain
- Color fading
- Low resolution

**Use cases:**
- Restoring old family photos
- Recovering low-quality screenshots
- Improving compressed images
- Digital photo restoration

**Code example:**
```typescript
const service = await getReplicateService();
const restoredUrl = await service.restore(degradedImageUrl);
```

### 4. Face Enhancement

AI-powered facial detail enhancement using GFPGAN.

**Model:** `tencentarc/gfpgan:9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3`

- **Speed:** ~8 seconds
- **Cost:** ~$0.008 per operation
- **Best for:** Profile pictures, headshots, portrait photography
- **Quality Score:** 90/100

**Usage:**
1. Click "Face Enhance" button in Advanced Tools panel
2. Upload portrait photo
3. Wait for processing
4. Receive enhanced portrait

**Improvements:**
- Sharper facial features
- Smoother skin texture
- Enhanced eye detail
- Better color balance
- Reduced blur

**Best for:**
- LinkedIn profile pictures
- Professional headshots
- Dating profiles
- Social media avatars
- Marketing portraits

**Code example:**
```typescript
const service = await getReplicateService();
const enhancedUrl = await service.faceEnhance(portraitUrl);
```

## Model Catalog

### Image Generation Models (Reference Only)

**Note:** We recommend using OpenRouter for image generation (better pricing, same quality).

#### Nano Banana Pro

**Model:** `google/nano-banana-pro`

- **Replicate Cost:** $0.134 per 2K, $0.24 per 4K
- **OpenRouter Cost:** Free tier, then ~$0.02-0.05 per image
- **Recommendation:** ✅ Use via OpenRouter (configured in Settings > Image Model)
- **Capabilities:** 4K generation, 14 reference images, text rendering
- **Popularity:** 4.7M runs on Replicate
- **Speed:** ~15 seconds per image

**Why use OpenRouter instead:**
- 5-12x cheaper per image
- Same underlying model (Google Gemini 3 Pro Image)
- Better for high-volume workflows
- Generous free tier

**When to use Replicate:**
- OpenRouter quota exceeded
- Need Replicate-specific features
- Testing/comparison purposes

#### FLUX Models

##### FLUX 2 Pro

**Model:** `black-forest-labs/flux-2-pro`

- **Cost:** ~$0.10 per image
- **Speed:** ~15 seconds
- **Features:** 8 reference images, consistent characters, style transfer
- **Popularity:** 453K runs
- **Resolution:** Up to 2048x2048

**Strengths:**
- Excellent prompt adherence
- Character consistency
- Professional quality
- Style transfer

##### FLUX 1.1 Pro

**Model:** `black-forest-labs/flux-1.1-pro`

- **Cost:** ~$0.05 per image
- **Speed:** ~8 seconds
- **Features:** Fast, high-quality generation
- **Popularity:** 65.2M runs (most popular)
- **Resolution:** Up to 2048x2048

**Strengths:**
- Best speed/quality balance
- Industry standard
- Proven reliability

##### FLUX 1 Dev

**Model:** `black-forest-labs/flux-1-dev`

- **Cost:** ~$0.02 per image
- **Speed:** ~6 seconds
- **Features:** Development model, good quality
- **Popularity:** 25M runs
- **Resolution:** Up to 1536x1536

**Strengths:**
- Budget-friendly
- Fast generation
- Good for testing

#### Imagen Models

##### Imagen 4

**Model:** `google/imagen-4`

- **Cost:** ~$0.08 per image
- **Speed:** ~10 seconds
- **Popularity:** 6.5M runs
- **Resolution:** Up to 2048x2048
- **Strengths:** Google's flagship, excellent realism

##### Imagen 4 Fast

**Model:** `google/imagen-4-fast`

- **Cost:** ~$0.02 per image
- **Speed:** ~4 seconds
- **Popularity:** 2.7M runs
- **Resolution:** Up to 1536x1536
- **Strengths:** Speed-optimized version

### Advanced Upscaling Models (Reference)

#### Crystal Upscaler

**Model:** `philz1337x/crystal-upscaler`

- **Optimized for:** Portraits, faces, products
- **Popularity:** 258.6K runs
- **Specialty:** Preserves skin texture, facial features

#### Topaz Labs Image Upscale

**Model:** `topazlabs/image-upscale`

- **Professional-grade:** Commercial upscaling
- **Popularity:** 1.1M runs
- **Specialty:** Maximum detail preservation

### Other Processing Models

#### SwinIR

**Model:** `jingyunliang/swinir`

- **Purpose:** Image restoration using Swin Transformer
- **Popularity:** 6.2M runs
- **Specialty:** Advanced restoration techniques

#### NAFNet

**Model:** `megvii-research/nafnet`

- **Purpose:** Nonlinear activation free image restoration
- **Popularity:** 1.4M runs
- **Specialty:** Noise reduction, deblurring

## Pricing Breakdown

### Cost by Operation

| Feature | Model | Input Size | Avg Cost | Speed |
|---------|-------|------------|----------|-------|
| Upscale (Fast) | Real-ESRGAN | 1024x1024 | $0.0025 | 5s |
| Upscale (Balanced) | Recraft Crisp | 1024x1024 | $0.01 | 10s |
| Upscale (Best) | Magic Refiner | 1024x1024 | $0.12 | 15s |
| Remove BG | rembg | Any size | $0.002 | 3s |
| Restore | CodeFormer | Any size | $0.01 | 10s |
| Face Enhance | GFPGAN | Any size | $0.008 | 8s |

### Monthly Cost Estimates

**Light Usage (10 operations/month):**
- Mix of features: ~$0.20/month
- Mostly fast upscaling: ~$0.03/month
- Mostly BG removal: ~$0.02/month

**Moderate Usage (50 operations/month):**
- Mix of features: ~$1.00/month
- Mostly fast upscaling: ~$0.13/month
- Mostly BG removal: ~$0.10/month

**Heavy Usage (200 operations/month):**
- Mix of features: ~$4.00/month
- Mostly fast upscaling: ~$0.50/month
- Mostly BG removal: ~$0.40/month

### Free Credits Breakdown

**$5 free credits = approximately:**
- 2,000 fast upscales
- 500 balanced upscales
- 41 best quality upscales
- 2,500 background removals
- 500 restorations
- 625 face enhancements

### Cost Optimization Tips

1. **Use appropriate quality tier:**
   - Fast for drafts and previews
   - Balanced for final designs
   - Best only when highest quality needed

2. **Batch operations:**
   - Process multiple images at once
   - Avoid re-processing same image

3. **Monitor spending:**
   - Check Replicate dashboard monthly
   - Set budget alerts in billing settings

4. **Use OpenRouter for generation:**
   - Much cheaper than Replicate for image creation
   - Save Replicate credits for enhancement

## Integration Examples

### Basic Usage (Studio UI)

1. **Generate or upload background image**
2. **Click any Replicate feature button** (Upscale, Remove BG, etc.)
3. **Select quality tier** if applicable
4. **Wait for processing** (progress bar shows status)
5. **Use before/after slider** to compare
6. **Apply to canvas**

### Voice Agent Integration

Say: **"Upscale the current image to best quality"**

ActionExecutor automatically:
1. Checks for Replicate API key
2. Calls appropriate Replicate service
3. Shows preview for approval
4. Applies to canvas when approved

### Programmatic Access

#### Upscale Image

```typescript
import { getReplicateService } from '@/services/replicate';

// Get service instance (fetches API key automatically)
const service = await getReplicateService();

// Upscale with quality selection
const result = await service.upscale(
  'https://example.com/image.jpg',
  'balanced' // 'fast' | 'balanced' | 'best'
);

console.log('Upscaled image:', result);
// Returns data URL of upscaled image
```

#### Remove Background

```typescript
const service = await getReplicateService();
const result = await service.removeBg('https://example.com/image.jpg');
// Returns transparent PNG data URL
console.log('Transparent image:', result);
```

#### Restore Image

```typescript
const service = await getReplicateService();
const result = await service.restore('https://example.com/old-photo.jpg');
console.log('Restored image:', result);
```

#### Face Enhancement

```typescript
const service = await getReplicateService();
const result = await service.faceEnhance('https://example.com/portrait.jpg');
console.log('Enhanced portrait:', result);
```

### With Progress Tracking

```typescript
const handleProgress = (percent: number) => {
  console.log(`Progress: ${percent}%`);
  // Update UI progress bar
};

const service = await getReplicateService(handleProgress);
const result = await service.upscale(imageUrl, 'best');

// Progress updates: 10% → 50% → 100%
```

### Error Handling

```typescript
try {
  const service = await getReplicateService();
  const result = await service.upscale(imageUrl, 'best');
  console.log('Success:', result);
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('API key')) {
      // Show API key setup modal
      showAPIKeyModal();
    } else if (error.message.includes('quota')) {
      // Show billing prompt
      showBillingPrompt();
    } else {
      // Generic error handling
      console.error('Operation failed:', error.message);
    }
  }
}
```

## Troubleshooting

### "Replicate API key not found"

**Cause:** No API key configured

**Solutions:**
1. Open Settings (⚙️ icon top right)
2. Scroll to "Replicate API (Optional)"
3. Paste your API token (starts with `r8_`)
4. Click "Save Settings"
5. Retry the operation

**Alternative:** Add to `.env.local`:
```bash
VITE_REPLICATE_API_KEY=r8_your_token_here
```

### "Prediction timeout after 5 minutes"

**Causes:**
- Very large image (>4K resolution)
- Replicate service experiencing high load
- Network connectivity issues

**Solutions:**
1. **Try with smaller image** (<2K resolution)
2. **Select faster quality tier** (Fast instead of Best)
3. **Wait a few minutes and retry**
4. **Check Replicate status:** [status.replicate.com](https://status.replicate.com)

### "Quota exceeded" or "Payment required"

**Cause:** Free credits exhausted or no billing added

**Solutions:**
1. Visit [replicate.com/billing](https://replicate.com/billing)
2. Add payment method (unlocks $5 free credits)
3. Monitor usage in Replicate dashboard
4. Consider batching operations to optimize costs

### "Model version not found"

**Cause:** Model version hash outdated (rare)

**Solutions:**
1. Check for app updates
2. Report issue on GitHub
3. Temporary: Try different quality tier

### Operation succeeds but no output visible

**Causes:**
- CORS issues (dev mode only)
- Image hosting URL expired
- Canvas not refreshing

**Solutions:**
1. Refresh the page
2. Try exporting and re-importing the canvas
3. Check browser console for errors (F12)

### Buttons are disabled

**Causes:**
- No background image loaded
- Operation already in progress
- API key validation pending

**Solutions:**
1. Generate or upload a background image first
2. Wait for current operation to complete
3. Check Settings modal saved successfully

### Modal shows every time I click a feature

**Cause:** API key not saving to database

**Solutions:**
1. Ensure you're signed in (authentication required)
2. Check browser console for database errors
3. Verify Supabase connection in Settings

## API Reference

### ReplicateService Class

#### Constructor

```typescript
new ReplicateService(
  apiKey: string,
  onProgress?: (percent: number) => void
)
```

**Parameters:**
- `apiKey`: Your Replicate API token (starts with `r8_`)
- `onProgress`: Optional callback for progress updates (0-100)

**Example:**
```typescript
const service = new ReplicateService('r8_abc123', (progress) => {
  console.log(`${progress}% complete`);
});
```

#### Methods

##### upscale()

```typescript
async upscale(
  imageUrl: string,
  quality: 'fast' | 'balanced' | 'best'
): Promise<string>
```

**Parameters:**
- `imageUrl`: URL or data URI of image to upscale
- `quality`: Quality tier (affects model selection and cost)

**Returns:** Data URL of upscaled image (2x original resolution)

**Throws:** Error if operation fails

**Example:**
```typescript
const upscaled = await service.upscale(
  'data:image/png;base64,...',
  'balanced'
);
```

---

##### removeBg()

```typescript
async removeBg(imageUrl: string): Promise<string>
```

**Parameters:**
- `imageUrl`: URL or data URI of image

**Returns:** Data URL of image with transparent background (PNG format)

**Throws:** Error if operation fails

**Example:**
```typescript
const transparent = await service.removeBg('https://example.com/photo.jpg');
```

---

##### restore()

```typescript
async restore(imageUrl: string): Promise<string>
```

**Parameters:**
- `imageUrl`: URL or data URI of degraded image

**Returns:** Data URL of restored image

**Throws:** Error if operation fails

**Example:**
```typescript
const restored = await service.restore('https://example.com/old-photo.jpg');
```

---

##### faceEnhance()

```typescript
async faceEnhance(imageUrl: string): Promise<string>
```

**Parameters:**
- `imageUrl`: URL or data URI of portrait image

**Returns:** Data URL of enhanced portrait

**Throws:** Error if operation fails

**Example:**
```typescript
const enhanced = await service.faceEnhance('data:image/jpeg;base64,...');
```

---

##### inpaint()

```typescript
async inpaint(
  imageUrl: string,
  prompt: string,
  maskUrl?: string,
  model?: 'flux' | 'ideogram'
): Promise<string>
```

**Parameters:**
- `imageUrl`: Base image to edit
- `prompt`: What to paint/change
- `maskUrl`: Optional mask image (white = edit area, black = preserve)
- `model`: Inpainting model to use (default: 'flux')

**Returns:** Data URL of edited image

**Throws:** Error if operation fails

**Example:**
```typescript
const edited = await service.inpaint(
  'https://example.com/image.jpg',
  'Add a mountain in the background',
  'https://example.com/mask.png',
  'flux'
);
```

---

##### cancelPrediction()

```typescript
async cancelPrediction(predictionId: string): Promise<void>
```

**Parameters:**
- `predictionId`: ID from startPrediction() (advanced usage)

**Returns:** Nothing (void)

**Example:**
```typescript
await service.cancelPrediction('abc123-prediction-id');
```

### Helper Functions

#### getReplicateService()

```typescript
async function getReplicateService(
  onProgress?: (percent: number) => void
): Promise<ReplicateService>
```

**Purpose:** Fetches API key from storage and creates service instance

**Parameters:**
- `onProgress`: Optional progress callback

**Returns:** Configured ReplicateService instance

**Throws:** Error if API key not found

**Usage:**
```typescript
// Simple usage
const service = await getReplicateService();

// With progress tracking
const service = await getReplicateService((progress) => {
  updateProgressBar(progress);
});
```

## Advanced Configuration

### Custom Model Versions

To use a specific model version, update `src/constants.ts`:

```typescript
export const MODELS = {
  replicate: {
    upscale: {
      fast: 'owner/model:version_hash',
      balanced: 'owner/model:different_version_hash',
      best: 'owner/model:another_version_hash',
    },
  },
};
```

**Note:** Model version hashes are 64-character SHA-256 hashes.

### Timeout Configuration

Polling timeout set in `src/services/replicate.ts`:

```typescript
const maxAttempts = 300; // 5 minutes (1s interval)
```

**To change:**
1. Edit `pollPrediction()` method in `replicate.ts`
2. Adjust `maxAttempts` variable
3. Consider API rate limits when reducing interval

### Development Proxy

Vite proxy handles CORS in dev mode (`vite.config.ts`):

```typescript
server: {
  proxy: {
    '/api/replicate': {
      target: 'https://api.replicate.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/replicate/, ''),
      configure: (proxy) => {
        proxy.on('proxyReq', (proxyReq, req) => {
          const token = req.headers['x-replicate-token'];
          if (token) {
            proxyReq.setHeader('Authorization', `Token ${token}`);
            proxyReq.removeHeader('x-replicate-token');
          }
        });
      },
    },
  },
},
```

**How it works:**
- Dev requests go to `/api/replicate/*`
- Proxy converts `x-replicate-token` header to `Authorization: Token`
- Bypasses CORS restrictions in development

## Performance Optimization

### Image Size Guidelines

**Upscaling:**
- Max recommended: 2048x2048 input for fast results
- Above 4K: May timeout or take very long
- Optimal: 1024x1024 to 2048x2048

**Background Removal:**
- Any size supported
- Recommended: <1080p for speed
- Large images (>4K): May take 10+ seconds

**Restoration:**
- Works best on degraded images <1080p
- Larger images: More processing time
- Optimal: 720p to 1080p

**Face Enhancement:**
- Best on faces >256px for visible improvement
- Too small (<128px): Limited improvement
- Optimal: 512x512 to 1024x1024 face size

### Caching Strategy

- Results are stored in Supabase Storage automatically
- Canvas saves include processed images
- No need to re-process same image twice
- Manual cache: Save favorite results to Gallery

### Batching Operations

For multiple images:

```typescript
const images = ['url1', 'url2', 'url3'];

// Process in parallel (respects rate limits)
const results = await Promise.all(
  images.map(url => service.upscale(url, 'fast'))
);

console.log('All images upscaled:', results);
```

**Note:** Replicate handles rate limiting automatically. Recommended max: 10 concurrent operations.

## Security Best Practices

1. **Never commit API keys** to git
   - Use `.env.local` for local development
   - Add `.env.local` to `.gitignore`

2. **Store in Supabase** for production
   - Encrypted per-user storage
   - Row Level Security (RLS) policies

3. **Rotate keys** if accidentally exposed
   - Generate new token at replicate.com/account/api-tokens
   - Update in Settings immediately

4. **Monitor usage** in Replicate dashboard
   - Check for unexpected activity
   - Review billing regularly

5. **Set spending limits** in billing settings
   - Prevent runaway costs
   - Get alerts before exceeding budget

## Related Documentation

- [Supabase Setup Guide](./SUPABASE_SETUP.md) - Database and authentication setup
- [OpenRouter Integration](./OPENROUTER_SETUP.md) - Image generation configuration
- [Settings Guide](./SETUP_GUIDE.md) - Complete settings documentation
- [Voice Agent Commands](./VOICE_COMMANDS.md) - Voice-activated features
- [Canvas Editor Guide](./CANVAS_GUIDE.md) - Using the canvas editor

## External Resources

- [Replicate Documentation](https://replicate.com/docs) - Official API docs
- [Replicate API Reference](https://replicate.com/docs/reference/http) - HTTP API reference
- [Model Explorer](https://replicate.com/explore) - Browse all models
- [Pricing Calculator](https://replicate.com/pricing) - Estimate costs
- [Status Page](https://status.replicate.com) - Service status

## Support

- **App Issues:** [GitHub Issues](https://github.com/yourusername/nanobanna-pro/issues)
- **Replicate API:** support@replicate.com
- **Community:** [Discord Server](#) (coming soon)

---

**Last Updated:** December 2025
**App Version:** 2.0
**Replicate API Version:** v1
**Document Version:** 1.0
