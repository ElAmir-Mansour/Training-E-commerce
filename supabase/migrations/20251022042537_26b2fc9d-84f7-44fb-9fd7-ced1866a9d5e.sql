-- Create storage bucket for logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for logos
CREATE POLICY "Anyone can view logos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'logos');

CREATE POLICY "Anyone can upload logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'logos');

CREATE POLICY "Anyone can update logos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'logos');

CREATE POLICY "Anyone can delete logos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'logos');