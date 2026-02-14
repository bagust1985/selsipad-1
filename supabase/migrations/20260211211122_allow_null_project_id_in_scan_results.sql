
-- Allow sc_scan_results.project_id to be NULL for standalone contract scans (presale wizard)
ALTER TABLE sc_scan_results ALTER COLUMN project_id DROP NOT NULL;

-- Also update the status constraint to include values used by the scan system
ALTER TABLE sc_scan_results DROP CONSTRAINT IF EXISTS sc_scan_results_status_check;
ALTER TABLE sc_scan_results ADD CONSTRAINT sc_scan_results_status_check 
  CHECK (status = ANY (ARRAY['PENDING', 'PASSED', 'FAILED', 'WARNING', 'PASS', 'FAIL', 'NEEDS_REVIEW', 'RUNNING']));

COMMENT ON COLUMN sc_scan_results.project_id IS 'FK to projects.id — NULL for standalone contract scans (presale wizard)';
