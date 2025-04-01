"use server"

import { sql } from "@/lib/db"
import { generateInterviewFromJobDescription } from "@/lib/ai-interview-generator"

export async function createInterviewFromJobDescription({
  userId,
  jobTitle,
  jobDescription,
  type,
  questionCount,
  technologies,
}: {
  userId: number
  jobTitle: string
  jobDescription: string
  type: string
  questionCount: number
  technologies: string[]
}) {
  try {
    // Generate interview questions using AI
    const generatedInterview = await generateInterviewFromJobDescription({
      jobDescription,
      type,
      questionCount,
      technologies,
    })

    if (!generatedInterview || !generatedInterview.questions || generatedInterview.questions.length === 0) {
      throw new Error("Failed to generate interview questions")
    }

    // Insert the interview into the database
    const result = await sql`
      INSERT INTO interviews (
        user_id, 
        title, 
        role, 
        type, 
        level, 
        questions, 
        technologies,
        job_description,
        created_at
      )
      VALUES (
        ${userId}, 
        ${jobTitle || generatedInterview.title}, 
        ${generatedInterview.role}, 
        ${type}, 
        ${generatedInterview.level}, 
        ${JSON.stringify(generatedInterview.questions)}, 
        ${technologies},
        ${jobDescription},
        NOW()
      )
      RETURNING id
    `

    if (!result || result.length === 0) {
      throw new Error("Failed to create interview in database")
    }

    const interviewId = result[0].id

    return {
      success: true,
      interviewId,
      message: "Interview created successfully",
    }
  } catch (error: any) {
    console.error("Error creating interview from job description:", error)
    return {
      success: false,
      error: error.message || "Failed to create interview",
    }
  }
}

// Add the missing fetchInterviewById export
export async function fetchInterviewById(interviewId: number) {
  try {
    if (!interviewId) {
      throw new Error("Interview ID is required")
    }

    const result = await sql`
      SELECT 
        i.*,
        u.name as user_name,
        u.email as user_email
      FROM 
        interviews i
      LEFT JOIN 
        users u ON i.user_id = u.id
      WHERE 
        i.id = ${interviewId}
    `

    if (!result || result.length === 0) {
      return { success: false, error: "Interview not found" }
    }

    return {
      success: true,
      interview: result[0],
    }
  } catch (error: any) {
    console.error("Error fetching interview by ID:", error)
    return {
      success: false,
      error: error.message || "Failed to fetch interview",
    }
  }
}

