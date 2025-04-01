"use server"

import { createUser, getUserByEmail, verifyPassword, getUserById } from "@/lib/db"
import { generateToken, verifyToken } from "@/lib/jwt"
import { checkDatabaseConnection } from "@/lib/db-check"

// Improved signUp function with JWT token
export async function signUp(email: string, password: string, name?: string) {
  try {
    console.log("[SERVER] Starting signup process for:", email)

    // Check database connection
    const isConnected = await checkDatabaseConnection()
    if (!isConnected) {
      console.error("[SERVER] Database connection failed during signup")
      return { success: false, error: "Database connection failed. Please try again later." }
    }
    console.log("[SERVER] Database connection successful")

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      console.log("[SERVER] User already exists with email:", email)
      return { success: false, error: "User with this email already exists" }
    }

    // Create the user
    console.log("[SERVER] Creating new user with email:", email)
    const user = await createUser(email, password, name)
    console.log("[SERVER] User created with ID:", user.id)

    // Generate JWT token
    const token = await generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
    })
    console.log("[SERVER] JWT token generated")

    console.log("[SERVER] Signup process completed successfully")
    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    }
  } catch (error: any) {
    console.error("[SERVER] Error signing up:", error)
    return {
      success: false,
      error: error.message || "Failed to sign up. Please try again later.",
    }
  }
}

// Improved signIn function with JWT token
export async function signIn(email: string, password: string) {
  try {
    console.log("[SERVER] Starting sign in process for:", email)

    // Check database connection
    const isConnected = await checkDatabaseConnection()
    if (!isConnected) {
      console.error("[SERVER] Database connection failed during signin")
      return { success: false, error: "Database connection failed. Please try again later." }
    }
    console.log("[SERVER] Database connection successful")

    // Get the user
    const user = await getUserByEmail(email)
    if (!user) {
      console.log("[SERVER] User not found with email:", email)
      return { success: false, error: "Invalid email or password" }
    }
    console.log("[SERVER] User found with ID:", user.id)

    // Verify the password
    const isValid = await verifyPassword(user, password)
    if (!isValid) {
      console.log("[SERVER] Invalid password for user:", user.id)
      return { success: false, error: "Invalid email or password" }
    }
    console.log("[SERVER] Password verified successfully")

    // Generate JWT token
    const token = await generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
    })
    console.log("[SERVER] JWT token generated")

    console.log("[SERVER] Sign in process completed successfully")
    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    }
  } catch (error: any) {
    console.error("[SERVER] Error signing in:", error)
    return {
      success: false,
      error: error.message || "Failed to sign in. Please try again later.",
    }
  }
}

// Function to verify a token and get the user
export async function verifyAuthToken(token: string) {
  try {
    console.log("[SERVER] Verifying auth token")

    if (!token) {
      console.log("[SERVER] No token provided")
      return null
    }

    // Verify the token
    const decoded = await verifyToken(token)
    if (!decoded) {
      console.log("[SERVER] Invalid or expired token")
      return null
    }

    // Get the user from the database to ensure they still exist
    const user = await getUserById(decoded.id)
    if (!user) {
      console.log("[SERVER] User not found for token")
      return null
    }

    console.log("[SERVER] Token verified successfully for user:", user.id)
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    }
  } catch (error) {
    console.error("[SERVER] Error verifying token:", error)
    return null
  }
}

// Function to get the current user from a token
export async function getCurrentUser(token: string) {
  if (!token) {
    return null
  }

  return verifyAuthToken(token)
}

