import { NextResponse } from "next/server"
import { createResumeContentsTable } from "@/lib/db-migration-resume-contents"

export async function GET() {
  try {
    console.log("API: Creating resume_contents table...")
    const result = await createResumeContentsTable()

    if (result.success) {
      return NextResponse.json({ success: true, message: "Resume contents table created successfully" })
    } else {
      return NextResponse.json({ success: false, error: "Failed to create resume contents table" }, { status: 500 })
    }
  } catch (error) {
    console.error("API Error creating resume contents table:", error)
    return NextResponse.json(
      { success: false, error: "An error occurred while creating resume contents table" },
      { status: 500 },
    )
  }
}

