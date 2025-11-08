-- Create settings table for site configuration
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_name TEXT NOT NULL DEFAULT 'منصة التدريب الذكية',
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public can read settings
CREATE POLICY "Anyone can view site settings" 
ON public.site_settings 
FOR SELECT 
USING (true);

-- Only authenticated users can update settings (you can add admin check later)
CREATE POLICY "Authenticated users can update site settings" 
ON public.site_settings 
FOR UPDATE 
USING (true);

-- Only authenticated users can insert settings
CREATE POLICY "Authenticated users can insert site settings" 
ON public.site_settings 
FOR INSERT 
WITH CHECK (true);

-- Create courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  instructor TEXT NOT NULL,
  duration TEXT NOT NULL,
  students INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(2,1) NOT NULL DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Public can read courses
CREATE POLICY "Anyone can view courses" 
ON public.courses 
FOR SELECT 
USING (true);

-- Only authenticated users can insert courses
CREATE POLICY "Authenticated users can insert courses" 
ON public.courses 
FOR INSERT 
WITH CHECK (true);

-- Only authenticated users can update courses
CREATE POLICY "Authenticated users can update courses" 
ON public.courses 
FOR UPDATE 
USING (true);

-- Only authenticated users can delete courses
CREATE POLICY "Authenticated users can delete courses" 
ON public.courses 
FOR DELETE 
USING (true);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
BEFORE UPDATE ON public.courses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default site settings
INSERT INTO public.site_settings (site_name, logo_url) 
VALUES ('منصة التدريب الذكية', NULL);

-- Insert sample courses
INSERT INTO public.courses (title, description, image_url, instructor, duration, students, rating) VALUES
('تطوير تطبيقات الويب الحديثة', 'تعلم بناء تطبيقات الويب باستخدام أحدث التقنيات والأدوات', '/placeholder.svg', 'د. محمد أحمد', '12 أسبوع', 2547, 4.8),
('القيادة وإدارة الأعمال', 'اكتسب المهارات القيادية اللازمة لإدارة الفرق والمشاريع بنجاح', '/placeholder.svg', 'أ. سارة علي', '8 أسابيع', 1893, 4.9),
('علوم البيانات والذكاء الاصطناعي', 'استكشف عالم البيانات الضخمة وتطبيقات الذكاء الاصطناعي', '/placeholder.svg', 'د. خالد يوسف', '16 أسبوع', 3241, 4.7);