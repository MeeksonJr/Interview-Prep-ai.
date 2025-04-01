-- Create the user_resumes table
CREATE TABLE IF NOT EXISTS user_resumes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  career_path TEXT NOT NULL,
  level TEXT NOT NULL,
  score INTEGER NOT NULL,
  analysis JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS user_resumes_user_id_idx ON user_resumes(user_id);

-- Add a comment to the table
COMMENT ON TABLE user_resumes IS 'Stores user resume files and analysis results';

