-- Add is_ended field to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_ended boolean DEFAULT false;

-- Create course_suggestions table for visitor suggestions
CREATE TABLE IF NOT EXISTS course_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  suggested_by_name text,
  suggested_by_email text,
  votes_count integer DEFAULT 0,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create course_polls table for admin-created polls
CREATE TABLE IF NOT EXISTS course_polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  votes_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  ended_at timestamp with time zone,
  updated_at timestamp with time zone DEFAULT now()
);

-- Create course_poll_votes table to track who voted
CREATE TABLE IF NOT EXISTS course_poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES course_polls(id) ON DELETE CASCADE,
  voter_identifier text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(poll_id, voter_identifier)
);

-- Create course_suggestion_votes table to track suggestion votes
CREATE TABLE IF NOT EXISTS course_suggestion_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id uuid REFERENCES course_suggestions(id) ON DELETE CASCADE,
  voter_identifier text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(suggestion_id, voter_identifier)
);

-- Enable RLS
ALTER TABLE course_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_suggestion_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for course_suggestions
CREATE POLICY "Anyone can view course suggestions"
  ON course_suggestions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert course suggestions"
  ON course_suggestions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update course suggestions"
  ON course_suggestions FOR UPDATE
  USING (true);

CREATE POLICY "Authenticated users can delete course suggestions"
  ON course_suggestions FOR DELETE
  USING (true);

-- RLS Policies for course_polls
CREATE POLICY "Anyone can view active course polls"
  ON course_polls FOR SELECT
  USING (is_active = true OR true);

CREATE POLICY "Authenticated users can insert course polls"
  ON course_polls FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update course polls"
  ON course_polls FOR UPDATE
  USING (true);

CREATE POLICY "Authenticated users can delete course polls"
  ON course_polls FOR DELETE
  USING (true);

-- RLS Policies for course_poll_votes
CREATE POLICY "Anyone can view poll votes"
  ON course_poll_votes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert poll votes"
  ON course_poll_votes FOR INSERT
  WITH CHECK (true);

-- RLS Policies for course_suggestion_votes
CREATE POLICY "Anyone can view suggestion votes"
  ON course_suggestion_votes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert suggestion votes"
  ON course_suggestion_votes FOR INSERT
  WITH CHECK (true);

-- Add triggers for updated_at
CREATE TRIGGER update_course_suggestions_updated_at
  BEFORE UPDATE ON course_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_polls_updated_at
  BEFORE UPDATE ON course_polls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();