-- STEP 1: Create profiles table (if it doesn't exist)
-- This combines the base schema + authentication fields migration
-- Run this in Supabase SQL Editor

-- ============================================================================
-- PART A: CREATE PROFILES TABLE (BASE SCHEMA)
-- ============================================================================

-- Create profiles table with base fields
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,

    -- Base fields (original schema)
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- User preferences
    default_image_quality TEXT DEFAULT '2K' CHECK (default_image_quality IN ('1K', '2K', '4K')),
    preferred_model TEXT DEFAULT 'gemini-3-pro-image-preview',

    -- Usage tracking
    images_generated INTEGER DEFAULT 0,
    storage_used_mb NUMERIC DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- ============================================================================
-- PART B: ADD NEW AUTHENTICATION FIELDS
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
-- PART C: MIGRATE EXISTING DATA
-- ============================================================================

DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Split full_name into first_name and last_name for existing users
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
-- PART D: GENERATE USERNAMES FOR EXISTING USERS
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
-- PART E: ADD CONSTRAINTS
-- ============================================================================

DO $$
BEGIN
  -- Add unique constraint on username
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

  -- Add format constraint on username
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
-- PART F: CREATE INDEXES
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
-- PART G: UPDATE TRIGGER FUNCTION
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

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

DO $$
BEGIN
  RAISE NOTICE '✓ Updated handle_new_user() trigger function';
END $$;

-- ============================================================================
-- PART H: CREATE UPDATED_AT TRIGGER (if needed)
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- ============================================================================
-- PART I: VERIFICATION QUERIES
-- ============================================================================

SELECT
  '=== PROFILES SCHEMA ===' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name IN ('first_name', 'last_name', 'username', 'full_name', 'email')
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
SELECT 'Ready to test authentication!' as next_step;
