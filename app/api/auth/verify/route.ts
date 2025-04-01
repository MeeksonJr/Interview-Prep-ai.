import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { getUserById } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ authenticated: false, message: "No token provided" }, { status: 400 })
    }

    // Verify the token
    const decoded = await verifyToken(token)
    if (!decoded || !decoded.id) {
      return NextResponse.json({ authenticated: false, message: "Invalid token" }, { status: 401 })
    }

    // Get the user from the database
    const user = await getUserById(decoded.id)
    if (!user) {
      return NextResponse.json({ authenticated: false, message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    console.error("Error verifying token:", error)
    return NextResponse.json({ authenticated: false, message: "Error verifying token" }, { status: 500 })
  }
}

