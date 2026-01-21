-- Migration: 20260121_add_fee_splitter_address.sql
-- Created: 2026-01-21
-- Description: Add fee_splitter_address column to launch_rounds

ALTER TABLE public.launch_rounds
  ADD COLUMN IF NOT EXISTS fee_splitter_address TEXT;

CREATE INDEX IF NOT EXISTS idx_launch_rounds_fee_splitter ON public.launch_rounds(fee_splitter_address);

COMMENT ON COLUMN public.launch_rounds.fee_splitter_address IS 'Reference to the FeeSplitter contract address for this presale';
