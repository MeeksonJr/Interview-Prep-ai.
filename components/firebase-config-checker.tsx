"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export function FirebaseConfigChecker({ children }: { children: React.ReactNode }) {
  const [configStatus, setConfigStatus] = useState<"checking" | "valid" | "invalid">("checking")

  useEffect(() => {
    // Check if all Firebase environment variables are set
    const firebaseVars = [
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    ]

    const allVarsPresent = firebaseVars.every((variable) => !!variable)
    setConfigStatus(allVarsPresent ? "valid" : "invalid")
  }, [])

  if (configStatus === "checking") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (configStatus === "invalid") {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm border-muted">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <CardTitle>Firebase Configuration Error</CardTitle>
            </div>
            <CardDescription>
              The Firebase configuration is incomplete or invalid. Please check your environment variables.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Make sure you have set the following environment variables:</p>
            <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground space-y-1">
              <li>NEXT_PUBLIC_FIREBASE_API_KEY</li>
              <li>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</li>
              <li>NEXT_PUBLIC_FIREBASE_PROJECT_ID</li>
              <li>NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET</li>
              <li>NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID</li>
              <li>NEXT_PUBLIC_FIREBASE_APP_ID</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.location.reload()} className="w-full">
              Retry
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}

