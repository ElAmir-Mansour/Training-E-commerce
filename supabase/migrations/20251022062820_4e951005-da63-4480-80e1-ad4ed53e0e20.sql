-- Create chatbot knowledge base table
CREATE TABLE public.chatbot_knowledge (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chatbot_knowledge ENABLE ROW LEVEL SECURITY;

-- Anyone can view active knowledge
CREATE POLICY "Anyone can view active chatbot knowledge"
ON public.chatbot_knowledge
FOR SELECT
USING (is_active = true);

-- Authenticated users can manage knowledge
CREATE POLICY "Authenticated users can insert chatbot knowledge"
ON public.chatbot_knowledge
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update chatbot knowledge"
ON public.chatbot_knowledge
FOR UPDATE
USING (true);

CREATE POLICY "Authenticated users can delete chatbot knowledge"
ON public.chatbot_knowledge
FOR DELETE
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_chatbot_knowledge_updated_at
BEFORE UPDATE ON public.chatbot_knowledge
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();