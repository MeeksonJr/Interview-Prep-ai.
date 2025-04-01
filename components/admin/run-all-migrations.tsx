"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

export function RunAllMigrations() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null)

  const handleRunMigrations = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/run-migrations")
      const data = await response.json()

      setResult(data)
    } catch (error) {
      console.error("Error running migrations:", error)
      setResult({
        success: false,
        error: "An unexpected error occurred",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Run All Database Migrations</h3>
        <Button variant="outline" size="sm" onClick={handleRunMigrations} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            "Run Migrations"
          )}
        </Button>
      </div>

      {result && (
        <Alert variant={result.success ? "default" : "destructive"}>
          {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
          <AlertDescription>{result.success ? result.message : result.error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

