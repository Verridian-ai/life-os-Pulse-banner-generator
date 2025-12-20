-- Migration: User Storage Buckets and Chat Persistence
-- Creates storage buckets for user data and tables for chat history

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- Create storage bucket for user chat data and exports
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('user-data', 'user-data', false, 52428800, ARRAY['application/json', 'text/plain', 'image/png', 'image/jpeg', 'image/webp']::text[]),
  ('chat-exports', 'chat-exports', false, 10485760, ARRAY['application/json', 'text/plain', 'application/pdf']::text[])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for user-data bucket (private, user-specific folders)
CREATE POLICY "Users can upload to their own folder in user-data"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-data'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own files in user-data"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user-data'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own files in user-data"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user-data'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own files in user-data"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-data'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for chat-exports bucket
CREATE POLICY "Users can upload to their own folder in chat-exports"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'chat-exports'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own files in chat-exports"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'chat-exports'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own files in chat-exports"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'chat-exports'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================================
-- CHAT CONVERSATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  mode TEXT NOT NULL DEFAULT 'design' CHECK (mode IN ('design', 'search', 'voice')),
  is_archived BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON public.chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_updated_at ON public.chat_conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_last_message ON public.chat_conversations(last_message_at DESC);

-- RLS for chat_conversations
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations"
ON public.chat_conversations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
ON public.chat_conversations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
ON public.chat_conversations FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
ON public.chat_conversations FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- CHAT MESSAGES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  -- Tool/action related fields
  tool_calls JSONB DEFAULT NULL,
  tool_results JSONB DEFAULT NULL,
  -- Image attachments (stored as URLs)
  images TEXT[] DEFAULT '{}',
  -- Generated images from this message
  generated_images TEXT[] DEFAULT '{}',
  -- Metadata for analytics
  model_used TEXT,
  tokens_used INTEGER,
  response_time_ms INTEGER,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for chat_messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);

-- RLS for chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own messages"
ON public.chat_messages FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own messages"
ON public.chat_messages FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages"
ON public.chat_messages FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages"
ON public.chat_messages FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- VOICE TRANSCRIPTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.voice_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  audio_duration_ms INTEGER,
  tool_calls JSONB DEFAULT NULL,
  provider TEXT CHECK (provider IN ('gemini', 'openai')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_voice_transcripts_user_id ON public.voice_transcripts(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_transcripts_conversation_id ON public.voice_transcripts(conversation_id);

-- RLS
ALTER TABLE public.voice_transcripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own voice transcripts"
ON public.voice_transcripts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own voice transcripts"
ON public.voice_transcripts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own voice transcripts"
ON public.voice_transcripts FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- ENHANCED USER PREFERENCES TABLE
-- ============================================================================

-- Add columns to user_preferences if they don't exist
DO $$
BEGIN
  -- Add chat preferences
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_preferences' AND column_name = 'chat_settings') THEN
    ALTER TABLE public.user_preferences ADD COLUMN chat_settings JSONB DEFAULT '{
      "auto_save": true,
      "save_images": true,
      "default_mode": "design",
      "voice_provider": "gemini",
      "auto_approve_actions": false
    }';
  END IF;

  -- Add notification preferences
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_preferences' AND column_name = 'notifications') THEN
    ALTER TABLE public.user_preferences ADD COLUMN notifications JSONB DEFAULT '{
      "email_updates": true,
      "in_app_sounds": true,
      "action_confirmations": true
    }';
  END IF;

  -- Add storage quota tracking
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_preferences' AND column_name = 'storage_used_bytes') THEN
    ALTER TABLE public.user_preferences ADD COLUMN storage_used_bytes BIGINT DEFAULT 0;
  END IF;

  -- Add last sync timestamp
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_preferences' AND column_name = 'last_sync_at') THEN
    ALTER TABLE public.user_preferences ADD COLUMN last_sync_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to update conversation's last_message_at when a new message is added
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.chat_conversations
  SET last_message_at = NEW.created_at,
      updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-updating conversation timestamp
DROP TRIGGER IF EXISTS trigger_update_conversation_last_message ON public.chat_messages;
CREATE TRIGGER trigger_update_conversation_last_message
AFTER INSERT ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_last_message();

-- Function to auto-generate conversation title from first message
CREATE OR REPLACE FUNCTION generate_conversation_title()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if it's the first user message and title is default
  IF NEW.role = 'user' THEN
    UPDATE public.chat_conversations
    SET title = LEFT(NEW.content, 50) || CASE WHEN LENGTH(NEW.content) > 50 THEN '...' ELSE '' END
    WHERE id = NEW.conversation_id
      AND title = 'New Conversation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-generating title
DROP TRIGGER IF EXISTS trigger_generate_conversation_title ON public.chat_messages;
CREATE TRIGGER trigger_generate_conversation_title
AFTER INSERT ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION generate_conversation_title();

-- Function to calculate user's storage usage
CREATE OR REPLACE FUNCTION calculate_user_storage(p_user_id UUID)
RETURNS BIGINT AS $$
DECLARE
  total_bytes BIGINT;
BEGIN
  SELECT COALESCE(SUM(file_size_bytes), 0)
  INTO total_bytes
  FROM public.images
  WHERE user_id = p_user_id;

  -- Update user preferences with new total
  UPDATE public.user_preferences
  SET storage_used_bytes = total_bytes,
      last_sync_at = NOW()
  WHERE user_id = p_user_id;

  RETURN total_bytes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.chat_conversations IS 'Stores chat conversation sessions per user';
COMMENT ON TABLE public.chat_messages IS 'Stores individual messages within conversations';
COMMENT ON TABLE public.voice_transcripts IS 'Stores voice agent transcript entries';
COMMENT ON COLUMN public.chat_messages.tool_calls IS 'JSON array of tool calls made by assistant';
COMMENT ON COLUMN public.chat_messages.tool_results IS 'JSON array of tool execution results';
COMMENT ON COLUMN public.chat_messages.generated_images IS 'URLs of images generated from this message';
