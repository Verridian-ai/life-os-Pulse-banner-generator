-- FINAL FIX: Link Admin Account to Auth (SAFE - Won't Delete Anything)
-- Run this in Supabase SQL Editor after running diagnose-users-table.sql

-- ============================================================================
-- STEP 1: Link the Admin account to auth.users
-- ============================================================================

-- This updates the Admin account to link it to the auth account
-- It won't delete or overwrite anything, just fills in the missing link
UPDATE public.users
SET supabase_user_id = (
  SELECT id FROM auth.users WHERE email = 'support@verridian.ai' LIMIT 1
)
WHERE email = 'support@verridian.ai'
  AND supabase_user_id IS NULL;

-- ============================================================================
-- STEP 2: Create profiles for any other auth users without profiles
-- ============================================================================

-- This only creates NEW profiles for auth users that don't have any profile yet
-- It won't touch the Admin account
INSERT INTO public.users (supabase_user_id, email, full_name, created_at, updated_at)
SELECT
  au.id as supabase_user_id,
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
  SELECT 1 FROM public.users pu
  WHERE pu.supabase_user_id = au.id OR pu.email = au.email
)
ON CONFLICT (supabase_user_id) DO NOTHING;

-- ============================================================================
-- STEP 3: Verification
-- ============================================================================

-- Check the Admin account
SELECT
  '✅ ADMIN ACCOUNT STATUS' as status,
  id,
  supabase_user_id,
  email,
  full_name,
  subscription_tier,
  CASE
    WHEN supabase_user_id IS NOT NULL THEN '✅ Properly linked to auth'
    ELSE '❌ Still not linked'
  END as link_status
FROM public.users
WHERE email = 'support@verridian.ai';

-- Check all users
SELECT
  '📋 ALL USERS' as status,
  pu.email,
  pu.full_name,
  CASE
    WHEN pu.supabase_user_id IS NOT NULL THEN '✅ Linked'
    ELSE '❌ Not linked'
  END as status,
  CASE
    WHEN au.id IS NOT NULL THEN '✅ Auth exists'
    ELSE '❌ No auth'
  END as auth_status
FROM public.users pu
LEFT JOIN auth.users au ON pu.supabase_user_id = au.id
ORDER BY pu.created_at;

-- Check if we can now save settings
SELECT
  '🔑 USER_API_KEYS CHECK' as status,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables WHERE table_name = 'user_api_keys'
    ) THEN '✅ Table exists'
    ELSE '❌ Table missing - run URGENT-FIX-SCHEMA.sql first'
  END as table_status;
