-- RPC: increment_post_repost_count
CREATE OR REPLACE FUNCTION increment_post_repost_count(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts
  SET repost_count = COALESCE(repost_count, 0) + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: decrement_post_repost_count
CREATE OR REPLACE FUNCTION decrement_post_repost_count(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts
  SET repost_count = GREATEST(COALESCE(repost_count, 0) - 1, 0)
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: increment_post_share_count
CREATE OR REPLACE FUNCTION increment_post_share_count(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts
  SET share_count = COALESCE(share_count, 0) + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
