import type { InterviewQuestion, EvaluationResult } from "./types"
import { evaluateAnswer as evaluateWithGemini } from "@/app/actions/gemini-actions"

export async function evaluateAnswer(question: InterviewQuestion, answer: string): Promise<EvaluationResult> {
  try {
    // First try to evaluate with Gemini
    return await evaluateWithGemini(question, answer)
  } catch (error) {
    console.error("Error in interview-evaluator:", error)

    // If Gemini fails, use a simple rule-based evaluation
    return simpleRuleBasedEvaluation(question, answer)
  }
}

// A simple rule-based evaluation that doesn't rely on AI
function simpleRuleBasedEvaluation(question: InterviewQuestion, answer: string): EvaluationResult {
  // Basic metrics
  const answerLength = answer.length
  const wordCount = answer.split(/\s+/).length

  // Very basic scoring based on length
  let lengthScore = 0
  if (wordCount < 10) lengthScore = 30
  else if (wordCount < 30) lengthScore = 50
  else if (wordCount < 50) lengthScore = 70
  else lengthScore = 80

  // Check if answer contains keywords from the question
  const questionWords = question.text.toLowerCase().split(/\s+/)
  const answerLower = answer.toLowerCase()
  const keywordMatches = questionWords.filter((word) => word.length > 4 && answerLower.includes(word)).length

  const keywordScore = Math.min(100, Math.floor(keywordMatches / 2) * 10 + 50)

  // Overall score is average of length and keyword scores
  const overallScore = Math.round((lengthScore + keywordScore) / 2)

  // Generate strengths based on scores
  const strengths = []
  if (wordCount >= 30) strengths.push("You provided a detailed response.")
  if (keywordMatches >= 3) strengths.push("Your answer addressed key points from the question.")
  if (strengths.length === 0) strengths.push("You attempted to answer the question.")

  // Generate improvements based on scores
  const improvements = []
  if (wordCount < 30) improvements.push("Try to provide more details in your answer.")
  if (keywordMatches < 3) improvements.push("Make sure to address all parts of the question directly.")
  if (improvements.length === 0) improvements.push("Continue practicing to improve your interview skills.")

  return {
    score: overallScore,
    strengths,
    improvements,
    detailedFeedback: `Your answer contained ${wordCount} words and addressed ${keywordMatches} key points from the question. ${
      overallScore >= 70 ? "Good job providing a detailed response!" : "Consider providing more details in your answer."
    }`,
  }
}

