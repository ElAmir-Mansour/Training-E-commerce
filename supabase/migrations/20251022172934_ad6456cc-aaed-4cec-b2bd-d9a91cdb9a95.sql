-- Create function to increment suggestion votes
CREATE OR REPLACE FUNCTION increment_suggestion_votes(suggestion_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE course_suggestions
  SET votes_count = votes_count + 1
  WHERE id = suggestion_id;
END;
$$;

-- Create function to increment poll votes
CREATE OR REPLACE FUNCTION increment_poll_votes(poll_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE course_polls
  SET votes_count = votes_count + 1
  WHERE id = poll_id;
END;
$$;