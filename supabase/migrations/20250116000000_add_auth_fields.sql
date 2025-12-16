-- Authentication Fields Migration
-- Adds first_name, last_name, username to profiles table
-- Run this in Supabase SQL Editor BEFORE deploying code changes

-- ============================================================================
-- STEP 1: Add new columns (safe - allows NULL initially)
-- ============================================================================

DO $$
BEGIN
  -- Add first_name column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'first_name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN first_name TEXT;
    RAISE NOTICE '✓ Added first_name column';
  ELSE
    RAISE NOTICE '✓ first_name column already exists';
  END IF;

  -- Add last_name column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'last_name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN last_name TEXT;
    RAISE NOTICE '✓ Added last_name column';
  ELSE
    RAISE NOTICE '✓ last_name column already exists';
  END IF;

  -- Add username column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'username'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN username TEXT;
    RAISE NOTICE '✓ Added username column';
  ELSE
    RAISE NOTICE '✓ username column already exists';
  END IF;
END $$;

-- ============================================================================
-- STEP 2: Migrate existing full_name data
-- Split full_name into first_name and last_name for existing users
-- ============================================================================

DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.profiles
  SET
      first_name = SPLIT_PART(full_name, ' ', 1),
      last_name = CASE
          WHEN LENGTH(full_name) - LENGTH(REPLACE(full_name, ' ', '')) > 0
          THEN SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1)
          ELSE NULL
      END
  WHERE full_name IS NOT NULL AND first_name IS NULL;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE '✓ Migrated % existing users names', updated_count;
END $$;

-- ============================================================================
-- STEP 3: Generate usernames for existing users
-- Use email prefix + unique ID to avoid conflicts
-- ============================================================================

DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.profiles
  SET username = LOWER(REGEXP_REPLACE(
      CONCAT(
          COALESCE(first_name, SPLIT_PART(email, '@', 1)),
          '_',
          SUBSTRING(id::text, 1, 8)
      ),
      '[^a-z0-9_-]', '', 'g'
  ))
  WHERE username IS NULL;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE '✓ Generated usernames for % existing users', updated_count;
END $$;

-- ============================================================================
-- STEP 4: Add unique constraint on username
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
    AND contype = 'u'
    AND conname = 'profiles_username_unique'
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_username_unique UNIQUE (username);
    RAISE NOTICE '✓ Added unique constraint on username';
  ELSE
    RAISE NOTICE '✓ Unique constraint on username already exists';
  END IF;
END $$;

-- ============================================================================
-- STEP 5: Add format constraint on username
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
    AND contype = 'c'
    AND conname = 'username_format'
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT username_format CHECK (
        username ~ '^[a-zA-Z0-9_-]{3,30}$'
    );
    RAISE NOTICE '✓ Added format constraint on username';
  ELSE
    RAISE NOTICE '✓ Format constraint on username already exists';
  END IF;
END $$;

-- ============================================================================
-- STEP 6: Create index for performance
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
    AND tablename = 'profiles'
    AND indexname = 'idx_profiles_username'
  ) THEN
    CREATE INDEX idx_profiles_username ON public.profiles(username);
    RAISE NOTICE '✓ Created index on username';
  ELSE
    RAISE NOTICE '✓ Index on username already exists';
  END IF;
END $$;

-- ============================================================================
-- STEP 7: Update trigger function to handle new fields
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name, username, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        LOWER(NEW.raw_user_meta_data->>'username'),
        -- Keep full_name for backward compatibility during transition
        CONCAT(
            COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
            ' ',
            COALESCE(NEW.raw_user_meta_data->>'last_name', '')
        )
    );
    RETURN NEW;
END;
$$;

DO $$
BEGIN
  RAISE NOTICE '✓ Updated handle_new_user() trigger function';
END $$;

-- ============================================================================
-- STEP 8: Verification Queries
-- ============================================================================

SELECT
  '=== PROFILES SCHEMA ===' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name IN ('first_name', 'last_name', 'username', 'full_name')
ORDER BY ordinal_position;

SELECT
  '=== SAMPLE DATA ===' as info,
  email,
  first_name,
  last_name,
  username,
  full_name
FROM public.profiles
ORDER BY created_at DESC
LIMIT 5;

SELECT '✅ MIGRATION COMPLETE' as status;
SELECT 'Ready to deploy code changes' as next_step;
