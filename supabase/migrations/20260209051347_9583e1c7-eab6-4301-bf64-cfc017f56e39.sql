-- Drop overly permissive policy
DROP POLICY "Service role can manage contact submissions" ON public.contact_submissions;

-- Only allow inserts (the edge function uses service role which bypasses RLS anyway)
-- No public read/update/delete access
CREATE POLICY "No public access to contact submissions"
ON public.contact_submissions
FOR SELECT
USING (false);