-- Fix user_api_keys foreign key constraint issue
-- This ensures user exists in auth.users before allowing API key insertion

-- ============================================================================
-- STEP 1: Verify and fix any orphaned records
-- ============================================================================

-- Check for any orphaned records in user_api_keys that don't have matching auth.users
DO $$
DECLARE
  orphaned_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO orphaned_count
  FROM public.user_api_keys k
  LEFT JOIN auth.users u ON k.user_id = u.id
  WHERE k.user_id IS NOT NULL AND u.id IS NULL;

  IF orphaned_count > 0 THEN
    RAISE NOTICE 'Found % orphaned records in user_api_keys', orphaned_count;

    -- Delete orphaned records
    DELETE FROM public.user_api_keys k
    WHERE k.user_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM auth.users u WHERE u.id = k.user_id
    );

    RAISE NOTICE '✓ Cleaned up orphaned records';
  ELSE
    RAISE NOTICE '✓ No orphaned records found';
  END IF;
END $$;

-- ============================================================================
-- STEP 2: Add trigger to prevent insertion with invalid user_id
-- ============================================================================

CREATE OR REPLACE FUNCTION public.validate_user_api_keys_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  -- If user_id is provided, verify it exists in auth.users
  IF NEW.user_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.user_id) THEN
      RAISE EXCEPTION 'User ID % does not exist in auth.users', NEW.user_id
        USING HINT = 'Ensure the user is authenticated and exists in the system before saving API keys';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS validate_user_api_keys_before_write ON public.user_api_keys;

-- Create trigger
CREATE TRIGGER validate_user_api_keys_before_write
  BEFORE INSERT OR UPDATE ON public.user_api_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_user_api_keys_user();

DO $$
BEGIN
  RAISE NOTICE '✓ Added validation trigger for user_api_keys';
END $$;

-- ============================================================================
-- STEP 3: Ensure profiles are created before API keys (optional safeguard)
-- ============================================================================

-- This function ensures a profile exists before allowing API key insertion
CREATE OR REPLACE FUNCTION public.ensure_profile_exists()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  -- If user_id is provided and profile doesn't exist, create it
  IF NEW.user_id IS NOT NULL THEN
    -- Check if profile exists
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.user_id) THEN
      -- Get user info from auth.users
      INSERT INTO public.profiles (id, email, username)
      SELECT
        u.id,
        u.email,
        LOWER(REGEXP_REPLACE(
          CONCAT(
            COALESCE(SPLIT_PART(u.email, '@', 1), 'user'),
            '_',
            SUBSTRING(u.id::text, 1, 8)
          ),
          '[^a-z0-9_-]', '', 'g'
        ))
      FROM auth.users u
      WHERE u.id = NEW.user_id
      ON CONFLICT (id) DO NOTHING;

      RAISE NOTICE '✓ Created profile for user % before saving API keys', NEW.user_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS ensure_profile_before_api_keys ON public.user_api_keys;

-- Create trigger (runs BEFORE the validation trigger)
CREATE TRIGGER ensure_profile_before_api_keys
  BEFORE INSERT OR UPDATE ON public.user_api_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_profile_exists();

DO $$
BEGIN
  RAISE NOTICE '✓ Added profile creation safeguard trigger';
END $$;

-- ============================================================================
-- STEP 4: Verification
-- ============================================================================

-- Show current triggers on user_api_keys
SELECT
  '=== TRIGGERS ON user_api_keys ===' as info,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'user_api_keys'
  AND trigger_schema = 'public'
ORDER BY action_order;

-- Show sample data
SELECT
  '=== SAMPLE user_api_keys DATA ===' as info,
  k.user_id,
  k.session_id,
  k.llm_provider,
  CASE WHEN k.gemini_api_key IS NOT NULL THEN '✓' ELSE '✗' END as has_gemini,
  CASE WHEN k.openrouter_api_key IS NOT NULL THEN '✓' ELSE '✗' END as has_openrouter,
  k.created_at
FROM public.user_api_keys k
ORDER BY k.created_at DESC
LIMIT 5;

SELECT '✅ FIX COMPLETE' as status;
SELECT 'user_api_keys table now has validation and safeguards' as next_step;
