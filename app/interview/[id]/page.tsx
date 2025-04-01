"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  ArrowRight,
  Mic,
  MicOff,
  Play,
  Share2,
  Bookmark,
  BookmarkCheck,
  Globe,
  Lock,
  Briefcase,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import type { InterviewQuestion } from "@/lib/types"
import { evaluateAnswer } from "@/lib/interview-evaluator"
import { VoiceRecorder } from "@/lib/voice-recorder"
import { useAuth } from "@/providers/auth-provider"
import { getInterviewById, updateInterview } from "@/app/actions/db-actions"
import { toggleSaveInterview, checkUserSavedInterview } from "@/app/actions/community-actions"
import { shareInterviewAction } from "@/app/actions/community-actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

export default function InterviewPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const [interview, setInterview] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [isAnswering, setIsAnswering] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [feedback, setFeedback] = useState<any>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [isShared, setIsShared] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState<string | null>(null)

  // Voice recording
  const voiceRecorderRef = useRef<VoiceRecorder | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchInterview = async () => {
      try {
        const interviewData = await getInterviewById(params.id, user.id)

        if (!interviewData) {
          setError("Interview not found or you don't have access to it")
          setLoading(false)
          return
        }

        console.log("Fetched interview:", interviewData)
        setInterview(interviewData)
        setIsShared(!!interviewData.is_public)

        if (interviewData.currentQuestionIndex !== undefined) {
          setCurrentQuestionIndex(interviewData.currentQuestionIndex)
        }

        if (interviewData.completed) {
          setIsCompleted(true)
        }

        // Check if the interview is saved
        try {
          const savedResult = await checkUserSavedInterview(user.id, Number.parseInt(params.id))
          setIsSaved(savedResult.saved)
        } catch (savedError) {
          console.error("Error checking if interview is saved:", savedError)
        }

        // Mark as started if not already
        if (!interviewData.started) {
          const updatedInterview = await updateInterview(params.id, user.id, {
            started: true,
            startedAt: new Date(),
          })
          setInterview(updatedInterview)
        }
      } catch (error: any) {
        console.error("Error fetching interview:", error)
        setError(error.message || "Failed to load interview")
      } finally {
        setLoading(false)
      }
    }

    fetchInterview()

    // Initialize voice recorder
    voiceRecorderRef.current = new VoiceRecorder()
    voiceRecorderRef.current.onTranscription((text) => {
      setUserAnswer(text)
    })
    voiceRecorderRef.current.onError((error) => {
      console.error("Voice recording error:", error)
    })

    return () => {
      // Clean up voice recorder
      if (voiceRecorderRef.current && voiceRecorderRef.current.isActive()) {
        voiceRecorderRef.current.stop()
      }
    }
  }, [params.id, router, user])

  const startRecording = async () => {
    try {
      if (voiceRecorderRef.current) {
        await voiceRecorderRef.current.start()
        setIsRecording(true)
      }
    } catch (error) {
      console.error("Error starting recording:", error)
    }
  }

  const stopRecording = () => {
    if (voiceRecorderRef.current && isRecording) {
      voiceRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleStartAnswering = () => {
    setIsAnswering(true)
  }

  const handleSubmitAnswer = async () => {
    if (!interview || !interview.questions || !user) return

    setIsSubmitting(true)

    try {
      const currentQuestion = interview.questions[currentQuestionIndex]

      // Evaluate the answer
      const answerFeedback = await evaluateAnswer({
        question: currentQuestion.question,
        answer: userAnswer,
        role: interview.role,
        level: interview.level,
        type: interview.type,
      })

      setFeedback(answerFeedback)

      // Update the question with the answer and feedback
      const updatedQuestions = [...interview.questions]
      updatedQuestions[currentQuestionIndex] = {
        ...currentQuestion,
        userAnswer,
        feedback: answerFeedback,
      }

      // Check if this is the last question
      const isLastQuestion = currentQuestionIndex === interview.questions.length - 1

      // Update the interview in the database
      const updateData: any = {
        questions: updatedQuestions,
        currentQuestionIndex: isLastQuestion ? currentQuestionIndex : currentQuestionIndex + 1,
      }

      if (isLastQuestion) {
        updateData.completed = true
        updateData.completedAt = new Date()
        updateData.score = calculateOverallScore(updatedQuestions)
      }

      console.log("Updating interview with data:", {
        id: interview.id,
        userId: user.id,
        updateData,
      })

      try {
        const updatedInterview = await updateInterview(interview.id, user.id, updateData)
        console.log("Interview updated successfully:", updatedInterview)

        // Update local state
        setInterview(updatedInterview)

        if (isLastQuestion) {
          setIsCompleted(true)
        }
      } catch (updateError: any) {
        console.error("Error updating interview:", updateError)

        // Even if the update fails, we still want to show the feedback
        // and allow the user to continue
        if (isLastQuestion) {
          setIsCompleted(true)
        }

        // Show error but don't block the user
        setError(`Warning: Your progress may not be saved. ${updateError.message || "Database connection error"}`)

        // Update local state anyway so the user can continue
        setInterview({
          ...interview,
          questions: updatedQuestions,
          currentQuestionIndex: isLastQuestion ? currentQuestionIndex : currentQuestionIndex + 1,
          completed: isLastQuestion ? true : interview.completed,
        })
      }
    } catch (error: any) {
      console.error("Error submitting answer:", error)
      setError(error.message || "Failed to submit answer")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prev) => prev + 1)
    setUserAnswer("")
    setFeedback(null)
    setIsAnswering(false)
  }

  const calculateOverallScore = (questions: InterviewQuestion[]) => {
    const answeredQuestions = questions.filter((q) => q.feedback)
    if (answeredQuestions.length === 0) return 0

    const totalScore = answeredQuestions.reduce((sum, q) => sum + (q.feedback?.score || 0), 0)
    return Math.round(totalScore / answeredQuestions.length)
  }

  const handleViewResults = () => {
    router.push(`/results/${interview?.id}`)
  }

  const handleShareInterview = async () => {
    if (!interview || !user) return

    setIsSharing(true)
    try {
      const result = await shareInterviewAction(interview.id, user.id, !isShared)
      if (result.success) {
        setIsShared(result.isPublic)
        setShowSuccess(result.isPublic ? "Interview shared to community" : "Interview removed from community")
        setTimeout(() => setShowSuccess(null), 3000)
      } else {
        setError(result.error || "Failed to share interview")
      }
    } catch (error: any) {
      console.error("Error sharing interview:", error)
      setError(error.message || "Failed to share interview")
    } finally {
      setIsSharing(false)
    }
  }

  const handleSaveInterview = async () => {
    if (!interview || !user) return

    setIsSaving(true)
    try {
      const result = await toggleSaveInterview(user.id, Number.parseInt(interview.id))
      if (result.success) {
        setIsSaved(result.saved)
        setShowSuccess(result.saved ? "Interview saved" : "Interview unsaved")
        setTimeout(() => setShowSuccess(null), 3000)
      } else {
        setError(result.error || "Failed to save interview")
      }
    } catch (error: any) {
      console.error("Error saving interview:", error)
      setError(error.message || "Failed to save interview")
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-10 flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading interview...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-10">
        <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/dashboard")} className="bg-white text-black hover:bg-gray-200">
              Back to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (!interview || !interview.questions) {
    return (
      <div className="container py-10">
        <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent">
          <CardHeader>
            <CardTitle>Interview Not Found</CardTitle>
            <CardDescription>
              The interview you're looking for doesn't exist or you don't have access to it.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/dashboard")} className="bg-white text-black hover:bg-gray-200">
              Back to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const currentQuestion = interview.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + (feedback ? 1 : 0)) / interview.questions.length) * 100

  return (
    <div className="container py-10">
      <Button variant="ghost" className="mb-6" onClick={() => router.push("/dashboard")}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      {showSuccess && (
        <Alert className="mb-6 bg-green-500/10 border-green-500/20 text-green-500">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{showSuccess}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                {interview.title || `${interview.role} Interview`}
                {isShared ? (
                  <Badge variant="outline" className="ml-2 bg-green-500/20 text-green-500 border-green-500/20">
                    <Globe className="h-3 w-3 mr-1" />
                    Public
                  </Badge>
                ) : (
                  <Badge variant="outline" className="ml-2 bg-secondary/50">
                    <Lock className="h-3 w-3 mr-1" />
                    Private
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {interview.type} • {interview.level} • Question {currentQuestionIndex + 1} of{" "}
                {interview.questions.length}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 hover:bg-white/10 gap-1"
                onClick={handleSaveInterview}
                disabled={isSaving}
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck className="h-4 w-4 text-green-500" />
                    Saved
                  </>
                ) : (
                  <>
                    <Bookmark className="h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 hover:bg-white/10 gap-1"
                onClick={handleShareInterview}
                disabled={isSharing}
              >
                <Share2 className="h-4 w-4" />
                {isShared ? "Unshare" : "Share"}
              </Button>
              {isCompleted && (
                <Button onClick={handleViewResults} className="bg-white text-black hover:bg-gray-200">
                  View Results
                </Button>
              )}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>

        {/* Job Description Section (if available) */}
        {interview.job_description && (
          <div className="px-6 mb-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/10 gap-1">
                  <Briefcase className="h-4 w-4" />
                  View Job Description
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black/90 border-white/10 max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Job Description</DialogTitle>
                  <DialogDescription>This interview is based on the following job description</DialogDescription>
                </DialogHeader>
                <div className="mt-4 space-y-4">
                  {interview.title && (
                    <div>
                      <h3 className="text-sm font-medium">Job Title</h3>
                      <p className="text-sm text-muted-foreground">{interview.title}</p>
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium">Description</h3>
                    <div className="mt-2 p-4 bg-white/5 rounded-md text-sm whitespace-pre-wrap">
                      {interview.job_description}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <h3 className="text-sm font-medium w-full">Key Skills</h3>
                    {interview.technologies?.map((tech: string) => (
                      <Badge key={tech} variant="secondary" className="bg-secondary/50">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
                <DialogFooter className="mt-4">
                  <DialogClose asChild>
                    <Button className="bg-white text-black hover:bg-gray-200">Close</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}

        <CardContent className="space-y-6">
          <div className="flex items-start gap-4">
            <Avatar className="mt-1">
              <AvatarImage src="/interviewer-avatar.png" />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <p className="font-medium">Interviewer</p>
              <div className="bg-secondary p-4 rounded-lg">
                <p>{currentQuestion.question}</p>
              </div>
            </div>
          </div>

          {!isAnswering && !feedback ? (
            <div className="flex justify-center">
              <Button size="lg" onClick={handleStartAnswering} className="gap-2 bg-white text-black hover:bg-gray-200">
                <Play className="h-4 w-4" />
                Start Answering
              </Button>
            </div>
          ) : !feedback ? (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Avatar className="mt-1">
                  <AvatarImage src="/user-avatar.png" />
                  <AvatarFallback>You</AvatarFallback>
                </Avatar>
                <div className="space-y-2 flex-1">
                  <p className="font-medium">You</p>
                  <Textarea
                    placeholder="Type your answer here..."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="min-h-[150px] bg-secondary/50 border-white/10"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant={isRecording ? "destructive" : "outline"}
                      onClick={isRecording ? stopRecording : startRecording}
                      className="gap-2 border-white/20 hover:bg-white/10"
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="h-4 w-4" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4" />
                          Record Answer
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={!userAnswer.trim() || isSubmitting}
                      className="gap-2 ml-auto bg-white text-black hover:bg-gray-200"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Answer"}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Avatar className="mt-1">
                  <AvatarImage src="/user-avatar.png" />
                  <AvatarFallback>You</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <p className="font-medium">Your Answer</p>
                  <div className="bg-secondary p-4 rounded-lg">
                    <p>{userAnswer}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Avatar className="mt-1">
                  <AvatarImage src="/feedback-avatar.png" />
                  <AvatarFallback>FB</AvatarFallback>
                </Avatar>
                <div className="space-y-2 flex-1">
                  <p className="font-medium">Feedback</p>
                  <Card className="bg-secondary/50 border-white/10">
                    <CardContent className="p-4 space-y-4">
                      <div>
                        <p className="font-medium">Score: {feedback.score}/100</p>
                        <Progress value={feedback.score} className="h-2 mt-1" />
                      </div>

                      <div className="space-y-2">
                        <p className="font-medium">Strengths:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          {feedback.strengths.map((strength: string, index: number) => (
                            <li key={index}>{strength}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <p className="font-medium">Areas for Improvement:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          {feedback.improvements.map((improvement: string, index: number) => (
                            <li key={index}>{improvement}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium">Detailed Feedback:</p>
                        <p className="mt-1">{feedback.detailedFeedback}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Featured Responses Section */}
              {feedback && feedback.score < 80 && (
                <div className="mt-6">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full border-white/20 hover:bg-white/10">
                        View Sample Strong Response
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-black/90 border-white/10">
                      <DialogHeader>
                        <DialogTitle>Sample Strong Response</DialogTitle>
                        <DialogDescription>
                          Here's an example of a high-quality answer to this question
                        </DialogDescription>
                      </DialogHeader>
                      <div className="mt-4 p-4 bg-white/5 rounded-md text-sm">
                        {currentQuestion.type === "technical" ? (
                          <div className="space-y-4">
                            <p>
                              To address this technical challenge, I would first break it down into manageable
                              components. For example, when implementing{" "}
                              {interview.technologies[0] || "a technical solution"}, I start by identifying the core
                              requirements and potential edge cases.
                            </p>
                            <p>
                              In a recent project, I faced a similar challenge where I needed to{" "}
                              {interview.role.includes("Frontend")
                                ? "optimize rendering performance in a complex dashboard"
                                : interview.role.includes("Backend")
                                  ? "design a scalable API architecture"
                                  : "implement a complex feature with multiple stakeholders"}
                              . I approached this by first creating a detailed technical design document outlining the
                              architecture, data flow, and potential bottlenecks.
                            </p>
                            <p>
                              I then implemented the solution using{" "}
                              {interview.technologies.join(", ") || "appropriate technologies"}, making sure to follow
                              best practices like{" "}
                              {interview.technologies.includes("React")
                                ? "component composition, memoization, and proper state management"
                                : "clean code principles, SOLID design, and comprehensive testing"}
                              . The result was a{" "}
                              {interview.level === "senior"
                                ? "highly scalable and maintainable"
                                : "functional and efficient"}{" "}
                              solution that{" "}
                              {interview.level === "senior"
                                ? "reduced load times by 40% and improved user engagement metrics"
                                : "met all the requirements and received positive feedback from users"}
                              .
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <p>
                              In my previous role at XYZ Company, I led a cross-functional team tasked with delivering a
                              critical project under a tight deadline. The project involved{" "}
                              {interview.role.includes("Frontend")
                                ? "redesigning our customer dashboard"
                                : interview.role.includes("Backend")
                                  ? "migrating our legacy system to a new architecture"
                                  : "implementing a new feature that would impact multiple teams"}
                              .
                            </p>
                            <p>
                              The main challenge we faced was{" "}
                              {interview.level === "senior"
                                ? "balancing technical debt reduction with new feature development while meeting business deadlines"
                                : "coordinating between different teams and ensuring everyone was aligned on priorities"}
                              . To address this, I implemented a structured approach:
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                              <li>
                                First, I organized a stakeholder meeting to clearly define success criteria and
                                establish priorities
                              </li>
                              <li>Then, I broke down the project into two-week sprints with clear deliverables</li>
                              <li>I implemented daily stand-ups to quickly identify and resolve blockers</li>
                              <li>
                                Finally, I maintained transparent communication with leadership about progress and
                                challenges
                              </li>
                            </ul>
                            <p>
                              The result was that we delivered the project on time, with high quality, and the team
                              remained cohesive throughout the process. This experience taught me the importance of{" "}
                              {interview.level === "senior"
                                ? "strategic planning, effective delegation, and maintaining a balance between technical excellence and business needs"
                                : "clear communication, proper planning, and team collaboration"}
                              .
                            </p>
                          </div>
                        )}
                      </div>
                      <DialogFooter className="mt-4">
                        <DialogClose asChild>
                          <Button className="bg-white text-black hover:bg-gray-200">Close</Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="border-white/20 hover:bg-white/10"
          >
            Save & Exit
          </Button>

          {feedback && currentQuestionIndex < interview.questions.length - 1 && (
            <Button onClick={handleNextQuestion} className="gap-2 bg-white text-black hover:bg-gray-200">
              Next Question
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}

          {feedback && currentQuestionIndex === interview.questions.length - 1 && !isCompleted && (
            <Button onClick={handleViewResults} className="gap-2 bg-white text-black hover:bg-gray-200">
              View Results
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

