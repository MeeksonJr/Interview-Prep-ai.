import type { AnswerEvaluationParams } from "./types"
import { evaluateAnswer as geminiEvaluateAnswer } from "@/app/actions/gemini-actions"

export async function evaluateAnswer(params: AnswerEvaluationParams): Promise<any> {
  try {
    // Use the evaluateAnswer function from gemini-actions
    return await geminiEvaluateAnswer(params)
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

