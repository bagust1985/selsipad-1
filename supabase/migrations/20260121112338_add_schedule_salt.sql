-- Migration: 20260121_add_schedule_salt.sql
-- Created: 2026-01-21
-- Description: Add schedule_salt column to launch_rounds for vesting schedule identification

ALTER TABLE public.launch_rounds
  ADD COLUMN IF NOT EXISTS schedule_salt TEXT;

CREATE INDEX IF NOT EXISTS idx_launch_rounds_schedule_salt ON public.launch_rounds(schedule_salt);

COMMENT ON COLUMN public.launch_rounds.schedule_salt IS 'Vesting schedule identifier used for Merkle leaf generation';
