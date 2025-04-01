import { sql } from "@/lib/db"

// Get trending interviews (most viewed)
export async function getTrendingInterviews(limit = 10, offset = 0, filters: any = {}) {
  try {
    // First check if the community_interviews table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'community_interviews'
      );
    `

    // If table doesn't exist, return empty array
    if (!tableExists[0].exists) {
      console.log("community_interviews table doesn't exist yet, returning empty trending interviews")
      return []
    }

    let query = `
      SELECT i.*, u.name as user_name, u.profile_image_url
      FROM interviews i
      JOIN users u ON i.user_id = u.id
      JOIN community_interviews ci ON i.id = ci.interview_id
      WHERE i.is_public IS TRUE AND i.completed IS TRUE
    `

    const values = []
    let paramIndex = 1

    // Apply filters
    if (filters.role) {
      query += ` AND i.role = $${paramIndex}`
      values.push(filters.role)
      paramIndex++
    }

    if (filters.type) {
      query += ` AND i.type = $${paramIndex}`
      values.push(filters.type)
      paramIndex++
    }

    if (filters.level) {
      query += ` AND i.level = $${paramIndex}`
      values.push(filters.level)
      paramIndex++
    }

    if (filters.technology) {
      query += ` AND $${paramIndex} = ANY(i.technologies)`
      values.push(filters.technology)
      paramIndex++
    }

    // Order by view count for trending
    query += ` ORDER BY i.view_count DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    values.push(limit, offset)

    try {
      console.log("Executing trending interviews query:", query)
      console.log("With values:", values)
      const result = await sql.query(query, values)
      return result.rows || []
    } catch (sqlError) {
      console.error("SQL error in getTrendingInterviews:", sqlError)
      return []
    }
  } catch (error) {
    console.error("Error getting trending interviews:", error)
    return []
  }
}

// Get popular interviews (most liked)
export async function getPopularInterviews(limit = 10, offset = 0, filters: any = {}) {
  try {
    // First check if the community_interviews table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'community_interviews'
      );
    `

    // If table doesn't exist, return empty array
    if (!tableExists[0].exists) {
      console.log("community_interviews table doesn't exist yet, returning empty popular interviews")
      return []
    }

    let query = `
      SELECT i.*, u.name as user_name, u.profile_image_url
      FROM interviews i
      JOIN users u ON i.user_id = u.id
      JOIN community_interviews ci ON i.id = ci.interview_id
      WHERE i.is_public IS TRUE AND i.completed IS TRUE
    `

    const values = []
    let paramIndex = 1

    // Apply filters
    if (filters.role) {
      query += ` AND i.role = $${paramIndex}`
      values.push(filters.role)
      paramIndex++
    }

    if (filters.type) {
      query += ` AND i.type = $${paramIndex}`
      values.push(filters.type)
      paramIndex++
    }

    if (filters.level) {
      query += ` AND i.level = $${paramIndex}`
      values.push(filters.level)
      paramIndex++
    }

    if (filters.technology) {
      query += ` AND $${paramIndex} = ANY(i.technologies)`
      values.push(filters.technology)
      paramIndex++
    }

    // Order by like count for popular
    query += ` ORDER BY i.like_count DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    values.push(limit, offset)

    try {
      console.log("Executing popular interviews query:", query)
      console.log("With values:", values)
      const result = await sql.query(query, values)
      return result.rows || []
    } catch (sqlError) {
      console.error("SQL error in getPopularInterviews:", sqlError)
      return []
    }
  } catch (error) {
    console.error("Error getting popular interviews:", error)
    return []
  }
}

// Get recent interviews
export async function getRecentInterviews(limit = 10, offset = 0, filters: any = {}) {
  try {
    // First check if the community_interviews table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'community_interviews'
      );
    `

    // If table doesn't exist, return empty array
    if (!tableExists[0].exists) {
      console.log("community_interviews table doesn't exist yet, returning empty recent interviews")
      return []
    }

    let query = `
      SELECT i.*, u.name as user_name, u.profile_image_url
      FROM interviews i
      JOIN users u ON i.user_id = u.id
      JOIN community_interviews ci ON i.id = ci.interview_id
      WHERE i.is_public IS TRUE AND i.completed IS TRUE
    `

    const values = []
    let paramIndex = 1

    // Apply filters
    if (filters.role) {
      query += ` AND i.role = $${paramIndex}`
      values.push(filters.role)
      paramIndex++
    }

    if (filters.type) {
      query += ` AND i.type = $${paramIndex}`
      values.push(filters.type)
      paramIndex++
    }

    if (filters.level) {
      query += ` AND i.level = $${paramIndex}`
      values.push(filters.level)
      paramIndex++
    }

    if (filters.technology) {
      query += ` AND $${paramIndex} = ANY(i.technologies)`
      values.push(filters.technology)
      paramIndex++
    }

    // Order by creation date for recent
    query += ` ORDER BY ci.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    values.push(limit, offset)

    try {
      console.log("Executing recent interviews query:", query)
      console.log("With values:", values)
      const result = await sql.query(query, values)
      return result.rows || []
    } catch (sqlError) {
      console.error("SQL error in getRecentInterviews:", sqlError)
      return []
    }
  } catch (error) {
    console.error("Error getting recent interviews:", error)
    return []
  }
}

// Get all community interviews
export async function getCommunityInterviews(limit = 20, offset = 0, filters: any = {}) {
  try {
    let query = `
      SELECT i.*, u.name as user_name, u.profile_image_url, ci.created_at as shared_at
      FROM community_interviews ci
      JOIN interviews i ON ci.interview_id = i.id
      JOIN users u ON i.user_id = u.id
      WHERE i.is_public IS TRUE AND i.completed IS TRUE
    `

    const values = []
    let paramIndex = 1

    // Apply filters
    if (filters.role) {
      query += ` AND i.role = $${paramIndex}`
      values.push(filters.role)
      paramIndex++
    }

    if (filters.type) {
      query += ` AND i.type = $${paramIndex}`
      values.push(filters.type)
      paramIndex++
    }

    if (filters.level) {
      query += ` AND i.level = $${paramIndex}`
      values.push(filters.level)
      paramIndex++
    }

    if (filters.technology) {
      query += ` AND $${paramIndex} = ANY(i.technologies)`
      values.push(filters.technology)
      paramIndex++
    }

    // Order by creation date
    query += ` ORDER BY ci.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    values.push(limit, offset)

    try {
      console.log("Executing community interviews query:", query)
      console.log("With values:", values)
      const result = await sql.query(query, values)
      return result.rows || []
    } catch (sqlError) {
      console.error("SQL error in getCommunityInterviews:", sqlError)
      return []
    }
  } catch (error) {
    console.error("Error getting community interviews:", error)
    return []
  }
}

// Like an interview
export async function likeInterview(userId: number, interviewId: number) {
  try {
    // Check if already liked
    const existingLike = await sql`
      SELECT * FROM interview_likes
      WHERE user_id = ${userId} AND interview_id = ${interviewId}
    `

    if (existingLike.length > 0) {
      // Already liked, so unlike
      await sql`
        DELETE FROM interview_likes
        WHERE user_id = ${userId} AND interview_id = ${interviewId}
      `

      // Decrement like count
      await sql`
        UPDATE interviews
        SET like_count = like_count - 1
        WHERE id = ${interviewId}
      `

      return { liked: false }
    } else {
      // Not liked, so like
      await sql`
        INSERT INTO interview_likes (user_id, interview_id)
        VALUES (${userId}, ${interviewId})
      `

      // Increment like count
      await sql`
        UPDATE interviews
        SET like_count = like_count + 1
        WHERE id = ${interviewId}
      `

      return { liked: true }
    }
  } catch (error) {
    console.error("Error liking interview:", error)
    throw error
  }
}

// Check if user has liked an interview
export async function hasUserLikedInterview(userId: number, interviewId: number) {
  try {
    const result = await sql`
      SELECT * FROM interview_likes
      WHERE user_id = ${userId} AND interview_id = ${interviewId}
    `

    return result.length > 0
  } catch (error) {
    console.error("Error checking if user liked interview:", error)
    return false
  }
}

// Save an interview
export async function saveInterview(userId: number, interviewId: number) {
  try {
    // Check if already saved
    const existingSave = await sql`
      SELECT * FROM saved_interviews
      WHERE user_id = ${userId} AND interview_id = ${interviewId}
    `

    if (existingSave.length > 0) {
      // Already saved, so unsave
      await sql`
        DELETE FROM saved_interviews
        WHERE user_id = ${userId} AND interview_id = ${interviewId}
      `

      return { saved: false }
    } else {
      // Not saved, so save
      await sql`
        INSERT INTO saved_interviews (user_id, interview_id)
        VALUES (${userId}, ${interviewId})
      `

      return { saved: true }
    }
  } catch (error) {
    console.error("Error saving interview:", error)
    throw error
  }
}

// Get saved interviews for a user
export async function getSavedInterviews(userId: number) {
  try {
    const result = await sql`
      SELECT i.*, u.name as user_name, u.profile_image_url
      FROM saved_interviews s
      JOIN interviews i ON s.interview_id = i.id
      JOIN users u ON i.user_id = u.id
      WHERE s.user_id = ${userId}
      ORDER BY s.created_at DESC
    `
    return result
  } catch (error) {
    console.error("Error getting saved interviews:", error)
    throw error
  }
}

// Increment view count for an interview
export async function incrementInterviewViewCount(interviewId: number) {
  try {
    await sql`
      UPDATE interviews
      SET view_count = view_count + 1
      WHERE id = ${interviewId}
    `

    return true
  } catch (error) {
    console.error("Error incrementing view count:", error)
    return false
  }
}

// Get unique roles, types, levels, and technologies for filtering
export async function getInterviewFilterOptions() {
  try {
    // First check if the community_interviews table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'community_interviews'
      );
    `

    // If table doesn't exist, return empty options
    if (!tableExists[0].exists) {
      console.log("community_interviews table doesn't exist yet, returning empty filter options")
      return { roles: [], types: [], levels: [], technologies: [] }
    }

    // If table exists, proceed with queries
    const roles = await sql`
      SELECT DISTINCT role FROM interviews 
      WHERE is_public IS TRUE AND completed IS TRUE
    `
    const types = await sql`
      SELECT DISTINCT type FROM interviews 
      WHERE is_public IS TRUE AND completed IS TRUE
    `
    const levels = await sql`
      SELECT DISTINCT level FROM interviews 
      WHERE is_public IS TRUE AND completed IS TRUE
    `

    // For technologies, we need to unnest the array
    const technologies = await sql`
      SELECT DISTINCT unnest(technologies) as technology 
      FROM interviews 
      WHERE is_public IS TRUE AND completed IS TRUE
    `

    return {
      roles: roles.map((r) => r.role),
      types: types.map((t) => t.type),
      levels: levels.map((l) => l.level),
      technologies: technologies.map((t) => t.technology),
    }
  } catch (error) {
    console.error("Error getting filter options:", error)
    // Return empty options on error
    return { roles: [], types: [], levels: [], technologies: [] }
  }
}

// Check if user has saved an interview
export async function hasUserSavedInterview(userId: number, interviewId: number) {
  try {
    const result = await sql`
      SELECT * FROM saved_interviews
      WHERE user_id = ${userId} AND interview_id = ${interviewId}
    `

    return result.length > 0
  } catch (error) {
    console.error("Error checking if user saved interview:", error)
    return false
  }
}

// Add interview to community
export async function addInterviewToCommunity(
  interviewId: number,
  userId: number,
  title?: string,
  description?: string,
  tags?: string[],
) {
  try {
    // Check if already in community
    const existingEntry = await sql`
      SELECT * FROM community_interviews
      WHERE interview_id = ${interviewId} AND user_id = ${userId}
    `

    if (existingEntry.length > 0) {
      // Already in community, update it
      await sql`
        UPDATE community_interviews
        SET title = ${title || null}, description = ${description || null}, tags = ${tags || null}
        WHERE interview_id = ${interviewId} AND user_id = ${userId}
      `
    } else {
      // Not in community, add it
      await sql`
        INSERT INTO community_interviews (interview_id, user_id, title, description, tags)
        VALUES (${interviewId}, ${userId}, ${title || null}, ${description || null}, ${tags || null})
      `
    }

    return { success: true }
  } catch (error) {
    console.error("Error adding interview to community:", error)
    throw error
  }
}

// Remove interview from community
export async function removeInterviewFromCommunity(interviewId: number, userId: number) {
  try {
    await sql`
      DELETE FROM community_interviews
      WHERE interview_id = ${interviewId} AND user_id = ${userId}
    `

    return { success: true }
  } catch (error) {
    console.error("Error removing interview from community:", error)
    throw error
  }
}

// Update the public status of an interview
export async function updateInterviewPublicStatus(interviewId: string, userId: number, isPublic: boolean) {
  try {
    console.log(`Updating interview ${interviewId} public status to ${isPublic} for user ${userId}`)

    // First update the is_public flag
    let result
    try {
      result = await sql`
        UPDATE interviews
        SET is_public = ${isPublic}
        WHERE id = ${interviewId} AND user_id = ${userId}
        RETURNING is_public, id
      `

      console.log("Update result:", result)

      if (!result || result.length === 0) {
        console.error("No rows updated. Interview not found or user not authorized.")
        throw new Error("Interview not found or user not authorized")
      }
    } catch (sqlError) {
      console.error("SQL error updating interview public status:", sqlError)
      // Handle rate limiting or connection errors
      if (sqlError.message && sqlError.message.includes("Too Many")) {
        throw new Error("Database rate limit exceeded. Please try again later.")
      }
      throw sqlError
    }

    return { is_public: isPublic, id: interviewId }
  } catch (error) {
    console.error("Error updating interview public status:", error)
    throw error
  }
}

// Get shared interviews for a user
export async function getSharedInterviews(userId: number) {
  try {
    const result = await sql`
      SELECT i.*, u.name as user_name, u.profile_image_url
      FROM interviews i
      JOIN users u ON i.user_id = u.id
      JOIN community_interviews ci ON i.id = ci.interview_id
      WHERE i.user_id = ${userId} AND i.is_public = true
      ORDER BY ci.created_at DESC
    `
    return result
  } catch (error) {
    console.error("Error getting shared interviews:", error)
    return []
  }
}

// Check if user has shared an interview
export async function hasUserSharedInterview(userId: number, interviewId: number) {
  try {
    const result = await sql`
      SELECT * FROM community_interviews
      WHERE user_id = ${userId} AND interview_id = ${interviewId}
    `

    return result.length > 0
  } catch (error) {
    console.error("Error checking if user shared interview:", error)
    return false
  }
}

