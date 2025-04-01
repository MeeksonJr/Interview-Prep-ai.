"use server"

import { revalidatePath } from "next/cache"
import { saveResumeToDb, deleteResume, analyzeResume } from "@/lib/db-resume"
import { sql } from "@/lib/db"
import { createResumeContentsTable } from "@/lib/db-migration-resume-contents"

export async function fetchUserResumes(userId: number) {
  try {
    console.log("[SERVER] Fetching resumes for user ID:", userId)

    // Use the correct table name: user_resumes instead of resumes
    const resumes = await sql`
      SELECT * FROM user_resumes
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `

    // Try to get resume contents if the table exists
    try {
      // First, ensure the resume_contents table exists
      await createResumeContentsTable()

      // For each resume, try to get its content
      for (const resume of resumes) {
        const contentResult = await sql`
          SELECT content FROM resume_contents
          WHERE resume_id = ${resume.id}
        `

        if (contentResult.length > 0) {
          resume.content = contentResult[0].content
        }
      }
    } catch (contentError) {
      console.error("[SERVER] Error fetching resume contents:", contentError)
      // Continue without contents if there's an error
    }

    return { success: true, resumes }
  } catch (error) {
    console.error("[SERVER] Error fetching resumes:", error)
    return { success: false, error: "Failed to fetch resumes" }
  }
}

export async function uploadAndAnalyzeResume(formData: FormData, userId: number) {
  try {
    console.log("Uploading and analyzing resume for user:", userId)

    // Get the file from the form data
    const file = formData.get("resume") as File
    if (!file) {
      return { success: false, error: "No file provided" }
    }

    // Get the career path and level from the form data
    const careerPath = (formData.get("careerPath") as string) || "fullstack"
    const level = (formData.get("level") as string) || "mid"

    // Convert the file to a buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    // Analyze the resume
    const analysisResult = await analyzeResume(fileBuffer, file.name, file.type, careerPath, level)

    if (!analysisResult.success) {
      return { success: false, error: analysisResult.error || "Failed to analyze resume" }
    }

    // Save the resume to the database
    const saveResult = await saveResumeToDb({
      userId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      careerPath,
      level,
      score: analysisResult.score,
      analysis: analysisResult.analysis,
    })

    if (!saveResult.success) {
      return { success: false, error: saveResult.error || "Failed to save resume" }
    }

    // Revalidate the resume page
    revalidatePath("/resume")

    return { success: true, resume: saveResult.resume }
  } catch (error: any) {
    console.error("Error uploading and analyzing resume:", error)
    return { success: false, error: error.message || "Failed to upload and analyze resume" }
  }
}

export async function deleteUserResume(resumeId: number, userId: number) {
  try {
    console.log("Deleting resume:", resumeId, "for user:", userId)
    const result = await deleteResume(resumeId, userId)

    if (result.success) {
      // Revalidate the resume page
      revalidatePath("/resume")
    }

    return result
  } catch (error: any) {
    console.error("Error deleting resume:", error)
    return { success: false, error: error.message || "Failed to delete resume" }
  }
}

// This function will save resume content to a separate table
export async function saveResumeContent(resumeId: number, content: string) {
  try {
    // First, ensure the resume_contents table exists
    await createResumeContentsTable()

    // Check if content already exists
    const existingContent = await sql`
      SELECT * FROM resume_contents WHERE resume_id = ${resumeId}
    `

    if (existingContent.length > 0) {
      // Update existing content
      await sql`
        UPDATE resume_contents 
        SET content = ${content}, updated_at = CURRENT_TIMESTAMP
        WHERE resume_id = ${resumeId}
      `
    } else {
      // Insert new content
      await sql`
        INSERT INTO resume_contents (resume_id, content)
        VALUES (${resumeId}, ${content})
      `
    }

    return { success: true }
  } catch (error) {
    console.error("Error saving resume content:", error)
    return { success: false, error: "Failed to save resume content" }
  }
}

