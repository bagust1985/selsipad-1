-- Migration: Add social media links to projects table
-- Description: Add discord and github columns to projects table for presale wizard

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS discord TEXT,
ADD COLUMN IF NOT EXISTS github TEXT;

COMMENT ON COLUMN projects.discord IS 'Discord server invite link';
COMMENT ON COLUMN projects.github IS 'GitHub repository URL';
