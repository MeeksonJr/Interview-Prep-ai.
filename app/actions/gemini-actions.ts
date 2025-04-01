"use server"

import { getGeminiApiKey } from "@/lib/server-utils"

// Function to generate interview questions
export async function generateInterviewQuestions(prompt: string) {
  try {
    const apiKey = getGeminiApiKey()
    if (!apiKey) {
      throw new Error("Gemini API key not found")
    }

    // Import the Google Generative AI library
    const { GoogleGenerativeAI } = await import("@google/generative-ai")
    const genAI = new GoogleGenerativeAI(apiKey)

    // Use gemini-1.5-flash model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Generate content
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    return text
  } catch (error: any) {
    console.error("Error generating questions with Gemini:", error)
    throw new Error(`Failed to generate questions with AI: ${error.message}`)
  }
}

// Function to evaluate an answer
export async function evaluateAnswer(prompt: string) {
  try {
    const apiKey = getGeminiApiKey()
    if (!apiKey) {
      throw new Error("Gemini API key not found")
    }

    // Import the Google Generative AI library
    const { GoogleGenerativeAI } = await import("@google/generative-ai")
    const genAI = new GoogleGenerativeAI(apiKey)

    // Use gemini-1.5-flash model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Generate content
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    return text
  } catch (error: any) {
    console.error("Error evaluating answer with Gemini:", error)
    throw new Error(`Failed to evaluate answer with AI: ${error.message}`)
  }
}

// Function to generate analysis
export async function generateAnalysis(prompt: string) {
  try {
    const apiKey = getGeminiApiKey()
    if (!apiKey) {
      throw new Error("Gemini API key not found")
    }

    // Import the Google Generative AI library
    const { GoogleGenerativeAI } = await import("@google/generative-ai")
    const genAI = new GoogleGenerativeAI(apiKey)

    // Use gemini-1.5-flash model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Generate content
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    return text
  } catch (error: any) {
    console.error("Error generating analysis with Gemini:", error)
    throw new Error(`Failed to generate analysis with AI: ${error.message}`)
  }
}

