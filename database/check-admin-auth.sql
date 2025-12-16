-- Check Admin Account Authentication Status
-- Run this in Supabase SQL Editor

-- ============================================================================
-- STEP 1: Check if Admin exists in auth.users
-- ============================================================================

SELECT
  '=== ADMIN AUTH STATUS ===' as info,
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at,
  CASE
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Email confirmed'
    ELSE '⚠️ Email NOT confirmed'
  END as email_status,
  CASE
    WHEN encrypted_password IS NOT NULL THEN '✅ Password set'
    ELSE '✗ No password'
  END as password_status
FROM auth.users
WHERE email = 'support@verridian.ai';

-- ============================================================================
-- STEP 2: Check public.users linkage
-- ============================================================================

SELECT
  '=== PUBLIC USER STATUS ===' as info,
  u.id as public_id,
  u.email,
  u.full_name,
  u.supabase_user_id,
  au.id as auth_id,
  CASE
    WHEN u.supabase_user_id = au.id THEN '✅ Linked correctly'
    WHEN u.supabase_user_id IS NULL THEN '✗ Not linked (NULL)'
    ELSE '✗ Mismatch'
  END as linkage_status
FROM public.users u
LEFT JOIN auth.users au ON u.email = au.email
WHERE u.email = 'support@verridian.ai';

-- ============================================================================
-- STEP 3: Instructions for password reset
-- ============================================================================

SELECT '=== NEXT STEPS ===' as info;
SELECT 'If admin exists but you cannot login, use Supabase Dashboard:' as step1;
SELECT 'Authentication → Users → Find support@verridian.ai → Reset Password' as step2;
SELECT 'Or use the Auth > Users section to send a password reset email' as step3;
