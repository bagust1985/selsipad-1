
-- Add FINALIZED and COMPLETED to valid project statuses
ALTER TABLE projects DROP CONSTRAINT projects_status_check;
ALTER TABLE projects ADD CONSTRAINT projects_status_check
  CHECK (status = ANY (ARRAY[
    'DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED',
    'LIVE', 'ENDED', 'DEPLOYED', 'PAUSED', 'FINALIZED', 'COMPLETED'
  ]));
