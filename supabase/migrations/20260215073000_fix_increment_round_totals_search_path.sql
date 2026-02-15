-- Fix increment_round_totals function to use proper search_path
-- This function is triggered on contributions INSERT/UPDATE to update launch_rounds.total_raised
CREATE OR REPLACE FUNCTION public.increment_round_totals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'  -- CRITICAL FIX: Previously was SET search_path TO '', causing table not found errors
AS $$
BEGIN
  IF NEW.status = 'CONFIRMED' AND (OLD.status IS NULL OR OLD.status != 'CONFIRMED') THEN
    -- Increment total_raised and total_participants in launch_rounds
    UPDATE launch_rounds
    SET 
      total_raised = total_raised + NEW.amount,
      total_participants = total_participants + 1
    WHERE id = NEW.round_id;
  END IF;
  
  RETURN NEW;
END;
$$;
