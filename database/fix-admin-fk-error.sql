-- Fix Admin Account Foreign Key Error
-- Run this in Supabase SQL Editor
--
-- This script:
-- 1. Diagnoses the issue (checks if Admin is properly linked)
-- 2. Fixes the Admin account linkage
-- 3. Verifies the fix worked

-- ============================================================================
-- STEP 1: DIAGNOSE - Check current state
-- ============================================================================

DO $$
DECLARE
  admin_email TEXT := 'support@verridian.ai';
  auth_user_id UUID;
  public_user_id UUID;
  public_supabase_user_id UUID;
BEGIN
  RAISE NOTICE '=== DIAGNOSIS START ===';

  -- Check auth.users table
  SELECT id INTO auth_user_id
  FROM auth.users
  WHERE email = admin_email
  LIMIT 1;

  IF auth_user_id IS NOT NULL THEN
    RAISE NOTICE '✓ Found admin in auth.users with ID: %', auth_user_id;
  ELSE
    RAISE NOTICE '✗ Admin NOT found in auth.users';
  END IF;

  -- Check public.users table
  SELECT id, supabase_user_id INTO public_user_id, public_supabase_user_id
  FROM public.users
  WHERE email = admin_email
  LIMIT 1;

  IF public_user_id IS NOT NULL THEN
    RAISE NOTICE '✓ Found admin in public.users with ID: %', public_user_id;
    IF public_supabase_user_id IS NOT NULL THEN
      RAISE NOTICE '✓ Admin has supabase_user_id: %', public_supabase_user_id;
      IF public_supabase_user_id = auth_user_id THEN
        RAISE NOTICE '✓ LINKED CORRECTLY - supabase_user_id matches auth ID';
      ELSE
        RAISE NOTICE '✗ MISMATCH - supabase_user_id (%) does not match auth ID (%)', public_supabase_user_id, auth_user_id;
      END IF;
    ELSE
      RAISE NOTICE '✗ PROBLEM - Admin supabase_user_id is NULL';
    END IF;
  ELSE
    RAISE NOTICE '✗ Admin NOT found in public.users';
  END IF;

  RAISE NOTICE '=== DIAGNOSIS END ===';
END $$;

-- ============================================================================
-- STEP 2: FIX - Link Admin account properly
-- ============================================================================

DO $$
DECLARE
  admin_email TEXT := 'support@verridian.ai';
  auth_user_id UUID;
  public_user_exists BOOLEAN;
BEGIN
  RAISE NOTICE '=== FIX START ===';

  -- Get the auth user ID
  SELECT id INTO auth_user_id
  FROM auth.users
  WHERE email = admin_email
  LIMIT 1;

  IF auth_user_id IS NULL THEN
    RAISE NOTICE '✗ Cannot fix - Admin not found in auth.users';
    RETURN;
  END IF;

  RAISE NOTICE 'Auth user ID: %', auth_user_id;

  -- Check if public.users record exists
  SELECT EXISTS(SELECT 1 FROM public.users WHERE email = admin_email) INTO public_user_exists;

  IF public_user_exists THEN
    -- Update existing record
    UPDATE public.users
    SET supabase_user_id = auth_user_id
    WHERE email = admin_email;

    RAISE NOTICE '✓ Updated existing public.users record';
  ELSE
    -- Create new record (shouldn't happen, but just in case)
    INSERT INTO public.users (supabase_user_id, email, full_name)
    VALUES (auth_user_id, admin_email, 'Admin')
    ON CONFLICT (supabase_user_id) DO UPDATE SET email = EXCLUDED.email;

    RAISE NOTICE '✓ Created new public.users record';
  END IF;

  RAISE NOTICE '=== FIX END ===';
END $$;

-- ============================================================================
-- STEP 3: VERIFY - Check if fix worked
-- ============================================================================

DO $$
DECLARE
  admin_email TEXT := 'support@verridian.ai';
  auth_user_id UUID;
  public_supabase_user_id UUID;
BEGIN
  RAISE NOTICE '=== VERIFICATION START ===';

  -- Get auth ID
  SELECT id INTO auth_user_id
  FROM auth.users
  WHERE email = admin_email
  LIMIT 1;

  -- Get public supabase_user_id
  SELECT supabase_user_id INTO public_supabase_user_id
  FROM public.users
  WHERE email = admin_email
  LIMIT 1;

  IF auth_user_id IS NOT NULL AND public_supabase_user_id IS NOT NULL THEN
    IF auth_user_id = public_supabase_user_id THEN
      RAISE NOTICE '✅ SUCCESS - Admin account properly linked!';
      RAISE NOTICE 'Auth ID: %', auth_user_id;
      RAISE NOTICE 'Public supabase_user_id: %', public_supabase_user_id;
    ELSE
      RAISE NOTICE '✗ STILL BROKEN - IDs do not match';
      RAISE NOTICE 'Auth ID: %', auth_user_id;
      RAISE NOTICE 'Public supabase_user_id: %', public_supabase_user_id;
    END IF;
  ELSE
    RAISE NOTICE '✗ STILL BROKEN - One or both IDs are NULL';
    RAISE NOTICE 'Auth ID: %', COALESCE(auth_user_id::TEXT, 'NULL');
    RAISE NOTICE 'Public supabase_user_id: %', COALESCE(public_supabase_user_id::TEXT, 'NULL');
  END IF;

  RAISE NOTICE '=== VERIFICATION END ===';
END $$;

-- ============================================================================
-- STEP 4: Show final state
-- ============================================================================

SELECT
  '=== FINAL STATE ===' as info,
  u.email,
  u.full_name,
  u.supabase_user_id,
  au.id as auth_id,
  CASE
    WHEN u.supabase_user_id IS NULL THEN '✗ Not linked'
    WHEN u.supabase_user_id = au.id THEN '✅ Linked correctly'
    ELSE '✗ Mismatch'
  END as status
FROM public.users u
LEFT JOIN auth.users au ON au.email = u.email
WHERE u.email = 'support@verridian.ai';

-- ============================================================================
-- STEP 5: Verify trigger exists
-- ============================================================================

SELECT
  '=== TRIGGER CHECK ===' as info,
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'user_api_keys'
  AND trigger_schema = 'public'
  AND trigger_name = 'ensure_user_profile_before_api_keys';

SELECT '✅ SCRIPT COMPLETE' as status;
