-- This is just a reference for the schema, not to be executed directly

-- Add job_description column to interviews table if it doesn't exist
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS job_description TEXT;

-- Make sure is_public column exists for sharing to community
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

