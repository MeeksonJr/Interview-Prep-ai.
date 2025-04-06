import { NextResponse } from "next/server"
import { validateGeminiApiKey } from "@/lib/api-key-validator"
import { getGeminiApiKey } from "@/lib/server-utils"

export async function GET() {
  try {
    // Use the server utility to get the API key
    const apiKey = getGeminiApiKey()
    const isValid = await validateGeminiApiKey(apiKey)

    return NextResponse.json({
      valid: isValid,
      modelName: isValid ? await getActiveModelName(apiKey) : null,
    })
  } catch (error) {
    console.error("Error validating Gemini API:", error)
    return NextResponse.json({ valid: false, error: "Failed to validate API key" }, { status: 500 })
  }
}

async function getActiveModelName(apiKey: string): Promise<string> {
  try {
    // This function runs server-side, so we can safely import the Google Generative AI library
    const { GoogleGenerativeAI } = await import("@google/generative-ai")
    const genAI = new GoogleGenerativeAI(apiKey)

    try {
      // Try flash model first
      const flashModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
      await flashModel.generateContent("test")
      return "gemini-1.5-flash"
    } catch (flashError) {
      // Try pro model as fallback
      try {
        const proModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
        await proModel.generateContent("test")
        return "gemini-2.0-flash"
      } catch (proError) {
        return "unknown"
      }
    }
  } catch (error) {
    console.error("Error checking model:", error)
    return "unknown"
  }
}

