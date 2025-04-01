import { NextResponse } from "next/server"
import { checkAndRepairUserUsage } from "@/lib/db-repair"

export async function GET() {
  try {
    const result = await checkAndRepairUserUsage()

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}

