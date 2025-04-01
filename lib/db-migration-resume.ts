import { sql } from "@/lib/db"

export async function migrateResumeTable() {
  try {
    console.log("Running resume table migration...")

    // Create user_resumes table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS user_resumes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        file_name TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        career_path TEXT NOT NULL,
        level TEXT NOT NULL,
        score INTEGER NOT NULL,
        analysis JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `
    console.log("Created user_resumes table")

    // Create an index on user_id for faster lookups
    await sql`
      CREATE INDEX IF NOT EXISTS user_resumes_user_id_idx ON user_resumes(user_id)
    `
    console.log("Created index on user_resumes.user_id")

    console.log("Resume table migration completed successfully")
    return { success: true }
  } catch (error) {
    console.error("Error running resume table migration:", error)
    return { success: false, error }
  }
}

