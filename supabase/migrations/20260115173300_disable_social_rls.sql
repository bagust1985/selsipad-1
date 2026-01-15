-- Disable RLS on post_comments (wallet-only auth doesn't use auth.uid())
ALTER TABLE post_comments DISABLE ROW LEVEL SECURITY;

-- Disable RLS on other social tables
ALTER TABLE post_likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE post_views DISABLE ROW LEVEL SECURITY;
ALTER TABLE post_shares DISABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes DISABLE ROW LEVEL SECURITY;

-- Application will handle permissions via session checks
