-- Add date fields to courses table for calendar functionality
ALTER TABLE courses
ADD COLUMN start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN registration_deadline TIMESTAMP WITH TIME ZONE;

-- Add index for better query performance on date fields
CREATE INDEX idx_courses_start_date ON courses(start_date);
CREATE INDEX idx_courses_end_date ON courses(end_date);

-- Add comment for documentation
COMMENT ON COLUMN courses.start_date IS 'تاريخ بداية الدورة';
COMMENT ON COLUMN courses.end_date IS 'تاريخ نهاية الدورة (اختياري)';
COMMENT ON COLUMN courses.registration_deadline IS 'آخر موعد للتسجيل (اختياري)';