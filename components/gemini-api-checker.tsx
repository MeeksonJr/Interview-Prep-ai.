"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { validateGeminiApiKey, getGeminiApiKey } from "@/lib/api-key-validator"
import { AlertCircle, CheckCircle, Info } from "lucide-react"

export function GeminiApiChecker() {
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    async function checkApiKey() {
      try {
        const apiKey = getGeminiApiKey()

        if (!apiKey) {
          setIsValid(false)
          setErrorMessage(
            "Gemini API key is missing. Please add NEXT_PUBLIC_GEMINI_API_KEY to your environment variables.",
          )
          setIsLoading(false)
          return
        }

        const valid = await validateGeminiApiKey(apiKey)
        setIsValid(valid)

        if (!valid) {
          setErrorMessage("Gemini API key validation failed. The key may be invalid or the service may be unavailable.")
        } else {
          setSuccessMessage("AI connected, Enjoy interviewing")
          setTimeout(() => {
            setSuccessMessage(null)
          }, 3000) // Hide after 3 seconds
        }
      } catch (error: any) {
        console.error("Error checking Gemini API key:", error)
        setIsValid(false)
        setErrorMessage(error.message || "Unknown error validating Gemini API key")
      } finally {
        setIsLoading(false)
      }
    }

    checkApiKey()
  }, [])

  if (isLoading) {
    return (
      <Alert className="mb-4 bg-yellow-500/10 border-yellow-500/20 text-yellow-400">
        <Info className="h-4 w-4" />
        <AlertTitle>Checking Gemini API configuration...</AlertTitle>
        <AlertDescription>Please wait while we verify your Gemini API key.</AlertDescription>
      </Alert>
    )
  }

  if (isValid === false) {
    return (
      <Alert className="mb-4 bg-red-500/10 border-red-500/20 text-red-400">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Gemini API Key Issue</AlertTitle>
        <AlertDescription>
          {errorMessage || "Your Gemini API key is missing or invalid. Some AI features may not work correctly."}
        </AlertDescription>
      </Alert>
    )
  }

  if (isValid === true && successMessage) {
    return (
      <Alert className="mb-4 bg-green-500/10 border-green-500/20 text-green-400">
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>Gemini API Connected</AlertTitle>
        <AlertDescription>{successMessage}</AlertDescription>
      </Alert>
    )
  }

  return null
}

