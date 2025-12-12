-- Nanobanna Pro - Neon Database Schema
-- Run this SQL in your Neon database console

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (synced with Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supabase_user_id UUID NOT NULL UNIQUE, -- Links to Supabase Auth
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  avatar_url TEXT,
  subscription_tier VARCHAR(50) DEFAULT 'free', -- free, pro, enterprise
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- Saved Designs/Banners
CREATE TABLE IF NOT EXISTS designs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url TEXT, -- GCS URL to thumbnail
  design_url TEXT NOT NULL, -- GCS URL to full design
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
CREATE TABLE IF NOT EXISTS brand_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  colors JSONB NOT NULL, -- Array of {hex, name, usage}
  fonts JSONB, -- Array of {name, usage}
  style_keywords TEXT[],
  logo_url TEXT, -- GCS URL
  industry VARCHAR(100),
  target_audience VARCHAR(255),
  reference_images JSONB, -- Array of GCS URLs
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage Metrics (for cost tracking and performance)
CREATE TABLE IF NOT EXISTS usage_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

-- Reference Images Library
CREATE TABLE IF NOT EXISTS reference_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL, -- GCS URL
  file_size_bytes BIGINT,
  mime_type VARCHAR(100),
  width INTEGER,
  height INTEGER,
  tags TEXT[],
  brand_profile_id UUID REFERENCES brand_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_designs_user_id ON designs(user_id);
CREATE INDEX IF NOT EXISTS idx_designs_created_at ON designs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_brand_profiles_user_id ON brand_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_user_id ON usage_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_created_at ON usage_metrics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reference_images_user_id ON reference_images(user_id);

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (supabase_user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (supabase_user_id = auth.uid());

-- Designs table policies
CREATE POLICY "Users can view own designs"
  ON designs FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE supabase_user_id = auth.uid()));

CREATE POLICY "Users can view public designs"
  ON designs FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can insert own designs"
  ON designs FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM users WHERE supabase_user_id = auth.uid()));

CREATE POLICY "Users can update own designs"
  ON designs FOR UPDATE
  USING (user_id IN (SELECT id FROM users WHERE supabase_user_id = auth.uid()));

CREATE POLICY "Users can delete own designs"
  ON designs FOR DELETE
  USING (user_id IN (SELECT id FROM users WHERE supabase_user_id = auth.uid()));

-- Brand profiles policies
CREATE POLICY "Users can manage own brand profiles"
  ON brand_profiles FOR ALL
  USING (user_id IN (SELECT id FROM users WHERE supabase_user_id = auth.uid()));

-- Usage metrics policies
CREATE POLICY "Users can view own metrics"
  ON usage_metrics FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE supabase_user_id = auth.uid()));

CREATE POLICY "Users can insert own metrics"
  ON usage_metrics FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM users WHERE supabase_user_id = auth.uid()));

-- Reference images policies
CREATE POLICY "Users can manage own reference images"
  ON reference_images FOR ALL
  USING (user_id IN (SELECT id FROM users WHERE supabase_user_id = auth.uid()));

-- User preferences policies
CREATE POLICY "Users can manage own preferences"
  ON user_preferences FOR ALL
  USING (user_id IN (SELECT id FROM users WHERE supabase_user_id = auth.uid()));

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
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_designs_updated_at
  BEFORE UPDATE ON designs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_profiles_updated_at
  BEFORE UPDATE ON brand_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
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
    (SELECT COUNT(*)::INTEGER FROM designs WHERE user_id = p_user_id),
    (SELECT COUNT(*)::INTEGER FROM brand_profiles WHERE user_id = p_user_id),
    (SELECT COUNT(*)::INTEGER FROM reference_images WHERE user_id = p_user_id),
    (SELECT COALESCE(SUM(cost_usd), 0) FROM usage_metrics WHERE user_id = p_user_id),
    (SELECT COUNT(*)::INTEGER FROM usage_metrics WHERE user_id = p_user_id);
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust based on your Neon setup)
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
