"use server"

import { sql } from "@/lib/db"

export async function createResumeContentsTable() {
  try {
    console.log("Checking resume_contents table...")

    // Check if the table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'resume_contents'
      );
    `

    if (!tableExists[0].exists) {
      console.log("Creating resume_contents table...")

      await sql`
        CREATE TABLE resume_contents (
          id SERIAL PRIMARY KEY,
          resume_id INTEGER NOT NULL,
          content TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (resume_id) REFERENCES user_resumes(id) ON DELETE CASCADE
        );
      `

      console.log("resume_contents table created successfully")
    } else {
      console.log("resume_contents table already exists")
    }

    return { success: true }
  } catch (error) {
    console.error("Error migrating resume_contents table:", error)
    return { success: false, error }
  }
}

// Add the missing migrateResumeContentsTable function
export async function migrateResumeContentsTable() {
  try {
    console.log("Starting resume_contents table migration...")

    // First, ensure the table exists
    const result = await createResumeContentsTable()

    if (!result.success) {
      throw new Error("Failed to create resume_contents table")
    }

    // Check if we need to add any indexes or additional columns
    const indexExists = await sql`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'resume_contents' 
        AND indexname = 'idx_resume_contents_resume_id'
      );
    `

    if (!indexExists[0].exists) {
      console.log("Adding index on resume_id column...")
      await sql`
        CREATE INDEX idx_resume_contents_resume_id ON resume_contents(resume_id);
      `
      console.log("Index created successfully")
    }

    // Check if we need to migrate any data from other tables
    // This is a placeholder for any future data migration logic
    console.log("Checking for data to migrate...")

    // For now, we'll just log that the migration is complete
    console.log("Resume contents table migration completed successfully")

    return { success: true, message: "Resume contents table migration completed successfully" }
  } catch (error) {
    console.error("Error during resume_contents table migration:", error)
    return { success: false, error }
  }
}

