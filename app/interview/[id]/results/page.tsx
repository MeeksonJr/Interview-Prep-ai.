"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { fetchInterviewById } from "@/app/actions/interview-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Share, Save, BarChart2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  shareInterviewAction,
  toggleSaveInterview,
  checkUserSavedInterview,
  checkUserSharedInterview,
} from "@/app/actions/community-actions"
import { useAuth } from "@/app/context/auth-context"

export default function InterviewResultsPage() {
  const { id } = useParams()
  const [interview, setInterview] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [isShared, setIsShared] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  // Performance metrics
  const [performanceData, setPerformanceData] = useState({
    communication: 0,
    technicalDepth: 0,
    problemSolving: 0,
    culturalFit: 0,
    confidence: 0,
    overall: 0,
  })

  useEffect(() => {
    const fetchInterview = async () => {
      if (!id) return

      try {
        const result = await fetchInterviewById(id as string)
        if (result.success && result.interview) {
          setInterview(result.interview)

          // Calculate performance metrics from feedback
          if (result.interview.feedback) {
            const feedback = result.interview.feedback

            // Extract scores from feedback or use defaults
            const communication = feedback.communication?.score || 0
            const technicalDepth = feedback.technical_depth?.score || 0
            const problemSolving = feedback.problem_solving?.score || 0
            const culturalFit = feedback.cultural_fit?.score || 0
            const confidence = feedback.confidence?.score || 0

            // Calculate overall score (average of all scores)
            const overall = Math.round((communication + technicalDepth + problemSolving + culturalFit + confidence) / 5)

            setPerformanceData({
              communication,
              technicalDepth,
              problemSolving,
              culturalFit,
              confidence,
              overall,
            })
          }

          // Check if user has saved this interview
          if (user?.id) {
            const savedResult = await checkUserSavedInterview(user.id, Number.parseInt(id as string))
            if (savedResult.success) {
              setIsSaved(savedResult.saved)
            }

            // Check if user has shared this interview
            const sharedResult = await checkUserSharedInterview(user.id, Number.parseInt(id as string))
            if (sharedResult.success) {
              setIsShared(sharedResult.shared)
            }
          }
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to load interview",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching interview:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchInterview()
  }, [id, user, toast])

  const handleShareInterview = async () => {
    if (!user?.id || !id) return

    setIsSharing(true)
    try {
      const result = await shareInterviewAction(id as string, user.id, !isShared)

      if (result.success) {
        setIsShared(!isShared)
        toast({
          title: "Success",
          description: result.message,
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to share interview",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sharing interview:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSharing(false)
    }
  }

  const handleSaveInterview = async () => {
    if (!user?.id || !id) return

    setIsSaving(true)
    try {
      const result = await toggleSaveInterview(user.id, Number.parseInt(id as string))

      if (result.success) {
        setIsSaved(result.saved)
        toast({
          title: "Success",
          description: result.saved ? "Interview saved" : "Interview unsaved",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save interview",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving interview:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
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

  if (!interview) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="pt-6">
            <p>Interview not found or you don't have permission to view it.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{interview.title || "Interview Results"}</h1>
          <p className="text-muted-foreground">{new Date(interview.created_at).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSaveInterview} disabled={isSaving}>
            <Save className={`h-4 w-4 mr-2 ${isSaved ? "fill-primary" : ""}`} />
            {isSaved ? "Saved" : "Save"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleShareInterview} disabled={isSharing}>
            <Share className={`h-4 w-4 mr-2 ${isShared ? "text-primary" : ""}`} />
            {isShared ? "Shared" : "Share"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="summary">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="questions">Questions & Answers</TabsTrigger>
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Interview Overview</CardTitle>
              <CardDescription>
                {interview.role} • {interview.level} • {interview.type}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {interview.technologies?.map((tech: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Overall Score</h3>
                  <div className="flex items-center gap-2">
                    <Progress value={performanceData.overall} className="h-2" />
                    <span className="text-sm font-medium">{performanceData.overall}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Takeaways</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {interview.feedback?.strengths && (
                <div>
                  <h3 className="font-medium mb-2">Strengths</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {interview.feedback.strengths.map((strength: string, index: number) => (
                      <li key={index}>{strength}</li>
                    ))}
                  </ul>
                </div>
              )}

              {interview.feedback?.areas_for_improvement && (
                <div>
                  <h3 className="font-medium mb-2">Areas for Improvement</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {interview.feedback.areas_for_improvement.map((area: string, index: number) => (
                      <li key={index}>{area}</li>
                    ))}
                  </ul>
                </div>
              )}

              {interview.feedback?.recommendations && (
                <div>
                  <h3 className="font-medium mb-2">Recommendations</h3>
                  <p>{interview.feedback.recommendations}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          {interview.questions?.map((question: any, index: number) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                <CardDescription>{question.category}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Question</h3>
                  <p>{question.text}</p>
                </div>

                {interview.responses && interview.responses[index] && (
                  <div>
                    <h3 className="font-medium mb-2">Your Answer</h3>
                    <p>{interview.responses[index].text}</p>
                  </div>
                )}

                {interview.feedback?.question_feedback && interview.feedback.question_feedback[index] && (
                  <div>
                    <h3 className="font-medium mb-2">Feedback</h3>
                    <p>{interview.feedback.question_feedback[index].feedback}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm">Score:</span>
                      <Progress value={interview.feedback.question_feedback[index].score} className="h-2 w-24" />
                      <span className="text-sm font-medium">{interview.feedback.question_feedback[index].score}%</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Detailed breakdown of your interview performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Communication</span>
                  <span className="font-medium">{performanceData.communication}%</span>
                </div>
                <Progress value={performanceData.communication} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {getPerformanceDescription("communication", performanceData.communication)}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Technical Depth</span>
                  <span className="font-medium">{performanceData.technicalDepth}%</span>
                </div>
                <Progress value={performanceData.technicalDepth} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {getPerformanceDescription("technicalDepth", performanceData.technicalDepth)}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Problem Solving</span>
                  <span className="font-medium">{performanceData.problemSolving}%</span>
                </div>
                <Progress value={performanceData.problemSolving} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {getPerformanceDescription("problemSolving", performanceData.problemSolving)}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Cultural Fit</span>
                  <span className="font-medium">{performanceData.culturalFit}%</span>
                </div>
                <Progress value={performanceData.culturalFit} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {getPerformanceDescription("culturalFit", performanceData.culturalFit)}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Confidence</span>
                  <span className="font-medium">{performanceData.confidence}%</span>
                </div>
                <Progress value={performanceData.confidence} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {getPerformanceDescription("confidence", performanceData.confidence)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>How your performance compares to previous interviews</CardDescription>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center">
              <div className="flex flex-col items-center text-center">
                <BarChart2 className="h-16 w-16 text-muted-foreground mb-4" />
                <p>Performance trends will be available after you complete more interviews</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper function to get performance descriptions based on score
function getPerformanceDescription(category: string, score: number): string {
  if (score >= 90) {
    return "Exceptional performance in this area. Continue to maintain this strength."
  } else if (score >= 70) {
    return "Strong performance. Some minor areas for improvement."
  } else if (score >= 50) {
    return "Satisfactory performance. Consider focused practice in this area."
  } else if (score >= 30) {
    return "Needs improvement. This is an area to prioritize in your preparation."
  } else {
    return "Significant improvement needed. Focus on building fundamental skills in this area."
  }
}

