import { GoogleGenerativeAI } from "@google/generative-ai"

export async function validateGeminiApiKey(apiKey: string): Promise<boolean> {
  if (!apiKey) return false

  try {
    const genAI = new GoogleGenerativeAI(apiKey)

    // Try with gemini-1.5-flash first
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
      const result = await model.generateContent("Test")
      const response = await result.response
      const text = response.text()

      return text.length > 0
    } catch (flashError) {
      console.error("Error validating with gemini-1.5-flash:", flashError)

      // Fall back to gemini-pro if flash isn't available
      try {
        const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
        const fallbackResult = await fallbackModel.generateContent("Test")
        const fallbackResponse = await fallbackResult.response
        const fallbackText = fallbackResponse.text()

        return fallbackText.length > 0
      } catch (proError) {
        console.error("Error validating with gemini-pro:", proError)
        return false
      }
    }
  } catch (error) {
    console.error("Error validating Gemini API key:", error)
    return false
  }
}

export function getGeminiApiKey(): string {
  return process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
}

