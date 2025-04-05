import type { InterviewGeneratorParams, InterviewQuestion } from "./types"
import { GeminiService } from "./gemini-service"

// This function now uses the Gemini API for generating interview questions
export async function generateInterviewQuestions(params: InterviewGeneratorParams): Promise<InterviewQuestion[]> {
  console.log("Generating interview questions with params:", params)

  try {
    // Use the Gemini service to generate questions
    const questions = await GeminiService.generateInterviewQuestions(params)
    console.log("Generated questions:", questions)
    return questions
  } catch (error) {
    console.error("Error generating interview questions:", error)
    // Fallback to the mock implementation if there's an error
    return fallbackGenerateQuestions(params)
  }
}

// Fallback function in case the Gemini API fails
function fallbackGenerateQuestions(params: InterviewGeneratorParams): InterviewQuestion[] {
  console.log("Using fallback question generator")

  const { role, type, level, questionCount, technologies } = params

  // Sample questions based on parameters
  const technicalQuestions = [
    `Explain how you would implement a responsive design for a complex dashboard using ${technologies.includes("React") ? "React" : "modern frontend frameworks"}.`,
    `Describe your approach to optimizing the performance of a ${technologies.includes("React") ? "React" : "web"} application that's loading slowly.`,
    `How would you structure a ${technologies.includes("Next.js") ? "Next.js" : "full-stack"} project to ensure scalability and maintainability?`,
    `Explain the concept of ${technologies.includes("JavaScript") ? "closures in JavaScript" : "data structures"} and provide a practical example.`,
    `How would you implement authentication and authorization in a ${technologies.includes("Next.js") ? "Next.js" : "web"} application?`,
    `Describe your experience with state management in ${technologies.includes("React") ? "React" : "frontend"} applications.`,
    `How would you handle error boundaries in a ${technologies.includes("React") ? "React" : "frontend"} application?`,
    `Explain your approach to testing ${technologies.includes("JavaScript") ? "JavaScript" : "code"} and what tools you prefer.`,
    `How would you implement a real-time feature in a web application?`,
    `Describe your experience with CI/CD pipelines and deployment strategies.`,
  ]

  const behavioralQuestions = [
    `Tell me about a complex ${role} project you led. What challenges did you face, and how did you overcome them?`,
    `Describe a situation where you had to make a difficult technical decision. How did you approach it?`,
    `Tell me about a time when you had to work under a tight deadline. How did you manage your time and priorities?`,
    `Describe a situation where you had to collaborate with a difficult team member. How did you handle it?`,
    `Tell me about a time when you received critical feedback. How did you respond to it?`,
    `Describe a situation where you had to learn a new technology quickly. What was your approach?`,
    `Tell me about a time when you identified and resolved a production issue.`,
    `Describe your approach to mentoring junior developers.`,
    `Tell me about a time when you had to make a trade-off between quality and speed.`,
    `Describe a situation where you had to convince your team to adopt a new technology or approach.`,
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

  // Adjust difficulty based on level
  if (level === "senior") {
    questions = questions.map((q) => q.replace("How would you", "Describe in detail how you would"))
  } else if (level === "junior") {
    questions = questions.map((q) => q.replace("complex", "recent").replace("led", "worked on"))
  }

  // Format as InterviewQuestion objects
  const result = questions.map((question) => ({
    question,
    type: question.includes("Tell me about") || question.includes("Describe a situation") ? "behavioral" : "technical",
  }))

  return result
}

