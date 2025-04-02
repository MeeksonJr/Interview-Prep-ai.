import { NextResponse } from "next/server"
import { migrateCommunityTable } from "@/lib/db-migration-community"

export async function GET() {
  try {
    const result = await migrateCommunityTable()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Community table migration completed successfully",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to migrate community table",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in migrate-community-table API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred",
      },
      { status: 500 },
    )
  }
}

