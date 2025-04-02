"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getInterviewById } from "@/app/actions/db-actions"
import { ArrowLeft, CheckCircle, XCircle, BarChart, MessageSquare, Copy, Share2, CreditCard } from "lucide-react"
import type { Interview, InterviewQuestion } from "@/lib/types"
import { useAuth } from "@/providers/auth-provider"
import { generateInterviewQuestions } from "@/lib/interview-generator"
import { createInterview } from "@/app/actions/db-actions"
import { checkUserActionAllowedAction, incrementUserUsageAction } from "@/app/actions/subscription-actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

export default function ResultsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const [interview, setInterview] = useState<Interview | null>(null)
  const [loading, setLoading] = useState(true)
  const [retakeLoading, setRetakeLoading] = useState(false)
  const [scores, setScores] = useState({
    overall: 0,
    communication: 0,
    technicalDepth: 0,
    problemSolving: 0,
    culturalFit: 0,
    confidence: 0,
  })
  const [error, setError] = useState<string | null>(null)
  const [usageLimits, setUsageLimits] = useState<any>(null)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const fetchInterview = async () => {
      try {
        const interviewData = await getInterviewById(params.id, user.id)

        if (!interviewData) {
          console.log("Interview not found, redirecting to dashboard")
          router.push("/dashboard")
          return
        }

        // Check if the interview is completed
         // @ts-ignore
        if (!interviewData.completed) {
          console.log("Interview not completed, redirecting to interview page")
          router.push(`/interview/${params.id}`)
          return
        }

        // Check if user can view results
        try {
          const usageCheck = await checkUserActionAllowedAction(user.id, "results")
          setUsageLimits(usageCheck)

          // If allowed, increment usage counter
          if (usageCheck.allowed) {
            try {
              await incrementUserUsageAction(user.id, "results")
            } catch (usageError) {
              console.error("Failed to increment usage, but continuing:", usageError)
              // Continue anyway - usage tracking is non-critical
            }
          }
        } catch (usageCheckError) {
          console.error("Error checking usage limits:", usageCheckError)
          // Continue anyway - we'll assume the user is allowed if we can't check
          setUsageLimits({ allowed: true })
        }
 // @ts-ignore
        setInterview({
           // @ts-ignore
          id: interviewData.id,
          ...interviewData,
        })

        // Calculate scores
        calculateScores(interviewData.questions || [])
      } catch (error) {
        console.error("Error fetching interview results:", error)
        setError("Failed to load interview results. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchInterview()
  }, [params.id, router, user])

  const calculateScores = (questions: InterviewQuestion[]) => {
    const answeredQuestions = questions.filter((q) => q.feedback)
    if (answeredQuestions.length === 0) return

    // Calculate overall score
    const overallScore = Math.round(
      answeredQuestions.reduce((sum, q) => sum + (q.feedback?.score || 0), 0) / answeredQuestions.length,
    )

    // Calculate category scores (simulated for now)
    // In a real app, these would come from the AI evaluation
    const communication = Math.round(overallScore * (0.8 + Math.random() * 0.4))
    const technicalDepth = Math.round(overallScore * (0.8 + Math.random() * 0.4))
    const problemSolving = Math.round(overallScore * (0.8 + Math.random() * 0.4))
    const culturalFit = Math.round(overallScore * (0.8 + Math.random() * 0.4))
    const confidence = Math.round(overallScore * (0.8 + Math.random() * 0.4))

    setScores({
      overall: overallScore,
      communication: Math.min(communication, 100),
      technicalDepth: Math.min(technicalDepth, 100),
      problemSolving: Math.min(problemSolving, 100),
      culturalFit: Math.min(culturalFit, 100),
      confidence: Math.min(confidence, 100),
    })
  }

  const handleRetakeInterview = async () => {
    if (!interview || !user) return

    try {
      // Check if user can retake interviews
      const usageCheck = await checkUserActionAllowedAction(user.id, "retakes")

      if (!usageCheck.allowed) {
        setError(`You've reached your daily limit for interview retakes. Upgrade your plan for more.`)
        return
      }

      setRetakeLoading(true)
      setError(null)

      // Extract the settings from the current interview
      const { role, type, level, technologies } = interview
      const questionCount = interview.questions.length

      console.log("Retaking interview with settings:", { role, type, level, questionCount, technologies })

      // Generate new questions with the same settings
      console.log("Generating new questions...")
      const questions = await generateInterviewQuestions({
        role,
        type,
        level,
        questionCount,
        technologies,
      })

      console.log("Questions generated:", questions)

      // Create a new interview with the same settings
      const interviewData = {
        userId: user.id,
        role,
        type,
        level,
        technologies,
        questions,
        started: false,
        completed: false,
        currentQuestionIndex: 0,
        title: `${role} Interview (Retake)`,
      }

      console.log("Creating new interview with data:", interviewData)

      const newInterview = await createInterview(interviewData)
      console.log("New interview created:", newInterview)

      // Increment retake usage counter
      await incrementUserUsageAction(user.id, "retakes")

      // Redirect to the new interview
      router.push(`/interview/${newInterview.id}`)
    } catch (error: any) {
      console.error("Error retaking interview:", error)
      setError(error.message || "Failed to create new interview. Please try again.")
      setRetakeLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Good"
    if (score >= 40) return "Fair"
    return "Needs Improvement"
  }

  if (loading) {
    return (
      <div className="container py-10 flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    )
  }

  // If user has reached their limit
  if (usageLimits && !usageLimits.allowed) {
    return (
      <div className="container py-10">
        <Button variant="ghost" className="mb-6" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent">
          <CardHeader>
            <CardTitle>Usage Limit Reached</CardTitle>
            <CardDescription>You've reached your daily limit for viewing interview results.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Your current plan ({usageLimits.plan}) allows you to view {usageLimits.usage.limit} results per day.
              You've used all of your daily allowance.
            </p>
            <p>Upgrade your subscription to get more results views per day or wait until tomorrow.</p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="border-white/20 hover:bg-white/10"
            >
              Back to Dashboard
            </Button>
            <Button asChild className="gap-2 bg-white text-black hover:bg-gray-200">
              <Link href="/subscription">
                <CreditCard className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (!interview || !interview.questions) {
    return (
      <div className="container py-10">
        <Card className="bg-card/50 backdrop-blur-sm border-muted">
          <CardHeader>
            <CardTitle>Results Not Found</CardTitle>
            <CardDescription>
              The interview results you're looking for don't exist or you don't have access to them.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <Button variant="ghost" className="mb-6" onClick={() => router.push("/dashboard")}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-card/50 backdrop-blur-sm border-muted">
            <CardHeader>
              <CardTitle>Interview Results</CardTitle>
              <CardDescription>
                {interview.role} • {interview.type} • {interview.level} • Completed on{" "}
                {interview.completedAt?.toLocaleString()}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Overall Score</h3>
                  <span className={`text-2xl font-bold ${getScoreColor(scores.overall)}`}>{scores.overall}/100</span>
                </div>
                <Progress value={scores.overall} className="h-2.5" />
                <p className="text-sm text-muted-foreground text-right">{getScoreLabel(scores.overall)}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">Communication</h4>
                    <span className={`font-medium ${getScoreColor(scores.communication)}`}>
                      {scores.communication}/100
                    </span>
                  </div>
                  <Progress value={scores.communication} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">Technical Depth</h4>
                    <span className={`font-medium ${getScoreColor(scores.technicalDepth)}`}>
                      {scores.technicalDepth}/100
                    </span>
                  </div>
                  <Progress value={scores.technicalDepth} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">Problem Solving</h4>
                    <span className={`font-medium ${getScoreColor(scores.problemSolving)}`}>
                      {scores.problemSolving}/100
                    </span>
                  </div>
                  <Progress value={scores.problemSolving} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">Cultural Fit</h4>
                    <span className={`font-medium ${getScoreColor(scores.culturalFit)}`}>{scores.culturalFit}/100</span>
                  </div>
                  <Progress value={scores.culturalFit} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">Confidence</h4>
                    <span className={`font-medium ${getScoreColor(scores.confidence)}`}>{scores.confidence}/100</span>
                  </div>
                  <Progress value={scores.confidence} className="h-2" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Key Takeaways</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {interview.questions
                         // @ts-ignore
                          .filter((q) => q.feedback?.strengths?.length > 0)
                           // @ts-ignore
                          .flatMap((q) => q.feedback.strengths)
                          .slice(0, 3)
                          .map((strength, index) => (
                            <li key={index} className="text-sm">
                              • {strength}
                            </li>
                          ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-500" />
                        Areas for Improvement
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {interview.questions
                         // @ts-ignore
                          .filter((q) => q.feedback?.improvements?.length > 0)
                           // @ts-ignore
                          .flatMap((q) => q.feedback.improvements)
                          .slice(0, 3)
                          .map((improvement, index) => (
                            <li key={index} className="text-sm">
                              • {improvement}
                            </li>
                          ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Question Breakdown</h3>
                <Tabs defaultValue="questions" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="questions" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Questions & Answers
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="flex items-center gap-2">
                      <BarChart className="h-4 w-4" />
                      Performance Analytics
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="questions" className="space-y-4 mt-4">
                    {interview.questions.map((question, index) => (
                      <Card key={index} className="bg-muted/30">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">
                            Question {index + 1}: {question.question}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {question.userAnswer ? (
                            <>
                              <div className="space-y-1">
                                <p className="text-sm font-medium">Your Answer:</p>
                                <p className="text-sm text-muted-foreground">{question.userAnswer}</p>
                              </div>

                              {question.feedback && (
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <p className="text-sm font-medium">Score:</p>
                                    <span className={`font-medium ${getScoreColor(question.feedback.score)}`}>
                                      {question.feedback.score}/100
                                    </span>
                                  </div>
                                  <Progress value={question.feedback.score} className="h-2" />

                                  <p className="text-sm font-medium mt-2">Feedback:</p>
                                  <p className="text-sm text-muted-foreground">{question.feedback.detailedFeedback}</p>
                                </div>
                              )}
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground">No answer provided</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="analytics" className="mt-4">
                    <Card className="bg-muted/30">
                      <CardContent className="pt-6">
                        <div className="text-center mb-6">
                          <p className="text-sm text-muted-foreground">
                            Detailed analytics visualization would appear here in the full application
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">Question Performance</h4>
                            <div className="h-40 bg-muted/50 rounded-lg flex items-center justify-center">
                              <p className="text-sm text-muted-foreground">Bar chart showing score per question</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">Skill Breakdown</h4>
                            <div className="h-40 bg-muted/50 rounded-lg flex items-center justify-center">
                              <p className="text-sm text-muted-foreground">Radar chart showing skills assessment</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>

            <CardFooter className="flex flex-wrap gap-2">
              <Button variant="outline" className="gap-2">
                <Copy className="h-4 w-4" />
                Save as PDF
              </Button>
              <Button variant="outline" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share Results
              </Button>
              <Button onClick={handleRetakeInterview} className="gap-2 ml-auto" disabled={retakeLoading}>
                {retakeLoading ? "Creating new interview..." : "Retake Interview"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card className="bg-card/50 backdrop-blur-sm border-muted sticky top-6">
            <CardHeader>
              <CardTitle>Improvement Plan</CardTitle>
              <CardDescription>Personalized recommendations based on your performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Focus Areas</h3>
                <ul className="space-y-2">
                  {scores.communication < 70 && (
                    <li className="text-sm flex items-start gap-2">
                      <div className="h-5 w-5 flex-shrink-0 mt-0.5">
                        <XCircle className="h-5 w-5 text-red-500" />
                      </div>
                      <span>Work on communication clarity and structure when explaining complex concepts</span>
                    </li>
                  )}
                  {scores.technicalDepth < 70 && (
                    <li className="text-sm flex items-start gap-2">
                      <div className="h-5 w-5 flex-shrink-0 mt-0.5">
                        <XCircle className="h-5 w-5 text-red-500" />
                      </div>
                      <span>Deepen your technical knowledge in {interview.technologies.join(", ")}</span>
                    </li>
                  )}
                  {scores.problemSolving < 70 && (
                    <li className="text-sm flex items-start gap-2">
                      <div className="h-5 w-5 flex-shrink-0 mt-0.5">
                        <XCircle className="h-5 w-5 text-red-500" />
                      </div>
                      <span>Practice breaking down complex problems into smaller steps</span>
                    </li>
                  )}
                  {scores.culturalFit < 70 && (
                    <li className="text-sm flex items-start gap-2">
                      <div className="h-5 w-5 flex-shrink-0 mt-0.5">
                        <XCircle className="h-5 w-5 text-red-500" />
                      </div>
                      <span>Improve your ability to discuss teamwork and collaboration experiences</span>
                    </li>
                  )}
                  {scores.confidence < 70 && (
                    <li className="text-sm flex items-start gap-2">
                      <div className="h-5 w-5 flex-shrink-0 mt-0.5">
                        <XCircle className="h-5 w-5 text-red-500" />
                      </div>
                      <span>Work on confidence in your delivery and reduce hesitation</span>
                    </li>
                  )}
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Recommended Practice</h3>
                <Card className="bg-muted/30">
                  <CardContent className="p-3 space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <p className="text-sm">Complete 3 more {interview.type} interviews</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <p className="text-sm">
                        Focus on {interview.level}-level {interview.role} questions
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <p className="text-sm">Practice with different question formats</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Learning Resources</h3>
                <Card className="bg-muted/30">
                  <CardContent className="p-3 space-y-3">
                    <div className="text-sm">
                      <p className="font-medium">Books:</p>
                      <ul className="list-disc pl-5 space-y-1 mt-1">
                        <li>Cracking the Coding Interview</li>
                        <li>System Design Interview</li>
                      </ul>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">Online Courses:</p>
                      <ul className="list-disc pl-5 space-y-1 mt-1">
                        <li>Advanced {interview.technologies[0]} Masterclass</li>
                        <li>Problem Solving Techniques</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleRetakeInterview} disabled={retakeLoading}>
                {retakeLoading ? "Creating new interview..." : "Practice Again"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

