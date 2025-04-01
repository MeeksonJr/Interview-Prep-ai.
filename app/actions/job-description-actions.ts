"use server"

import { analyzeJobDescription } from "@/lib/job-description-analyzer"

export async function analyzeJobDescriptionAction(
  userId: number,
  description: string,
  title?: string,
  company?: string,
) {
  try {
    const result = await analyzeJobDescription(userId, description, title, company)
    return result
  } catch (error: any) {
    console.error("Error analyzing job description:", error)
    return { success: false, error: error.message }
  }
}

