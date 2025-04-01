import { sql } from "@/lib/db"

export async function migrateJobAnalysisTable() {
  try {
    console.log("Checking job_analysis table...")

    // Check if the table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'job_analysis'
      );
    `

    if (!tableExists[0].exists) {
      console.log("Creating job_analysis table...")

      await sql`
        CREATE TABLE job_analysis (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          resume_id INTEGER NOT NULL,
          job_title TEXT,
          company TEXT,
          job_description TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (resume_id) REFERENCES user_resumes(id) ON DELETE CASCADE
        );
      `

      console.log("job_analysis table created successfully")
    } else {
      console.log("job_analysis table already exists")
    }

    return { success: true }
  } catch (error) {
    console.error("Error migrating job_analysis table:", error)
    return { success: false, error }
  }
}

