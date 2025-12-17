-- Migration: Verify and create images table for Gallery feature
-- This ensures the images table exists with proper schema, RLS policies, and indexes
-- Created: 2025-12-17

-- Create images table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    storage_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size_bytes INTEGER,
    prompt TEXT,
    model_used TEXT,
    quality TEXT,
    generation_type TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS images_updated_at ON public.images;
CREATE TRIGGER images_updated_at
    BEFORE UPDATE ON public.images
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own images" ON public.images;
DROP POLICY IF EXISTS "Users can insert their own images" ON public.images;
DROP POLICY IF EXISTS "Users can update their own images" ON public.images;
DROP POLICY IF EXISTS "Users can delete their own images" ON public.images;

-- RLS Policy: Users can only view their own images
CREATE POLICY "Users can view their own images"
    ON public.images
    FOR SELECT
    USING (auth.uid() = user_id);

-- RLS Policy: Users can only insert their own images
CREATE POLICY "Users can insert their own images"
    ON public.images
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only update their own images
CREATE POLICY "Users can update their own images"
    ON public.images
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only delete their own images
CREATE POLICY "Users can delete their own images"
    ON public.images
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_images_user_id ON public.images(user_id);
CREATE INDEX IF NOT EXISTS idx_images_created_at ON public.images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_images_is_favorite ON public.images(user_id, is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_images_tags ON public.images USING GIN(tags);

-- Add comment for documentation
COMMENT ON TABLE public.images IS 'Stores AI-generated images with metadata for the Gallery feature';
COMMENT ON COLUMN public.images.storage_url IS 'Supabase Storage URL or data URI';
COMMENT ON COLUMN public.images.file_size_bytes IS 'File size in bytes for quota tracking';
COMMENT ON COLUMN public.images.generation_type IS 'Type of generation: text_to_image, image_edit, upscale, etc.';
