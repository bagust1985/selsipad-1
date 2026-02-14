
-- V2.4.1b.1: Case-insensitive wallet address index for ilike lookups
CREATE INDEX IF NOT EXISTS idx_wallets_address_lower
  ON public.wallets (lower(address));
