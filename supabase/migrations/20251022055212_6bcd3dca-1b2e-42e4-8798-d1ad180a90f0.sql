-- Add video_url column to courses table
ALTER TABLE public.courses 
ADD COLUMN video_url text;