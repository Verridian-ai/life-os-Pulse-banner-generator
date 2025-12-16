-- Diagnose Users Table Structure
-- Run this FIRST to understand your table structure

-- ============================================================================
-- 1. CHECK TABLE STRUCTURE
-- ============================================================================

SELECT
  '=== USERS TABLE STRUCTURE ===' as section,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- ============================================================================
-- 2. CHECK CONSTRAINTS
-- ============================================================================

SELECT
  '=== CONSTRAINTS ===' as section,
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass;

-- ============================================================================
-- 3. SHOW CURRENT DATA
-- ============================================================================

SELECT
  '=== CURRENT USERS ===' as section,
  *
FROM public.users;

-- ============================================================================
-- 4. CHECK AUTH USERS
-- ============================================================================

SELECT
  '=== AUTH USERS ===' as section,
  id,
  email,
  created_at
FROM auth.users;

-- ============================================================================
-- 5. COMPARE AUTH VS PUBLIC USERS
-- ============================================================================

SELECT
  '=== COMPARISON ===' as section,
  au.id as auth_id,
  au.email as auth_email,
  pu.id as public_id,
  pu.supabase_user_id as public_supabase_user_id,
  pu.email as public_email,
  CASE
    WHEN pu.id IS NULL THEN '❌ No profile'
    WHEN pu.supabase_user_id IS NULL THEN '⚠️ Profile exists but not linked'
    ELSE '✅ Properly linked'
  END as status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.supabase_user_id OR au.id = pu.id;
