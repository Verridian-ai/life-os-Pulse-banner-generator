-- Diagnostic Script: Find and Fix Auth Triggers
-- Run this in Supabase SQL Editor to diagnose the signup issue

-- ============================================================================
-- 1. CHECK FOR TRIGGERS ON auth.users TABLE
-- ============================================================================

-- List all triggers on auth.users
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users'
ORDER BY trigger_name;

-- ============================================================================
-- 2. CHECK FOR FUNCTIONS THAT MIGHT BE CALLED BY TRIGGERS
-- ============================================================================

SELECT
    proname as function_name,
    prosrc as function_source
FROM pg_proc
WHERE proname LIKE '%user%' OR proname LIKE '%auth%'
  AND pronamespace = 'public'::regnamespace
ORDER BY proname;

-- ============================================================================
-- 3. CHECK RLS POLICIES ON public.users
-- ============================================================================

SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'users'
ORDER BY policyname;

-- ============================================================================
-- 4. FIX: DROP PROBLEMATIC TRIGGER (if it exists)
-- ============================================================================

-- Common trigger name that might be causing issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP TRIGGER IF EXISTS create_profile_for_user ON auth.users;

-- ============================================================================
-- 5. CREATE PROPER TRIGGER (if needed)
-- ============================================================================

-- Function to create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  -- Insert into public.users table
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name);

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the signup
    RAISE WARNING 'Failed to create user profile: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger on auth.users (runs after insert)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 6. GRANT NECESSARY PERMISSIONS
-- ============================================================================

-- Grant service_role permission to insert into public.users
GRANT INSERT, UPDATE ON public.users TO service_role;
GRANT INSERT, UPDATE ON public.users TO authenticator;

-- ============================================================================
-- 7. VERIFY THE FIX
-- ============================================================================

-- Check if trigger exists and is enabled
SELECT
    trigger_name,
    event_manipulation,
    action_timing,
    tgenabled
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users'
  AND trigger_name = 'on_auth_user_created';
