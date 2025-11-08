-- Create contact_info table for managing contact details
CREATE TABLE public.contact_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('phone', 'email', 'whatsapp', 'telegram')),
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_info ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active contact info"
ON public.contact_info
FOR SELECT
USING (is_active = true);

CREATE POLICY "Authenticated users can insert contact info"
ON public.contact_info
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update contact info"
ON public.contact_info
FOR UPDATE
USING (true);

CREATE POLICY "Authenticated users can delete contact info"
ON public.contact_info
FOR DELETE
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_contact_info_updated_at
BEFORE UPDATE ON public.contact_info
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();