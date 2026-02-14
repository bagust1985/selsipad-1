-- Add FAILED status to launch_rounds constraint for refund flow
ALTER TABLE launch_rounds
DROP CONSTRAINT IF EXISTS launch_rounds_status_check;

ALTER TABLE launch_rounds
ADD CONSTRAINT launch_rounds_status_check 
CHECK (status = ANY (ARRAY[
  'DRAFT'::text, 
  'SUBMITTED'::text, 
  'SUBMITTED_FOR_REVIEW'::text, 
  'APPROVED'::text, 
  'APPROVED_TO_DEPLOY'::text, 
  'REJECTED'::text, 
  'DEPLOYED'::text, 
  'ACTIVE'::text, 
  'ENDED'::text, 
  'FAILED'::text,
  'CANCELLED'::text
]));
