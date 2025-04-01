import { type NextRequest, NextResponse } from "next/server"
import { getUserResumes } from "@/lib/db-resume"

export async function GET(request: NextRequest) {
  try {
    // Get the userId from the query parameters
    const userId = request.nextUrl.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Convert userId to number
    const userIdNum = Number.parseInt(userId, 10)

    if (isNaN(userIdNum)) {
      return NextResponse.json({ error: "Invalid User ID" }, { status: 400 })
    }

    // Fetch the user's resumes
    const result = await getUserResumes(userIdNum)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Return the resumes
    return NextResponse.json({ resumes: result.resumes })
  } catch (error: any) {
    console.error("Error in resumes API:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch resumes" }, { status: 500 })
  }
}

