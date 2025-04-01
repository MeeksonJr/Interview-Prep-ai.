import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSessionByToken, getUserById } from "@/lib/db"

export async function GET() {
  try {
    // Get the session token
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("session")
    const sessionToken = sessionCookie?.value

    console.log("[SERVER] Auth check - Session cookie exists:", !!sessionCookie)

    if (!sessionToken) {
      return NextResponse.json({
        authenticated: false,
        message: "No session token found",
      })
    }

    // Get the session
    const session = await getSessionByToken(sessionToken)

    if (!session) {
      return NextResponse.json({
        authenticated: false,
        message: "Invalid or expired session",
      })
    }

    // Get the user
    const user = await getUserById(session.user_id)

    if (!user) {
      return NextResponse.json({
        authenticated: false,
        message: "User not found",
      })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error: any) {
    console.error("[SERVER] Auth check error:", error)
    return NextResponse.json(
      {
        authenticated: false,
        error: error.message || "Authentication check failed",
      },
      { status: 500 },
    )
  }
}

