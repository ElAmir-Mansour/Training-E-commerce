-- Add course type and platform access fields to courses table
ALTER TABLE public.courses 
ADD COLUMN course_type TEXT NOT NULL DEFAULT 'in-person' CHECK (course_type IN ('in-person', 'online', 'asynchronous')),
ADD COLUMN platform_url TEXT,
ADD COLUMN is_platform_active BOOLEAN DEFAULT false;