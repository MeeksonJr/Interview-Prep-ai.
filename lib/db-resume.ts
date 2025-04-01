import { sql } from "@/lib/db"
import { analyzeResumeWithAI } from "@/lib/ai-resume-analyzer"
import { migrateResumeTable } from "./db-migration-resume"

// Helper function to ensure the resume table exists
async function ensureResumeTableExists() {
  try {
    // Try to query the table
    await sql`SELECT 1 FROM user_resumes LIMIT 1`
    return true
  } catch (error: any) {
    if (error.message.includes("relation") && error.message.includes("does not exist")) {
      console.log("Resume table doesn't exist, creating it now...")
      const result = await migrateResumeTable()
      return result.success
    }
    throw error
  }
}

export async function saveResumeToDb({
  userId,
  fileName,
  fileType,
  fileSize,
  careerPath,
  level,
  score,
  analysis,
}: {
  userId: number
  fileName: string
  fileType: string
  fileSize: number
  careerPath: string
  level: string
  score: number
  analysis: any
}) {
  try {
    // Ensure the table exists
    const tableExists = await ensureResumeTableExists()
    if (!tableExists) {
      return {
        success: false,
        error: "Failed to create resume table. Please try again later.",
      }
    }

    // Insert the resume into the database
    const result = await sql`
      INSERT INTO user_resumes (
        user_id, file_name, file_type, file_size, career_path, level, score, analysis
      ) VALUES (
        ${userId}, ${fileName}, ${fileType}, ${fileSize}, ${careerPath}, ${level}, ${score}, ${JSON.stringify(analysis)}
      )
      RETURNING id, user_id, file_name, file_type, file_size, career_path, level, score, analysis, created_at
    `

    if (!result || result.length === 0) {
      return { success: false, error: "Failed to save resume" }
    }

    return { success: true, resume: result[0] }
  } catch (error: any) {
    console.error("Error saving resume to database:", error)
    return { success: false, error: error.message || "Database error" }
  }
}

export async function getUserResumes(userId: number) {
  try {
    // Ensure the table exists
    const tableExists = await ensureResumeTableExists()
    if (!tableExists) {
      return {
        success: false,
        error: "Failed to create resume table. Please try again later.",
      }
    }

    console.log("Fetching resumes for user ID:", userId)
    const result = await sql`
      SELECT id, user_id, file_name, file_type, file_size, career_path, level, score, analysis, created_at
      FROM user_resumes
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `

    console.log("Fetched resumes:", result ? result.length : 0)
    return { success: true, resumes: result || [] }
  } catch (error: any) {
    console.error("Error fetching user resumes:", error)
    return { success: false, error: error.message || "Database error", resumes: [] }
  }
}

export async function deleteResume(resumeId: number, userId: number) {
  try {
    // Ensure the table exists
    const tableExists = await ensureResumeTableExists()
    if (!tableExists) {
      return {
        success: false,
        error: "Failed to create resume table. Please try again later.",
      }
    }

    const result = await sql`
      DELETE FROM user_resumes
      WHERE id = ${resumeId} AND user_id = ${userId}
      RETURNING id
    `

    if (!result || result.length === 0) {
      return { success: false, error: "Resume not found or you don't have permission to delete it" }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error deleting resume:", error)
    return { success: false, error: error.message || "Database error" }
  }
}

export async function getResumeById(resumeId: number, userId: number) {
  try {
    // Ensure the table exists
    const tableExists = await ensureResumeTableExists()
    if (!tableExists) {
      return {
        success: false,
        error: "Failed to create resume table. Please try again later.",
      }
    }

    const result = await sql`
      SELECT * FROM user_resumes
      WHERE id = ${resumeId} AND user_id = ${userId}
    `
    return { success: true, resume: result[0] || null }
  } catch (error: any) {
    console.error("Error getting resume by ID:", error)
    return { success: false, error: error.message || "Database error", resume: null }
  }
}

export async function updateResumeAnalysis(
  resumeId: number,
  userId: number,
  analysis: any,
  score: number,
  careerPath: string,
  level: string,
) {
  try {
    // Ensure the table exists
    const tableExists = await ensureResumeTableExists()
    if (!tableExists) {
      return {
        success: false,
        error: "Failed to create resume table. Please try again later.",
      }
    }

    const result = await sql`
      UPDATE user_resumes
      SET 
        analysis = ${JSON.stringify(analysis)},
        score = ${score},
        career_path = ${careerPath},
        level = ${level}
      WHERE id = ${resumeId} AND user_id = ${userId}
      RETURNING *
    `
    return { success: true, resume: result[0] || null }
  } catch (error: any) {
    console.error("Error updating resume analysis:", error)
    return { success: false, error: error.message || "Database error", resume: null }
  }
}

export async function analyzeResume(
  fileBuffer: Buffer,
  fileName: string,
  fileType: string,
  careerPath: string,
  level: string,
) {
  try {
    // Extract text from the resume file
    // For simplicity, we'll use a mock implementation
    // In a real application, you would use libraries like pdf-parse, mammoth, etc.

    // For now, we'll use the AI analyzer directly
    const analysisResult = await analyzeResumeWithAI(fileBuffer, fileName, fileType, careerPath, level)

    if (!analysisResult.success) {
      return { success: false, error: analysisResult.error || "Failed to analyze resume" }
    }

    return {
      success: true,
      score: analysisResult.score,
      analysis: analysisResult.analysis,
    }
  } catch (error: any) {
    console.error("Error analyzing resume:", error)
    return { success: false, error: error.message || "Analysis error" }
  }
}

