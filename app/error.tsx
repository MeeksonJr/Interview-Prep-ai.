"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md gradient-border bg-black/50 backdrop-blur-sm border-transparent">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="h-5 w-5" />
            <CardTitle className="text-xl">Something went wrong</CardTitle>
          </div>
          <CardDescription>We encountered an error while trying to process your request.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-900/20 border border-red-900/50 rounded-md p-4 mb-4">
            <p className="text-sm text-red-300">{error.message || "An unexpected error occurred. Please try again."}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Go Home
          </Button>
          <Button onClick={() => reset()}>Try Again</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

