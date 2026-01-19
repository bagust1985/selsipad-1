-- Migration: 20260119080000_user_follows.sql
-- Created: 2026-01-19
-- Description: User follow/unfollow system with badge gating

-- ============================================
-- EXTEND PROFILES TABLE
-- ============================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0 CHECK (follower_count >= 0),
  ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0 CHECK (following_count >= 0);

COMMENT ON COLUMN profiles.follower_count IS 'Number of users following this user';
COMMENT ON COLUMN profiles.following_count IS 'Number of users this user is following';

CREATE INDEX IF NOT EXISTS idx_profiles_follower_count ON profiles(follower_count DESC) WHERE follower_count > 0;
CREATE INDEX IF NOT EXISTS idx_profiles_following_count ON profiles(following_count DESC) WHERE following_count > 0;

-- ============================================
-- TABLE: user_follows
-- Purpose: Track follow relationships between users
-- ============================================
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL, -- user who is following (no FK to support wallet-only auth)
  following_id UUID NOT NULL, -- user being followed (no FK to support wallet-only auth)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id) -- Cannot follow yourself
);

COMMENT ON TABLE user_follows IS 'User follow relationships - tracks who follows whom';
COMMENT ON COLUMN user_follows.follower_id IS 'User ID of the follower (wallet-only auth)';
COMMENT ON COLUMN user_follows.following_id IS 'User ID being followed (wallet-only auth)';

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON user_follows(following_id);
CREATE INDEX idx_user_follows_created ON user_follows(created_at DESC);

-- Composite index for checking if user A follows user B
CREATE INDEX idx_user_follows_check ON user_follows(follower_id, following_id);

-- ============================================
-- TRIGGERS FOR AUTO-UPDATE COUNTS
-- ============================================

-- Function to update follower/following counts
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment follower count for the user being followed
    UPDATE profiles 
    SET follower_count = follower_count + 1 
    WHERE user_id = NEW.following_id;
    
    -- Increment following count for the follower
    UPDATE profiles 
    SET following_count = following_count + 1 
    WHERE user_id = NEW.follower_id;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement follower count for the user being unfollowed
    UPDATE profiles 
    SET follower_count = GREATEST(0, follower_count - 1)
    WHERE user_id = OLD.following_id;
    
    -- Decrement following count for the unfollower
    UPDATE profiles 
    SET following_count = GREATEST(0, following_count - 1)
    WHERE user_id = OLD.follower_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_follow_counts
AFTER INSERT OR DELETE ON user_follows
FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- ============================================
-- HELPER FUNCTION: Check if user is followable
-- ============================================

-- Check if a user can be followed (has at least one active badge)
CREATE OR REPLACE FUNCTION is_user_followable(target_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  badge_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO badge_count
  FROM badge_instances
  WHERE user_id = target_user_id
    AND status = 'ACTIVE'
    AND (expires_at IS NULL OR expires_at > NOW());
  
  RETURN badge_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_user_followable IS 'Check if user has at least one active badge and can be followed';

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- Public can view all follow relationships
CREATE POLICY "Public can view all follows" ON user_follows
  FOR SELECT
  USING (true);

-- Users can follow others (insert will be validated in application layer for badge check)
CREATE POLICY "Users can create follows" ON user_follows
  FOR INSERT
  WITH CHECK (follower_id = auth.uid());

-- Users can unfollow (delete their own follows)
CREATE POLICY "Users can delete own follows" ON user_follows
  FOR DELETE
  USING (follower_id = auth.uid());

-- Service role bypass for admin operations
CREATE POLICY "Service role can manage all follows" ON user_follows
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- HELPER FUNCTION: Get followers list
-- ============================================

CREATE OR REPLACE FUNCTION get_user_followers(
  target_user_id UUID,
  result_limit INTEGER DEFAULT 50,
  result_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  avatar_url TEXT,
  follower_count INTEGER,
  following_count INTEGER,
  followed_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id,
    p.username,
    p.avatar_url,
    p.follower_count,
    p.following_count,
    uf.created_at
  FROM user_follows uf
  JOIN profiles p ON uf.follower_id = p.user_id
  WHERE uf.following_id = target_user_id
  ORDER BY uf.created_at DESC
  LIMIT result_limit
  OFFSET result_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_followers IS 'Get list of users following the target user';

-- ============================================
-- HELPER FUNCTION: Get following list
-- ============================================

CREATE OR REPLACE FUNCTION get_user_following(
  target_user_id UUID,
  result_limit INTEGER DEFAULT 50,
  result_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  avatar_url TEXT,
  follower_count INTEGER,
  following_count INTEGER,
  followed_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id,
    p.username,
    p.avatar_url,
    p.follower_count,
    p.following_count,
    uf.created_at
  FROM user_follows uf
  JOIN profiles p ON uf.following_id = p.user_id
  WHERE uf.follower_id = target_user_id
  ORDER BY uf.created_at DESC
  LIMIT result_limit
  OFFSET result_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_following IS 'Get list of users being followed by the target user';
