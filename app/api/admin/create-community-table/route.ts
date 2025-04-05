import { NextResponse } from "next/server"
import { migrateCommunityTable } from "@/lib/db-migration-community"

export async function GET() {
  try {
    console.log("Creating community_interviews table...")
    const result = await migrateCommunityTable()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Community interviews table created successfully",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error?.message || "Failed to create community interviews table",
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Error creating community interviews table:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unexpected error occurred",
      },
      { status: 500 },
    )
  }
}

