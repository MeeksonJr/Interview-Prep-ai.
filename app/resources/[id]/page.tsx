"use client"

import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, RefreshCw } from "lucide-react"

export default function ResourceDetailPage() {
  const { id } = useParams()
  const [resourceDetails, setResourceDetails] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchResourceDetails = async () => {
    setLoading(true)
    setError(null)

    try {
      // Always use the fallback API to ensure we get a response
      const endpoint = `/api/resources/fallback/${id}?t=${Date.now()}`

      const response = await fetch(endpoint)

      // Check if the response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text()
        console.error("API response not OK:", response.status, errorText)
        throw new Error(`Server error: ${response.status}`)
      }

      // Now try to parse the JSON
      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        console.error("JSON parse error:", jsonError)
        throw new Error("Failed to parse server response")
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to load resource details")
      }

      setResourceDetails(data.data)
    } catch (error: any) {
      console.error("Error fetching resource details:", error)

      // If all else fails, provide a generic error message
      setError("We're having trouble loading this resource. Please try again later.")

      // Set a generic resource content as fallback
      setResourceDetails(`
        <h2>Resource: ${id}</h2>
        <p>We're currently experiencing technical difficulties loading this resource.</p>
        <p>Please try refreshing the page or come back later.</p>
      `)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResourceDetails()
  }, [id])

  const handleRefresh = () => {
    setResourceDetails(null)
    fetchResourceDetails()
  }

  return (
    <div className="container py-10">
      <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">Resource Details</CardTitle>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={loading}
              className="border-white/20 hover:bg-white/10"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </>
              )}
            </Button>
          </div>
          <CardDescription>Details for resource ID: {id}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {loading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="prose prose-sm prose-invert max-w-none">
              {resourceDetails ? (
                <div dangerouslySetInnerHTML={{ __html: resourceDetails }} />
              ) : (
                <p>No details available for this resource.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

