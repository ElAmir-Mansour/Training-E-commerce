-- إضافة أعمدة المحتوى المسجل لجدول الدورات
ALTER TABLE courses
ADD COLUMN recorded_content_url TEXT,
ADD COLUMN recorded_content_type TEXT DEFAULT 'youtube',
ADD COLUMN is_recorded_content_active BOOLEAN DEFAULT false;

COMMENT ON COLUMN courses.recorded_content_url IS 'رابط المحتوى المسجل (YouTube, Vimeo, إلخ)';
COMMENT ON COLUMN courses.recorded_content_type IS 'نوع المحتوى المسجل (youtube, vimeo, google_drive, external_video, external_audio)';
COMMENT ON COLUMN courses.is_recorded_content_active IS 'تفعيل/تعطيل ظهور المحتوى المسجل للزوار';