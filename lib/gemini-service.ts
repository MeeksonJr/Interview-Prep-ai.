import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai"
import type { InterviewGeneratorParams, InterviewQuestion, AnswerEvaluationParams } from "./types"

// Initialize the Gemini API with the API key
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
const genAI = new GoogleGenerativeAI(apiKey)

// Safety settings to avoid harmful content
const safetySettings = [
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
]

// Get the model - use gemini-1.5-flash as requested
function getModel() {
  try {
    return genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      safetySettings,
    })
  } catch (error) {
    console.error("Error getting gemini-1.5-flash model:", error)

    // Fall back to gemini-2.0-flash if the flash model isn't available
    try {
      console.log("Falling back to gemini-2.0-flash model")
      return genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
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
          // Fallback to the mock implementation if parsing fails
          return fallbackGenerateQuestions(params)
        }
      } catch (generateError) {
        console.error("Error generating content:", generateError)
        return fallbackGenerateQuestions(params)
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error)
      // Fallback to the mock implementation
      return fallbackGenerateQuestions(params)
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
          // Fallback to the mock implementation if parsing fails
          return fallbackEvaluateAnswer(params)
        }
      } catch (generateError) {
        console.error("Error generating evaluation content:", generateError)
        return fallbackEvaluateAnswer(params)
      }
    } catch (error) {
      console.error("Error calling Gemini API for evaluation:", error)
      // Fallback to the mock implementation
      return fallbackEvaluateAnswer(params)
    }
  }

  // Generate a conversation response for the AI interviewer
  static async generateConversationResponse(message: string, context: any): Promise<string> {
    try {
      const { step, previousMessages, role, level } = context

      // For the interview creation flow, we can use predefined responses
      if (step >= 1 && step <= 6) {
        const predefinedResponses = [
          "What role are you training for?",
          "What type of interview? Behavioral, technical, or both?",
          "What job level are you aiming for? (Junior, Mid-level, Senior)",
          "How many questions would you like in this interview?",
          "What technologies should we cover? (e.g., JavaScript, React, Node.js)",
          "Got it! I've prepared your interview. Click 'Start Interview' when you're ready.",
        ]

        return predefinedResponses[step - 1]
      }

      // Get the model
      const model = getModel()

      // For the actual interview, use Gemini to generate more dynamic responses
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

// Fallback functions in case the API fails
function fallbackGenerateQuestions(params: InterviewGeneratorParams): InterviewQuestion[] {
  const { role, type, level, questionCount, technologies } = params

  // Sample questions based on parameters (simplified version of the mock implementation)
  const technicalQuestions = [
    `Explain how you would implement a responsive design for a complex dashboard.`,
    `Describe your approach to optimizing the performance of a web application that's loading slowly.`,
    `How would you structure a full-stack project to ensure scalability and maintainability?`,
    `Explain the concept of data structures and provide a practical example.`,
    `How would you implement authentication and authorization in a web application?`,
  ]

  const behavioralQuestions = [
    `Tell me about a complex project you led. What challenges did you face, and how did you overcome them?`,
    `Describe a situation where you had to make a difficult technical decision. How did you approach it?`,
    `Tell me about a time when you had to work under a tight deadline. How did you manage your time and priorities?`,
    `Describe a situation where you had to collaborate with a difficult team member. How did you handle it?`,
    `Tell me about a time when you received critical feedback. How did you respond to it?`,
  ]

  // Select questions based on type
  let questions: string[] = []

  if (type === "technical") {
    questions = technicalQuestions.slice(0, questionCount)
  } else if (type === "behavioral") {
    questions = behavioralQuestions.slice(0, questionCount)
  } else {
    // Mixed - alternate between technical and behavioral
    for (let i = 0; i < questionCount; i++) {
      if (i % 2 === 0) {
        questions.push(technicalQuestions[Math.floor(i / 2) % technicalQuestions.length])
      } else {
        questions.push(behavioralQuestions[Math.floor(i / 2) % behavioralQuestions.length])
      }
    }
  }

  // Format as InterviewQuestion objects
  return questions.map((question) => ({
    question,
    type: question.includes("Tell me about") || question.includes("Describe a situation") ? "behavioral" : "technical",
  }))
}

function fallbackEvaluateAnswer(params: AnswerEvaluationParams): any {
  const { answer } = params

  // Basic analysis of the answer
  const wordCount = answer.split(/\s+/).length

  // Calculate a basic score based on length
  let score = 0
  if (wordCount > 200) {
    score = 80
  } else if (wordCount > 100) {
    score = 60
  } else if (wordCount > 50) {
    score = 40
  } else {
    score = 20
  }

  return {
    score,
    strengths: ["Attempted to answer the question"],
    improvements: ["Provide more detailed responses"],
    detailedFeedback:
      "This is a fallback evaluation because the AI service is currently unavailable. Try again later for a more detailed assessment.",
  }
}

