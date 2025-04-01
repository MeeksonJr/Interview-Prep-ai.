"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"
import type { InterviewGeneratorParams, InterviewQuestion, AnswerEvaluationParams } from "@/lib/types"
import { getGeminiApiKey } from "@/lib/server-utils"

// Safety settings to avoid harmful content
const safetySettings = [
  {
    category: "HARM_CATEGORY_HARASSMENT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    category: "HARM_CATEGORY_HATE_SPEECH",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
]

// Get the model
function getModel() {
  // Use the server utility to get the API key
  const apiKey = getGeminiApiKey()
  const genAI = new GoogleGenerativeAI(apiKey)

  try {
    return genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      safetySettings,
    })
  } catch (error) {
    console.error("Error getting gemini-1.5-flash model:", error)

    // Fall back to gemini-pro if the flash model isn't available
    try {
      console.log("Falling back to gemini-pro model")
      return genAI.getGenerativeModel({
        model: "gemini-pro",
        safetySettings,
      })
    } catch (fallbackError) {
      console.error("Error getting fallback model:", fallbackError)
      throw new Error("Failed to initialize any Gemini model. Please check your API key and try again.")
    }
  }
}

export class GeminiService {
  // Generate interview questions based on parameters
  static async generateInterviewQuestions(params: InterviewGeneratorParams): Promise<InterviewQuestion[]> {
    try {
      const { role, type, level, questionCount, technologies } = params

      // Get the model
      const model = getModel()

      // Construct the prompt for generating interview questions
      const prompt = `
        Generate ${questionCount} interview questions for a ${level} ${role} position.
        The interview type is ${type} (${type === "mixed" ? "both technical and behavioral" : type}).
        ${technologies.length > 0 ? `Focus on these technologies: ${technologies.join(", ")}.` : ""}
        
        Format the response as a JSON array of objects with the following structure:
        [
          {
            "question": "The interview question text",
            "type": "technical" or "behavioral"
          }
        ]
        
        Make sure the questions are appropriate for the ${level} level and focus on ${role} skills.
        ${type === "technical" ? "Include specific technical questions related to the technologies mentioned." : ""}
        ${type === "behavioral" ? "Focus on past experiences and soft skills." : ""}
        ${type === "mixed" ? "Include a mix of technical and behavioral questions." : ""}
        
        Return ONLY the JSON array, no additional text.
      `

      try {
        // Generate content
        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        // Parse the JSON response
        try {
          // Extract JSON from the response (in case there's additional text)
          const jsonMatch = text.match(/\[[\s\S]*\]/)
          const jsonString = jsonMatch ? jsonMatch[0] : text

          const questions = JSON.parse(jsonString) as InterviewQuestion[]

          // Validate and ensure we have the right number of questions
          const validQuestions = questions.filter((q) => q.question && q.type).slice(0, questionCount)

          return validQuestions
        } catch (parseError) {
          console.error("Error parsing Gemini response:", parseError)
          console.log("Raw response:", text)
          throw new Error("Failed to parse interview questions")
        }
      } catch (generateError) {
        console.error("Error generating content:", generateError)
        throw new Error("Failed to generate interview questions")
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error)
      throw new Error("Failed to generate interview questions")
    }
  }

  // Evaluate an answer to an interview question
  static async evaluateAnswer(params: AnswerEvaluationParams): Promise<any> {
    try {
      const { question, answer, role, level, type } = params

      // Get the model
      const model = getModel()

      // Construct the prompt for evaluating the answer
      const prompt = `
        Evaluate this ${type} interview answer for a ${level} ${role} position.
        
        Question: "${question}"
        
        Answer: "${answer}"
        
        Provide an evaluation in JSON format with the following structure:
        {
          "score": (a number from 0 to 100),
          "strengths": [array of strengths in the answer],
          "improvements": [array of areas for improvement],
          "detailedFeedback": "detailed feedback paragraph"
        }
        
        Be fair but thorough in your assessment. Consider:
        - Relevance to the question
        - Technical accuracy (for technical questions)
        - Communication clarity
        - Depth of knowledge demonstrated
        - Use of specific examples
        - Structure of the response
        
        Return ONLY the JSON object, no additional text.
      `

      try {
        // Generate content
        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        // Parse the JSON response
        try {
          // Extract JSON from the response (in case there's additional text)
          const jsonMatch = text.match(/\{[\s\S]*\}/)
          const jsonString = jsonMatch ? jsonMatch[0] : text

          const evaluation = JSON.parse(jsonString)

          // Ensure all required fields are present
          return {
            score: evaluation.score || 0,
            strengths: evaluation.strengths || ["Attempted to answer the question"],
            improvements: evaluation.improvements || ["Provide more detailed responses"],
            detailedFeedback: evaluation.detailedFeedback || "No detailed feedback available.",
          }
        } catch (parseError) {
          console.error("Error parsing Gemini evaluation response:", parseError)
          console.log("Raw evaluation response:", text)
          throw new Error("Failed to parse evaluation response")
        }
      } catch (generateError) {
        console.error("Error generating evaluation content:", generateError)
        throw new Error("Failed to generate evaluation content")
      }
    } catch (error) {
      console.error("Error calling Gemini API for evaluation:", error)
      throw new Error("Failed to evaluate answer")
    }
  }

  // Generate a conversation response for the AI interviewer
  static async generateConversationResponse(message: string, context: any): Promise<string> {
    try {
      const { previousMessages, role, level } = context

      // Get the model
      const model = getModel()

      // Construct the conversation history
      let conversationContext = ""
      if (previousMessages && previousMessages.length > 0) {
        conversationContext = "Previous conversation:\n"
        previousMessages.forEach((msg: any) => {
          conversationContext += `${msg.role === "user" ? "Candidate" : "Interviewer"}: ${msg.content}\n`
        })
      }

      // Construct the prompt
      const prompt = `
        You are an AI interviewer conducting a ${level} ${role} interview.
        ${conversationContext}
        
        The candidate just said: "${message}"
        
        Respond as a professional interviewer would. Be encouraging but also probe for deeper answers when appropriate.
        Keep your response concise and focused.
        
        Your response:
      `

      try {
        // Generate content
        const result = await model.generateContent(prompt)
        const response = await result.response
        return response.text()
      } catch (generateError) {
        console.error("Error generating conversation response:", generateError)
        return "I'm here to help you prepare for your interview. What would you like to know?"
      }
    } catch (error) {
      console.error("Error calling Gemini API for conversation:", error)
      // Fallback response
      return "I'm here to help you prepare for your interview. What would you like to know?"
    }
  }
}

