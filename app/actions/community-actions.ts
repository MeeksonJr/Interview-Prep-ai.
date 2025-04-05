"use server"

import {
  getTrendingInterviews,
  getPopularInterviews,
  getRecentInterviews,
  likeInterview,
  saveInterview,
  hasUserLikedInterview,
  getSavedInterviews,
  incrementInterviewViewCount,
  getInterviewFilterOptions,
  hasUserSavedInterview,
  updateInterviewPublicStatus,
  getSharedInterviews,
  hasUserSharedInterview,
  addInterviewToCommunity,
  removeInterviewFromCommunity,
  getCommunityInterviews,
  createCommunityInterviewsTable,
} from "@/lib/db-community"

export async function fetchTrendingInterviews(limit = 10, offset = 0, filters = {}) {
  try {
    const interviews = await getTrendingInterviews(limit, offset, filters)
    return { success: true, interviews: interviews || [] }
  } catch (error: any) {
    console.error("Error fetching trending interviews:", error)
    return { success: false, error: error.message, interviews: [] }
  }
}

export async function fetchPopularInterviews(limit = 10, offset = 0, filters = {}) {
  try {
    const interviews = await getPopularInterviews(limit, offset, filters)
    return { success: true, interviews: interviews || [] }
  } catch (error: any) {
    console.error("Error fetching popular interviews:", error)
    return { success: false, error: error.message, interviews: [] }
  }
}

export async function fetchRecentInterviews(limit = 10, offset = 0, filters = {}) {
  try {
    const interviews = await getRecentInterviews(limit, offset, filters)
    return { success: true, interviews: interviews || [] }
  } catch (error: any) {
    console.error("Error fetching recent interviews:", error)
    return { success: false, error: error.message, interviews: [] }
  }
}

// Update the fetchCommunityInterviews function to handle the tab parameter correctly
export async function fetchCommunityInterviews(tab = "recent", limit = 10, offset = 0, filters = {}) {
  try {
    console.log(`Fetching community interviews for tab: ${tab}, limit: ${limit}, offset: ${offset}`)

    let interviews = []

    // Call the appropriate function based on the tab
    if (tab === "trending") {
      const result = await getTrendingInterviews(limit, offset, filters)
      interviews = result || []
    } else if (tab === "popular") {
      const result = await getPopularInterviews(limit, offset, filters)
      interviews = result || []
    } else {
      // Default to recent
      const result = await getRecentInterviews(limit, offset, filters)
      interviews = result || []
    }

    return { success: true, interviews: interviews }
  } catch (error: any) {
    console.error(`Error fetching ${tab} community interviews:`, error)
    return { success: false, error: error.message, interviews: [] }
  }
}

export async function likeInterviewAction(interviewId: number, userId: number) {
  try {
    const result = await likeInterview(userId, interviewId)
    return {
      success: true,
      liked: result.liked,
      message: result.liked ? "Interview liked" : "Interview unliked",
    }
  } catch (error: any) {
    console.error("Error liking interview:", error)
    return { success: false, error: error.message }
  }
}

export async function toggleLikeInterview(userId: number, interviewId: number) {
  try {
    const result = await likeInterview(userId, interviewId)
    return {
      success: true,
      liked: result.liked,
      message: result.liked ? "Interview liked" : "Interview unliked",
    }
  } catch (error: any) {
    console.error("Error toggling like for interview:", error)
    return { success: false, error: error.message, liked: false }
  }
}

export async function saveInterviewAction(interviewId: number, userId: number) {
  try {
    const result = await saveInterview(userId, interviewId)
    return {
      success: true,
      saved: result.saved,
      message: result.saved ? "Interview saved" : "Interview unsaved",
    }
  } catch (error: any) {
    console.error("Error saving interview:", error)
    return { success: false, error: error.message }
  }
}

export async function toggleSaveInterview(userId: number, interviewId: number) {
  try {
    const result = await saveInterview(userId, interviewId)
    return {
      success: true,
      saved: result.saved,
      message: result.saved ? "Interview saved" : "Interview unsaved",
    }
  } catch (error: any) {
    console.error("Error toggling save for interview:", error)
    return { success: false, error: error.message, saved: false }
  }
}

export async function checkUserLikedInterview(userId: number, interviewId: number) {
  try {
    const liked = await hasUserLikedInterview(userId, interviewId)
    return { success: true, liked }
  } catch (error: any) {
    console.error("Error checking if user liked interview:", error)
    return { success: false, error: error.message, liked: false }
  }
}

export async function fetchSavedInterviews(userId: number) {
  try {
    let interviews = []

    try {
      interviews = (await getSavedInterviews(userId)) || []
    } catch (dbError) {
      console.error("Error fetching saved interviews from database:", dbError)
      interviews = []
    }

    return { success: true, interviews }
  } catch (error: any) {
    console.error("Error fetching saved interviews:", error)
    return { success: false, error: error.message, interviews: [] }
  }
}

export async function viewInterview(interviewId: number) {
  try {
    await incrementInterviewViewCount(interviewId)
    return { success: true }
  } catch (error: any) {
    console.error("Error incrementing view count:", error)
    return { success: false, error: error.message }
  }
}

export async function incrementViewCount(interviewId: number) {
  try {
    await incrementInterviewViewCount(interviewId)
    return { success: true }
  } catch (error: any) {
    console.error("Error incrementing view count:", error)
    return { success: false, error: error.message }
  }
}

export async function fetchFilterOptions() {
  try {
    const options = await getInterviewFilterOptions()
    return { success: true, options }
  } catch (error: any) {
    console.error("Error fetching filter options:", error)
    return {
      success: false,
      error: error.message,
      options: { roles: [], types: [], levels: [], technologies: [] },
    }
  }
}

export async function checkUserSavedInterview(userId: number, interviewId: number) {
  try {
    const saved = await hasUserSavedInterview(userId, interviewId)
    return { success: true, saved }
  } catch (error: any) {
    console.error("Error checking if user saved interview:", error)
    return { success: false, error: error.message, saved: false }
  }
}

export async function shareInterviewAction(interviewId: string, userId: number, isPublic: boolean) {
  try {
    console.log(`Sharing interview ${interviewId} for user ${userId}, isPublic: ${isPublic}`)

    try {
      // First update the interview's public status
      const result = await updateInterviewPublicStatus(interviewId, userId, isPublic)
      console.log("Share interview result:", result)

      // If making public, add to community table
      if (isPublic) {
        try {
          // Ensure the community_interviews table exists
          await createCommunityInterviewsTable()

          // Then add the interview to the community
          await addInterviewToCommunity(Number(interviewId), userId)
        } catch (communityError: any) {
          console.error("Error adding interview to community:", communityError)
          // Don't fail the operation if adding to community fails
          // Just log the error and continue
        }
      } else {
        // If making private, remove from community table
        try {
          // Ensure the community_interviews table exists
          await createCommunityInterviewsTable()

          // Then remove the interview from the community
          await removeInterviewFromCommunity(Number(interviewId), userId)
        } catch (communityError: any) {
          console.error("Error removing interview from community:", communityError)
          // Don't fail the operation if removing from community fails
          // Just log the error and continue
        }
      }

      return {
        success: true,
        isPublic: result.is_public,
        message: isPublic ? "Interview shared to community" : "Interview removed from community",
      }
    } catch (dbError: any) {
      console.error("Database error in shareInterviewAction:", dbError)

      // Handle rate limiting errors with a user-friendly message
      if (dbError.message && dbError.message.includes("rate limit")) {
        return {
          success: false,
          error: "Too many requests. Please try again in a moment.",
          isPublic: !isPublic, // Return the opposite of what was requested since the operation failed
        }
      }

      // Handle other database errors
      return {
        success: false,
        error: "Failed to update interview status. Please try again.",
        isPublic: !isPublic,
      }
    }
  } catch (error: any) {
    console.error("Error sharing interview:", error)
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
      isPublic: !isPublic,
    }
  }
}

export async function fetchSharedInterviews(userId: number) {
  try {
    let interviews = []

    try {
      interviews = (await getSharedInterviews(userId)) || []
    } catch (dbError) {
      console.error("Error fetching shared interviews from database:", dbError)
      interviews = []
    }

    return { success: true, interviews }
  } catch (error: any) {
    console.error("Error fetching shared interviews:", error)
    return { success: false, error: error.message, interviews: [] }
  }
}

export async function checkUserSharedInterview(userId: number, interviewId: number) {
  try {
    const shared = await hasUserSharedInterview(userId, interviewId)
    return { success: true, shared }
  } catch (error: any) {
    console.error("Error checking if user shared interview:", error)
    return { success: false, error: error.message, shared: false }
  }
}

// New function to fetch all community interviews
export async function fetchAllCommunityInterviews(limit = 20, offset = 0, filters = {}) {
  try {
    const interviews = await getCommunityInterviews(limit, offset, filters)
    return { success: true, interviews: interviews || [] }
  } catch (error: any) {
    console.error("Error fetching all community interviews:", error)
    return { success: false, error: error.message, interviews: [] }
  }
}

// New function to create community table if it doesn't exist
export async function createCommunityTable() {
  try {
    const result = await createCommunityInterviewsTable()
    return {
      success: result.success,
      message: "Community interviews table created successfully",
      error: result.error,
    }
  } catch (error: any) {
    console.error("Error creating community interviews table:", error)
    return {
      success: false,
      error: error.message || "Failed to create community interviews table",
    }
  }
}

