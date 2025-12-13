# Gallery Setup Guide - Save Images to Gallery

## The Issue

Generated images are **not being saved to your gallery** because the database tables haven't been created in Supabase yet, or you're not authenticated.

## Quick Fix - 2 Steps

### Step 1: Set Up Supabase Database Tables

1. **Go to your Supabase project**
   - Open https://supabase.com/dashboard
   - Select your project: `bkergrdlytwvdzszmuos`

2. **Run the database schema**
   - Click on **SQL Editor** in the left sidebar
   - Click **New Query**
   - Copy the entire contents of `supabase/schema.sql`
   - Paste it into the SQL editor
   - Click **Run** (or press Ctrl+Enter)

3. **Verify tables were created**
   - Click on **Table Editor** in the left sidebar
   - You should see these tables:
     - `profiles`
     - `projects`
     - `images` ✅ (This is the important one!)
     - `reference_images`
     - `brand_profiles`

### Step 2: Sign In to the App

Images can only be saved to the gallery for **authenticated users** (due to security policies).

**Option A: Create an account**

1. Open the app
2. Look for a Sign In or Sign Up button in the header
3. Create a new account with your email
4. You're ready to go!

**Option B: Temporarily allow anonymous users** (DEV ONLY - Not secure for production)

If you want to test without authentication, you can temporarily modify the RLS policies:

Run this SQL in Supabase SQL Editor:

```sql
-- Allow anonymous users to insert images (DEV ONLY!)
CREATE POLICY "Allow anon image insert"
    ON public.images FOR INSERT
    TO anon
    WITH CHECK (true);

-- Allow anonymous users to view their own images
CREATE POLICY "Allow anon image select"
    ON public.images FOR SELECT
    TO anon
    USING (true);
```

⚠️ **WARNING**: This allows anyone to insert/view images without authentication. Only use in development!

## How It Works

When you generate an image, the app:

1. ✅ Generates the image using Gemini API
2. ✅ Uploads to Supabase Storage
3. ✅ **Saves metadata to `images` table** (requires auth + schema)
4. ✅ **Shows in Gallery tab** (queries `images` table)

## Troubleshooting

### "Images not showing in gallery"

Check browser console (F12) for these messages:

**Good** ✅:

```
[Image Gen] ✅ Saved to database and gallery
[Database] ✅ Image saved to database: <uuid>
```

**Not authenticated** ⚠️:

```
[Database] User not authenticated - cannot save image to database
[Database] Images will be saved to gallery once you sign in
```

→ **Solution**: Sign in to the app

**Schema not set up** ❌:

```
[Database] Create image error: relation "public.images" does not exist
```

→ **Solution**: Run the schema.sql file in Supabase SQL Editor

**RLS policy blocking** ❌:

```
[Database] Create image error: new row violates row-level security policy
```

→ **Solution**: Make sure you're signed in, or temporarily allow anon (see Step 2 Option B)

### "Where is the Gallery tab?"

Look for tabs at the top of the app:

- **Studio** - Main editing canvas
- **Gallery** ← Click here to see saved images
- **Brainstorm** - Chat interface

## What Gets Saved

Each generated image saves:

- Original prompt
- Model used (Nano Banana Pro, Nano Banana, etc.)
- Quality (1K, 2K, 4K)
- Generation type (generate, edit, upscale, etc.)
- Timestamp
- Direct link to image in Supabase Storage
- Tags and favorites (you can add these later)

## Production Note

Before deploying to production:

1. ✅ Remove the "Allow anon" policies if you added them
2. ✅ Ensure all users must sign up/sign in
3. ✅ Set up proper authentication flows
4. ✅ Test with real user accounts
