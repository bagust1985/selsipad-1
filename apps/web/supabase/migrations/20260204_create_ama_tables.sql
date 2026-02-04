-- =============================================
-- AMA Requests Table
-- Stores developer AMA request submissions
-- Run this migration in Supabase SQL Editor
-- =============================================

CREATE TABLE IF NOT EXISTS ama_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Developer & Project
  developer_id UUID REFERENCES auth.users(id) NOT NULL,
  project_id UUID REFERENCES projects(id) NOT NULL,
  project_name TEXT NOT NULL,
  
  -- Schedule (set by developer)
  scheduled_at TIMESTAMPTZ NOT NULL,
  
  -- Content (displayed to investors)
  description TEXT NOT NULL,
  
  -- Payment tracking
  payment_tx_hash TEXT NOT NULL,
  payment_amount_bnb NUMERIC NOT NULL,
  request_id_bytes32 TEXT NOT NULL, -- For contract lookup/refund
  chain_id INTEGER DEFAULT 97, -- BSC Testnet
  
  -- Status workflow: PENDING -> PINNED/REJECTED -> LIVE -> ENDED
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PINNED', 'REJECTED', 'LIVE', 'ENDED')),
  
  -- Admin actions
  is_pinned BOOLEAN DEFAULT FALSE,
  pinned_at TIMESTAMPTZ,
  pinned_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  refund_tx_hash TEXT,
  
  -- AMA session timing
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX idx_ama_requests_status ON ama_requests(status);
CREATE INDEX idx_ama_requests_pinned ON ama_requests(is_pinned, scheduled_at);
CREATE INDEX idx_ama_requests_developer ON ama_requests(developer_id);

-- Enable RLS
ALTER TABLE ama_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can read pinned/live AMAs
CREATE POLICY "Public read pinned and live AMAs"
  ON ama_requests FOR SELECT
  USING (status IN ('PINNED', 'LIVE', 'ENDED'));

-- Developers can read their own requests
CREATE POLICY "Developers read own requests"
  ON ama_requests FOR SELECT
  USING (developer_id = auth.uid());

-- Developers can insert their own requests
CREATE POLICY "Developers insert own requests"
  ON ama_requests FOR INSERT
  WITH CHECK (developer_id = auth.uid());

COMMENT ON TABLE ama_requests IS 'Developer AMA request submissions with payment tracking';

-- =============================================
-- AMA Messages Table (Live Chat)
-- Real-time chat during AMA sessions
-- =============================================

CREATE TABLE IF NOT EXISTS ama_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ama_id UUID REFERENCES ama_requests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Message content
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'USER' CHECK (message_type IN ('USER', 'DEVELOPER', 'SYSTEM', 'PINNED')),
  
  -- Denormalized user info for speed
  username TEXT,
  avatar_url TEXT,
  is_developer BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  
  -- Moderation
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_by UUID REFERENCES auth.users(id),
  is_pinned_message BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast queries
CREATE INDEX idx_ama_messages_ama_id ON ama_messages(ama_id, created_at);
CREATE INDEX idx_ama_messages_pinned ON ama_messages(ama_id, is_pinned_message) WHERE is_pinned_message = TRUE;

-- Enable RLS
ALTER TABLE ama_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can read messages from live/ended AMAs
CREATE POLICY "Public read AMA messages"
  ON ama_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ama_requests 
      WHERE ama_requests.id = ama_messages.ama_id 
      AND ama_requests.status IN ('LIVE', 'ENDED')
    )
  );

-- Authenticated users can insert messages to live AMAs
CREATE POLICY "Users insert messages to live AMAs"
  ON ama_messages FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM ama_requests 
      WHERE ama_requests.id = ama_messages.ama_id 
      AND ama_requests.status = 'LIVE'
    )
  );

COMMENT ON TABLE ama_messages IS 'Real-time chat messages during AMA sessions';

-- =============================================
-- Enable Supabase Realtime for Live Chat
-- =============================================

-- Add ama_messages to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE ama_messages;
