"use server"

import {
  createInterview as dbCreateInterview,
  getInterviewById as dbGetInterviewById,
  updateInterview as dbUpdateInterview,
  getUserInterviews as dbGetUserInterviews,
} from "@/lib/db"
import { generateInterviewQuestions as libGenerateInterviewQuestions } from "@/lib/interview-generator"

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

