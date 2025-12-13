# 📚 Nanobanna Pro - Complete Wiki

> Comprehensive setup, deployment, and development guide for Nanobanna Pro

**Repository:** https://github.com/Verridian-ai/life-os-Pulse-banner-generator

---

## Table of Contents

1. [Introduction](#introduction)
2. [Architecture Overview](#architecture-overview)
3. [Prerequisites](#prerequisites)
4. [Local Development Setup](#local-development-setup)
5. [Supabase Setup](#supabase-setup)
6. [Environment Configuration](#environment-configuration)
7. [Deployment to Vercel](#deployment-to-vercel)
8. [Deployment Modes](#deployment-modes)
9. [API Keys & Configuration](#api-keys--configuration)
10. [Troubleshooting](#troubleshooting)
11. [Development Guide](#development-guide)
12. [Contributing](#contributing)

---

## Introduction

Nanobanna Pro is an AI-powered LinkedIn banner designer built for the **Careersy Community**. It leverages multiple cutting-edge AI models (Gemini 3 Pro Image, OpenRouter, Replicate) to provide professional-grade design capabilities with voice control.

### Key Features

- 🎨 **4K Image Generation** with Gemini 3 Pro Image
- 🤖 **Multi-LLM Support** (10+ models via OpenRouter)
- 🖼️ **Professional Image Processing** (upscaling, background removal, restoration)
- 🎙️ **Voice-Powered Design** with Gemini Live Audio
- 📊 **Brand Consistency Engine** with AI extraction
- 🔗 **Multi-Step Workflows** with tool chaining

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                  Nanobanna Pro Frontend                 │
│  ┌───────────┐  ┌───────────┐  ┌──────────────────┐   │
│  │  Canvas   │  │ AI Studio │  │  User Dashboard  │   │
│  │  Editor   │  │  Sidebar  │  │  & Analytics     │   │
│  └───────────┘  └───────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────┘
                        │
    ┌───────────────────┼───────────────────┐
    │                   │                   │
┌───▼────┐      ┌───────▼───────┐   ┌──────▼──────┐
│ Auth   │      │   Database    │   │   Storage   │
│        │      │  (PostgreSQL) │   │  (S3-like)  │
└────────┘      └───────────────┘   └─────────────┘
    │                   │                   │
    └───────────────────┼───────────────────┘
                        │
    ┌───────────────────┼───────────────────┐
    │                   │                   │
┌───▼──────┐    ┌───────▼──────┐    ┌──────▼──────┐
│ Gemini   │    │  OpenRouter  │    │  Replicate  │
│ 3 Pro    │    │  (10+ LLMs)  │    │  (Image     │
│ Image    │    │              │    │  Processing)│
└──────────┘    └──────────────┘    └─────────────┘
```

### Technology Stack

**Frontend:**

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Fabric.js (Canvas)

**Backend:**

- Supabase (Auth, DB, Storage)
- PostgreSQL
- Row Level Security (RLS)

**AI Services:**

- Google Gemini (Image gen, voice)
- OpenRouter (Multi-model access)
- Replicate (Image processing)

**Deployment:**

- Vercel (Hosting)
- GitHub Actions (CI/CD)

---

## Prerequisites

### Required

- **Node.js** 18+ (LTS recommended)
- **npm** or **pnpm** or **yarn**
- **Git**
- **Supabase Account** (free tier works)

### For Pilot Mode (Pre-configured API Keys)

- **Gemini API Key** - [Get here](https://aistudio.google.com/app/apikey)
- **OpenRouter API Key** - [Get here](https://openrouter.ai/keys)
- **Replicate API Key** - [Get here](https://replicate.com/account/api-tokens)

### For Development

- **Code Editor** (VS Code recommended)
- **Supabase CLI** (optional but helpful)

---

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Verridian-ai/life-os-Pulse-banner-generator.git
cd life-os-Pulse-banner-generator
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local with your values
nano .env.local
```

Minimum required for local development:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GEMINI_API_KEY=your-gemini-key
```

### 4. Start Development Server

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

---

## Supabase Setup

### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Click **"New Project"**
3. Fill in:
   - **Name:** `nanobanna-pro`
   - **Database Password:** (generate strong password)
   - **Region:** Choose closest to your users
4. Click **"Create new project"**
5. Wait ~2 minutes for provisioning

### Step 2: Get API Credentials

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://xxx.supabase.co`)
   - **anon public** key

Add to `.env.local`:

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### Step 3: Run Database Schema

1. Go to **SQL Editor** in Supabase dashboard
2. Click **"New query"**
3. Open `supabase/schema.sql` from the project
4. Copy the **entire contents**
5. Paste into SQL Editor
6. Click **"Run"**

**Verify Success:**

```sql
-- Run this query to check tables were created
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

You should see:

- users
- designs
- brand_profiles
- usage_metrics
- reference_images
- user_preferences

### Step 4: Configure Authentication

#### Email/Password (Already Enabled)

1. Go to **Authentication** → **Providers**
2. **Email** should be enabled by default

#### Google OAuth (Optional but Recommended)

1. Go to **Authentication** → **Providers** → **Google**
2. Click **"Enable"**
3. Get OAuth credentials:

   **Google Cloud Console:**
   - Go to https://console.cloud.google.com/apis/credentials
   - Create project (if needed)
   - Click **"Create Credentials"** → **"OAuth 2.0 Client ID"**
   - Application type: **Web application**
   - **Authorized redirect URIs:** Copy from Supabase UI
   - Copy **Client ID** and **Client Secret**

4. Paste into Supabase Google provider settings
5. Click **"Save"**

#### GitHub OAuth (Optional)

1. Go to **Authentication** → **Providers** → **GitHub**
2. Click **"Enable"**
3. Get OAuth credentials:

   **GitHub Settings:**
   - Go to https://github.com/settings/developers
   - Click **"New OAuth App"**
   - **Application name:** Nanobanna Pro
   - **Homepage URL:** Your app URL
   - **Authorization callback URL:** Copy from Supabase UI
   - Copy **Client ID** and **Client Secret**

4. Paste into Supabase GitHub provider settings
5. Click **"Save"**

### Step 5: Configure Storage Buckets

Storage buckets should be auto-created by the schema, but verify:

1. Go to **Storage** in Supabase dashboard
2. You should see 4 buckets:
   - `designs` (public)
   - `references` (public)
   - `avatars` (public)
   - `logos` (public)

If missing, create manually:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('designs', 'designs', true),
  ('references', 'references', true),
  ('avatars', 'avatars', true),
  ('logos', 'logos', true);
```

### Step 6: Test Authentication

1. Start your dev server: `npm run dev`
2. Open http://localhost:5173
3. Click **"Sign Up"**
4. Create test account
5. Check **Authentication** → **Users** in Supabase
6. Verify user appears in database:
   ```sql
   SELECT * FROM public.users;
   ```

---

## Environment Configuration

### Full .env.local Configuration

```env
# ============================================================================
# SUPABASE (REQUIRED)
# ============================================================================
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...

# ============================================================================
# AI API KEYS
# ============================================================================
# Mode 1 (User): Leave empty, users enter their own keys
# Mode 2 (Pilot): Fill in for shared usage

# Gemini API Key - https://aistudio.google.com/app/apikey
VITE_GEMINI_API_KEY=AIzaSy...

# OpenRouter API Key - https://openrouter.ai/keys
VITE_OPENROUTER_API_KEY=sk-or-v1-...

# Replicate API Key - https://replicate.com/account/api-tokens
VITE_REPLICATE_API_KEY=r8_...

# ============================================================================
# APPLICATION SETTINGS
# ============================================================================
VITE_APP_NAME=Nanobanna Pro
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development

# Feature Flags
VITE_ENABLE_VOICE_AGENT=true
VITE_ENABLE_PUBLIC_GALLERY=true
VITE_ENABLE_ANALYTICS=false

# ============================================================================
# PILOT MODE SETTINGS (for Careersy Community)
# ============================================================================
# Set to true to enable shared API keys
VITE_PILOT_MODE=true

# Usage Limits (per user)
VITE_PILOT_MAX_DESIGNS=50
VITE_PILOT_MAX_GENERATIONS_PER_DAY=20
VITE_PILOT_MAX_STORAGE_MB=100
```

### Getting AI API Keys

#### Gemini API Key (Google)

1. Go to https://aistudio.google.com/app/apikey
2. Click **"Create API Key"**
3. Select existing GCP project or create new
4. Copy the key
5. **Free tier:** 60 requests/minute

#### OpenRouter API Key

1. Go to https://openrouter.ai/keys
2. Sign in with Google/GitHub
3. Click **"Create Key"**
4. Name it "Nanobanna Pro"
5. Copy the key
6. **Free tier:** Available for some models

#### Replicate API Key

1. Go to https://replicate.com/account/api-tokens
2. Sign in
3. Click **"Create token"**
4. Name it "Nanobanna Pro"
5. Copy the token
6. **Pricing:** Pay per prediction

---

## Deployment to Vercel

### Step 1: Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add remote (use your repo URL)
git remote add origin https://github.com/Verridian-ai/life-os-Pulse-banner-generator.git

# Push to GitHub
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to https://vercel.com
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select `life-os-Pulse-banner-generator`
5. Click **"Import"**

### Step 3: Configure Environment Variables

In Vercel project settings:

1. Click **"Settings"** → **"Environment Variables"**
2. Add each variable:

**Required:**

```
VITE_SUPABASE_URL = https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGci...
```

**For Pilot Mode:**

```
VITE_GEMINI_API_KEY = AIzaSy...
VITE_OPENROUTER_API_KEY = sk-or-v1-...
VITE_REPLICATE_API_KEY = r8_...
VITE_PILOT_MODE = true
```

3. Click **"Save"**

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait ~2 minutes for build
3. Deployment URL: `https://your-project.vercel.app`

### Step 5: Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain (e.g., `nanobanna.careersy.com`)
4. Follow DNS configuration instructions
5. Wait for DNS propagation (~5-60 minutes)

### Step 6: Update Supabase Redirect URLs

1. Go to Supabase **Authentication** → **URL Configuration**
2. Add your Vercel URL to **Site URL**:
   ```
   https://your-project.vercel.app
   ```
3. Add to **Redirect URLs**:
   ```
   https://your-project.vercel.app/**
   ```

---

## Deployment Modes

### Mode 1: User-Hosted (Self-Service)

**Use Case:** Public release where users provide their own API keys

**Configuration:**

```env
# .env.local (or Vercel env vars)
VITE_PILOT_MODE=false
# Leave AI keys empty
VITE_GEMINI_API_KEY=
VITE_OPENROUTER_API_KEY=
VITE_REPLICATE_API_KEY=
```

**User Experience:**

1. User signs up
2. Goes to Settings
3. Enters their own API keys
4. Keys stored in `user_preferences` table (encrypted)
5. User pays for their own AI usage

**Pros:**

- ✅ Scalable - no shared quota limits
- ✅ Users control their own costs
- ✅ No admin API key management

**Cons:**

- ❌ Friction - users need to get API keys
- ❌ Technical barrier for non-developers

---

### Mode 2: Pilot Hosted (Careersy Community)

**Use Case:** Private pilot for Careersy community with pre-configured API keys

**Configuration:**

```env
# Vercel Environment Variables
VITE_PILOT_MODE=true
VITE_GEMINI_API_KEY=your-shared-key
VITE_OPENROUTER_API_KEY=your-shared-key
VITE_REPLICATE_API_KEY=your-shared-key
VITE_PILOT_MAX_DESIGNS=50
VITE_PILOT_MAX_GENERATIONS_PER_DAY=20
```

**User Experience:**

1. User signs up (invite-only)
2. Instant access - no API key setup
3. Shared API quota across all pilot users
4. Usage limits enforced per user
5. Admin pays for all AI usage

**Pros:**

- ✅ Zero friction - works immediately
- ✅ Perfect for non-technical users
- ✅ Controlled pilot environment

**Cons:**

- ❌ Shared quota can be exhausted
- ❌ Admin bears all costs
- ❌ Need usage monitoring

**Recommended for:** Careersy Community pilot phase

---

## API Keys & Configuration

### Gemini API (Google)

**Models Available:**

- `gemini-2.5-flash` - Fast text/vision
- `gemini-3-pro-image-preview` - 4K image generation
- `gemini-2.5-flash-native-audio-preview` - Voice agent

**Pricing:**

- Free tier: 60 RPM, 1500 RPD
- Imagen 3: $0.04 per image (1K)
- Gemini 3 Pro Image: $0.24 per image (4K)

**Rate Limits:**

- Free: 60 requests/min
- Paid: 1000 requests/min

**Get Key:**
https://aistudio.google.com/app/apikey

---

### OpenRouter API

**Models Available:**

- GLM 4.6 Plus - Top reasoning
- MiniMax M2 Plus - Coding/agentic
- GPT-5.1 - Latest OpenAI
- Claude 3.7 Sonnet - Anthropic
- 100+ more models

**Pricing:**

- Varies by model
- GLM 4.6: ~$0.001/1K tokens
- GPT-5.1: ~$0.01/1K tokens

**Get Key:**
https://openrouter.ai/keys

---

### Replicate API

**Models Used:**

- Real-ESRGAN - Fast upscaling
- Recraft Crisp - Professional upscaling
- Magic Refiner - Best quality upscaling
- Remove BG - Background removal
- CodeFormer - Face restoration

**Pricing:**

- Pay per prediction
- Upscaling: ~$0.002-$0.02 per image
- Background removal: ~$0.001 per image

**Get Key:**
https://replicate.com/account/api-tokens

---

## Troubleshooting

### Issue: "Not authenticated" error

**Solution:**

1. Check Supabase connection:
   ```javascript
   console.log(await supabase.auth.getSession());
   ```
2. Verify environment variables are set
3. Clear browser localStorage
4. Re-login

---

### Issue: Image generation fails

**Solution:**

1. Check API key is valid:
   ```bash
   curl -H "Authorization: Bearer YOUR_KEY" \
     https://generativelanguage.googleapis.com/v1/models
   ```
2. Check rate limits not exceeded
3. Verify model ID is correct
4. Check browser console for errors

---

### Issue: Storage upload fails

**Solution:**

1. Check storage bucket exists in Supabase
2. Verify RLS policies allow upload:
   ```sql
   SELECT * FROM storage.buckets WHERE id = 'designs';
   ```
3. Check file size limits (default 50MB)
4. Verify user is authenticated

---

### Issue: Build fails on Vercel

**Solution:**

1. Check all dependencies in `package.json`
2. Verify TypeScript has no errors:
   ```bash
   npm run type-check
   ```
3. Check build command in `vercel.json`
4. Review build logs in Vercel dashboard

---

### Issue: CORS errors

**Solution:**

1. Add allowed origins in Supabase:
   - Go to **Settings** → **API**
   - Add Vercel URL to allowed origins
2. Update redirect URLs in Auth settings

---

## Development Guide

### Project Structure

```
nanobanna-pro/
├── src/
│   ├── components/
│   │   ├── features/          # Feature components
│   │   │   ├── ImageToolsPanel.tsx
│   │   │   ├── ModelSelector.tsx
│   │   │   ├── BrandConsistencyPanel.tsx
│   │   │   └── ...
│   │   ├── ui/                # Reusable UI components
│   │   └── canvas/            # Canvas-related components
│   ├── context/               # React Context providers
│   │   ├── AuthContext.tsx
│   │   ├── AIContext.tsx
│   │   └── CanvasContext.tsx
│   ├── services/              # API & business logic
│   │   ├── auth.ts
│   │   ├── database.ts
│   │   ├── storage.ts
│   │   ├── llm.ts
│   │   ├── replicate.ts
│   │   └── ...
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript definitions
│   ├── utils/                 # Utility functions
│   └── styles/                # Global styles
├── supabase/
│   └── schema.sql             # Database schema
├── public/                    # Static assets
└── .github/
    └── workflows/             # CI/CD pipelines
```

### Adding a New Feature

1. **Define Types**

   ```typescript
   // src/types/feature.ts
   export interface MyFeature {
     id: string;
     name: string;
   }
   ```

2. **Create Service**

   ```typescript
   // src/services/myFeature.ts
   export const createFeature = async (data: MyFeature) => {
     // Implementation
   };
   ```

3. **Build Component**

   ```typescript
   // src/components/features/MyFeature.tsx
   export const MyFeature: React.FC = () => {
     // Component logic
   };
   ```

4. **Add to Context** (if needed)

   ```typescript
   // src/context/FeatureContext.tsx
   export const FeatureProvider: React.FC = ({ children }) => {
     // Context logic
   };
   ```

5. **Update Documentation**
   - Add to README.md
   - Update WIKI.md

---

## Contributing

### Setup for Contributors

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/life-os-Pulse-banner-generator.git
   ```
3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/Verridian-ai/life-os-Pulse-banner-generator.git
   ```
4. Create feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```

### Development Workflow

1. Pull latest from upstream:
   ```bash
   git pull upstream main
   ```
2. Make changes
3. Run tests:
   ```bash
   npm run lint
   npm run type-check
   ```
4. Commit with conventional commits:
   ```bash
   git commit -m "feat: add amazing feature"
   ```
5. Push to your fork:
   ```bash
   git push origin feature/amazing-feature
   ```
6. Open Pull Request

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

**Example:**

```
feat(canvas): add multi-select for elements

- Implement Ctrl+Click multi-selection
- Add bulk operations (delete, move, resize)
- Update keyboard shortcuts

Closes #123
```

---

## Support & Community

- 📧 **Email:** support@careersy.com
- 💬 **Discord:** [Join Careersy Community](https://discord.gg/careersy)
- 🐛 **Bug Reports:** [GitHub Issues](https://github.com/Verridian-ai/life-os-Pulse-banner-generator/issues)
- 💡 **Feature Requests:** [GitHub Discussions](https://github.com/Verridian-ai/life-os-Pulse-banner-generator/discussions)

---

## License

MIT License - see [LICENSE](./LICENSE) file for details.

---

**Made with ❤️ for the Careersy Community**
