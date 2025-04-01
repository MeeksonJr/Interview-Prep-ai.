"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"

export function GeminiModelInfo() {
  const [modelName, setModelName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchModelInfo() {
      try {
        const response = await fetch("/api/gemini/validate")
        const data = await response.json()

        if (data.valid && data.modelName) {
          setModelName(data.modelName)
        } else {
          setModelName(null)
        }
      } catch (error) {
        console.error("Error fetching model info:", error)
        setModelName(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchModelInfo()
  }, [])

  if (isLoading || !modelName) {
    return null
  }

  return (
    <Badge variant="outline" className="ml-2">
      {modelName}
    </Badge>
  )
}

