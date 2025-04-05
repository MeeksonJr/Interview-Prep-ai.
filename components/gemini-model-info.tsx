"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"

export function GeminiModelInfo() {
  const [modelName, setModelName] = useState<string | null>(null)

  useEffect(() => {
    // Try to determine which model is being used
    async function checkModel() {
      try {
        const genAI = new (window as any).GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "")

        try {
          // Try flash model first
          const flashModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
          await flashModel.generateContent("test")
          setModelName("gemini-1.5-flash")
        } catch (flashError) {
          // Try pro model as fallback
          try {
            const proModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
            await proModel.generateContent("test")
            setModelName("gemini-2.0-flash")
          } catch (proError) {
            setModelName("unknown")
          }
        }
      } catch (error) {
        console.error("Error checking model:", error)
        setModelName("unknown")
      }
    }

    // Load the Google Generative AI SDK
    const script = document.createElement("script")
    script.src = "https://cdn.jsdelivr.net/npm/@google/generative-ai@latest"
    script.async = true
    script.onload = () => checkModel()
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  if (!modelName) return null

  return (
    <Badge variant="outline" className="bg-white/5 text-white/80 flex items-center gap-1">
      <Sparkles className="h-3 w-3" />
      {modelName === "unknown" ? "Gemini AI" : modelName}
    </Badge>
  )
}

