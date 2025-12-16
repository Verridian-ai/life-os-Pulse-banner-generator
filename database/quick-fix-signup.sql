-- QUICK FIX: Disable problematic auth triggers
-- Run this in Supabase SQL Editor to fix "Database error saving new user"

-- ============================================================================
-- OPTION 1: DISABLE ALL AUTH TRIGGERS (Quick Fix)
-- ============================================================================

-- Drop any existing triggers on auth.users that might be failing
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP TRIGGER IF EXISTS create_profile_for_user ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_trigger ON auth.users;

-- ============================================================================
-- OPTION 2: CREATE SAFE TRIGGER WITH ERROR HANDLING
-- ============================================================================

-- Function with proper error handling (won't fail signup)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  -- Try to insert into public.users, but don't fail if it errors
  BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'fullName'
      )
    )
    ON CONFLICT (id) DO UPDATE
    SET
      email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, public.users.full_name);
  EXCEPTION
    WHEN OTHERS THEN
      -- Log error but continue (don't block signup)
      RAISE WARNING 'handle_new_user failed: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- Create trigger (runs AFTER insert so it won't block auth)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Ensure service_role can insert into users table
GRANT ALL ON public.users TO service_role;
GRANT ALL ON public.users TO postgres;

-- ============================================================================
-- VERIFY
-- ============================================================================

SELECT
    'Trigger check:' as info,
    COUNT(*) as trigger_count
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users';
