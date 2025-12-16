-- Fix Missing User Profile - Creates profiles for existing auth users
-- Run this in Supabase SQL Editor

-- ============================================================================
-- 1. FIRST: Run URGENT-FIX-SCHEMA.sql if you haven't already
-- ============================================================================

-- This ensures the users table has all required columns
-- Copy and run URGENT-FIX-SCHEMA.sql first if you get errors

-- ============================================================================
-- 2. CREATE MISSING USER PROFILES
-- ============================================================================

-- This will create user profiles for any auth users that don't have profiles yet
INSERT INTO public.users (id, email, full_name, created_at, updated_at)
SELECT
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'name',
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'fullName'
  ) as full_name,
  au.created_at,
  au.updated_at
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.id = au.id
);

-- Show how many profiles were created
SELECT
  'User profiles created:' as status,
  COUNT(*) as count
FROM auth.users au
WHERE EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.id = au.id
);

-- ============================================================================
-- 3. FIX THE AUTH TRIGGER (Safe version that won't fail)
-- ============================================================================

-- Drop any existing problematic triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP TRIGGER IF EXISTS create_profile_for_user ON auth.users;

-- Create a safe function that won't block signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  -- Try to insert into public.users, but don't fail if it errors
  BEGIN
    INSERT INTO public.users (id, email, full_name, created_at, updated_at)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'fullName'
      ),
      NEW.created_at,
      NEW.updated_at
    )
    ON CONFLICT (id) DO UPDATE
    SET
      email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
      updated_at = EXCLUDED.updated_at;
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

-- Grant necessary permissions
GRANT INSERT, UPDATE ON public.users TO service_role;
GRANT INSERT, UPDATE ON public.users TO authenticator;
GRANT ALL ON public.users TO postgres;

-- ============================================================================
-- 4. VERIFICATION
-- ============================================================================

-- Check that all auth users now have profiles
SELECT
  'VERIFICATION - Auth users vs User profiles:' as check_type,
  (SELECT COUNT(*) FROM auth.users) as auth_users_count,
  (SELECT COUNT(*) FROM public.users) as user_profiles_count,
  CASE
    WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM public.users)
    THEN '✅ All users have profiles'
    ELSE '❌ Some users missing profiles - run script again'
  END as status;

-- Show current user profiles
SELECT
  'Current user profiles:' as info,
  id,
  email,
  full_name,
  created_at
FROM public.users
ORDER BY created_at DESC;
