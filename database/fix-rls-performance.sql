-- Supabase RLS Performance & Security Fixes
-- Run this after running schema.sql to optimize RLS policies

-- ============================================================================
-- 1. DROP ALL EXISTING RLS POLICIES (to recreate them optimized)
-- ============================================================================

-- Users table policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Designs table policies
DROP POLICY IF EXISTS "Users can view own designs" ON designs;
DROP POLICY IF EXISTS "Users can view public designs" ON designs;
DROP POLICY IF EXISTS "Users can insert own designs" ON designs;
DROP POLICY IF EXISTS "Users can update own designs" ON designs;
DROP POLICY IF EXISTS "Users can delete own designs" ON designs;

-- Brand profiles policies
DROP POLICY IF EXISTS "Users can manage own brand profiles" ON brand_profiles;

-- Usage metrics policies
DROP POLICY IF EXISTS "Users can view own metrics" ON usage_metrics;
DROP POLICY IF EXISTS "Users can insert own metrics" ON usage_metrics;

-- Reference images policies
DROP POLICY IF EXISTS "Users can manage own reference images" ON reference_images;

-- User preferences policies
DROP POLICY IF EXISTS "Users can manage own preferences" ON user_preferences;

-- User API keys policies (if table exists)
DROP POLICY IF EXISTS "Users can view their own API keys" ON user_api_keys;
DROP POLICY IF EXISTS "Users can insert their own API keys" ON user_api_keys;
DROP POLICY IF EXISTS "Users can update their own API keys" ON user_api_keys;
DROP POLICY IF EXISTS "Users can delete their own API keys" ON user_api_keys;

-- Images table policies (if table exists)
DROP POLICY IF EXISTS "Users can view own images" ON images;
DROP POLICY IF EXISTS "Users can insert own images" ON images;
DROP POLICY IF EXISTS "Users can update own images" ON images;
DROP POLICY IF EXISTS "Users can delete own images" ON images;

-- ============================================================================
-- 2. ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;

-- Enable RLS on other tables if they exist
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'brand_profiles') THEN
        ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'usage_metrics') THEN
        ALTER TABLE usage_metrics ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reference_images') THEN
        ALTER TABLE reference_images ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_api_keys') THEN
        ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'images') THEN
        ALTER TABLE images ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- ============================================================================
-- 3. CREATE OPTIMIZED RLS POLICIES (with SELECT auth.uid())
-- ============================================================================

-- Users table policies - OPTIMIZED
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = (SELECT auth.uid()));

-- Designs table policies - OPTIMIZED (consolidated SELECT policies)
CREATE POLICY "Users can view designs"
  ON designs FOR SELECT
  USING (
    user_id = (SELECT auth.uid()) OR is_public = true
  );

CREATE POLICY "Users can insert own designs"
  ON designs FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own designs"
  ON designs FOR UPDATE
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own designs"
  ON designs FOR DELETE
  USING (user_id = (SELECT auth.uid()));

-- User preferences policies - OPTIMIZED
CREATE POLICY "Users can manage own preferences"
  ON user_preferences FOR ALL
  USING (user_id = (SELECT auth.uid()));

-- Generated images policies - NEW (RLS was missing!)
CREATE POLICY "Users can view own generated images"
  ON generated_images FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own generated images"
  ON generated_images FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own generated images"
  ON generated_images FOR DELETE
  USING (user_id = (SELECT auth.uid()));

-- Brand profiles policies - OPTIMIZED (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'brand_profiles') THEN
        EXECUTE 'CREATE POLICY "Users can manage own brand profiles"
          ON brand_profiles FOR ALL
          USING (user_id = (SELECT auth.uid()))';
    END IF;
END $$;

-- Usage metrics policies - OPTIMIZED (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'usage_metrics') THEN
        EXECUTE 'CREATE POLICY "Users can view own metrics"
          ON usage_metrics FOR SELECT
          USING (user_id = (SELECT auth.uid()))';

        EXECUTE 'CREATE POLICY "Users can insert own metrics"
          ON usage_metrics FOR INSERT
          WITH CHECK (user_id = (SELECT auth.uid()))';
    END IF;
END $$;

-- Reference images policies - OPTIMIZED (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reference_images') THEN
        EXECUTE 'CREATE POLICY "Users can manage own reference images"
          ON reference_images FOR ALL
          USING (user_id = (SELECT auth.uid()))';
    END IF;
END $$;

-- User API keys policies - OPTIMIZED (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_api_keys') THEN
        EXECUTE 'CREATE POLICY "Users can view own API keys"
          ON user_api_keys FOR SELECT
          USING (user_id = (SELECT auth.uid()))';

        EXECUTE 'CREATE POLICY "Users can insert own API keys"
          ON user_api_keys FOR INSERT
          WITH CHECK (user_id = (SELECT auth.uid()))';

        EXECUTE 'CREATE POLICY "Users can update own API keys"
          ON user_api_keys FOR UPDATE
          USING (user_id = (SELECT auth.uid()))';

        EXECUTE 'CREATE POLICY "Users can delete own API keys"
          ON user_api_keys FOR DELETE
          USING (user_id = (SELECT auth.uid()))';
    END IF;
END $$;

-- Images table policies - OPTIMIZED (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'images') THEN
        EXECUTE 'CREATE POLICY "Users can view own images"
          ON images FOR SELECT
          USING (user_id = (SELECT auth.uid()))';

        EXECUTE 'CREATE POLICY "Users can insert own images"
          ON images FOR INSERT
          WITH CHECK (user_id = (SELECT auth.uid()))';

        EXECUTE 'CREATE POLICY "Users can update own images"
          ON images FOR UPDATE
          USING (user_id = (SELECT auth.uid()))';

        EXECUTE 'CREATE POLICY "Users can delete own images"
          ON images FOR DELETE
          USING (user_id = (SELECT auth.uid()))';
    END IF;
END $$;

-- ============================================================================
-- 4. FIX FUNCTION SECURITY (search_path issues)
-- ============================================================================

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- Fix handle_updated_at function (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_proc WHERE proname = 'handle_updated_at') THEN
        EXECUTE '
        CREATE OR REPLACE FUNCTION handle_updated_at()
        RETURNS TRIGGER
        SECURITY DEFINER
        SET search_path = public
        LANGUAGE plpgsql AS $func$
        BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
        END;
        $func$';
    END IF;
END $$;

-- Fix handle_new_user function (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_proc WHERE proname = 'handle_new_user') THEN
        EXECUTE '
        CREATE OR REPLACE FUNCTION handle_new_user()
        RETURNS TRIGGER
        SECURITY DEFINER
        SET search_path = public
        LANGUAGE plpgsql AS $func$
        BEGIN
          INSERT INTO public.users (id, email, full_name)
          VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>''name'')
          ON CONFLICT (id) DO NOTHING;
          RETURN NEW;
        END;
        $func$';
    END IF;
END $$;

-- Fix get_user_stats function (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_proc WHERE proname = 'get_user_stats') THEN
        EXECUTE '
        CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
        RETURNS TABLE(
          total_designs INTEGER,
          total_brand_profiles INTEGER,
          total_reference_images INTEGER,
          total_cost_usd DECIMAL,
          total_operations INTEGER
        )
        SECURITY DEFINER
        SET search_path = public
        LANGUAGE plpgsql AS $func$
        BEGIN
          RETURN QUERY
          SELECT
            (SELECT COUNT(*)::INTEGER FROM public.designs WHERE user_id = p_user_id),
            (SELECT COUNT(*)::INTEGER FROM public.brand_profiles WHERE user_id = p_user_id),
            (SELECT COUNT(*)::INTEGER FROM public.reference_images WHERE user_id = p_user_id),
            (SELECT COALESCE(SUM(cost_usd), 0) FROM public.usage_metrics WHERE user_id = p_user_id),
            (SELECT COUNT(*)::INTEGER FROM public.usage_metrics WHERE user_id = p_user_id);
        END;
        $func$';
    END IF;
END $$;

-- Fix increment_view_count function (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_proc WHERE proname = 'increment_view_count') THEN
        EXECUTE '
        CREATE OR REPLACE FUNCTION increment_view_count(design_id UUID)
        RETURNS void
        SECURITY DEFINER
        SET search_path = public
        LANGUAGE plpgsql AS $func$
        BEGIN
          UPDATE public.designs
          SET view_count = view_count + 1
          WHERE id = design_id;
        END;
        $func$';
    END IF;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these queries to verify the fixes worked:

-- 1. Check RLS is enabled on all tables
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;

-- 2. Check all policies use optimized auth.uid()
-- SELECT schemaname, tablename, policyname, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;

-- 3. Check functions have proper security settings
-- SELECT proname, prosecdef, proconfig
-- FROM pg_proc
-- WHERE pronamespace = 'public'::regnamespace
-- ORDER BY proname;
