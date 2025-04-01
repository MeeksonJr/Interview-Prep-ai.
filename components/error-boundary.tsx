"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Add global error handler
    const errorHandler = (event: ErrorEvent) => {
      console.error("Caught in error boundary:", event.error)
      setError(event.error)
      // Prevent the error from bubbling up
      event.preventDefault()
    }

    // Add unhandled rejection handler
    const rejectionHandler = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection caught in error boundary:", event.reason)
      setError(new Error(event.reason?.message || "Unknown error occurred"))
      // Prevent the rejection from bubbling up
      event.preventDefault()
    }

    window.addEventListener("error", errorHandler)
    window.addEventListener("unhandledrejection", rejectionHandler)

    return () => {
      window.removeEventListener("error", errorHandler)
      window.removeEventListener("unhandledrejection", rejectionHandler)
    }
  }, [])

  if (error) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          <Alert variant="destructive" className="mb-4 bg-red-900/20 border-red-900/50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>{error.message || "An unexpected error occurred. Please try again."}</AlertDescription>
          </Alert>
          <Button
            onClick={() => {
              setError(null)
              window.location.reload()
            }}
            className="w-full"
          >
            Reload Page
          </Button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

