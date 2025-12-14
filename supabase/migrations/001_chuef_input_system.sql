-- ============================================
-- CHUEF UNIVERSAL INPUT INGESTION SYSTEM
-- ============================================
-- This schema implements the two-layer storage model:
-- 1. Universal ledger (inputs) - stores ALL input with embeddings
-- 2. Domain tables (chat_messages, contact_submissions) - reference inputs

-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- UNIVERSAL INPUT LEDGER
-- ============================================
CREATE TABLE IF NOT EXISTS inputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  kind TEXT NOT NULL CHECK (kind IN ('chat_message', 'contact_submission')),
  text TEXT NOT NULL,
  embedding vector(1536),
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for vector similarity search
CREATE INDEX IF NOT EXISTS inputs_embedding_idx ON inputs 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Index for filtering by kind
CREATE INDEX IF NOT EXISTS inputs_kind_idx ON inputs (kind);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS inputs_user_id_idx ON inputs (user_id);

-- ============================================
-- CHAT MESSAGES (Domain Table)
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  input_id UUID NOT NULL REFERENCES inputs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  room TEXT NOT NULL DEFAULT 'lobby',
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for room queries
CREATE INDEX IF NOT EXISTS chat_messages_room_idx ON chat_messages (room, created_at DESC);

-- Index for user message history
CREATE INDEX IF NOT EXISTS chat_messages_user_id_idx ON chat_messages (user_id);

-- ============================================
-- CONTACT SUBMISSIONS (Domain Table)
-- ============================================
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  input_id UUID NOT NULL REFERENCES inputs(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS contact_submissions_email_idx ON contact_submissions (email);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- INPUTS TABLE POLICIES
-- ============================================

-- Public can read chat_message inputs (for realtime)
CREATE POLICY "Public can read chat inputs"
  ON inputs FOR SELECT
  USING (kind = 'chat_message');

-- Authenticated users can insert their own inputs
CREATE POLICY "Auth users can insert own inputs"
  ON inputs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role bypasses RLS (for API ingest)
-- Note: Service role automatically bypasses RLS

-- ============================================
-- CHAT_MESSAGES TABLE POLICIES
-- ============================================

-- Public can read all chat messages (the lobby is public)
CREATE POLICY "Public can read chat messages"
  ON chat_messages FOR SELECT
  USING (true);

-- Authenticated users can insert their own messages
CREATE POLICY "Auth users can insert own chat messages"
  ON chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- CONTACT_SUBMISSIONS TABLE POLICIES
-- ============================================

-- Contact submissions are NOT publicly readable
-- Only service role can read (for admin purposes)

-- Anyone can insert contact submissions (even anonymous)
CREATE POLICY "Anyone can insert contact submissions"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

-- ============================================
-- REALTIME SETUP
-- ============================================

-- Enable realtime for chat_messages table
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- ============================================
-- HELPER FUNCTION: Semantic Search
-- ============================================
CREATE OR REPLACE FUNCTION match_inputs(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10,
  filter_kind TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  kind TEXT,
  text TEXT,
  meta JSONB,
  similarity FLOAT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    inputs.id,
    inputs.user_id,
    inputs.kind,
    inputs.text,
    inputs.meta,
    1 - (inputs.embedding <=> query_embedding) AS similarity,
    inputs.created_at
  FROM inputs
  WHERE 
    (filter_kind IS NULL OR inputs.kind = filter_kind)
    AND 1 - (inputs.embedding <=> query_embedding) > match_threshold
  ORDER BY inputs.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================
-- VIEW: Chat messages with user info
-- ============================================
CREATE OR REPLACE VIEW chat_messages_with_user AS
SELECT 
  cm.id,
  cm.input_id,
  cm.user_id,
  cm.room,
  cm.text,
  cm.created_at,
  COALESCE(
    raw_user_meta_data->>'full_name',
    raw_user_meta_data->>'name',
    split_part(u.email, '@', 1)
  ) AS display_name,
  raw_user_meta_data->>'avatar_url' AS avatar_url
FROM chat_messages cm
LEFT JOIN auth.users u ON cm.user_id = u.id;

-- Grant access to the view
GRANT SELECT ON chat_messages_with_user TO anon, authenticated;
