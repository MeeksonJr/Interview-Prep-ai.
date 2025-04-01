-- This is a reference for the database schema, not for direct execution

-- Existing tables (for reference)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS interviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title TEXT,
  role TEXT,
  type TEXT,
  level TEXT,
  technologies TEXT[],
  questions JSONB,
  responses JSONB,
  feedback JSONB,
  score INTEGER,
  completed BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS saved_interviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  interview_id INTEGER REFERENCES interviews(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, interview_id)
);

CREATE TABLE IF NOT EXISTS interview_likes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  interview_id INTEGER REFERENCES interviews(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, interview_id)
);

-- New table for shared interviews
CREATE TABLE IF NOT EXISTS shared_interviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  interview_id INTEGER NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, interview_id)
);

-- Table for resume uploads
CREATE TABLE IF NOT EXISTS user_resumes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  analysis JSONB,
  score INTEGER,
  career_path TEXT,
  level TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

