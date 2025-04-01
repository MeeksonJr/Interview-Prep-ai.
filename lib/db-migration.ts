import { sql } from "@/lib/db"

export async function runMigrations() {
  try {
    console.log("Running database migrations...")

    // Add new fields to interviews table
    await sql`
      ALTER TABLE interviews 
      ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS job_description TEXT
    `
    console.log("Added new fields to interviews table")

    // Create interview_likes table
    await sql`
      CREATE TABLE IF NOT EXISTS interview_likes (
        user_id INTEGER NOT NULL,
        interview_id INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, interview_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE
      )
    `
    console.log("Created interview_likes table")

    // Create saved_interviews table
    await sql`
      CREATE TABLE IF NOT EXISTS saved_interviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        interview_id INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE
      )
    `
    console.log("Created saved_interviews table")

    // Create job_descriptions table
    await sql`
      CREATE TABLE IF NOT EXISTS job_descriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        description TEXT NOT NULL,
        title TEXT,
        company TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        interview_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE SET NULL
      )
    `
    console.log("Created job_descriptions table")

    console.log("Database migrations completed successfully")
    return { success: true }
  } catch (error) {
    console.error("Error running database migrations:", error)
    return { success: false, error }
  }
}

// Add the missing migrateDatabase export
export async function migrateDatabase() {
  try {
    console.log("Starting database migration...")
    const result = await runMigrations()

    if (result.success) {
      console.log("Database migration completed successfully")
      return { success: true }
    } else {
      console.error("Database migration failed:", result.error)
      return { success: false, error: result.error }
    }
  } catch (error) {
    console.error("Error during database migration:", error)
    return { success: false, error }
  }
}

