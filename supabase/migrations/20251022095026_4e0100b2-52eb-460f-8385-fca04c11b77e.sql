-- Create enum for question types
CREATE TYPE public.question_type AS ENUM ('rating', 'text', 'multiple_choice');

-- Create enum for question categories
CREATE TYPE public.question_category AS ENUM ('course', 'trainer', 'center', 'venue', 'general');

-- Create evaluation_forms table
CREATE TABLE public.evaluation_forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  form_title TEXT NOT NULL DEFAULT 'استمارة تقييم الدورة',
  form_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create evaluation_responses table
CREATE TABLE public.evaluation_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID REFERENCES public.evaluation_forms(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  trainee_name TEXT NOT NULL,
  trainee_email TEXT,
  trainee_phone TEXT,
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.evaluation_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for evaluation_forms
CREATE POLICY "Anyone can view active evaluation forms"
ON public.evaluation_forms
FOR SELECT
USING (is_active = true);

CREATE POLICY "Authenticated users can insert evaluation forms"
ON public.evaluation_forms
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update evaluation forms"
ON public.evaluation_forms
FOR UPDATE
USING (true);

CREATE POLICY "Authenticated users can delete evaluation forms"
ON public.evaluation_forms
FOR DELETE
USING (true);

-- RLS Policies for evaluation_responses
CREATE POLICY "Anyone can insert evaluation responses"
ON public.evaluation_responses
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can view all evaluation responses"
ON public.evaluation_responses
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can update evaluation responses"
ON public.evaluation_responses
FOR UPDATE
USING (true);

CREATE POLICY "Authenticated users can delete evaluation responses"
ON public.evaluation_responses
FOR DELETE
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_evaluation_forms_course_id ON public.evaluation_forms(course_id);
CREATE INDEX idx_evaluation_forms_is_active ON public.evaluation_forms(is_active);
CREATE INDEX idx_evaluation_responses_form_id ON public.evaluation_responses(form_id);
CREATE INDEX idx_evaluation_responses_course_id ON public.evaluation_responses(course_id);
CREATE INDEX idx_evaluation_responses_submitted_at ON public.evaluation_responses(submitted_at);

-- Create trigger for automatic timestamp updates on evaluation_forms
CREATE TRIGGER update_evaluation_forms_updated_at
BEFORE UPDATE ON public.evaluation_forms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert a default evaluation form template for existing courses
INSERT INTO public.evaluation_forms (course_id, form_title, form_questions, is_active)
SELECT 
  id as course_id,
  'استمارة تقييم الدورة' as form_title,
  '[
    {
      "id": "q1",
      "type": "rating",
      "category": "course",
      "question": "ما مدى رضاك عن محتوى الدورة؟",
      "required": true,
      "options": null
    },
    {
      "id": "q2",
      "type": "rating",
      "category": "course",
      "question": "هل كانت المادة العلمية واضحة ومفهومة؟",
      "required": true,
      "options": null
    },
    {
      "id": "q3",
      "type": "rating",
      "category": "course",
      "question": "هل حققت الدورة أهدافك؟",
      "required": true,
      "options": null
    },
    {
      "id": "q4",
      "type": "rating",
      "category": "trainer",
      "question": "ما تقييمك لأداء المدرب؟",
      "required": true,
      "options": null
    },
    {
      "id": "q5",
      "type": "rating",
      "category": "trainer",
      "question": "هل كان المدرب متمكناً من المادة؟",
      "required": true,
      "options": null
    },
    {
      "id": "q6",
      "type": "rating",
      "category": "trainer",
      "question": "هل كان المدرب متفاعلاً مع الأسئلة؟",
      "required": true,
      "options": null
    },
    {
      "id": "q7",
      "type": "rating",
      "category": "center",
      "question": "ما مدى رضاك عن الخدمات المقدمة من المركز؟",
      "required": true,
      "options": null
    },
    {
      "id": "q8",
      "type": "rating",
      "category": "center",
      "question": "هل كان التنظيم جيداً؟",
      "required": true,
      "options": null
    },
    {
      "id": "q9",
      "type": "rating",
      "category": "venue",
      "question": "ما تقييمك للمكان التدريبي؟",
      "required": true,
      "options": null
    },
    {
      "id": "q10",
      "type": "rating",
      "category": "venue",
      "question": "هل كانت التجهيزات مناسبة؟",
      "required": true,
      "options": null
    },
    {
      "id": "q11",
      "type": "multiple_choice",
      "category": "general",
      "question": "هل توصي بهذه الدورة للآخرين؟",
      "required": true,
      "options": ["نعم، بشدة", "نعم", "ربما", "لا"]
    },
    {
      "id": "q12",
      "type": "text",
      "category": "general",
      "question": "ملاحظات واقتراحات للتحسين",
      "required": false,
      "options": null
    }
  ]'::jsonb as form_questions,
  false as is_active
FROM public.courses
LIMIT 0;