-- Phase 1: Add PAUSED to projects.status constraint
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;

ALTER TABLE projects ADD CONSTRAINT projects_status_check 
  CHECK (status = ANY (ARRAY[
    'DRAFT'::text, 
    'SUBMITTED'::text, 
    'IN_REVIEW'::text, 
    'APPROVED'::text, 
    'REJECTED'::text, 
    'LIVE'::text, 
    'ENDED'::text, 
    'DEPLOYED'::text,
    'PAUSED'::text
  ]));
