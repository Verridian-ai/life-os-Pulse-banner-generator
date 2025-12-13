# Supabase Authentication & Database Setup Guide

## Overview

This guide walks you through setting up complete user authentication and database schema for Nanobanna Pro.

---

## Step 1: Run Database Schema

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/bkergrdlytwvdzszmuos
2. Click **SQL Editor** in the left sidebar
3. Click **"New query"**
4. Copy the entire contents of `supabase/schema.sql`
5. Paste into the SQL editor
6. Click **"Run"** (or press Ctrl+Enter)
7. Wait for confirmation: "Success. No rows returned"

### What This Creates:

**Tables:**

- `profiles` - User profiles with preferences and usage stats
- `projects` - Design projects for each user
- `images` - Generated images with metadata
- `image_history` - Edit history for multi-turn editing

**Features:**

- ✅ Row Level Security (RLS) - Users can only access their own data
- ✅ Auto-created profiles on signup
- ✅ Auto-increment usage counters
- ✅ Storage usage tracking
- ✅ Indexed for performance

---

## Step 2: Enable Email Authentication

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Find **Email** provider
3. Make sure it's **ENABLED** (toggle should be ON)
4. Configure settings:
   - **Enable email confirmations:** OFF (for testing) or ON (for production)
   - **Secure email change:** ON (recommended)
   - **Secure password change:** ON (recommended)
5. Click **Save**

### For Testing (Recommended):

- **Disable email confirmations** - Users can sign up instantly
- You can enable it later for production

### For Production:

- **Enable email confirmations** - Users must verify email
- Configure email templates in **Auth** → **Email Templates**

---

## Step 3: Create Storage Bucket

1. Go to **Storage** in left sidebar
2. Click **"New bucket"**
3. Configure:
   - **Name:** `generated-images`
   - **Public:** ✅ ENABLE
   - **File size limit:** 50 MB
4. Click **"Create bucket"**

The SQL schema already includes storage policies, so they'll be applied automatically!

---

## Step 4: Test Authentication

### Test Sign Up:

1. Start your app: `npm run dev`
2. You should see a "Sign In" button in the header (once integrated)
3. Click it and switch to "Sign Up"
4. Enter:
   - Email: test@example.com
   - Password: test123
5. Click "Create Account"
6. Check Supabase Dashboard → **Authentication** → **Users**
7. You should see your new user!

### Test Sign In:

1. Sign out (if signed in)
2. Click "Sign In"
3. Enter same credentials
4. Should log you in successfully

### Check Database:

1. Go to **Table Editor** → `profiles`
2. You should see a profile row for your user
3. Check `images_generated` starts at 0
4. Check `storage_used_mb` starts at 0

---

## Step 5: Test Image Upload

1. While signed in, generate an image
2. Check console logs:
   ```
   [Supabase] Using authenticated user ID: <uuid>
   [Image Gen] Uploading to Supabase Storage...
   [Supabase] ✅ Upload successful
   ```
3. Go to **Storage** → `generated-images`
4. You should see a folder with your user ID (UUID)
5. Inside, your generated image

### Check Metadata:

1. Go to **Table Editor** → `images`
2. Should see a row for your image with:
   - `user_id` - Your UUID
   - `storage_url` - Public URL
   - `prompt` - What you entered
   - `model_used` - Which model generated it
3. Go back to `profiles`
4. Check `images_generated` incremented to 1
5. Check `storage_used_mb` shows file size

---

## Step 6: Test Projects

### Create a Project:

```typescript
import { supabase } from './services/supabase';

const createProject = async () => {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      name: 'My LinkedIn Banner',
      description: 'Professional banner with blue gradient',
    })
    .select()
    .single();

  if (error) console.error(error);
  else console.log('Project created:', data);
};
```

### Load Projects:

```typescript
const loadProjects = async () => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) console.error(error);
  else console.log('Projects:', data);
};
```

---

## Database Schema Reference

### `profiles` Table

| Column                | Type    | Description                  |
| --------------------- | ------- | ---------------------------- |
| id                    | UUID    | User ID (matches auth.users) |
| email                 | TEXT    | User email                   |
| full_name             | TEXT    | User's name                  |
| avatar_url            | TEXT    | Profile picture URL          |
| default_image_quality | TEXT    | Preferred quality (1K/2K/4K) |
| preferred_model       | TEXT    | Default image model          |
| images_generated      | INTEGER | Total images created         |
| storage_used_mb       | NUMERIC | Storage usage in MB          |

### `projects` Table

| Column               | Type    | Description                 |
| -------------------- | ------- | --------------------------- |
| id                   | UUID    | Project ID                  |
| user_id              | UUID    | Owner                       |
| name                 | TEXT    | Project name                |
| description          | TEXT    | Project description         |
| canvas_width         | INTEGER | Canvas width (default 1584) |
| canvas_height        | INTEGER | Canvas height (default 396) |
| background_image_url | TEXT    | Current background          |
| is_favorite          | BOOLEAN | Starred project             |
| tags                 | TEXT[]  | Search tags                 |

### `images` Table

| Column          | Type    | Description                   |
| --------------- | ------- | ----------------------------- |
| id              | UUID    | Image ID                      |
| user_id         | UUID    | Owner                         |
| project_id      | UUID    | Associated project (nullable) |
| storage_url     | TEXT    | Supabase Storage URL          |
| file_name       | TEXT    | Filename                      |
| file_size_bytes | INTEGER | File size                     |
| prompt          | TEXT    | Generation prompt             |
| model_used      | TEXT    | Model that created it         |
| quality         | TEXT    | Quality level                 |
| generation_type | TEXT    | Type of operation             |
| parent_image_id | UUID    | Source image (for edits)      |
| is_favorite     | BOOLEAN | Starred image                 |
| tags            | TEXT[]  | Search tags                   |

### `image_history` Table

| Column           | Type | Description      |
| ---------------- | ---- | ---------------- |
| id               | UUID | History ID       |
| image_id         | UUID | Associated image |
| user_id          | UUID | Owner            |
| action           | TEXT | Operation type   |
| prompt           | TEXT | Edit prompt      |
| input_image_url  | TEXT | Before edit      |
| output_image_url | TEXT | After edit       |

---

## API Functions Reference

### Auth Functions

```typescript
import { signUp, signIn, signOut, getCurrentUser } from './services/supabase';

// Sign up
await signUp({
  email: 'user@example.com',
  password: 'password123',
  fullName: 'John Doe',
});

// Sign in
await signIn({
  email: 'user@example.com',
  password: 'password123',
});

// Sign out
await signOut();

// Get current user
const user = await getCurrentUser();
console.log(user?.email);
```

### Storage Functions

```typescript
import { uploadImage, listUserImages, deleteImage } from './services/supabase';

// Upload image
const publicUrl = await uploadImage(base64Image, 'my-image.png');

// List user's images
const imageUrls = await listUserImages();

// Delete image
await deleteImage(publicUrl);
```

---

## Security Features

### Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:

- ✅ Users can only view their own data
- ✅ Users can only create data for themselves
- ✅ Users can only update their own data
- ✅ Users can only delete their own data

### Storage Security

Storage policies ensure:

- ✅ Users can only upload to their own folder (`{user_id}/`)
- ✅ Users can only delete from their own folder
- ✅ Everyone can view images (public sharing)
- ✅ Authenticated users required for uploads

---

## Monitoring & Maintenance

### Check Usage:

1. Go to **Settings** → **Usage**
2. Monitor:
   - Database size
   - Storage size
   - Bandwidth
   - Auth users

### Free Tier Limits:

- 500 MB database
- 1 GB storage
- 2 GB bandwidth/month
- Unlimited auth users

### View Logs:

1. Go to **Logs** in Supabase
2. Filter by:
   - API calls
   - Auth events
   - Storage operations
   - Errors

---

## Troubleshooting

### "User not found" after signup

- Check **Authentication** → **Users** in dashboard
- Verify email confirmation is disabled (for testing)
- Check console for errors

### "Permission denied" on upload

- Verify storage bucket exists
- Check RLS policies are applied
- Confirm user is authenticated

### "Profile not created"

- Check **Table Editor** → `profiles`
- Verify trigger `on_auth_user_created` exists
- Run schema.sql again if needed

### Images not showing in Storage

- Verify bucket is public
- Check file actually uploaded (Network tab)
- Confirm path: `generated-images/{user_id}/{filename}`

---

## Next Steps

1. ✅ Run `supabase/schema.sql` in SQL Editor
2. ✅ Enable Email authentication
3. ✅ Create `generated-images` storage bucket
4. ✅ Test signup/signin
5. ✅ Test image generation with auth
6. 🔄 Integrate auth UI into app header
7. 🔄 Add projects management UI
8. 🔄 Add image gallery UI

---

## Production Checklist

Before deploying to production:

- [ ] Enable email confirmations
- [ ] Set up custom email templates
- [ ] Configure password reset flow
- [ ] Set up rate limiting
- [ ] Enable MFA (multi-factor authentication)
- [ ] Set up monitoring alerts
- [ ] Configure backup strategy
- [ ] Update privacy policy with data storage info
- [ ] Test all auth flows thoroughly
- [ ] Remove hardcoded API keys
- [ ] Use environment variables for keys
