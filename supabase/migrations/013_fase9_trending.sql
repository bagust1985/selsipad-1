-- FASE 9: Trending Projects
-- Periodic snapshot-based trending calculation

-- 1. Trending Snapshots
-- Records each calculation event (e.g. every 10 mins)
CREATE TABLE trending_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    window_start_at TIMESTAMPTZ NOT NULL, -- e.g. NOW() - 24 hours
    window_end_at TIMESTAMPTZ NOT NULL,   -- e.g. NOW()
    computed_at TIMESTAMPTZ DEFAULT NOW(),
    version TEXT DEFAULT 'v1' -- Format version
);

CREATE INDEX idx_trending_snapshots_computed ON trending_snapshots(computed_at DESC);

-- 2. Trending Projects
-- Denormalized ranking for a specific snapshot
CREATE TABLE trending_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_id UUID NOT NULL REFERENCES trending_snapshots(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    rank INTEGER NOT NULL, -- 1 to 50
    score NUMERIC NOT NULL, -- Computed score
    
    post_count_24h INTEGER DEFAULT 0,
    comment_count_24h INTEGER DEFAULT 0,
    
    category TEXT DEFAULT 'ALL', -- 'ALL', 'PRESALE', 'FAIRLAUNCH'
    chain_scope TEXT DEFAULT 'ALL', -- 'ALL', 'SOLANA', 'EVM'
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(snapshot_id, category, chain_scope, rank)
);

CREATE INDEX idx_trending_projects_snapshot ON trending_projects(snapshot_id);
CREATE INDEX idx_trending_projects_project ON trending_projects(project_id);

-- RLS Policies

-- trending_snapshots: Public Read
ALTER TABLE trending_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read snapshots" ON trending_snapshots
    FOR SELECT USING (true);

-- trending_projects: Public Read
ALTER TABLE trending_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read trending projects" ON trending_projects
    FOR SELECT USING (true);
    
-- Write Access: Service Role Only (No policies for Auth Users)
-- Since we don't define INSERT/UPDATE policies for authenticated users,
-- by default they cannot write. Service role bypasses RLS.
