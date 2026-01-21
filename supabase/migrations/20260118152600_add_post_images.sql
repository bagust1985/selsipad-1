-- Migration: Add media support to posts
-- Adds image_urls array field for post images

ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';

-- Index for posts with images
CREATE INDEX IF NOT EXISTS idx_posts_has_images ON posts((array_length(image_urls, 1) > 0)) WHERE deleted_at IS NULL AND array_length(image_urls, 1) > 0;

COMMENT ON COLUMN posts.image_urls IS 'Array of image URLs uploaded with the post';
