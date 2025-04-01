import { NextResponse } from "next/server"
import { migrateResumeTable } from "@/lib/db-migration-resume"

export async function GET() {
  try {
    const result = await migrateResumeTable()

    if (result.success) {
      return NextResponse.json({ success: true, message: "Resume table migration completed successfully" })
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to migrate resume table", details: result.error },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in resume table migration route:", error)
    return NextResponse.json({ success: false, error: "Internal server error", details: error }, { status: 500 })
  }
}

