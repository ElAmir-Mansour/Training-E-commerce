-- Update existing evaluation forms to use likert scale instead of rating
UPDATE evaluation_forms 
SET form_questions = jsonb_set(
  form_questions,
  '{}',
  (
    SELECT jsonb_agg(
      jsonb_set(
        question,
        '{type}',
        CASE 
          WHEN question->>'type' = 'rating' THEN '"likert"'::jsonb
          ELSE question->'type'
        END
      )
    )
    FROM jsonb_array_elements(form_questions) AS question
  )
)
WHERE EXISTS (
  SELECT 1 
  FROM jsonb_array_elements(form_questions) AS q 
  WHERE q->>'type' = 'rating'
);