"use client"

import { useState, useEffect } from "react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { checkGeminiApiConfigured } from "@/app/actions/api-actions"

export function GeminiApiChecker() {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkApiKey() {
      try {
        // Use the server action to check if the API key is configured
        const configured = await checkGeminiApiConfigured()
        setIsConfigured(configured)
      } catch (error) {
        console.error("Error checking Gemini API key:", error)
        setIsConfigured(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkApiKey()
  }, [])

  if (isLoading) {
    return (
      <Alert className="mb-4">
        <AlertTitle>Checking Gemini API configuration...</AlertTitle>
        <AlertDescription>Please wait while we verify the API configuration.</AlertDescription>
      </Alert>
    )
  }

  if (isConfigured === false) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTitle>Gemini API Not Configured</AlertTitle>
        <AlertDescription>
          The Gemini API key is not configured. Please add the GEMINI_API_KEY environment variable to enable AI
          features.
        </AlertDescription>
      </Alert>
    )
  }

  return null
}

