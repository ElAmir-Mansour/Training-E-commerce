-- Add additional images and registration status to courses table
ALTER TABLE public.courses 
ADD COLUMN additional_images text[] DEFAULT '{}',
ADD COLUMN is_registration_closed boolean DEFAULT false;