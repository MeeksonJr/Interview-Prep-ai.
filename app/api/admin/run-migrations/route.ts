import { NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/db-init"

export async function GET() {
  try {
    const result = await initializeDatabase()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Database migrations completed successfully",
        results: result.results,
      })
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to run migrations", details: result.error },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error running migrations:", error)
    return NextResponse.json({ success: false, error: "Error running migrations", details: error }, { status: 500 })
  }
}

