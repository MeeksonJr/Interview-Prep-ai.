"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import { uploadAndAnalyzeResume, fetchUserResumes, deleteUserResume } from "@/app/actions/resume-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { FileUp, Trash2, FileText, AlertCircle, Database, Copy, Check } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function ResumePage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const [resumes, setResumes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedResume, setSelectedResume] = useState<any>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tableExists, setTableExists] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const loadResumes = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log("Loading resumes for user:", user.id)
        const result = await fetchUserResumes(user.id)

        if (result.success) {
          console.log(`Loaded ${result.resumes.length} resumes`)
          setResumes(result.resumes)
          setTableExists(true)
        } else {
          console.error("Failed to load resumes:", result.error)

          // Check if the error is about the missing table
          if (
            (result.error && result.error.includes("relation") && result.error.includes("does not exist")) ||
            (result.error && result.error.includes("resume feature is not yet set up"))
          ) {
            // The table is being created automatically now, so we'll just show a loading state
            setError("Setting up resume feature. This may take a moment...")

            // Try again after a short delay
            setTimeout(() => loadResumes(), 3000)
          } else {
            setError(result.error || "Failed to load resumes")
            toast({
              title: "Error",
              description: result.error || "Failed to load resumes",
              variant: "destructive",
            })
          }
        }
      } catch (error: any) {
        console.error("Error loading resumes:", error)
        setError(error.message || "An unexpected error occurred")
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadResumes()
  }, [user, router, toast])

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!tableExists) {
      toast({
        title: "Feature Not Available",
        description: "The resume feature is not yet set up. Please run the SQL script to create the necessary table.",
        variant: "destructive",
      })
      return
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to upload a resume",
        variant: "destructive",
      })
      return
    }

    const form = event.currentTarget
    const formData = new FormData(form)

    // Validate file
    const file = formData.get("resume") as File
    if (!file || file.size === 0) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      })
      return
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ]
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Please upload a PDF, DOC, DOCX, or TXT file",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    try {
      console.log("Uploading resume:", file.name)
      const result = await uploadAndAnalyzeResume(formData, user.id)

      if (result.success) {
        console.log("Resume uploaded successfully")
        toast({
          title: "Success",
          description: "Resume uploaded and analyzed successfully",
        })

        // Add the new resume to the list
        setResumes((prev) => [result.resume, ...prev])

        // Reset the form
        form.reset()
      } else {
        console.error("Failed to upload resume:", result.error)
        toast({
          title: "Error",
          description: result.error || "Failed to upload resume",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error uploading resume:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (resumeId: number) => {
    if (!user) return

    try {
      console.log("Deleting resume:", resumeId)
      const result = await deleteUserResume(resumeId, user.id)

      if (result.success) {
        console.log("Resume deleted successfully")
        toast({
          title: "Success",
          description: "Resume deleted successfully",
        })

        // Remove the deleted resume from the list
        setResumes((prev) => prev.filter((resume: any) => resume.id !== resumeId))
      } else {
        console.error("Failed to delete resume:", result.error)
        toast({
          title: "Error",
          description: result.error || "Failed to delete resume",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error deleting resume:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const viewResumeDetails = (resume: any) => {
    setSelectedResume(resume)
    setOpenDialog(true)
  }

  const copyToClipboard = () => {
    const sqlScript = `CREATE TABLE IF NOT EXISTS user_resumes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  career_path TEXT NOT NULL,
  level TEXT NOT NULL,
  score INTEGER NOT NULL,
  analysis JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS user_resumes_user_id_idx ON user_resumes(user_id);`

    navigator.clipboard.writeText(sqlScript).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)

      toast({
        title: "SQL Copied",
        description: "The SQL script has been copied to your clipboard",
      })
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!tableExists) {
    return (
      <div className="container mx-auto p-4">
        <Card className="border-yellow-300 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Resume Feature Setup Required
            </CardTitle>
            <CardDescription>The resume analysis feature needs to be set up in your database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>To use the resume analysis feature, you need to create the necessary database table.</p>

              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mt-2 overflow-x-auto text-sm relative">
                <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={copyToClipboard}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <pre className="whitespace-pre-wrap">
                  {`CREATE TABLE IF NOT EXISTS user_resumes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  career_path TEXT NOT NULL,
  level TEXT NOT NULL,
  score INTEGER NOT NULL,
  analysis JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS user_resumes_user_id_idx ON user_resumes(user_id);`}
                </pre>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-900 p-4 rounded-md">
                <h3 className="font-medium flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4" />
                  Instructions
                </h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Copy the SQL script above</li>
                  <li>Run it in your PostgreSQL database</li>
                  <li>Refresh this page to start using the resume analysis feature</li>
                </ol>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
            <Button onClick={copyToClipboard}>{copied ? "Copied!" : "Copy SQL Script"}</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (error && tableExists) {
    return (
      <div className="container mx-auto p-4">
        <Card className="border-red-300">
          <CardHeader>
            <CardTitle className="text-red-500">Error Loading Resumes</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <p className="mt-4">Please try again later or contact support if the problem persists.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Resume Analysis</h1>
        <p className="text-muted-foreground">
          Upload your resume to get personalized feedback and improve your chances of landing your dream job
        </p>
      </div>

      <Tabs defaultValue="upload">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload Resume</TabsTrigger>
          <TabsTrigger value="history">Resume History</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Your Resume</CardTitle>
              <CardDescription>Get personalized feedback based on your career goals</CardDescription>
            </CardHeader>
            <form onSubmit={handleUpload}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resume">Resume File</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
                    <FileUp className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">Drag and drop your resume or click to browse</p>
                    <Input id="resume" name="resume" type="file" accept=".pdf,.doc,.docx,.txt" className="max-w-sm" />
                    <p className="text-xs text-muted-foreground mt-2">Supported formats: PDF, DOC, DOCX, TXT</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="careerPath">Career Path</Label>
                    <Select name="careerPath" defaultValue="fullstack">
                      <SelectTrigger>
                        <SelectValue placeholder="Select career path" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="frontend">Frontend Developer</SelectItem>
                        <SelectItem value="backend">Backend Developer</SelectItem>
                        <SelectItem value="fullstack">Full Stack Developer</SelectItem>
                        <SelectItem value="devops">DevOps Engineer</SelectItem>
                        <SelectItem value="data">Data Scientist/Engineer</SelectItem>
                        <SelectItem value="mobile">Mobile Developer</SelectItem>
                        <SelectItem value="ai">AI/ML Engineer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="level">Experience Level</Label>
                    <Select name="level" defaultValue="mid">
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="junior">Junior (0-2 years)</SelectItem>
                        <SelectItem value="mid">Mid-Level (3-5 years)</SelectItem>
                        <SelectItem value="senior">Senior (6+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={uploading}>
                  {uploading ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                      Analyzing...
                    </>
                  ) : (
                    "Upload & Analyze"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Why Analyze Your Resume?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col items-center text-center p-4">
                  <div className="bg-primary/10 p-3 rounded-full mb-4">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2">Personalized Feedback</h3>
                  <p className="text-sm text-muted-foreground">
                    Get tailored recommendations based on your target role and experience level
                  </p>
                </div>

                <div className="flex flex-col items-center text-center p-4">
                  <div className="bg-primary/10 p-3 rounded-full mb-4">
                    <AlertCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2">Identify Gaps</h3>
                  <p className="text-sm text-muted-foreground">
                    Discover missing skills and experiences that could improve your chances
                  </p>
                </div>

                <div className="flex flex-col items-center text-center p-4">
                  <div className="bg-primary/10 p-3 rounded-full mb-4">
                    <FileUp className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2">Track Improvements</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload multiple versions to see how your resume improves over time
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {resumes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">You haven't uploaded any resumes yet</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => document.querySelector('[value="upload"]')?.dispatchEvent(new Event("click"))}
                >
                  Upload Your First Resume
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resumes.map((resume: any) => (
                <Card key={resume.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{resume.file_name}</CardTitle>
                        <CardDescription>{new Date(resume.created_at).toLocaleDateString()}</CardDescription>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(resume.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Match Score</span>
                      <span className="text-sm font-medium">{resume.score}%</span>
                    </div>
                    <Progress value={resume.score} className="h-2" />

                    <div className="flex flex-wrap gap-2 mt-4">
                      <div className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs">
                        {resume.career_path === "frontend"
                          ? "Frontend"
                          : resume.career_path === "backend"
                            ? "Backend"
                            : resume.career_path === "fullstack"
                              ? "Full Stack"
                              : resume.career_path}
                      </div>
                      <div className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs">
                        {resume.level === "junior"
                          ? "Junior"
                          : resume.level === "mid"
                            ? "Mid-Level"
                            : resume.level === "senior"
                              ? "Senior"
                              : resume.level}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" onClick={() => viewResumeDetails(resume)}>
                      View Analysis
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Resume Analysis</DialogTitle>
            <DialogDescription>
              {selectedResume?.file_name} • {new Date(selectedResume?.created_at).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>

          {selectedResume && selectedResume.analysis && (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Match Score</h3>
                  <span className="font-medium">{selectedResume.score}%</span>
                </div>
                <Progress value={selectedResume.score} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2">{selectedResume.analysis.overall_assessment}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Detected Skills</h3>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Technical Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedResume.analysis.detected_skills.technical.map((skill: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                        {selectedResume.analysis.detected_skills.technical.length === 0 && (
                          <span className="text-sm text-muted-foreground">No technical skills detected</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Soft Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedResume.analysis.detected_skills.soft.map((skill: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                        {selectedResume.analysis.detected_skills.soft.length === 0 && (
                          <span className="text-sm text-muted-foreground">No soft skills detected</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Strengths</h3>
                  {selectedResume.analysis.strengths.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {selectedResume.analysis.strengths.map((strength: string, index: number) => (
                        <li key={index} className="text-sm">
                          {strength}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No specific strengths identified</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Areas for Improvement</h3>
                {selectedResume.analysis.areas_for_improvement.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedResume.analysis.areas_for_improvement.map((area: string, index: number) => (
                      <li key={index} className="text-sm">
                        {area}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No specific areas for improvement identified</p>
                )}
              </div>

              <div>
                <h3 className="font-medium mb-2">Recommendations</h3>
                {selectedResume.analysis.recommendations.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedResume.analysis.recommendations.map((recommendation: string, index: number) => (
                      <li key={index} className="text-sm">
                        {recommendation}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No specific recommendations available</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

