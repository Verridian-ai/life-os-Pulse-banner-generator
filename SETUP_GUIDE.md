# Nanobanna Pro - Backend Setup Guide

Complete setup instructions for integrating Supabase Auth, Neon Database, and Google Cloud Storage.

---

## 🚀 Quick Setup Overview

Your stack:

- **Authentication**: Supabase Auth
- **Database**: Neon PostgreSQL (with Data API)
- **File Storage**: Google Cloud Storage
- **Frontend**: React + Vite + TypeScript

---

## 📋 Prerequisites

1. **Supabase Account** - https://supabase.com
2. **Neon Account** - https://neon.tech
3. **Google Cloud Account** - https://console.cloud.google.com
4. **Node.js** - v18 or higher

---

## 1️⃣ Supabase Auth Setup

### Step 1.1: Create Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in:
   - **Name**: `nanobanna-pro`
   - **Database Password**: (save this)
   - **Region**: Choose closest to you
4. Wait for project to provision (~2 minutes)

### Step 1.2: Configure Auth Providers

#### Enable Email/Password Auth (Default - Already Enabled)

1. Go to **Authentication** > **Providers**
2. **Email** should be enabled by default
3. Configure email templates (optional):
   - **Authentication** > **Email Templates**
   - Customize Confirmation, Magic Link, etc.

#### Enable Google OAuth (Recommended)

1. Go to **Authentication** > **Providers** > **Google**
2. Click "Enable"
3. Get OAuth credentials from Google:
   - Visit https://console.cloud.google.com/apis/credentials
   - Create OAuth 2.0 Client ID
   - **Application type**: Web application
   - **Authorized redirect URIs**: Add your Supabase callback URL (shown in Supabase UI)
   - Copy **Client ID** and **Client Secret**
4. Paste into Supabase Google provider settings
5. **Save**

#### Enable GitHub OAuth (Optional)

1. Go to **Authentication** > **Providers** > **GitHub**
2. Click "Enable"
3. Get OAuth credentials from GitHub:
   - Visit https://github.com/settings/developers
   - Click "New OAuth App"
   - Fill in:
     - **Application name**: Nanobanna Pro
     - **Homepage URL**: Your app URL
     - **Authorization callback URL**: (shown in Supabase UI)
   - Copy **Client ID** and **Client Secret**
4. Paste into Supabase GitHub provider settings
5. **Save**

### Step 1.3: Get API Keys

1. Go to **Settings** > **API**
2. Copy:
   - **Project URL** (e.g., `https://xxx.supabase.co`)
   - **anon public** key
3. Add to `.env.local`:

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 1.4: Configure Row Level Security

Supabase has RLS enabled by default. Our Neon database will handle data security, but you need to allow Supabase Auth tokens to work with Neon.

1. Go to **SQL Editor**
2. Run this to create the `auth.uid()` helper function:

```sql
-- This allows our Neon RLS policies to work with Supabase JWT tokens
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    (current_setting('request.jwt.claims', true)::json->>'user_id')
  )::uuid
$$;
```

---

## 2️⃣ Neon Database Setup

### Step 2.1: Database Already Created

You already have:

- **Neon Project**: `ep-flat-firefly-a71brgai`
- **Data API Endpoint**: `https://ep-flat-firefly-a71brgai.apirest.ap-southeast-2.aws.neon.tech/neondb/rest/v1`

### Step 2.2: Run Database Schema

1. Go to Neon Console: https://console.neon.tech
2. Select your project
3. Go to **SQL Editor**
4. Copy the entire contents of `database/schema.sql`
5. Paste and **Run**
6. Verify tables created:

```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

You should see:

- `users`
- `designs`
- `brand_profiles`
- `usage_metrics`
- `reference_images`
- `user_preferences`

### Step 2.3: Configure Data API Authentication

1. Go to **Project Settings** > **Data API**
2. **Enable** Data API if not already enabled
3. Configure authentication to accept Supabase JWT tokens:
   - In Neon, you'll use the Supabase JWT for authentication
   - The RLS policies in our schema use `auth.uid()` which extracts the user ID from the JWT

### Step 2.4: Add Environment Variable

Add to `.env.local`:

```env
VITE_NEON_API_URL=https://ep-flat-firefly-a71brgai.apirest.ap-southeast-2.aws.neon.tech/neondb/rest/v1
```

---

## 3️⃣ Google Cloud Storage Setup

### Step 3.1: Create GCP Project

1. Go to https://console.cloud.google.com
2. Click **Select a project** > **New Project**
3. **Project name**: `nanobanna-pro`
4. Click **Create**

### Step 3.2: Create Storage Bucket

1. Go to **Cloud Storage** > **Buckets**
2. Click **Create Bucket**
3. Fill in:
   - **Name**: `nanobanna-pro` (must be globally unique, add suffix if taken)
   - **Location type**: Region (choose closest to your users)
   - **Storage class**: Standard
   - **Access control**: Uniform
4. Click **Create**

### Step 3.3: Configure CORS

1. Open **Cloud Shell** (top-right corner)
2. Create a `cors.json` file:

```bash
cat > cors.json << EOF
[
  {
    "origin": ["http://localhost:5173", "https://your-production-domain.com"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
EOF
```

3. Apply CORS configuration:

```bash
gsutil cors set cors.json gs://nanobanna-pro
```

### Step 3.4: Set Bucket Permissions

1. Go to your bucket
2. Click **Permissions** tab
3. Click **Grant Access**
4. Add:
   - **Principal**: `allUsers`
   - **Role**: `Storage Object Viewer` (for public read access)
5. Click **Save**

### Step 3.5: Create Service Account (for signed URLs)

1. Go to **IAM & Admin** > **Service Accounts**
2. Click **Create Service Account**
3. Fill in:
   - **Name**: `nanobanna-storage`
   - **Description**: Storage signed URL generation
4. Click **Create and Continue**
5. **Grant roles**:
   - Select **Storage Admin**
6. Click **Done**
7. Click on the service account you just created
8. Go to **Keys** tab
9. Click **Add Key** > **Create new key**
10. **Key type**: JSON
11. Click **Create** (downloads JSON file)

⚠️ **IMPORTANT**: Keep this JSON file secure! Never commit it to Git.

### Step 3.6: Add Environment Variables

Add to `.env.local`:

```env
VITE_GCS_PROJECT_ID=nanobanna-pro
VITE_GCS_BUCKET_NAME=nanobanna-pro
```

For the service account key, you have 2 options:

**Option A**: Store in environment variable (local development)

```env
GCS_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
```

**Option B**: Store file path (recommended)

```env
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

---

## 4️⃣ Backend API for Signed URLs (Optional but Recommended)

For production-grade file uploads, create a simple backend endpoint to generate signed URLs.

### Option A: Node.js/Express Backend

Create `backend/server.js`:

```javascript
const express = require('express');
const { Storage } = require('@google-cloud/storage');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);

// Generate signed URL for upload
app.post('/api/storage/signed-url', async (req, res) => {
  const { fileName, contentType } = req.body;

  // Verify authentication (check Supabase JWT)
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const file = bucket.file(fileName);

    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType,
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    res.json({ signedUrl: url, publicUrl });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    res.status(500).json({ error: 'Failed to generate signed URL' });
  }
});

// Delete file
app.delete('/api/storage/delete', async (req, res) => {
  const { fileName } = req.body;

  try {
    await bucket.file(fileName).delete();
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

Install dependencies:

```bash
npm install express @google-cloud/storage cors
```

Run backend:

```bash
node backend/server.js
```

Add to `.env.local`:

```env
VITE_BACKEND_URL=http://localhost:3000
```

### Option B: Serverless Functions (Vercel/Netlify)

If deploying to Vercel or Netlify, create serverless functions instead.

---

## 5️⃣ Install Frontend Dependencies

Install required packages:

```bash
npm install @supabase/supabase-js
```

---

## 6️⃣ Wrap App with Providers

Update `src/main.tsx` or `src/App.tsx`:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { AIProvider } from './context/AIContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <AIProvider>
        <App />
      </AIProvider>
    </AuthProvider>
  </React.StrictMode>
);
```

---

## 7️⃣ Testing

### Test Authentication

1. Start dev server: `npm run dev`
2. Try signing up with email/password
3. Check Supabase **Authentication** > **Users** to see new user
4. Check Neon database: `SELECT * FROM users;`
5. Try OAuth login (Google/GitHub)

### Test Database Operations

```typescript
import { createDesign, getUserDesigns } from './services/neon';

// Save a design
const design = await createDesign(userId, {
  title: 'Test Banner',
  design_url: 'https://storage.googleapis.com/...',
  canvas_data: canvasState,
});

// Get user's designs
const designs = await getUserDesigns(userId);
```

### Test File Upload

```typescript
import { uploadImageViaSignedURL } from './services/gcs';

const file = document.querySelector('input[type="file"]').files[0];
const result = await uploadImageViaSignedURL(file, 'designs');
console.log('Uploaded to:', result.url);
```

---

## 8️⃣ Production Deployment

### Environment Variables (Production)

Set these in your hosting provider (Vercel/Netlify/etc.):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_NEON_API_URL`
- `VITE_GCS_PROJECT_ID`
- `VITE_GCS_BUCKET_NAME`
- `VITE_BACKEND_URL` (your backend API URL)

### CORS Updates

Update CORS configurations to include your production domain:

**Supabase**:

- **Authentication** > **URL Configuration** > Add production URL

**GCS**:

```bash
gsutil cors set cors-prod.json gs://nanobanna-pro
```

### Security Checklist

✅ Never commit `.env.local` or service account keys to Git
✅ Use environment variables for all secrets
✅ Enable RLS policies on all Neon tables
✅ Use signed URLs for all GCS uploads (never direct uploads)
✅ Validate JWT tokens on backend endpoints
✅ Set appropriate CORS policies
✅ Enable rate limiting on auth endpoints
✅ Use HTTPS in production

---

## 🎯 Next Steps

1. **Run the schema**: Execute `database/schema.sql` in Neon
2. **Set environment variables**: Copy `.env.example` to `.env.local` and fill in values
3. **Install dependencies**: `npm install @supabase/supabase-js`
4. **Wrap app with AuthProvider**: Update `src/main.tsx`
5. **Test authentication**: Sign up and verify user in both Supabase and Neon
6. **Test file uploads**: Upload an image and verify in GCS bucket

---

## 📚 Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Neon Data API Docs](https://neon.tech/docs/guides/data-api)
- [Google Cloud Storage Docs](https://cloud.google.com/storage/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

## 🆘 Troubleshooting

### "Not authenticated" error

- Check if Supabase session is active: `localStorage.getItem('supabase.auth.token')`
- Verify JWT token is being sent in requests
- Check Neon RLS policies allow the operation

### CORS errors on GCS upload

- Verify CORS configuration on bucket
- Check origin is whitelisted in `cors.json`
- Make sure signed URLs include correct content-type

### Database connection errors

- Verify Neon project is active (not paused)
- Check API endpoint URL is correct
- Ensure JWT token is valid and not expired

### File upload fails

- Check GCS bucket permissions
- Verify service account has Storage Admin role
- Ensure signed URL hasn't expired (15min limit)

---

Need help? Check the resources above or create an issue on GitHub!
