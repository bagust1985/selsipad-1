-- Add nickname column to profiles table
-- This allows users to set a custom display name

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS nickname text;

-- Add index for faster lookups (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_profiles_nickname ON profiles(nickname);

-- Update the updated_at trigger to include nickname changes
-- (assuming trigger already exists from previous migrations)
