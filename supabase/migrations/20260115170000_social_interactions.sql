-- Migration: Social Feed Interactions
-- Adds likes, comments, reactions, views, shares, and engagement metrics

-- ============================================
-- EXTEND posts TABLE
-- ============================================
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS repost_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS edit_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMPTZ;

-- ============================================
-- TABLE: post_likes
-- ============================================
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_post_likes_post ON post_likes(post_id);
CREATE INDEX idx_post_likes_user ON post_likes(user_id);

-- ============================================
-- TABLE: post_comments
-- ============================================
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 2000),
  parent_comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  like_count INTEGER DEFAULT 0
);

CREATE INDEX idx_post_comments_post ON post_comments(post_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_post_comments_author ON post_comments(author_id);
CREATE INDEX idx_post_comments_parent ON post_comments(parent_comment_id);

-- ============================================
-- TABLE: post_reactions
-- ============================================
CREATE TABLE IF NOT EXISTS post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('love', 'haha', 'wow', 'sad', 'angry')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_post_reactions_post ON post_reactions(post_id);
CREATE INDEX idx_post_reactions_user ON post_reactions(user_id);
CREATE INDEX idx_post_reactions_type ON post_reactions(reaction_type);

-- ============================================
-- TABLE: post_views
-- ============================================
CREATE TABLE IF NOT EXISTS post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID, -- NULL for anonymous views
  session_id TEXT, -- For tracking anonymous users
  ip_address TEXT,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique view per user per post (or session if anonymous)
  UNIQUE(post_id, user_id),
  UNIQUE(post_id, session_id)
);

CREATE INDEX idx_post_views_post ON post_views(post_id);
CREATE INDEX idx_post_views_user ON post_views(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_post_views_viewed_at ON post_views(viewed_at);

-- ============================================
-- TABLE: post_shares
-- ============================================
CREATE TABLE IF NOT EXISTS post_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  share_type TEXT NOT NULL CHECK (share_type IN ('link', 'repost', 'quote')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_post_shares_post ON post_shares(post_id);
CREATE INDEX idx_post_shares_user ON post_shares(user_id);
CREATE INDEX idx_post_shares_type ON post_shares(share_type);

-- ============================================
-- TABLE: comment_likes
-- ============================================
CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES post_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(comment_id, user_id)
);

CREATE INDEX idx_comment_likes_comment ON comment_likes(comment_id);
CREATE INDEX idx_comment_likes_user ON comment_likes(user_id);

-- ============================================
-- TRIGGERS FOR AUTO-UPDATE COUNTS
-- ============================================

-- Function to update post like count
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_like_count
AFTER INSERT OR DELETE ON post_likes
FOR EACH ROW EXECUTE FUNCTION update_post_like_count();

-- Function to update post comment count
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_comment_count
AFTER INSERT OR DELETE ON post_comments
FOR EACH ROW EXECUTE FUNCTION update_post_comment_count();

-- Function to update post view count
CREATE OR REPLACE FUNCTION update_post_view_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET view_count = view_count + 1 WHERE id = NEW.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_view_count
AFTER INSERT ON post_views
FOR EACH ROW EXECUTE FUNCTION update_post_view_count();

-- Function to update comment like count
CREATE OR REPLACE FUNCTION update_comment_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE post_comments SET like_count = like_count + 1 WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE post_comments SET like_count = like_count - 1 WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comment_like_count
AFTER INSERT OR DELETE ON comment_likes
FOR EACH ROW EXECUTE FUNCTION update_comment_like_count();

-- Auto-update updated_at for comments
CREATE TRIGGER update_post_comments_updated_at 
BEFORE UPDATE ON post_comments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE post_likes IS 'User likes on posts';
COMMENT ON TABLE post_comments IS 'Comments on posts with nested reply support';
COMMENT ON TABLE post_reactions IS 'Emoji reactions on posts (love, haha, wow, sad, angry)';
COMMENT ON TABLE post_views IS 'View tracking for posts';
COMMENT ON TABLE post_shares IS 'Share tracking (link, repost, quote)';
COMMENT ON TABLE comment_likes IS 'Likes on comments';

COMMENT ON COLUMN posts.view_count IS 'Cached view count from post_views';
COMMENT ON COLUMN posts.like_count IS 'Cached like count from post_likes';
COMMENT ON COLUMN posts.comment_count IS 'Cached comment count from post_comments';
COMMENT ON COLUMN posts.last_edited_at IS 'Last time post was edited';
COMMENT ON COLUMN posts.edit_count IS 'Number of times post was edited';
