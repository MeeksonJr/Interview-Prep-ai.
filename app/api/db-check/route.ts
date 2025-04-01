import { NextResponse } from "next/server"
import { checkDatabaseConnection } from "@/lib/db-check"
import { neon } from "@neondatabase/serverless"
import { connectionString } from "@/lib/db"

export async function GET() {
  try {
    // First check database connection
    const isConnected = await checkDatabaseConnection()

    if (!isConnected) {
      return NextResponse.json(
        {
          status: "error",
          message: "Database connection failed - please check your connection string and database credentials",
        },
        { status: 500 },
      )
    }

    // Check table structure
    try {
      const sql = neon(connectionString)

      // Check users table structure
      const usersColumns = await sql`
       SELECT column_name 
       FROM information_schema.columns 
       WHERE table_schema = 'public' 
       AND table_name = 'users'
     `

      const columnNames = usersColumns.map((col) => col.column_name)

      // Check connection to interviews table
      const interviewsCheck = await sql`
       SELECT COUNT(*) FROM interviews
     `

      return NextResponse.json({
        status: "success",
        message: "Database connection successful",
        connectionString: connectionString.replace(/:[^:/]+@/, ":****@"), // Hide password
        tables: {
          users: {
            exists: columnNames.length > 0,
            columns: columnNames,
          },
          interviews: {
            exists: true,
            count: interviewsCheck[0].count,
          },
        },
      })
    } catch (error) {
      return NextResponse.json({
        status: "warning",
        message: "Database connected but schema check failed",
        error: error.message,
        connectionString: connectionString.replace(/:[^:/]+@/, ":****@"), // Hide password
      })
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: "Database connection check failed",
        error: error.message,
        connectionString: connectionString.replace(/:[^:/]+@/, ":****@"), // Hide password
      },
      { status: 500 },
    )
  }
}

