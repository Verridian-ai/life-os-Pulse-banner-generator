-- Nanobanna Pro - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (Public profile table linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supabase_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Link to built-in auth.users
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  avatar_url TEXT,
  subscription_tier VARCHAR(50) DEFAULT 'free', -- free, pro, enterprise
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create a trigger to automatically create a public user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (supabase_user_id, email, name, subscription_tier)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'free')
  ON CONFLICT (supabase_user_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Saved Designs/Banners
CREATE TABLE IF NOT EXISTS public.designs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url TEXT, -- URL to thumbnail
  design_url TEXT NOT NULL, -- URL to full design
  canvas_data JSONB, -- Full canvas state for re-editing
  width INTEGER DEFAULT 1920,
  height INTEGER DEFAULT 568,
  tags TEXT[], -- Array of tags for search
  is_public BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Brand Profiles
CREATE TABLE IF NOT EXISTS public.brand_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  colors JSONB NOT NULL, -- Array of {hex, name, usage}
  fonts JSONB, -- Array of {name, usage}
  style_keywords TEXT[],
  logo_url TEXT,
  industry VARCHAR(100),
  target_audience VARCHAR(255),
  reference_images JSONB, -- Array of URLs
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage Metrics (for cost tracking and performance)
CREATE TABLE IF NOT EXISTS public.usage_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  operation_type VARCHAR(100) NOT NULL, -- 'text_generation', 'image_generation', 'upscale', etc.
  model_id VARCHAR(255) NOT NULL,
  provider VARCHAR(50) NOT NULL, -- 'gemini', 'openrouter', 'replicate'
  status VARCHAR(50) NOT NULL, -- 'success', 'failure'
  response_time_ms INTEGER,
  cost_usd DECIMAL(10, 6) DEFAULT 0,
  input_tokens INTEGER,
  output_tokens INTEGER,
  error_message TEXT,
  metadata JSONB, -- Additional context (quality level, image size, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reference Images Library (Legacy/Brand specific)
CREATE TABLE IF NOT EXISTS public.reference_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size_bytes BIGINT,
  mime_type VARCHAR(100),
  width INTEGER,
  height INTEGER,
  tags TEXT[],
  brand_profile_id UUID REFERENCES public.brand_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated Images Gallery (New table used by Database Service)
CREATE TABLE IF NOT EXISTS public.images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  storage_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  prompt TEXT,
  model_used TEXT,
  quality TEXT,
  generation_type TEXT DEFAULT 'generate',
  tags TEXT[],
  project_id TEXT,
  file_size_bytes BIGINT,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  default_model_provider VARCHAR(50) DEFAULT 'gemini',
  default_text_model VARCHAR(255),
  default_image_model VARCHAR(255),
  auto_model_selection BOOLEAN DEFAULT true,
  default_quality VARCHAR(50) DEFAULT 'balanced',
  gemini_api_key TEXT, -- Encrypted in production
  openrouter_api_key TEXT, -- Encrypted in production
  replicate_api_key TEXT, -- Encrypted in production
  gcs_bucket_name VARCHAR(255),
  preferences JSONB, -- Other UI preferences
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_designs_user_id ON public.designs(user_id);
CREATE INDEX IF NOT EXISTS idx_designs_created_at ON public.designs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_brand_profiles_user_id ON public.brand_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_user_id ON public.usage_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_created_at ON public.usage_metrics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reference_images_user_id ON public.reference_images(user_id);
CREATE INDEX IF NOT EXISTS idx_images_user_id ON public.images(user_id);
CREATE INDEX IF NOT EXISTS idx_images_created_at ON public.images(created_at DESC);

-- Row Level Security (RLS) Policies

-- Users table policies
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (supabase_user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (supabase_user_id = auth.uid());

-- Designs table policies
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own designs"
  ON public.designs FOR SELECT
  USING (user_id IN (SELECT id FROM public.users WHERE supabase_user_id = auth.uid()));

CREATE POLICY "Users can view public designs"
  ON public.designs FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can insert own designs"
  ON public.designs FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE supabase_user_id = auth.uid()));

CREATE POLICY "Users can update own designs"
  ON public.designs FOR UPDATE
  USING (user_id IN (SELECT id FROM public.users WHERE supabase_user_id = auth.uid()));

CREATE POLICY "Users can delete own designs"
  ON public.designs FOR DELETE
  USING (user_id IN (SELECT id FROM public.users WHERE supabase_user_id = auth.uid()));

-- Brand profiles policies
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own brand profiles"
  ON public.brand_profiles FOR ALL
  USING (user_id IN (SELECT id FROM public.users WHERE supabase_user_id = auth.uid()));

-- Usage metrics policies
ALTER TABLE public.usage_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own metrics"
  ON public.usage_metrics FOR SELECT
  USING (user_id IN (SELECT id FROM public.users WHERE supabase_user_id = auth.uid()));

CREATE POLICY "Users can insert own metrics"
  ON public.usage_metrics FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE supabase_user_id = auth.uid()));

-- Reference images policies
ALTER TABLE public.reference_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own reference images"
  ON public.reference_images FOR ALL
  USING (user_id IN (SELECT id FROM public.users WHERE supabase_user_id = auth.uid()));

-- Images policies (New table)
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own images"
  ON public.images FOR SELECT
  USING (user_id IN (SELECT id FROM public.users WHERE supabase_user_id = auth.uid()));

CREATE POLICY "Users can insert own images"
  ON public.images FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE supabase_user_id = auth.uid()));

CREATE POLICY "Users can update own images"
  ON public.images FOR UPDATE
  USING (user_id IN (SELECT id FROM public.users WHERE supabase_user_id = auth.uid()));

CREATE POLICY "Users can delete own images"
  ON public.images FOR DELETE
  USING (user_id IN (SELECT id FROM public.users WHERE supabase_user_id = auth.uid()));

-- User preferences policies
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences"
  ON public.user_preferences FOR ALL
  USING (user_id IN (SELECT id FROM public.users WHERE supabase_user_id = auth.uid()));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_designs_updated_at
  BEFORE UPDATE ON public.designs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_profiles_updated_at
  BEFORE UPDATE ON public.brand_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS TABLE(
  total_designs INTEGER,
  total_brand_profiles INTEGER,
  total_reference_images INTEGER,
  total_cost_usd DECIMAL,
  total_operations INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::INTEGER FROM public.designs WHERE user_id = p_user_id),
    (SELECT COUNT(*)::INTEGER FROM public.brand_profiles WHERE user_id = p_user_id),
    (SELECT COUNT(*)::INTEGER FROM public.reference_images WHERE user_id = p_user_id),
    (SELECT COALESCE(SUM(cost_usd), 0) FROM public.usage_metrics WHERE user_id = p_user_id),
    (SELECT COUNT(*)::INTEGER FROM public.usage_metrics WHERE user_id = p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(design_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.designs
  SET view_count = view_count + 1
  WHERE id = design_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STORAGE BUCKETS SETUP
-- ============================================================================

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('generated-images', 'generated-images', true),
  ('designs', 'designs', true),
  ('references', 'references', true),
  ('logos', 'logos', true),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies

-- Helper policy to allow public read access to specific buckets
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING ( bucket_id IN ('generated-images', 'designs', 'references', 'logos', 'avatars') );

-- Authenticated Upload
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK ( auth.role() = 'authenticated' AND bucket_id IN ('generated-images', 'designs', 'references', 'logos', 'avatars') );

-- Owner Update
CREATE POLICY "Owner Update"
ON storage.objects FOR UPDATE
USING ( auth.uid() = owner )
WITH CHECK ( auth.uid() = owner );

-- Owner Delete
CREATE POLICY "Owner Delete"
ON storage.objects FOR DELETE
USING ( auth.uid() = owner );
