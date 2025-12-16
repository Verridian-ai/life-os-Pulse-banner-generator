-- Settings Overhaul Schema Migration
-- Run this in Supabase SQL Editor BEFORE deploying code changes
--
-- This migration:
-- 1. Adds llm_magic_edit_model column to user_api_keys table
-- 2. Creates safety trigger to auto-create user profiles
-- 3. Fixes foreign key constraint issues
--
-- Safe to run multiple times (uses IF NOT EXISTS / IF EXISTS checks)

-- ============================================================================
-- 1. ADD MAGIC EDIT MODEL COLUMN
-- ============================================================================

ALTER TABLE public.user_api_keys
ADD COLUMN IF NOT EXISTS llm_magic_edit_model TEXT;

RAISE NOTICE '✓ Added llm_magic_edit_model column';

-- ============================================================================
-- 2. SET DEFAULT FOR EXISTING ROWS
-- ============================================================================

-- Use image_model as default for magic edit (same model by default)
UPDATE public.user_api_keys
SET llm_magic_edit_model = llm_image_model
WHERE llm_magic_edit_model IS NULL AND llm_image_model IS NOT NULL;

RAISE NOTICE '✓ Set defaults for existing rows';

-- ============================================================================
-- 3. CREATE USER PROFILE SAFETY TRIGGER
-- ============================================================================

-- This function ensures a user profile exists in public.users before
-- saving API keys. Prevents foreign key constraint errors.
CREATE OR REPLACE FUNCTION public.ensure_user_profile()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  -- Only for authenticated users (not anonymous sessions)
  IF NEW.user_id IS NOT NULL THEN
    -- Try to create user profile if it doesn't exist
    BEGIN
      INSERT INTO public.users (supabase_user_id, email)
      SELECT NEW.user_id, email
      FROM auth.users WHERE id = NEW.user_id
      ON CONFLICT (supabase_user_id) DO NOTHING;

      RAISE NOTICE 'User profile ensured for user_id: %', NEW.user_id;
    EXCEPTION
      WHEN OTHERS THEN
        -- Log error but don't block the API key save
        RAISE WARNING 'Failed to ensure user profile: %', SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS ensure_user_profile_before_api_keys ON public.user_api_keys;

-- Create trigger (runs BEFORE INSERT OR UPDATE)
CREATE TRIGGER ensure_user_profile_before_api_keys
  BEFORE INSERT OR UPDATE ON public.user_api_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_user_profile();

RAISE NOTICE '✓ Created user profile safety trigger';

-- ============================================================================
-- 4. GRANT PERMISSIONS (if needed)
-- ============================================================================

-- Ensure service_role and postgres have full access
GRANT ALL ON public.user_api_keys TO service_role;
GRANT ALL ON public.user_api_keys TO postgres;

-- Authenticated and anon roles should already have access via RLS
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_api_keys TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_api_keys TO anon;

RAISE NOTICE '✓ Granted permissions';

-- ============================================================================
-- 5. VERIFY SCHEMA
-- ============================================================================

SELECT
  '=== USER_API_KEYS SCHEMA ===' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_api_keys'
ORDER BY ordinal_position;

-- ============================================================================
-- 6. VERIFY TRIGGER
-- ============================================================================

SELECT
  '=== TRIGGERS ===' as info,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'user_api_keys'
  AND trigger_schema = 'public';

-- ============================================================================
-- 7. TEST THE TRIGGER
-- ============================================================================

-- You can test the trigger by checking if it works:
-- SELECT public.ensure_user_profile();

SELECT '✅ MIGRATION COMPLETE' as status;
SELECT 'Ready to deploy code changes' as next_step;
