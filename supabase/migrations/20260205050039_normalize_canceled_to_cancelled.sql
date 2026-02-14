-- Phase 1: Normalize CANCELED -> CANCELLED to match on-chain spelling

-- Update existing data first (if any)
UPDATE launch_rounds 
SET result = 'CANCELLED' 
WHERE result = 'CANCELED';

-- Drop old constraint
ALTER TABLE launch_rounds DROP CONSTRAINT IF EXISTS launch_rounds_result_check;

-- Add new constraint with CANCELLED spelling
ALTER TABLE launch_rounds ADD CONSTRAINT launch_rounds_result_check 
  CHECK (result = ANY (ARRAY[
    'NONE'::text, 
    'SUCCESS'::text, 
    'FAILED'::text, 
    'CANCELLED'::text
  ]));
