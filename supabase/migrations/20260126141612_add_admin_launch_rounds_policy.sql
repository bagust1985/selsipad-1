
-- Add RLS policy for admins to view all launch rounds
CREATE POLICY "Admins can view all rounds"
ON public.launch_rounds
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  )
);
