"use server"

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai"
import type { EvaluationResult } from "@/lib/types"

// Initialize the Google Generative AI client
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY

// Function to generate text with Gemini
export async function generateText(prompt: string): Promise<string> {
  if (!API_KEY) {
    console.error("Gemini API key is not set")
    throw new Error("Gemini API key is not set")
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY)

    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    })

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    return text
  } catch (error) {
    console.error("Error generating text with Gemini:", error)
    throw error
  }
}

// Function to evaluate an answer with Gemini
export async function evaluateAnswer(
  question: string,
  answer: string,
  jobRole: string,
  experienceLevel: string,
): Promise<EvaluationResult> {
  try {
    // Prepare the prompt for Gemini
    const prompt = `
    You are an expert interviewer evaluating a candidate's response to a job interview question.

    Question: "${question}"
    
    Candidate's Answer: "${answer}"
    
    Job Role: ${jobRole}
    Experience Level: ${experienceLevel}
    
    Evaluate the answer based on the following criteria and provide a score from 0-10 for each:
    
    1. Relevance: How directly the answer addresses the question
    2. Clarity: How well-structured and easy to understand the answer is
    3. Accuracy: The technical correctness of the answer (if applicable)
    4. Depth: The level of detail and understanding demonstrated
    5. Impression: The overall impression the answer would make on an interviewer
    
    For each criterion, provide:
    - A score (0-10)
    - Brief feedback explaining the score
    
    Also provide:
    - An overall score (0-10)
    - General feedback on the answer
    - Specific suggestions for improvement
    
    Format your response as a JSON object with the following structure:
    
    {
      "criteria": {
        "relevance": {
          "score": number,
          "feedback": "string"
        },
        "clarity": {
          "score": number,
          "feedback": "string"
        },
        "accuracy": {
          "score": number,
          "feedback": "string"
        },
        "depth": {
          "score": number,
          "feedback": "string"
        },
        "impression": {
          "score": number,
          "feedback": "string"
        }
      },
      "overallScore": number,
      "feedback": "string",
      "suggestions": "string"
    }
    
    Return ONLY the JSON object without any markdown formatting, code blocks, or additional text.
    `

    // Try multiple models in case one fails
    const models = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-pro-vision"]
    let lastError = null
    let rawResponse = ""

    for (const modelName of models) {
      try {
        const genAI = new GoogleGenerativeAI(API_KEY!)
        const model = genAI.getGenerativeModel({ model: modelName })
        const result = await model.generateContent(prompt)
        const response = await result.response
        rawResponse = response.text()

        // Clean the response if it contains markdown code blocks
        let cleanedResponse = rawResponse

        // Remove markdown code block indicators if present
        if (cleanedResponse.includes("```json")) {
          cleanedResponse = cleanedResponse.replace(/```json\n/g, "").replace(/```/g, "")
        } else if (cleanedResponse.includes("```")) {
          cleanedResponse = cleanedResponse.replace(/```\n/g, "").replace(/```/g, "")
        }

        // Parse the JSON response
        const evaluation = JSON.parse(cleanedResponse)

        // Convert to our application's format
        return {
          // @ts-ignore
          criteria: {
            relevance: {
              score: evaluation.criteria.relevance.score,
              feedback: evaluation.criteria.relevance.feedback,
            },
            clarity: {
              score: evaluation.criteria.clarity.score,
              feedback: evaluation.criteria.clarity.feedback,
            },
            accuracy: {
              score: evaluation.criteria.accuracy.score,
              feedback: evaluation.criteria.accuracy.feedback,
            },
            depth: {
              score: evaluation.criteria.depth.score,
              feedback: evaluation.criteria.depth.feedback,
            },
            impression: {
              score: evaluation.criteria.impression.score,
              feedback: evaluation.criteria.impression.feedback,
            },
          },
          overallScore: evaluation.overallScore,
          feedback: evaluation.feedback,
          suggestions: evaluation.suggestions,
          strengths: extractStrengths(evaluation),
          improvements: extractImprovements(evaluation),
        }
      } catch (error) {
        console.error(`Error with model ${modelName}:`, error)
        lastError = error
        // Try the next model
      }
    }

    // If all models failed, try one last attempt to parse the raw response if it exists
    if (rawResponse) {
      try {
        console.log("Attempting to parse raw response:", rawResponse.substring(0, 100) + "...")

        // Try to extract JSON from the raw response
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const jsonStr = jsonMatch[0]
          const evaluation = JSON.parse(jsonStr)

          return {
            // @ts-ignore
            criteria: {
              relevance: {
                score: evaluation.criteria.relevance.score,
                feedback: evaluation.criteria.relevance.feedback,
              },
              clarity: {
                score: evaluation.criteria.clarity.score,
                feedback: evaluation.criteria.clarity.feedback,
              },
              accuracy: {
                score: evaluation.criteria.accuracy.score,
                feedback: evaluation.criteria.accuracy.feedback,
              },
              depth: {
                score: evaluation.criteria.depth.score,
                feedback: evaluation.criteria.depth.feedback,
              },
              impression: {
                score: evaluation.criteria.impression.score,
                feedback: evaluation.criteria.impression.feedback,
              },
            },
            overallScore: evaluation.overallScore,
            feedback: evaluation.feedback,
            suggestions: evaluation.suggestions,
            strengths: extractStrengths(evaluation),
            improvements: extractImprovements(evaluation),
          }
        }
      } catch (parseError) {
        console.error("Error parsing raw response:", parseError)
        console.log("Raw response:", rawResponse)
      }
    }

    // If all models failed, use a rule-based evaluation
    console.error("All Gemini models failed, using rule-based evaluation")
    return ruleBasedEvaluation(answer, question)
  } catch (error) {
    console.error("Error evaluating answer with Gemini:", error)
    // Return a basic evaluation if Gemini fails
    return ruleBasedEvaluation(answer, question)
  }
}

// Add the missing generateAnalysis function
export async function generateAnalysis(prompt: string): Promise<string> {
  if (!API_KEY) {
    console.error("Gemini API key is not set")
    throw new Error("Gemini API key is not set")
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY)

    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    })

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    return text
  } catch (error) {
    console.error("Error generating analysis with Gemini:", error)
    throw error
  }
}

// Helper function to extract strengths from evaluation
function extractStrengths(evaluation: any): string[] {
  const strengths: string[] = []

  // Extract strengths from criteria with high scores (7+)
  Object.entries(evaluation.criteria).forEach(([criterion, data]: [string, any]) => {
    if (data.score >= 7) {
      strengths.push(`Strong ${criterion}: ${data.feedback.split(".")[0]}.`)
    }
  })

  // If no high scores, find the highest scoring criterion
  if (strengths.length === 0) {
    let highestCriterion = ""
    let highestScore = -1

    Object.entries(evaluation.criteria).forEach(([criterion, data]: [string, any]) => {
      if (data.score > highestScore) {
        highestScore = data.score
        highestCriterion = criterion
      }
    })

    if (highestCriterion) {
      const data = evaluation.criteria[highestCriterion]
      strengths.push(`Relatively stronger ${highestCriterion}: ${data.feedback.split(".")[0]}.`)
    }
  }

  // If still empty, add a generic strength
  if (strengths.length === 0) {
    strengths.push("Attempted to answer the question")
  }

  return strengths
}

// Helper function to extract improvements from evaluation
function extractImprovements(evaluation: any): string[] {
  const improvements: string[] = []

  // Extract improvements from criteria with low scores (5 or less)
  Object.entries(evaluation.criteria).forEach(([criterion, data]: [string, any]) => {
    if (data.score <= 5) {
      improvements.push(`Improve ${criterion}: ${data.feedback.split(".")[0]}.`)
    }
  })

  // Add suggestions if available
  if (evaluation.suggestions) {
    const suggestionsList = evaluation.suggestions
      .split(".")
      .filter((s: string) => s.trim().length > 0)
      .map((s: string) => s.trim())
      .slice(0, 2) // Take only the first two suggestions

    improvements.push(...suggestionsList)
  }

  // If still empty, add a generic improvement
  if (improvements.length === 0) {
    improvements.push("Provide more specific examples and details in your answer")
  }

  return improvements
}

// Rule-based evaluation for when Gemini fails
function ruleBasedEvaluation(answer: string, question: string): EvaluationResult {
  // Basic metrics
  const wordCount = answer.split(/\s+/).filter(Boolean).length
  const sentenceCount = answer.split(/[.!?]+/).filter(Boolean).length

  // Score based on length (very basic)
  let lengthScore = 0
  if (wordCount >= 150) lengthScore = 8
  else if (wordCount >= 100) lengthScore = 6
  else if (wordCount >= 50) lengthScore = 4
  else if (wordCount >= 20) lengthScore = 2
  else lengthScore = 1

  // Check if answer contains keywords from question (very basic relevance check)
  const questionWords = new Set(
    question
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3),
  )

  const answerWords = answer
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3)

  const matchingWords = answerWords.filter((w) => questionWords.has(w))
  const relevanceScore = Math.min(Math.floor((matchingWords.length / questionWords.size) * 10), 8)

  // Structure score based on sentence count
  const structureScore = Math.min(Math.floor(sentenceCount / 3), 7)

  // Overall score
  const overallScore = Math.floor((lengthScore + relevanceScore + structureScore) / 3)

  return {
    // @ts-ignore
    criteria: {
      relevance: {
        score: relevanceScore,
        feedback: `The answer ${relevanceScore > 5 ? "addresses" : "partially addresses"} the question.`,
      },
      clarity: {
        score: structureScore,
        feedback: `The answer is ${structureScore > 5 ? "well-structured" : "somewhat structured"} with ${sentenceCount} sentences.`,
      },
      accuracy: {
        score: 5, // Neutral score for accuracy since we can't evaluate technical correctness
        feedback: "Unable to evaluate technical accuracy without domain knowledge.",
      },
      depth: {
        score: lengthScore,
        feedback: `The answer provides ${lengthScore > 5 ? "good" : "limited"} detail with ${wordCount} words.`,
      },
      impression: {
        score: overallScore,
        feedback: `The overall impression is ${overallScore > 7 ? "strong" : overallScore > 4 ? "average" : "weak"}.`,
      },
    },
    overallScore: overallScore,
    feedback: `This is an automated evaluation. The answer is ${wordCount} words long and contains ${sentenceCount} sentences. It matches ${matchingWords.length} keywords from the question.`,
    suggestions:
      "Provide more specific examples. Structure your answer with a clear introduction and conclusion. Directly address all parts of the question.",
    strengths: [
      "Attempted to answer the question",
      wordCount > 100 ? "Provided a substantial response" : "Provided a response",
    ],
    improvements: [
      "Add more specific examples and details",
      "Ensure all parts of the question are addressed",
      "Structure your answer more clearly",
    ],
  }
}

