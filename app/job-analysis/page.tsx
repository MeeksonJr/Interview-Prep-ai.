"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { analyzeJobMatch } from "@/app/actions/job-analysis-actions"
import { AnalysisResults } from "@/components/job-analysis/analysis-results"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function JobAnalysisPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [resumeId, setResumeId] = useState<string>("")
  const [jobTitle, setJobTitle] = useState<string>("")
  const [company, setCompany] = useState<string>("")
  const [jobDescription, setJobDescription] = useState<string>("")
  const [resumes, setResumes] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [loadingResumes, setLoadingResumes] = useState<boolean>(true)
  const [analysis, setAnalysis] = useState<any>(null)

  // Fetch user's resumes
  useEffect(() => {
    if (!user?.id) return

    const fetchResumes = async () => {
      try {
        console.log("Fetching resumes for user:", user.id)
        const response = await fetch(`/api/resumes?userId=${user.id}`)

        if (!response.ok) {
          const errorText = await response.text()
          console.error("Resume API error response:", errorText)
          throw new Error(`Failed to fetch resumes: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        console.log("Fetched resumes:", data.resumes?.length || 0)
        setResumes(data.resumes || [])
      } catch (error) {
        console.error("Error fetching resumes:", error)
        toast({
          title: "Error",
          description: "Failed to load your resumes. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoadingResumes(false)
      }
    }

    fetchResumes()
  }, [user?.id, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to analyze job matches",
        variant: "destructive",
      })
      return
    }

    if (!resumeId) {
      toast({
        title: "Error",
        description: "Please select a resume to analyze",
        variant: "destructive",
      })
      return
    }

    if (!jobDescription) {
      toast({
        title: "Error",
        description: "Please enter a job description to analyze",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setAnalysis(null)

    try {
      const result = await analyzeJobMatch({
        userId: user.id,
        resumeId: Number.parseInt(resumeId),
        jobTitle,
        company,
        jobDescription,
      })

      if (!result.success) {
        throw new Error(result.error || "Failed to analyze job match")
      }

      setAnalysis(result.analysis)

      toast({
        title: "Analysis Complete",
        description: "Your resume has been analyzed against the job description",
      })
    } catch (error: any) {
      console.error("Error analyzing job match:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to analyze job match",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading authentication...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Job Analysis</CardTitle>
            <CardDescription>You must be logged in to analyze job matches</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/login")}>Log In</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="space-y-8">
        <Card className="border-none shadow-lg bg-gradient-to-br from-gray-900 to-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Job Match Analysis</CardTitle>
            <CardDescription className="text-gray-300">
              Compare your resume against a job description to see how well you match
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="resume" className="text-gray-300">
                    Select Resume
                  </Label>
                  <Select
                    value={resumeId}
                    onValueChange={setResumeId}
                    disabled={loadingResumes || resumes.length === 0}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-300">
                      <SelectValue placeholder="Select a resume" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {loadingResumes ? (
                        <SelectItem value="loading" disabled>
                          Loading resumes...
                        </SelectItem>
                      ) : resumes.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No resumes found
                        </SelectItem>
                      ) : (
                        resumes.map((resume) => (
                          <SelectItem key={resume.id} value={resume.id.toString()}>
                            {resume.file_name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {resumes.length === 0 && !loadingResumes && (
                    <p className="text-sm text-gray-400 mt-1">
                      You need to upload a resume first.{" "}
                      <Button
                        variant="link"
                        className="p-0 h-auto text-blue-400"
                        onClick={() => router.push("/resume")}
                      >
                        Go to Resumes
                      </Button>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="jobTitle" className="text-gray-300">
                      Job Title (Optional)
                    </Label>
                    <Input
                      id="jobTitle"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-gray-300"
                      placeholder="e.g. Software Engineer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company" className="text-gray-300">
                      Company (Optional)
                    </Label>
                    <Input
                      id="company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-gray-300"
                      placeholder="e.g. Google"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="jobDescription" className="text-gray-300">
                    Job Description
                  </Label>
                  <Textarea
                    id="jobDescription"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-[200px] bg-gray-800 border-gray-700 text-gray-300"
                    placeholder="Paste the full job description here..."
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading || !resumeId || !jobDescription}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Job Match"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {analysis && <AnalysisResults analysis={analysis} jobTitle={jobTitle} company={company} />}
      </div>
    </div>
  )
}

