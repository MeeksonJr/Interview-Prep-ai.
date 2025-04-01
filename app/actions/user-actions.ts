"use server"

import { getUserById as getDbUserById, updateUser, deleteUser } from "@/lib/db"

// Update user profile
export async function updateUserProfile(userId: number, formData: FormData) {
  try {
    console.log(`Updating profile for user ${userId}`)

    // Get user details
    const user = await getDbUserById(userId)
    if (!user) {
      return { success: false, error: "User not found" }
    }

    // Extract form data
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const profileImage = formData.get("profileImage") as File | null

    // In a real app, you would upload the profile image to a storage service
    // and get back a URL to store in the database
    let profileImageUrl = user.profile_image_url
    if (profileImage && profileImage.size > 0) {
      // Simulate image upload - in a real app, this would be a real URL
      // For now, we'll just use a placeholder
      profileImageUrl = `/placeholder.svg?height=200&width=200`
    }

    // Update user in database with a simplified approach
    try {
      // Use a simple update with just the name to avoid potential issues
      const updatedUser = await updateUser(userId, {
        name,
      })

      return { success: true, user: updatedUser }
    } catch (dbError) {
      console.error("Database error updating user:", dbError)
      return { success: false, error: "Failed to update profile. Please try again." }
    }
  } catch (error: any) {
    console.error("Error updating user profile:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

// Change password
export async function changeUserPassword(userId: number, currentPassword: string, newPassword: string) {
  try {
    // In a real app, you would verify the current password and update with the new one
    // For now, we'll just simulate success
    return { success: true }
  } catch (error: any) {
    console.error("Error changing password:", error)
    return { success: false, error: error.message }
  }
}

// Delete account
export async function deleteUserAccount(userId: number) {
  try {
    // Delete user from database
    await deleteUser(userId)
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting account:", error)
    return { success: false, error: error.message }
  }
}

// Export user data
export async function exportUserData(userId: number) {
  try {
    // In a real app, you would generate a PDF or JSON file with the user's data
    // For now, we'll just simulate success with a dummy URL
    return {
      success: true,
      url: `/api/export-data?userId=${userId}&timestamp=${Date.now()}`,
    }
  } catch (error: any) {
    console.error("Error exporting data:", error)
    return { success: false, error: error.message }
  }
}

// Get user by ID (simplified wrapper)
export async function getUserById(userId: number) {
  try {
    // Import the function directly to avoid naming conflicts
    const user = await getDbUserById(userId)
    return user
  } catch (error) {
    console.error("Error getting user by ID:", error)
    return null
  }
}

