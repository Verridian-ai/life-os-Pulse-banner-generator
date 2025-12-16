-- Add Missing Columns to Users Table
-- Run this in Supabase SQL Editor to fix PGRST204 error

-- Add full_name column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users'
    AND column_name = 'full_name'
  ) THEN
    ALTER TABLE users ADD COLUMN full_name VARCHAR(255);
    RAISE NOTICE 'Added full_name column to users table';
  ELSE
    RAISE NOTICE 'full_name column already exists';
  END IF;
END $$;

-- Add avatar_url column if it doesn't exist (for future use)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users'
    AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE users ADD COLUMN avatar_url TEXT;
    RAISE NOTICE 'Added avatar_url column to users table';
  ELSE
    RAISE NOTICE 'avatar_url column already exists';
  END IF;
END $$;

-- Add is_pro column if it doesn't exist (for future use)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users'
    AND column_name = 'is_pro'
  ) THEN
    ALTER TABLE users ADD COLUMN is_pro BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Added is_pro column to users table';
  ELSE
    RAISE NOTICE 'is_pro column already exists';
  END IF;
END $$;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- Verify all columns exist
SELECT
  'Users table columns:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
