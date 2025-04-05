import { NextResponse } from "next/server"
import { migrateDatabase } from "@/lib/db-migration"
import { migrateResumeTable } from "@/lib/db-migration-resume"
import { migrateResumeContentsTable } from "@/lib/db-migration-resume-contents"
import { migrateJobAnalysisTable } from "@/lib/db-migration-job-analysis"
import { migrateCommunityTable } from "@/lib/db-migration-community"

export async function GET() {
  try {
    console.log("Running all migrations...")

    // Run base migrations
    const baseResult = await migrateDatabase()
    if (!baseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to run base migrations",
        },
        { status: 500 },
      )
    }

    // Run resume table migration
    const resumeResult = await migrateResumeTable()
    if (!resumeResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to run resume table migration",
        },
        { status: 500 },
      )
    }

    // Run resume contents table migration
    const resumeContentsResult = await migrateResumeContentsTable()
    if (!resumeContentsResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to run resume contents table migration",
        },
        { status: 500 },
      )
    }

    // Run job analysis table migration
    const jobAnalysisResult = await migrateJobAnalysisTable()
    if (!jobAnalysisResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to run job analysis table migration",
        },
        { status: 500 },
      )
    }

    // Run community table migration
    const communityResult = await migrateCommunityTable()
    if (!communityResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to run community table migration",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "All migrations completed successfully",
    })
  } catch (error) {
    console.error("Error in run-migrations API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred",
      },
      { status: 500 },
    )
  }
}

