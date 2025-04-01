"use server"

import { sql } from "@/lib/db"
import { analyzeJobMatchWithResume } from "@/lib/job-match-analyzer"
import { createResumeContentsTable } from "@/lib/db-migration-resume-contents"
import { migrateJobAnalysisTable } from "@/lib/db-migration-job-analysis"

export async function analyzeJobMatch({
  userId,
  resumeId,
  jobTitle,
  company,
  jobDescription,
}: {
  userId: number
  resumeId: number
  jobTitle?: string
  company?: string
  jobDescription: string
}) {
  try {
    // First, try to create the resume_contents table if it doesn't exist
    try {
      await createResumeContentsTable()
    } catch (error) {
      console.error("Error ensuring resume_contents table exists:", error)
      // Continue even if this fails
    }

    // Also ensure the job_analysis table exists
    try {
      await migrateJobAnalysisTable()
    } catch (error) {
      console.error("Error ensuring job_analysis table exists:", error)
      // Continue even if this fails
    }

    // Verify the resume belongs to the user
    let resume
    try {
      // Try to get resume with content
      const resumeCheck = await sql`
        SELECT r.*, rc.content 
        FROM user_resumes r
        LEFT JOIN resume_contents rc ON r.id = rc.resume_id
        WHERE r.id = ${resumeId} AND r.user_id = ${userId}
      `

      if (resumeCheck.length === 0) {
        return { success: false, error: "Resume not found or doesn't belong to user" }
      }

      resume = resumeCheck[0]
    } catch (error) {
      console.error("Error fetching resume with content:", error)

      // Fallback to just getting the resume without content
      try {
        const basicResumeCheck = await sql`
          SELECT * FROM user_resumes
          WHERE id = ${resumeId} AND user_id = ${userId}
        `

        if (basicResumeCheck.length === 0) {
          return { success: false, error: "Resume not found or doesn't belong to user" }
        }

        resume = basicResumeCheck[0]
      } catch (fallbackError) {
        console.error("Error in fallback resume fetch:", fallbackError)
        return { success: false, error: "Failed to fetch resume information" }
      }
    }

    // Save the job description analysis request
    try {
      await sql`
        INSERT INTO job_analysis (
          user_id, 
          resume_id, 
          job_title, 
          company, 
          job_description
        ) VALUES (
          ${userId}, 
          ${resumeId}, 
          ${jobTitle || null}, 
          ${company || null}, 
          ${jobDescription}
        )
      `
    } catch (error) {
      console.error("Error saving job analysis request:", error)
      // Continue even if this fails
    }

    // Analyze the job match
    const analysis = await analyzeJobMatchWithResume(resume, jobDescription, jobTitle, company)

    return {
      success: true,
      analysis,
    }
  } catch (error: any) {
    console.error("Error analyzing job match:", error)
    return { success: false, error: error.message || "Failed to analyze job match" }
  }
}

