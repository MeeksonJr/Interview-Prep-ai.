"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Plus, X, Loader2, Briefcase } from "lucide-react"
import { useAuth } from "@/providers/auth-provider"
import { createInterview } from "@/app/actions/db-actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function CreatePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("standard")
  const [role, setRole] = useState("")
  const [interviewType, setInterviewType] = useState("mixed")
  const [level, setLevel] = useState("mid-level")
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

    if (!role.trim()) {
      setError("Please specify a role")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await createInterview({
        userId: user.id,
        role,
        type: interviewType,
        level,
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
      <Button variant="ghost" className="mb-6" onClick={() => router.push("/dashboard")}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent">
        <CardHeader>
          <CardTitle>Create New Interview</CardTitle>
          <CardDescription>Set up your interview parameters or use a job description</CardDescription>
        </CardHeader>

        <Tabs defaultValue="standard" value={activeTab} onValueChange={setActiveTab}>
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="standard">Standard Setup</TabsTrigger>
              <TabsTrigger value="job-description">From Job Description</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="standard">
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
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    placeholder="e.g., Frontend Developer, DevOps Engineer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
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

                <div className="space-y-2">
                  <Label htmlFor="level">Experience Level</Label>
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger id="level">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="junior">Junior</SelectItem>
                      <SelectItem value="mid-level">Mid-level</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                      <SelectItem value="lead">Lead / Manager</SelectItem>
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
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleAddTechnology}
                      className="shrink-0"
                    >
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
                  disabled={loading || !role.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Interview...
                    </>
                  ) : (
                    "Create Interview"
                  )}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>

          <TabsContent value="job-description">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-16 w-16 mb-4 text-muted-foreground" />
              <h3 className="text-xl font-medium mb-2">Create from Job Description</h3>
              <p className="text-center text-muted-foreground mb-6 max-w-md">
                Paste a job description and we'll analyze it to create relevant interview questions tailored to the
                position.
              </p>
              <Button
                onClick={() => router.push("/create/job-description")}
                className="bg-white text-black hover:bg-gray-200"
              >
                Continue to Job Description
              </Button>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}

