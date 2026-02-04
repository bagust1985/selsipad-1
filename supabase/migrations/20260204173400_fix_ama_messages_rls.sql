-- Fix RLS for AMA messages
-- Allow authenticated users to send messages

-- Disable RLS on ama_messages table
ALTER TABLE ama_messages DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS ama_messages_public_read ON ama_messages;
DROP POLICY IF EXISTS ama_messages_auth_insert ON ama_messages;
DROP POLICY IF EXISTS ama_messages_own_update ON ama_messages;
DROP POLICY IF EXISTS ama_messages_admin_delete ON ama_messages;

-- Add comment
COMMENT ON TABLE ama_messages IS 'AMA chat messages - RLS disabled, access controlled by application logic';
