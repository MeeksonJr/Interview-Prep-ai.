"use server"

import {
  createInterview as dbCreateInterview,
  getInterviewById as dbGetInterviewById,
  updateInterview as dbUpdateInterview,
  getUserInterviews as dbGetUserInterviews,
} from "@/lib/db"
import { generateInterviewQuestions as libGenerateInterviewQuestions } from "@/lib/interview-generator"
import { sql } from "@/lib/db"
import { generateInterviewFromJobDescription } from "@/lib/ai-interview-generator"

// Interview-related actions
export async function createInterview(interviewData: any) {
  console.log("[SERVER] Creating interview with data:", interviewData)
  const result = await dbCreateInterview(interviewData)
  console.log("[SERVER] Interview created:", result)
  return result
}

export async function getInterviewById(id: string, userId: number) {
  return dbGetInterviewById(id, userId)
}

export async function updateInterview(id: string, userId: number, updateData: any) {
  return dbUpdateInterview(id, userId, updateData)
}

export async function getUserInterviews(userId: number) {
  return dbGetUserInterviews(userId)
}

// Re-export the generateInterviewQuestions function as a server action
export async function generateInterviewQuestions(params: any) {
  console.log("[SERVER] Generating interview questions with params:", params)
  const questions = await libGenerateInterviewQuestions(params)
  console.log("[SERVER] Generated questions:", questions)
  return questions
}

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

// Add the deleteInterview action
export async function deleteInterviewAction(interviewId: number, userId: number) {
  try {
    console.log(`Deleting interview ${interviewId} for user ${userId}`)

    // Delete the interview from the database
    const result = await sql`
      DELETE FROM interviews
      WHERE id = ${interviewId} AND user_id = ${userId}
      RETURNING id
    `

    if (!result || result.length === 0) {
      return { success: false, error: "Interview not found or you don't have permission to delete it" }
    }

    return { success: true, message: "Interview deleted successfully" }
  } catch (error: any) {
    console.error("Error deleting interview:", error)
    return { success: false, error: error.message || "Failed to delete interview" }
  }
}

