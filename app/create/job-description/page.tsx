"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Briefcase, Plus, X, Loader2 } from "lucide-react"
import { useAuth } from "@/providers/auth-provider"
import { createInterviewFromJobDescription } from "@/app/actions/interview-actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function JobDescriptionPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [jobTitle, setJobTitle] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [interviewType, setInterviewType] = useState("mixed")
  const [questionCount, setQuestionCount] = useState(5)
  const [technologies, setTechnologies] = useState<string[]>([])
  const [newTechnology, setNewTechnology] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAddTechnology = () => {
    if (newTechnology.trim() && !technologies.includes(newTechnology.trim())) {
      setTechnologies([...technologies, newTechnology.trim()])
      setNewTechnology("")
    }
  }

  const handleRemoveTechnology = (tech: string) => {
    setTechnologies(technologies.filter((t) => t !== tech))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!jobDescription.trim()) {
      setError("Please provide a job description")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await createInterviewFromJobDescription({
        userId: user.id,
        jobTitle,
        jobDescription,
        type: interviewType,
        questionCount,
        technologies,
      })

      if (result.success && result.interviewId) {
        router.push(`/interview/${result.interviewId}`)
      } else {
        setError(result.error || "Failed to create interview")
      }
    } catch (error: any) {
      console.error("Error creating interview:", error)
      setError(error.message || "Failed to create interview")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <Button variant="ghost" className="mb-6" onClick={() => router.push("/create")}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Create Options
      </Button>

      <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Create Interview from Job Description
          </CardTitle>
          <CardDescription>Paste a job description and we'll generate relevant interview questions</CardDescription>
        </CardHeader>

        {error && (
          <div className="px-6">
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="job-title">Job Title (Optional)</Label>
              <Input
                id="job-title"
                placeholder="e.g., Senior Frontend Developer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job-description">Job Description</Label>
              <Textarea
                id="job-description"
                placeholder="Paste the job description here..."
                className="min-h-[200px]"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">We'll analyze this to create relevant interview questions</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interview-type">Interview Type</Label>
              <Select value={interviewType} onValueChange={setInterviewType}>
                <SelectTrigger id="interview-type">
                  <SelectValue placeholder="Select interview type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="behavioral">Behavioral</SelectItem>
                  <SelectItem value="mixed">Mixed (Both)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="question-count">Number of Questions: {questionCount}</Label>
              </div>
              <Slider
                id="question-count"
                min={3}
                max={10}
                step={1}
                value={[questionCount]}
                onValueChange={(value) => setQuestionCount(value[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>3</span>
                <span>10</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Key Technologies (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a technology..."
                  value={newTechnology}
                  onChange={(e) => setNewTechnology(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddTechnology()
                    }
                  }}
                />
                <Button type="button" variant="outline" size="icon" onClick={handleAddTechnology} className="shrink-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {technologies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {technologies.map((tech) => (
                    <Badge key={tech} variant="secondary" className="bg-secondary/50 pl-2 pr-1 py-1">
                      {tech}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 hover:bg-transparent"
                        onClick={() => handleRemoveTechnology(tech)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-white text-black hover:bg-gray-200"
              disabled={loading || !jobDescription.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Interview...
                </>
              ) : (
                "Create Interview"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

