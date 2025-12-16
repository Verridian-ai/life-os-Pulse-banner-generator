-- Safe Fix for Missing User Profiles - Won't delete Admin account
-- Run this in Supabase SQL Editor

-- ============================================================================
-- 1. CHECK CURRENT TABLE STRUCTURE
-- ============================================================================

-- First, let's see what columns exist in your users table
SELECT
  'Current users table structure:' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Show current users (won't delete anything)
SELECT
  'Current users in database:' as info,
  *
FROM public.users;

-- ============================================================================
-- 2. SAFE UPDATE - Only update existing user, don't insert new
-- ============================================================================

-- Update the Admin user's supabase_user_id if it's NULL
-- This won't delete the account, just links it properly
UPDATE public.users
SET supabase_user_id = id
WHERE email = 'support@verridian.ai'
  AND supabase_user_id IS NULL;

-- ============================================================================
-- 3. VERIFICATION
-- ============================================================================

-- Verify the Admin account is still there and properly linked
SELECT
  'Admin account status:' as info,
  id,
  supabase_user_id,
  email,
  full_name,
  CASE
    WHEN supabase_user_id IS NOT NULL THEN '✅ Linked to auth'
    ELSE '❌ Not linked'
  END as status
FROM public.users
WHERE email = 'support@verridian.ai';
