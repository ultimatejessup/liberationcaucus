CREATE TABLE public.contact_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anyone (public contact form) via edge function using service role
-- No SELECT policy needed for anonymous users
CREATE POLICY "Service role can manage contact submissions"
ON public.contact_submissions
FOR ALL
USING (true)
WITH CHECK (true);