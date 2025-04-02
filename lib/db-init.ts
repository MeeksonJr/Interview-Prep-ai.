import { migrateDatabase } from "./db-migration"
import { migrateCommunityTable } from "./db-migration-community"
import { migrateResumeTable } from "./db-migration-resume"
import { migrateJobAnalysisTable } from "./db-migration-job-analysis"
import { createResumeContentsTable } from "./db-migration-resume-contents"

export async function initializeDatabase() {
  try {
    console.log("Initializing database...")
    const results = {
      main: false,
      community: false,
      resume: false,
      jobAnalysis: false,
      resumeContents: false,
    }

    // Run existing migrations
    try {
      await migrateDatabase()
      results.main = true
    } catch (error) {
      console.error("Error during main database migration:", error)
    }

    // Run community table migration with explicit error handling
    try {
      const communityResult = await migrateCommunityTable()
      results.community = communityResult.success
      if (!communityResult.success) {
        console.error("Community table migration failed:", communityResult.error)
      } else {
        console.log("Community table migration completed successfully")
      }
    } catch (communityError) {
      console.error("Error during community table migration:", communityError)
      // Continue with initialization even if community migration fails
    }

    // Run resume table migration with explicit error handling
    try {
      await migrateResumeTable()
      results.resume = true
    } catch (resumeError) {
      console.error("Error during resume table migration:", resumeError)
      // Continue with initialization even if resume migration fails
    }

    // Migrate job analysis table
    try {
      await migrateJobAnalysisTable()
      results.jobAnalysis = true
    } catch (error) {
      console.error("Error migrating job analysis table:", error)
    }

    // Create resume contents table
    try {
      await createResumeContentsTable()
      results.resumeContents = true
    } catch (error) {
      console.error("Error creating resume contents table:", error)
    }

    console.log("Database initialization completed with results:", results)
    return {
      success: true,
      results,
    }
  } catch (error) {
    console.error("Error initializing database:", error)
    return { success: false, error }
  }
}

