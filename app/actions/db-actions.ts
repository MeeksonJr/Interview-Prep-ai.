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
import { getUserById } from "@/lib/db" // Import getUserById
import { format } from "date-fns"

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
    // Get the user
    const user = await getUserById(userId)
    if (!user) {
      throw new Error("User not found")
    }

    // Check if the user has reached their daily interview limit
    const today = new Date()
    const formattedDate = format(today, "yyyy-MM-dd")

    const usageResult = await sql`
     SELECT interviews_used_today, daily_interview_limit
     FROM users
     WHERE id = ${userId}
   `

    if (!usageResult || usageResult.length === 0) {
      throw new Error("Failed to retrieve user usage data")
    }

    const { interviews_used_today, daily_interview_limit } = usageResult[0]

    if (daily_interview_limit !== -1 && interviews_used_today >= daily_interview_limit) {
      throw new Error("You have reached your daily interview limit. Upgrade your plan for more.")
    }

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

    // Increment the user's interviews_used_today count
    await sql`
     UPDATE users
     SET interviews_used_today = interviews_used_today + 1
     WHERE id = ${userId}
   `

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

