import type { AnswerEvaluationParams } from "./types"
import { GeminiService } from "./gemini-service"

export async function evaluateAnswer(params: AnswerEvaluationParams): Promise<any> {
  try {
    // Use the Gemini service to evaluate the answer
    return await GeminiService.evaluateAnswer(params)
  } catch (error) {
    console.error("Error evaluating answer:", error)
    // Return a basic evaluation if there's an error
    return {
      score: 50,
      strengths: ["Attempted to answer the question"],
      improvements: ["Provide more detailed responses"],
      detailedFeedback: "We couldn't generate a detailed evaluation at this time. Please try again later.",
    }
  }
}

