-- Migration: 014_add_projects_metadata.sql
-- Created: 2026-01-14
-- Description: Add metadata JSONB column to projects table for flexible data storage

-- Add metadata column to store flexible project data (type, chain, raised, target, etc.)
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

COMMENT ON COLUMN projects.metadata IS 'Flexible metadata storage for project details (type, chain, raised, target, lp_lock, etc.)';

-- Create index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_projects_metadata_gin ON projects USING GIN (metadata);

-- Example default metadata structure:
-- {
--   "type": "presale" | "fairlaunch",
--   "chain": "SOL" | "EVM",
--   "raised": 0,
--   "target": 1000,
--   "lp_lock": false,
--   "featured": false
-- }
