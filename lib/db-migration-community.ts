import { sql } from "@/lib/db"

export async function migrateCommunityTable() {
  console.log("Running community table migration...")

  try {
    // Check if community_interviews table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'community_interviews'
      );
    `

    if (!tableExists[0].exists) {
      // Create community_interviews table
      await sql`
        CREATE TABLE IF NOT EXISTS community_interviews (
          id SERIAL PRIMARY KEY,
          interview_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          title TEXT,
          description TEXT,
          tags TEXT[]
        );
      `
      console.log("Created community_interviews table")

      // Create necessary indexes for performance
      await sql`
        CREATE INDEX IF NOT EXISTS idx_community_interviews_interview_id ON community_interviews(interview_id);
      `
      await sql`
        CREATE INDEX IF NOT EXISTS idx_community_interviews_user_id ON community_interviews(user_id);
      `
      console.log("Created indexes for community_interviews table")
    } else {
      console.log("community_interviews table already exists")
    }

    // Check if is_public column exists in interviews table and has default false
    const columnCheck = await sql`
      SELECT column_default 
      FROM information_schema.columns 
      WHERE table_name = 'interviews' AND column_name = 'is_public';
    `

    if (columnCheck.length === 0) {
      // Add is_public column if it doesn't exist
      await sql`
        ALTER TABLE interviews 
        ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;
      `
      console.log("Added is_public column to interviews table")
    } else if (columnCheck[0].column_default !== "false") {
      // Update default value if it's not false
      await sql`
        ALTER TABLE interviews 
        ALTER COLUMN is_public SET DEFAULT FALSE;
      `
      console.log("Updated is_public default value to FALSE")
    }

    console.log("Community table migration completed successfully")
    return { success: true }
  } catch (error) {
    console.error("Error during community table migration:", error)
    return { success: false, error }
  }
}

