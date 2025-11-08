-- Create storage bucket for course materials
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-materials', 'course-materials', true);

-- Create policy for viewing course materials
CREATE POLICY "Anyone can view course materials"
ON storage.objects
FOR SELECT
USING (bucket_id = 'course-materials');

-- Create policy for uploading course materials (authenticated users only)
CREATE POLICY "Authenticated users can upload course materials"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'course-materials' AND auth.role() = 'authenticated');

-- Create policy for deleting course materials (authenticated users only)
CREATE POLICY "Authenticated users can delete course materials"
ON storage.objects
FOR DELETE
USING (bucket_id = 'course-materials' AND auth.role() = 'authenticated');

-- Add course_materials column to courses table
ALTER TABLE courses
ADD COLUMN course_materials JSONB DEFAULT '[]'::jsonb;