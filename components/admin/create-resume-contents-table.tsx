"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function CreateResumeContentsTable() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleCreateTable = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/create-resume-contents-table")
      const data = await response.json()

      if (data.success) {
        setResult("Resume contents table created successfully!")
      } else {
        setResult(`Error: ${data.error || "Failed to create table"}`)
      }
    } catch (error) {
      console.error("Error creating resume contents table:", error)
      setResult("An error occurred while creating the table")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleCreateTable} disabled={loading} variant="outline" size="sm">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Table...
          </>
        ) : (
          "Create Resume Contents Table"
        )}
      </Button>

      {result && <p className={`text-sm ${result.includes("Error") ? "text-red-500" : "text-green-500"}`}>{result}</p>}
    </div>
  )
}

