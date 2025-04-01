"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, ArrowRight, Bot, Sparkles } from "lucide-react"
import { generateInterviewQuestions } from "@/lib/interview-generator"
import { createInterview } from "@/app/actions/db-actions"
import { useAuth } from "@/providers/auth-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function CreateInterviewPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Interview settings
  const [role, setRole] = useState("")
  const [type, setType] = useState("technical")
  const [level, setLevel] = useState("mid")
  const [questionCount, setQuestionCount] = useState(3)
  const [technologies, setTechnologies] = useState<string[]>([])
  const [customTechnology, setCustomTechnology] = useState("")

  // AI conversation
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    {
      role: "assistant",
      content:
        "Hello! Let's prepare an interview for you. I'll ask a few questions to generate the perfect interview. Are you ready?",
    },
  ])

  const handleAddMessage = (content: string, isUser = true) => {
    const newMessages = [...messages, { role: isUser ? "user" : "assistant", content }]
    setMessages(newMessages)

    if (isUser) {
      // Simulate AI response based on the conversation flow
      setTimeout(() => {
        let aiResponse = ""

        if (step === 1 && !role) {
          aiResponse = "What role are you training for?"
          setStep(2)
        } else if (step === 2) {
          setRole(content)
          aiResponse = "What type of interview? Behavioral, technical, or both?"
          setStep(3)
        } else if (step === 3) {
          if (content.toLowerCase().includes("technical")) {
            setType("technical")
          } else if (content.toLowerCase().includes("behavioral")) {
            setType("behavioral")
          } else {
            setType("mixed")
          }
          aiResponse = "What job level are you aiming for? (Junior, Mid-level, Senior)"
          setStep(4)
        } else if (step === 4) {
          if (content.toLowerCase().includes("junior")) {
            setLevel("junior")
          } else if (content.toLowerCase().includes("senior")) {
            setLevel("senior")
          } else {
            setLevel("mid")
          }
          aiResponse = "How many questions would you like in this interview?"
          setStep(5)
        } else if (step === 5) {
          // Extract number from response
          const match = content.match(/\d+/)
          if (match) {
            setQuestionCount(Number.parseInt(match[0]))
          }
          aiResponse = "What technologies should we cover? (e.g., JavaScript, React, Node.js)"
          setStep(6)
        } else if (step === 6) {
          const techs = content
            .split(/,|\s+and\s+/)
            .map((t) => t.trim())
            .filter(Boolean)
          setTechnologies(techs)
          aiResponse = "Got it! I've prepared your interview. Click 'Start Interview' when you're ready."
          setStep(7)
        }

        handleAddMessage(aiResponse, false)
      }, 1000)
    }
  }

  const handleManualSubmit = async () => {
    if (!user) {
      setError("You must be logged in to create an interview")
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log("Generating questions with params:", { role, type, level, questionCount, technologies })

      // Generate questions based on settings
      const questions = await generateInterviewQuestions({
        role,
        type,
        level,
        questionCount,
        technologies,
      })

      console.log("Questions generated:", questions)

      // Create interview in PostgreSQL
      console.log("Creating interview in database")
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
      }

      console.log("Interview data:", interviewData)

      const interview = await createInterview(interviewData)
      console.log("Interview created with ID:", interview.id)

      router.push(`/interview/${interview.id}`)
    } catch (error: any) {
      console.error("Error creating interview:", error)
      setError(`Error creating interview: ${error.message || "Unknown error"}`)
      setLoading(false)
    }
  }

  const handleAISubmit = async () => {
    if (!user || !role || step < 7) {
      setError("Please complete all steps before starting the interview")
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log("Generating questions with params:", { role, type, level, questionCount, technologies })

      // Generate questions based on conversation
      const questions = await generateInterviewQuestions({
        role,
        type,
        level,
        questionCount,
        technologies,
      })

      console.log("Questions generated:", questions)

      // Create interview in PostgreSQL
      console.log("Creating interview in database")
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
      }

      console.log("Interview data:", interviewData)

      const interview = await createInterview(interviewData)
      console.log("Interview created with ID:", interview.id)

      router.push(`/interview/${interview.id}`)
    } catch (error: any) {
      console.error("Error creating interview:", error)
      setError(`Error creating interview: ${error.message || "Unknown error"}`)
      setLoading(false)
    }
  }

  const handleUserInput = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const input = form.elements.namedItem("userInput") as HTMLInputElement
    const content = input.value.trim()

    if (content) {
      handleAddMessage(content)
      input.value = ""
    }
  }

  return (
    <div className="container py-10">
      <Button variant="ghost" className="mb-6" onClick={() => router.push("/dashboard")}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      {error && (
        <Alert className="mb-6 bg-red-500/10 border-red-500/20 text-red-400">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/2 lg:w-2/3">
          <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent">
            <CardHeader>
              <CardTitle>Create New Interview</CardTitle>
              <CardDescription>Set up your practice interview session</CardDescription>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="ai" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-secondary">
                  <TabsTrigger value="ai" className="data-[state=active]:bg-white/10">
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI Assistant
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="data-[state=active]:bg-white/10">
                    <Bot className="h-4 w-4 mr-2" />
                    Manual Setup
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="ai" className="space-y-4">
                  <div className="border border-white/10 rounded-lg p-4 h-96 overflow-y-auto space-y-4">
                    {messages.map((message, index) => (
                      <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className="flex items-start gap-3 max-w-[80%]">
                          {message.role === "assistant" && (
                            <Avatar>
                              <AvatarImage src="/ai-assistant.png" />
                              <AvatarFallback>AI</AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={`rounded-lg p-3 ${
                              message.role === "user" ? "bg-white/10 text-white" : "bg-secondary"
                            }`}
                          >
                            {message.content}
                          </div>
                          {message.role === "user" && (
                            <Avatar>
                              <AvatarImage src="/user-avatar.png" />
                              <AvatarFallback>You</AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {step < 7 ? (
                    <form onSubmit={handleUserInput} className="flex gap-2">
                      <Input
                        name="userInput"
                        placeholder="Type your response..."
                        className="flex-1 bg-secondary/50 border-white/10"
                        disabled={loading}
                      />
                      <Button type="submit" disabled={loading} className="bg-white text-black hover:bg-gray-200">
                        Send
                      </Button>
                    </form>
                  ) : (
                    <Button
                      onClick={handleAISubmit}
                      className="w-full bg-white text-black hover:bg-gray-200"
                      disabled={loading}
                    >
                      {loading ? "Creating Interview..." : "Start Interview"}
                    </Button>
                  )}
                </TabsContent>

                <TabsContent value="manual" className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="role">Job Role</Label>
                      <Input
                        id="role"
                        placeholder="e.g., Frontend Developer, Data Scientist"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="bg-secondary/50 border-white/10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Interview Type</Label>
                      <RadioGroup value={type} onValueChange={setType} className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="technical" id="technical" />
                          <Label htmlFor="technical">Technical</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="behavioral" id="behavioral" />
                          <Label htmlFor="behavioral">Behavioral</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="mixed" id="mixed" />
                          <Label htmlFor="mixed">Mixed (Both)</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label>Experience Level</Label>
                      <RadioGroup value={level} onValueChange={setLevel} className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="junior" id="junior" />
                          <Label htmlFor="junior">Junior</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="mid" id="mid" />
                          <Label htmlFor="mid">Mid-level</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="senior" id="senior" />
                          <Label htmlFor="senior">Senior</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label>Number of Questions: {questionCount}</Label>
                      <Slider
                        value={[questionCount]}
                        min={1}
                        max={10}
                        step={1}
                        onValueChange={(value) => setQuestionCount(value[0])}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Technologies</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {["JavaScript", "React", "Node.js", "Python", "SQL", "AWS"].map((tech) => (
                          <div key={tech} className="flex items-center space-x-2">
                            <Checkbox
                              id={tech}
                              checked={technologies.includes(tech)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setTechnologies([...technologies, tech])
                                } else {
                                  setTechnologies(technologies.filter((t) => t !== tech))
                                }
                              }}
                            />
                            <Label htmlFor={tech}>{tech}</Label>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Input
                          placeholder="Add custom technology"
                          value={customTechnology}
                          onChange={(e) => setCustomTechnology(e.target.value)}
                          className="bg-secondary/50 border-white/10"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="border-white/20 hover:bg-white/10"
                          onClick={() => {
                            if (customTechnology && !technologies.includes(customTechnology)) {
                              setTechnologies([...technologies, customTechnology])
                              setCustomTechnology("")
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {technologies.map((tech) => (
                          <div
                            key={tech}
                            className="bg-white/10 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1"
                          >
                            {tech}
                            <button
                              type="button"
                              className="text-white/70 hover:text-white"
                              onClick={() => setTechnologies(technologies.filter((t) => t !== tech))}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>

            <CardFooter className="flex justify-end">
              {/* Only show this button for manual tab */}
              <Button
                onClick={handleManualSubmit}
                disabled={!role || technologies.length === 0 || loading}
                className="gap-2 bg-white text-black hover:bg-gray-200"
              >
                {loading ? "Creating Interview..." : "Create Interview"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="w-full md:w-1/2 lg:w-1/3">
          <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent sticky top-6">
            <CardHeader>
              <CardTitle>Interview Preview</CardTitle>
              <CardDescription>Your customized interview session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Role</p>
                <p className="text-sm text-muted-foreground">{role || "Not specified"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Interview Type</p>
                <p className="text-sm text-muted-foreground capitalize">{type}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Experience Level</p>
                <p className="text-sm text-muted-foreground capitalize">{level}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Number of Questions</p>
                <p className="text-sm text-muted-foreground">{questionCount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Technologies</p>
                <div className="flex flex-wrap gap-1">
                  {technologies.length > 0 ? (
                    technologies.map((tech) => (
                      <span key={tech} className="bg-white/10 px-2 py-1 rounded text-xs">
                        {tech}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">None selected</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

