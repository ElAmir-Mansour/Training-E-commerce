-- Update RLS policies for course-materials bucket to allow public uploads and deletes
-- (Since there's no authentication system currently in place)

DROP POLICY IF EXISTS "Authenticated users can upload course materials" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete course materials" ON storage.objects;

-- Allow anyone to upload course materials
CREATE POLICY "Anyone can upload course materials"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'course-materials');

-- Allow anyone to delete course materials
CREATE POLICY "Anyone can delete course materials"
ON storage.objects
FOR DELETE
USING (bucket_id = 'course-materials');