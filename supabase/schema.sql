-- Nanobanna Pro - Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. ENABLE ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on auth.users (default in Supabase)
-- No action needed, already enabled

-- ============================================
-- 2. CREATE PROFILES TABLE
-- ============================================
-- Extended user profile information
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- User preferences
    default_image_quality TEXT DEFAULT '2K' CHECK (default_image_quality IN ('1K', '2K', '4K')),
    preferred_model TEXT DEFAULT 'gemini-3-pro-image-preview',

    -- Usage tracking
    images_generated INTEGER DEFAULT 0,
    storage_used_mb NUMERIC DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 3. CREATE PROJECTS TABLE
-- ============================================
-- Users can create multiple design projects
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Project details
    name TEXT NOT NULL,
    description TEXT,

    -- Current canvas state
    canvas_width INTEGER DEFAULT 1584,
    canvas_height INTEGER DEFAULT 396,
    background_image_url TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed TIMESTAMPTZ DEFAULT NOW(),

    -- Organization
    is_favorite BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own projects"
    ON public.projects FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
    ON public.projects FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
    ON public.projects FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
    ON public.projects FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON public.projects(updated_at DESC);

-- ============================================
-- 4. CREATE IMAGES TABLE
-- ============================================
-- Track all generated images with metadata
CREATE TABLE IF NOT EXISTS public.images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,

    -- Image details
    storage_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size_bytes INTEGER,
    mime_type TEXT DEFAULT 'image/png',

    -- Generation metadata
    prompt TEXT,
    model_used TEXT,
    quality TEXT, -- '1K', '2K', '4K'
    generation_type TEXT, -- 'generate', 'edit', 'upscale', 'remove-bg', 'restore', 'face-enhance'

    -- Parent relationship (for edits/variations)
    parent_image_id UUID REFERENCES public.images(id) ON DELETE SET NULL,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_favorite BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- Enable RLS
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own images"
    ON public.images FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own images"
    ON public.images FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own images"
    ON public.images FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own images"
    ON public.images FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_images_user_id ON public.images(user_id);
CREATE INDEX IF NOT EXISTS idx_images_project_id ON public.images(project_id);
CREATE INDEX IF NOT EXISTS idx_images_created_at ON public.images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_images_parent_id ON public.images(parent_image_id);

-- ============================================
-- 5. CREATE IMAGE HISTORY TABLE
-- ============================================
-- Track edit history for multi-turn editing
CREATE TABLE IF NOT EXISTS public.image_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_id UUID NOT NULL REFERENCES public.images(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Edit details
    action TEXT NOT NULL, -- 'generate', 'edit', 'upscale', etc.
    prompt TEXT,
    input_image_url TEXT,
    output_image_url TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.image_history ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own image history"
    ON public.image_history FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own image history"
    ON public.image_history FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_image_history_image_id ON public.image_history(image_id);
CREATE INDEX IF NOT EXISTS idx_image_history_created_at ON public.image_history(created_at DESC);

-- ============================================
-- 6. STORAGE BUCKET POLICIES
-- ============================================
-- Policies for the 'generated-images' bucket

-- Allow users to view their own images
CREATE POLICY "Users can view own images in storage"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'generated-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to upload their own images
CREATE POLICY "Users can upload own images to storage"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'generated-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own images
CREATE POLICY "Users can delete own images from storage"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'generated-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to all images (for sharing)
CREATE POLICY "Public can view all images in storage"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'generated-images');

-- ============================================
-- 7. HELPER FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Trigger for projects
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Function to increment images_generated counter
CREATE OR REPLACE FUNCTION public.increment_images_generated()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET images_generated = images_generated + 1
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-increment on image creation
DROP TRIGGER IF EXISTS on_image_created ON public.images;
CREATE TRIGGER on_image_created
    AFTER INSERT ON public.images
    FOR EACH ROW
    EXECUTE FUNCTION public.increment_images_generated();

-- Function to update storage usage
CREATE OR REPLACE FUNCTION public.update_storage_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET storage_used_mb = (
        SELECT COALESCE(SUM(file_size_bytes), 0) / 1024.0 / 1024.0
        FROM public.images
        WHERE user_id = NEW.user_id
    )
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update storage on image insert/delete
DROP TRIGGER IF EXISTS on_image_storage_change ON public.images;
CREATE TRIGGER on_image_storage_change
    AFTER INSERT OR DELETE ON public.images
    FOR EACH ROW
    EXECUTE FUNCTION public.update_storage_usage();

-- ============================================
-- 8. INDEXES FOR PERFORMANCE
-- ============================================

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_images_user_created ON public.images(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_user_updated ON public.projects(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_images_favorites ON public.images(user_id, is_favorite) WHERE is_favorite = TRUE;

-- ============================================
-- DONE!
-- ============================================
-- Your database schema is now set up.
-- Next steps:
-- 1. Enable email auth in Supabase Dashboard
-- 2. Create the 'generated-images' storage bucket
-- 3. Run your application with auth enabled
