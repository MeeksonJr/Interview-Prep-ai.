import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function generateInterviewFromJobDescription({
  jobDescription,
  type,
  questionCount,
  technologies,
}: {
  jobDescription: string
  type: string
  questionCount: number
  technologies: string[]
}) {
  try {
    const techString = technologies.length > 0 ? `focusing on ${technologies.join(", ")}` : ""

    const prompt = `
      You are an expert technical interviewer. Based on the following job description, create a structured interview with ${questionCount} questions.
      
      Job Description:
      ${jobDescription}
      
      Interview Type: ${type} (${type === "technical" ? "technical questions only" : type === "behavioral" ? "behavioral questions only" : "mix of technical and behavioral questions"})
      ${techString}
      
      Please analyze the job description and extract:
      1. The role (e.g., "Frontend Developer", "Full Stack Engineer", etc.)
      2. The experience level (e.g., "Junior", "Mid-level", "Senior")
      
      Then, generate ${questionCount} interview questions appropriate for this role, level, and the specified interview type.
      
      Format your response as a JSON object with the following structure:
      {
        "title": "Interview for [Position]",
        "role": "[Extracted Role]",
        "level": "[Extracted Level]",
        "questions": [
          {
            "question": "Question text here",
            "type": "technical" or "behavioral"
          }
        ]
      }
      
      Only return the JSON object, nothing else.
    `

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
    })

    try {
      const parsedResponse = JSON.parse(text)
      return parsedResponse
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError)
      throw new Error("Failed to parse interview questions")
    }
  } catch (error) {
    console.error("Error generating interview from job description:", error)
    throw error
  }
}

