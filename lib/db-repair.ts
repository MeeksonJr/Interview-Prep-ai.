import { neon } from "@neondatabase/serverless"
import { connectionString } from "./db"

/**
 * Checks and repairs the user_usage table if needed
 * This can be called from an admin endpoint or scheduled job
 */
export async function checkAndRepairUserUsage() {
  const sql = neon(connectionString)

  try {
    console.log("Checking user_usage table...")

    // Check if the table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_usage'
      ) as exists
    `

    if (!tableExists[0].exists) {
      console.log("user_usage table doesn't exist, creating it...")
      await sql`
        CREATE TABLE IF NOT EXISTS user_usage (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          interviews_used INTEGER DEFAULT 0,
          results_viewed INTEGER DEFAULT 0,
          retakes_done INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE
        )
      `
      console.log("user_usage table created successfully")
    }

    // Check if there are any users without usage records for today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const usersWithoutUsage = await sql`
      SELECT u.id 
      FROM users u
      LEFT JOIN user_usage uu ON u.id = uu.user_id AND uu.date >= ${today}
      WHERE uu.id IS NULL
    `

    if (usersWithoutUsage.length > 0) {
      console.log(`Found ${usersWithoutUsage.length} users without usage records for today, creating them...`)

      for (const user of usersWithoutUsage) {
        await sql`
          INSERT INTO user_usage (user_id, date)
          VALUES (${user.id}, CURRENT_DATE)
        `
      }

      console.log("Created missing usage records successfully")
    }

    return {
      success: true,
      message: "User usage table checked and repaired if needed",
      usersFixed: usersWithoutUsage.length,
    }
  } catch (error) {
    console.error("Error checking/repairing user_usage table:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

