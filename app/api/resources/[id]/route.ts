import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id

  try {
    // Instead of using the AI SDK directly, we'll redirect to the fallback API
    // This ensures we always get a valid response
    const fallbackUrl = new URL(request.url)
    fallbackUrl.pathname = `/api/resources/fallback/${id}`

    return NextResponse.redirect(fallbackUrl)
  } catch (error: any) {
    console.error("API route error:", error)

    // If all else fails, return a simple error message in valid JSON format
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Please try again later.",
      },
      { status: 500 },
    )
  }
}

