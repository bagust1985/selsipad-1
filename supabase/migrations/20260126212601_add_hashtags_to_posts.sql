
-- Add hashtags column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS hashtags text[];

-- Create GIN index for fast hashtag search
CREATE INDEX IF NOT EXISTS idx_posts_hashtags ON posts USING GIN (hashtags);
