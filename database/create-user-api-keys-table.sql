-- Create user_api_keys table for settings storage
-- This table was missing from the initial schema

-- Drop existing table if it exists (to recreate with correct structure)
DROP TABLE IF EXISTS user_api_keys CASCADE;

-- Create user_api_keys table
CREATE TABLE user_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT UNIQUE,  -- For anonymous users
  gemini_api_key TEXT,
  openrouter_api_key TEXT,
  replicate_api_key TEXT,
  llm_provider TEXT DEFAULT 'openrouter',
  llm_model TEXT,
  llm_image_model TEXT,
  llm_upscale_model TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  -- Ensure either user_id OR session_id is set (but not both)
  CONSTRAINT user_or_session CHECK (
    (user_id IS NOT NULL AND session_id IS NULL) OR
    (user_id IS NULL AND session_id IS NOT NULL)
  )
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_api_keys_user_id ON user_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_api_keys_session_id ON user_api_keys(session_id);

-- Create updated_at trigger
DROP TRIGGER IF EXISTS update_user_api_keys_updated_at ON user_api_keys;
CREATE TRIGGER update_user_api_keys_updated_at
  BEFORE UPDATE ON user_api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only access their own API keys
CREATE POLICY "Users can view own API keys"
  ON user_api_keys FOR SELECT
  USING (
    user_id = (SELECT auth.uid()) OR
    session_id = current_setting('request.jwt.claims', true)::json->>'session_id'
  );

CREATE POLICY "Users can insert own API keys"
  ON user_api_keys FOR INSERT
  WITH CHECK (
    user_id = (SELECT auth.uid()) OR
    session_id IS NOT NULL
  );

CREATE POLICY "Users can update own API keys"
  ON user_api_keys FOR UPDATE
  USING (
    user_id = (SELECT auth.uid()) OR
    session_id = current_setting('request.jwt.claims', true)::json->>'session_id'
  );

CREATE POLICY "Users can delete own API keys"
  ON user_api_keys FOR DELETE
  USING (
    user_id = (SELECT auth.uid()) OR
    session_id = current_setting('request.jwt.claims', true)::json->>'session_id'
  );

-- Grant permissions
GRANT ALL ON user_api_keys TO service_role;
GRANT ALL ON user_api_keys TO postgres;
GRANT ALL ON user_api_keys TO authenticated;
GRANT ALL ON user_api_keys TO anon;

-- Verify table creation
SELECT
  'user_api_keys table created successfully!' as status,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name = 'user_api_keys';
