import { neon } from "@neondatabase/serverless"

// Updated connection string - note the removal of -pooler from the URL
export const connectionString = process.env.NEXT_PUBLIC_connection_StringL || ""

export async function checkDatabaseConnection() {
  try {
    // Create a new neon client for each connection check
    const sql = neon(connectionString)

    // Use a simple query to test the connection
    const result = await sql`SELECT NOW() as time`

    if (!result || result.length === 0) {
      throw new Error("No result returned from database")
    }

    console.log("Database connection successful:", result[0].time)
    return true
  } catch (error) {
    console.error("Database connection error:", error)
    return false
  }
}

