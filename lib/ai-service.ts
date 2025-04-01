import type { InterviewGeneratorParams, InterviewQuestion, AnswerEvaluationParams } from "./types"
import { GeminiService } from "./gemini-service"

// This service now uses Gemini API for all AI functionality
export class AIService {
  // Generate interview questions based on parameters
  static async generateInterviewQuestions(params: InterviewGeneratorParams): Promise<InterviewQuestion[]> {
    return GeminiService.generateInterviewQuestions(params)
  }

  // Evaluate an answer to an interview question
  static async evaluateAnswer(params: AnswerEvaluationParams): Promise<any> {
    return GeminiService.evaluateAnswer(params)
  }

  // Generate a conversation response for the AI interviewer
  static async generateConversationResponse(message: string, context: any): Promise<string> {
    return GeminiService.generateConversationResponse(message, context)
  }
}

