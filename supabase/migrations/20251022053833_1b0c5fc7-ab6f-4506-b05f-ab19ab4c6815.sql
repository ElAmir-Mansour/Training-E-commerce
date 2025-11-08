-- Add course topics, instructor credentials, and certificate features
ALTER TABLE public.courses 
ADD COLUMN course_topics text[] DEFAULT '{}',
ADD COLUMN instructor_credentials text,
ADD COLUMN certificate_url text,
ADD COLUMN is_certificate_active boolean DEFAULT false;