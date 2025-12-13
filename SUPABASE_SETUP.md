# Supabase Storage Setup Guide

## Project Details

- **Project URL:** https://bkergrdlytwvdzszmuos.supabase.co
- **Anon Key:** Already configured in code
- **Service Key:** Keep this secret for server-side operations

---

## Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/bkergrdlytwvdzszmuos
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Configure the bucket:
   - **Name:** `generated-images`
   - **Public bucket:** ✅ **Enable** (so images have public URLs)
   - **File size limit:** 50 MB (recommended)
   - **Allowed MIME types:** `image/*` (or leave empty for all types)
5. Click **"Create bucket"**

---

## Step 2: Configure Bucket Policies (Optional but Recommended)

### Option A: Fully Public (Easiest for Testing)

Allow anyone to read, but only authenticated users to upload:

```sql
-- Allow public read access
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'generated-images');

-- Allow anyone to upload (for testing)
CREATE POLICY "Anyone can upload images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'generated-images');
```

### Option B: User-Specific Access (Recommended for Production)

Each user can only access their own images:

```sql
-- Allow users to view their own images
CREATE POLICY "Users can view own images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'generated-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to upload their own images
CREATE POLICY "Users can upload own images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'generated-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'generated-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## Step 3: Test the Integration

Once the bucket is created, the app will automatically:

1. **Generate a user ID** on first use (stored in localStorage)
2. **Upload generated images** to `generated-images/{user_id}/{filename}.png`
3. **Return public URLs** like:
   ```
   https://bkergrdlytwvdzszmuos.supabase.co/storage/v1/object/public/generated-images/user_1234567890_abc123/generated_1234567890.png
   ```

---

## Step 4: Verify Upload is Working

### Check Console Logs:

When you generate an image, you should see:

```
[Image Gen] ✓ Image found in candidate 0, part 0
[Image Gen] Uploading to Supabase Storage...
[Supabase] Uploading image: { filePath: 'user_xxx/generated_xxx.png', size: 123456, mimeType: 'image/png' }
[Supabase] ✅ Upload successful: https://bkergrdlytwvdzszmuos.supabase.co/storage/v1/object/public/...
[Image Gen] ✅ Saved to Supabase: https://...
```

### Check Supabase Dashboard:

1. Go to **Storage** → **generated-images** bucket
2. You should see folders with user IDs
3. Click a folder to see uploaded images
4. Click an image to verify it loads

---

## Features Implemented

### ✅ Automatic Upload

- All generated images are automatically uploaded to Supabase
- Original base64 is used as fallback if upload fails

### ✅ Per-User Storage

- Each user gets their own folder: `generated-images/{user_id}/`
- User ID is auto-generated and stored in localStorage

### ✅ Public URLs

- Images are accessible via public URLs
- No authentication needed to view images

### ✅ Error Handling

- If Supabase upload fails, app falls back to base64
- Graceful degradation ensures app keeps working

---

## Helper Functions Available

```typescript
import { uploadImage, listUserImages, deleteImage, getUserId } from './services/supabase';

// Upload an image
const publicUrl = await uploadImage(base64Image, 'custom-name.png');

// List all images for current user
const imageUrls = await listUserImages();

// Delete an image
const success = await deleteImage(imageUrl);

// Get current user ID
const userId = getUserId();
```

---

## Storage Limits

**Free Tier:**

- 1 GB storage
- 2 GB bandwidth/month

**Monitor Usage:**

- Go to **Settings** → **Usage** in Supabase Dashboard
- Check storage and bandwidth usage

---

## Security Considerations

### Current Setup (Testing):

- ⚠️ Anonymous user IDs (anyone can upload)
- ✅ Public read access (images are viewable by anyone)

### Production Recommendations:

1. **Enable Supabase Auth** - Use real user authentication
2. **Update RLS Policies** - Lock down to authenticated users only
3. **Rate Limiting** - Prevent abuse with rate limits
4. **File Validation** - Check file types and sizes server-side
5. **CDN** - Use Supabase CDN or Cloudflare for better performance

---

## Troubleshooting

### "Bucket not found" error:

- Make sure you created the `generated-images` bucket
- Check bucket name is exactly `generated-images` (lowercase, hyphenated)

### "Permission denied" error:

- Check RLS policies are set up correctly
- Make sure bucket is set to **Public**
- Verify anon key has correct permissions

### Upload fails silently:

- Check browser console for detailed errors
- Verify Supabase project is active and not paused
- Check storage quota hasn't been exceeded

### Images not loading:

- Verify bucket is set to **Public**
- Check the public URL is correct
- Try opening the URL directly in a new tab

---

## Next Steps

1. ✅ Create the `generated-images` bucket
2. ✅ Enable public access
3. ✅ Test by generating an image in the app
4. ✅ Check Supabase Dashboard to see uploaded files
5. ✅ Monitor storage usage
6. 🔄 Later: Add real authentication for production
