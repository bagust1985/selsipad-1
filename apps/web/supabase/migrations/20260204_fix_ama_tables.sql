-- =============================================
-- EMERGENCY: Create AMA Tables if not exists
-- Run this SQL in Supabase SQL Editor
-- =============================================

-- Check if table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE tablename = 'ama_requests'
  ) THEN
    -- Create ama_requests table
    CREATE TABLE ama_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      
      -- Developer & Project
      developer_id UUID NOT NULL,
      project_id UUID REFERENCES projects(id),
      project_name TEXT NOT NULL,
      
      -- Schedule (set by developer)
      scheduled_at TIMESTAMPTZ NOT NULL,
      
      -- Content (displayed to investors)
      description TEXT NOT NULL,
      
      -- Payment tracking
      payment_tx_hash TEXT NOT NULL,
      payment_amount_bnb NUMERIC NOT NULL,
      request_id_bytes32 TEXT NOT NULL,
      chain_id INTEGER DEFAULT 97,
      
      -- Status workflow
      status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PINNED', 'REJECTED', 'LIVE', 'ENDED')),
      
      -- Admin actions
      is_pinned BOOLEAN DEFAULT FALSE,
      pinned_at TIMESTAMPTZ,
      pinned_by UUID,
      rejection_reason TEXT,
      refund_tx_hash TEXT,
      
      -- AMA session timing
      started_at TIMESTAMPTZ,
      ended_at TIMESTAMPTZ,
      
      -- Timestamps
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Create indexes
    CREATE INDEX idx_ama_requests_status ON ama_requests(status);
    CREATE INDEX idx_ama_requests_developer ON ama_requests(developer_id);
    
    RAISE NOTICE 'Created ama_requests table';
  ELSE
    RAISE NOTICE 'ama_requests table already exists';
  END IF;
END
$$;

-- Create ama_messages table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE tablename = 'ama_messages'
  ) THEN
    CREATE TABLE ama_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      ama_id UUID REFERENCES ama_requests(id) ON DELETE CASCADE NOT NULL,
      user_id UUID NOT NULL,
      
      content TEXT NOT NULL,
      message_type TEXT DEFAULT 'USER' CHECK (message_type IN ('USER', 'DEVELOPER', 'SYSTEM', 'PINNED')),
      
      username TEXT,
      avatar_url TEXT,
      is_developer BOOLEAN DEFAULT FALSE,
      is_verified BOOLEAN DEFAULT FALSE,
      
      is_deleted BOOLEAN DEFAULT FALSE,
      deleted_by UUID,
      is_pinned_message BOOLEAN DEFAULT FALSE,
      
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX idx_ama_messages_ama_id ON ama_messages(ama_id, created_at);
    
    RAISE NOTICE 'Created ama_messages table';
  ELSE
    RAISE NOTICE 'ama_messages table already exists';
  END IF;
END
$$;

-- Enable RLS (safe to run multiple times)
ALTER TABLE ama_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ama_messages ENABLE ROW LEVEL SECURITY;

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Public read pinned and live AMAs" ON ama_requests;
DROP POLICY IF EXISTS "Developers read own requests" ON ama_requests;
DROP POLICY IF EXISTS "Developers insert own requests" ON ama_requests;

-- Create permissive policies (service role bypasses these anyway)
CREATE POLICY IF NOT EXISTS "Allow all select" ON ama_requests FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow all insert" ON ama_requests FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all update" ON ama_requests FOR UPDATE USING (true);
CREATE POLICY IF NOT EXISTS "Allow all delete" ON ama_requests FOR DELETE USING (true);

RAISE NOTICE 'AMA tables setup complete!';
