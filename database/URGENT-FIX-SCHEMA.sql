-- URGENT: Fix Missing Columns and Schema Issues
-- Run this IMMEDIATELY in Supabase SQL Editor to fix current errors
--
-- Fixes:
-- - PGRST204: Could not find the 'full_name' column
-- - 406 errors on users and user_api_keys tables
-- - Missing columns in users table

-- ============================================================================
-- 1. FIX USERS TABLE
-- ============================================================================

-- Add missing columns to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS full_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT FALSE;

-- ============================================================================
-- 2. VERIFY USER_API_KEYS TABLE EXISTS
-- ============================================================================

-- Check if user_api_keys table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'user_api_keys'
  ) THEN
    RAISE NOTICE 'Creating user_api_keys table...';

    -- Create the table (from create-user-api-keys-table.sql)
    CREATE TABLE user_api_keys (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      session_id TEXT UNIQUE,
      gemini_api_key TEXT,
      openrouter_api_key TEXT,
      replicate_api_key TEXT,
      llm_provider TEXT DEFAULT 'openrouter',
      llm_model TEXT,
      llm_image_model TEXT,
      llm_upscale_model TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT user_or_session CHECK (
        (user_id IS NOT NULL AND session_id IS NULL) OR
        (user_id IS NULL AND session_id IS NOT NULL)
      )
    );

    -- Create indexes
    CREATE INDEX idx_user_api_keys_user_id ON user_api_keys(user_id);
    CREATE INDEX idx_user_api_keys_session_id ON user_api_keys(session_id);

    -- Enable RLS
    ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;

    -- Create RLS policies
    CREATE POLICY "Users can view own API keys"
      ON user_api_keys FOR SELECT
      USING (
        user_id = (SELECT auth.uid()) OR
        session_id = current_setting('request.jwt.claims', true)::json->>'session_id'
      );

    CREATE POLICY "Users can insert own API keys"
      ON user_api_keys FOR INSERT
      WITH CHECK (
        user_id = (SELECT auth.uid()) OR
        session_id IS NOT NULL
      );

    CREATE POLICY "Users can update own API keys"
      ON user_api_keys FOR UPDATE
      USING (
        user_id = (SELECT auth.uid()) OR
        session_id = current_setting('request.jwt.claims', true)::json->>'session_id'
      );

    CREATE POLICY "Users can delete own API keys"
      ON user_api_keys FOR DELETE
      USING (
        user_id = (SELECT auth.uid()) OR
        session_id = current_setting('request.jwt.claims', true)::json->>'session_id'
      );

    -- Grant permissions
    GRANT ALL ON user_api_keys TO service_role;
    GRANT ALL ON user_api_keys TO postgres;
    GRANT ALL ON user_api_keys TO authenticated;
    GRANT ALL ON user_api_keys TO anon;

    RAISE NOTICE 'user_api_keys table created successfully';
  ELSE
    RAISE NOTICE 'user_api_keys table already exists';
  END IF;
END $$;

-- ============================================================================
-- 3. REFRESH SCHEMA CACHE
-- ============================================================================

-- This forces PostgREST to reload the schema and fixes 406 errors
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- 4. VERIFICATION
-- ============================================================================

-- Verify users table columns
SELECT
  'USERS TABLE:' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Verify user_api_keys table exists
SELECT
  'USER_API_KEYS TABLE:' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_api_keys'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT
  'RLS POLICIES:' as info,
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('users', 'user_api_keys')
ORDER BY tablename, policyname;
