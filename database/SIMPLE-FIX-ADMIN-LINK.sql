-- SIMPLE FIX: Just link the Admin account (SAFEST approach)
-- Run this in Supabase SQL Editor

-- ============================================================================
-- STEP 1: Link Admin to auth (won't delete anything)
-- ============================================================================

-- Find the auth user ID for support@verridian.ai
DO $$
DECLARE
  auth_user_id UUID;
BEGIN
  -- Get the auth user ID
  SELECT id INTO auth_user_id
  FROM auth.users
  WHERE email = 'support@verridian.ai'
  LIMIT 1;

  -- Update the public.users record to link it
  IF auth_user_id IS NOT NULL THEN
    UPDATE public.users
    SET supabase_user_id = auth_user_id
    WHERE email = 'support@verridian.ai'
      AND (supabase_user_id IS NULL OR supabase_user_id != auth_user_id);

    RAISE NOTICE 'Admin account linked to auth user ID: %', auth_user_id;
  ELSE
    RAISE NOTICE 'No auth user found for support@verridian.ai';
  END IF;
END $$;

-- ============================================================================
-- STEP 2: Verify it worked
-- ============================================================================

SELECT
  '✅ VERIFICATION' as status,
  email,
  full_name,
  supabase_user_id,
  CASE
    WHEN supabase_user_id IS NOT NULL THEN '✅ Linked successfully'
    ELSE '❌ Still not linked - check auth.users table'
  END as result
FROM public.users
WHERE email = 'support@verridian.ai';

-- ============================================================================
-- STEP 3: Check if we need to add unique constraint (for future)
-- ============================================================================

-- Check if unique constraint exists
SELECT
  'Unique constraint check:' as info,
  COUNT(*) as constraint_count
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass
  AND contype = 'u'
  AND conname LIKE '%supabase_user_id%';

-- Add unique constraint if it doesn't exist (for future safety)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.users'::regclass
      AND contype = 'u'
      AND conname LIKE '%supabase_user_id%'
  ) THEN
    -- Add unique constraint on supabase_user_id
    ALTER TABLE public.users
      ADD CONSTRAINT users_supabase_user_id_unique
      UNIQUE (supabase_user_id);

    RAISE NOTICE '✅ Added unique constraint on supabase_user_id';
  ELSE
    RAISE NOTICE '✅ Unique constraint already exists';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not add unique constraint: %', SQLERRM;
END $$;
