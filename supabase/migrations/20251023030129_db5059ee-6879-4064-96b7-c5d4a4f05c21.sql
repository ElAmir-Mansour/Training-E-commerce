-- Add support for multiple recorded content URLs
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS recorded_content_urls TEXT[] DEFAULT '{}';

-- Migrate existing single recorded_content_url to the new array format
UPDATE courses 
SET recorded_content_urls = ARRAY[recorded_content_url]
WHERE recorded_content_url IS NOT NULL 
  AND recorded_content_url != ''
  AND (recorded_content_urls IS NULL OR recorded_content_urls = '{}');