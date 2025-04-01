import { sql } from "@/lib/db"

export async function createResumeContentsTable() {
  try {
    console.log("Creating resume_contents table if it doesn't exist...")

    // First, check if the table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'resume_contents'
      );
    `

    if (tableExists[0].exists) {
      console.log("resume_contents table already exists")
      return { success: true }
    }

    // Create the table
    await sql`
      CREATE TABLE resume_contents (
        id SERIAL PRIMARY KEY,
        resume_id INTEGER NOT NULL,
        content TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `

    console.log("resume_contents table created successfully")
    return { success: true }
  } catch (error) {
    console.error("Error creating resume_contents table:", error)
    return { success: false, error }
  }
}

