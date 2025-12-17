-- Add missing llm_magic_edit_model column to user_api_keys table
-- This column is referenced in the codebase but was never added to the schema

ALTER TABLE public.user_api_keys
ADD COLUMN IF NOT EXISTS llm_magic_edit_model TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.user_api_keys.llm_magic_edit_model IS 'Model selection for magic edit operations';

-- Verify the column was added
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'user_api_keys'
    AND column_name = 'llm_magic_edit_model'
  ) THEN
    RAISE NOTICE '✓ llm_magic_edit_model column added successfully';
  ELSE
    RAISE EXCEPTION '✗ Failed to add llm_magic_edit_model column';
  END IF;
END $$;

SELECT '✅ MIGRATION COMPLETE' as status;
SELECT 'user_api_keys table now supports all model configuration fields' as next_step;
