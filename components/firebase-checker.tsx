"use client"

import type React from "react"

import { useEffect, useState } from "react"

export function FirebaseChecker({ children }: { children: React.ReactNode }) {
  const [isFirebaseReady, setIsFirebaseReady] = useState(false)

  useEffect(() => {
    // Check if Firebase is available
    const checkFirebase = async () => {
      try {
        // Dynamically import Firebase to ensure it's only loaded on the client
        const { auth } = await import("@/lib/firebase")

        if (auth) {
          console.log("Firebase auth is available")
          setIsFirebaseReady(true)
        } else {
          console.error("Firebase auth is not available")
        }
      } catch (error) {
        console.error("Error checking Firebase:", error)
      }
    }

    checkFirebase()
  }, [])

  if (!isFirebaseReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <>{children}</>
}

