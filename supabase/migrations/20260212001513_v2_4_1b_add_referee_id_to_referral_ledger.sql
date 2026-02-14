
-- V2.4.1b.1: Add referee_id column to referral_ledger for per-referee tracking
ALTER TABLE public.referral_ledger
  ADD COLUMN IF NOT EXISTS referee_id uuid REFERENCES public.profiles(user_id);

-- Drop old too-restrictive constraint (only source_type + source_id)
ALTER TABLE public.referral_ledger
  DROP CONSTRAINT IF EXISTS referral_ledger_source_type_source_id_key;

-- Create new compound unique: one entry per referee per source
ALTER TABLE public.referral_ledger
  ADD CONSTRAINT referral_ledger_source_type_source_id_referee_id_key
  UNIQUE (source_type, source_id, referee_id);

-- Index for fast lookups by referee
CREATE INDEX IF NOT EXISTS idx_referral_ledger_referee_id
  ON public.referral_ledger (referee_id);
