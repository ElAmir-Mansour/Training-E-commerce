-- Add optional voter information columns to course_poll_votes table
ALTER TABLE course_poll_votes
ADD COLUMN voter_name TEXT,
ADD COLUMN voter_job TEXT,
ADD COLUMN voter_city TEXT,
ADD COLUMN voter_phone TEXT,
ADD COLUMN voter_email TEXT;