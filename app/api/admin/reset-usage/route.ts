import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST() {
  try {
    // Reset the interviews_used_today counter for all users
    await sql`
     UPDATE users
     SET interviews_used_today = 0
   `

    return NextResponse.json({ success: true, message: "Daily usage counters reset successfully" })
  } catch (error: any) {
    console.error("Error resetting daily usage counters:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to reset daily usage counters" },
      { status: 500 },
    )
  }
}

