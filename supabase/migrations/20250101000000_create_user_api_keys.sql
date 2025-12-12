-- ============================================================================
-- User API Keys Storage
-- ============================================================================
-- This migration creates secure storage for user API keys
-- Each user can store their own API keys for AI services

-- Create user_api_keys table
CREATE TABLE IF NOT EXISTS public.user_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT, -- For anonymous users

    -- API Keys (encrypted by Supabase)
    gemini_api_key TEXT,
    openai_api_key TEXT,
    openrouter_api_key TEXT,
    replicate_api_key TEXT,

    -- Provider preferences
    llm_provider TEXT DEFAULT 'gemini', -- 'gemini' or 'openrouter'
    voice_provider TEXT DEFAULT 'gemini', -- 'gemini' or 'openai'

    -- Model selections
    llm_model TEXT,
    llm_image_model TEXT,
    llm_upscale_model TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure one record per user OR per session
    CONSTRAINT unique_user_or_session UNIQUE NULLS NOT DISTINCT (user_id, session_id)
);

-- Create index for faster lookups
CREATE INDEX idx_user_api_keys_user_id ON public.user_api_keys(user_id);
CREATE INDEX idx_user_api_keys_session_id ON public.user_api_keys(session_id);

-- Enable Row Level Security
ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies
-- ============================================================================

-- Policy: Authenticated users can read their own keys
CREATE POLICY "Users can view their own API keys"
    ON public.user_api_keys
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy: Authenticated users can insert their own keys
CREATE POLICY "Users can insert their own API keys"
    ON public.user_api_keys
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy: Authenticated users can update their own keys
CREATE POLICY "Users can update their own API keys"
    ON public.user_api_keys
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Authenticated users can delete their own keys
CREATE POLICY "Users can delete their own API keys"
    ON public.user_api_keys
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ============================================================================
-- Anonymous User Policies (session-based)
-- ============================================================================

-- Policy: Anonymous users can read their session keys
CREATE POLICY "Anonymous users can view their session API keys"
    ON public.user_api_keys
    FOR SELECT
    TO anon
    USING (session_id IS NOT NULL);

-- Policy: Anonymous users can insert with session_id
CREATE POLICY "Anonymous users can insert session API keys"
    ON public.user_api_keys
    FOR INSERT
    TO anon
    WITH CHECK (session_id IS NOT NULL AND user_id IS NULL);

-- Policy: Anonymous users can update their session keys
CREATE POLICY "Anonymous users can update session API keys"
    ON public.user_api_keys
    FOR UPDATE
    TO anon
    USING (session_id IS NOT NULL)
    WITH CHECK (session_id IS NOT NULL AND user_id IS NULL);

-- Policy: Anonymous users can delete their session keys
CREATE POLICY "Anonymous users can delete session API keys"
    ON public.user_api_keys
    FOR DELETE
    TO anon
    USING (session_id IS NOT NULL);

-- ============================================================================
-- Trigger for updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.user_api_keys
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- Grant permissions
-- ============================================================================

GRANT ALL ON public.user_api_keys TO authenticated;
GRANT ALL ON public.user_api_keys TO anon;
GRANT ALL ON public.user_api_keys TO service_role;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE public.user_api_keys IS 'Stores user API keys for various AI services with encryption';
COMMENT ON COLUMN public.user_api_keys.user_id IS 'Foreign key to auth.users for authenticated users';
COMMENT ON COLUMN public.user_api_keys.session_id IS 'Session identifier for anonymous users';
COMMENT ON COLUMN public.user_api_keys.gemini_api_key IS 'Google Gemini API key';
COMMENT ON COLUMN public.user_api_keys.openai_api_key IS 'OpenAI API key for Realtime and GPT models';
COMMENT ON COLUMN public.user_api_keys.openrouter_api_key IS 'OpenRouter API key for multi-model access';
COMMENT ON COLUMN public.user_api_keys.replicate_api_key IS 'Replicate API key for image upscaling';
