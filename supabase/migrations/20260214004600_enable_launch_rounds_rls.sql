-- Enable RLS on launch_rounds table
ALTER TABLE public.launch_rounds ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (cleanup)
DROP POLICY IF EXISTS "launch_rounds_public_read" ON public.launch_rounds;
DROP POLICY IF EXISTS "launch_rounds_service_write" ON public.launch_rounds;

-- Public can read all rounds (project info is transparent)
CREATE POLICY "launch_rounds_public_read"
  ON public.launch_rounds FOR SELECT
  USING (true);

-- Only service role can write (all writes go through server actions)
CREATE POLICY "launch_rounds_service_write"
  ON public.launch_rounds FOR ALL
  USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);
