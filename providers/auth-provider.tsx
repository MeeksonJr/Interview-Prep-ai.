"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { verifyAuthToken } from "@/app/actions/auth-actions"

interface User {
  id: number
  email: string
  name?: string
  subscriptionPlan?: string
  subscriptionStatus?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  token: string | null
  setAuthState: (token: string, user: User) => void
  signOut: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  token: null,
  setAuthState: () => {},
  signOut: () => {},
  refreshUser: async () => {},
})

export const useAuth = () => useContext(AuthContext)

// Improved AuthProvider with local storage for JWT
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const router = useRouter()

  // Function to set auth state (used after login/signup)
  const setAuthState = (token: string, user: User) => {
    console.log("Setting auth state with token and user:", { token: token.substring(0, 10) + "...", user })

    // Save to state
    setToken(token)
    setUser(user)

    // Save to local storage
    try {
      localStorage.setItem("auth_token", token)
      localStorage.setItem("user", JSON.stringify(user))
    } catch (error) {
      console.error("Error saving auth state to localStorage:", error)
    }
  }

  // Function to clear auth state (used for logout)
  const clearAuthState = () => {
    console.log("Clearing auth state")

    // Clear state
    setToken(null)
    setUser(null)

    // Clear local storage
    try {
      localStorage.removeItem("auth_token")
      localStorage.removeItem("user")
    } catch (error) {
      console.error("Error clearing auth state from localStorage:", error)
    }
  }

  // Function to handle sign out
  const handleSignOut = () => {
    clearAuthState()
    router.push("/login")
  }

  // Function to verify token and refresh user data
  const refreshUser = async () => {
    try {
      setLoading(true)
      console.log("Refreshing user data...")

      // Get token from state or local storage
      const currentToken = token || (typeof window !== "undefined" ? localStorage.getItem("auth_token") : null)

      if (!currentToken) {
        console.log("No token found, clearing auth state")
        clearAuthState()
        setLoading(false)
        return
      }

      // Verify token on the server
      try {
        const userData = await verifyAuthToken(currentToken)

        if (userData) {
          console.log("Token verified, updated user data:", userData)
          // Update state with fresh user data
          setUser(userData)
          setToken(currentToken)

          // Update local storage with fresh user data
          try {
            localStorage.setItem("user", JSON.stringify(userData))
            console.log("Updated user data in localStorage")
          } catch (error) {
            console.error("Error updating user in localStorage:", error)
          }
        } else {
          console.log("Token verification failed, clearing auth state")
          // Token is invalid, clear auth state
          clearAuthState()
        }
      } catch (error) {
        console.error("Error verifying token during refresh:", error)
        // Don't clear auth state on error, just log it
      }
    } catch (error) {
      console.error("Error refreshing user:", error)
      setError(error instanceof Error ? error : new Error("Unknown error occurred"))
    } finally {
      setLoading(false)
    }
  }

  // Load auth state from local storage on initial render
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        setLoading(true)

        // Get token and user from local storage
        let storedToken = null
        let storedUserJson = null

        try {
          storedToken = localStorage.getItem("auth_token")
          storedUserJson = localStorage.getItem("user")
        } catch (error) {
          console.error("Error accessing localStorage:", error)
        }

        if (storedToken && storedUserJson) {
          // Parse user data
          try {
            const userData = JSON.parse(storedUserJson)
            console.log("Found stored auth data:", { token: storedToken.substring(0, 10) + "...", user: userData })

            // Verify token on the server
            try {
              const verifiedUser = await verifyAuthToken(storedToken)

              if (verifiedUser) {
                // Token is valid, set auth state
                console.log("Token verified successfully, setting auth state")
                setToken(storedToken)
                setUser(verifiedUser)
              } else {
                // Token is invalid, clear auth state
                console.log("Token verification failed, clearing auth state")
                clearAuthState()
              }
            } catch (verifyError) {
              console.error("Error verifying token:", verifyError)
              // Continue with stored user data for now
              console.log("Using stored user data despite verification error")
              setToken(storedToken)
              setUser(userData)
            }
          } catch (parseError) {
            console.error("Error parsing stored user data:", parseError)
            clearAuthState()
          }
        } else {
          console.log("No stored auth data found")
        }
      } catch (error) {
        console.error("Error loading auth state:", error)
        setError(error instanceof Error ? error : new Error("Unknown error occurred"))
        clearAuthState()
      } finally {
        setLoading(false)
      }
    }

    loadAuthState()
  }, [])

  // If there's an error, render an error message
  if (error) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Error</h2>
          <p className="text-red-500 mb-4">{error.message}</p>
          <button
            onClick={() => {
              clearAuthState()
              window.location.reload()
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reload
          </button>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        token,
        setAuthState,
        signOut: handleSignOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

