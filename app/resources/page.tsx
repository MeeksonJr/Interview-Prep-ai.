"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { getUserInterviews } from "@/app/actions/db-actions"
import { useAuth } from "@/providers/auth-provider"
import { BookOpen, Video, FileText, Briefcase, CheckCircle, Star, BarChart, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function ResourcesPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [interviews, setInterviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("recommended")

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
      return
    }

    if (user) {
      fetchData()
    }
  }, [user, authLoading, router])

  const fetchData = async () => {
    if (!user) return

    try {
      setLoading(true)
      const interviewsData = await getUserInterviews(user.id)
      setInterviews(interviewsData || [])
    } catch (error: any) {
      console.error("Error fetching data:", error)
      setError(error.message || "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  // Get user's technologies from their interviews
  const getUserTechnologies = () => {
    const techMap: Record<string, number> = {}

    interviews.forEach((interview) => {
      if (interview.technologies && Array.isArray(interview.technologies)) {
        interview.technologies.forEach((tech: string) => {
          techMap[tech] = (techMap[tech] || 0) + 1
        })
      }
    })

    // Sort by frequency
    return Object.entries(techMap)
      .sort(([, countA], [, countB]) => (countB as number) - (countA as number))
      .map(([tech]) => tech)
  }

  // Get user's roles from their interviews
  const getUserRoles = () => {
    const roleMap: Record<string, number> = {}

    interviews.forEach((interview) => {
      if (interview.role) {
        roleMap[interview.role] = (roleMap[interview.role] || 0) + 1
      }
    })

    // Sort by frequency
    return Object.entries(roleMap)
      .sort(([, countA], [, countB]) => (countB as number) - (countA as number))
      .map(([role]) => role)
  }

  const userTechnologies = getUserTechnologies()
  const userRoles = getUserRoles()

  // Calculate average score
  const calculateAverageScore = () => {
    const completedInterviews = interviews.filter((i) => i.completed && i.score !== undefined)
    if (completedInterviews.length === 0) return 0

    const totalScore = completedInterviews.reduce((sum, interview) => sum + interview.score, 0)
    return Math.round(totalScore / completedInterviews.length)
  }

  const averageScore = calculateAverageScore()

  // Determine areas for improvement
  const getAreasForImprovement = () => {
    // This is a simplified version - in a real app, you would analyze feedback from interviews
    if (averageScore < 50) {
      return ["Communication skills", "Technical depth", "Problem-solving approach"]
    } else if (averageScore < 70) {
      return ["Structured responses", "Specific examples", "Technical terminology"]
    } else {
      return ["Advanced concepts", "Leadership examples", "System design"]
    }
  }

  if (loading || authLoading) {
    return (
      <div className="container py-10 flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading resources...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Learning Resources</h1>
          <p className="text-muted-foreground mt-1">Personalized resources to help you improve your interview skills</p>
        </div>
      </div>

      {error && <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">{error}</div>}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-secondary/50 p-1 rounded-lg">
          <TabsTrigger value="recommended" className="data-[state=active]:bg-white/10 rounded-md">
            Recommended
          </TabsTrigger>
          <TabsTrigger value="technical" className="data-[state=active]:bg-white/10 rounded-md">
            Technical
          </TabsTrigger>
          <TabsTrigger value="behavioral" className="data-[state=active]:bg-white/10 rounded-md">
            Behavioral
          </TabsTrigger>
          <TabsTrigger value="career" className="data-[state=active]:bg-white/10 rounded-md">
            Career
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommended">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Performance Summary Card */}
            <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent col-span-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-blue-400" />
                  Your Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Average Score</p>
                    <p className="text-2xl font-bold">{averageScore}/100</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Interviews Completed</p>
                    <p className="text-2xl font-bold">{interviews.filter((i) => i.completed).length}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Focus Areas</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {getAreasForImprovement().map((area, index) => (
                        <Badge key={index} variant="secondary" className="bg-secondary/50">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommended Resources based on user data */}
            {userTechnologies.length > 0 && (
              <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-400" />
                    {userTechnologies[0]} Mastery
                  </CardTitle>
                  <CardDescription>Resources to improve your {userTechnologies[0]} skills</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Video className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Advanced {userTechnologies[0]} Patterns</p>
                      <p className="text-sm text-muted-foreground">Learn the advanced patterns and best practices</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Interview Questions Guide</p>
                      <p className="text-sm text-muted-foreground">Top 50 {userTechnologies[0]} interview questions</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="link" className="text-blue-400 hover:text-blue-300 p-0">
                    View All Resources
                  </Button>
                </CardFooter>
              </Card>
            )}

            {userRoles.length > 0 && (
              <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-blue-500"></div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-green-400" />
                    {userRoles[0]} Career Path
                  </CardTitle>
                  <CardDescription>Resources for {userRoles[0]} career development</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Star className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Career Progression Guide</p>
                      <p className="text-sm text-muted-foreground">From Junior to Senior {userRoles[0]}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Skills Assessment</p>
                      <p className="text-sm text-muted-foreground">Evaluate your {userRoles[0]} skills</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="link" className="text-blue-400 hover:text-blue-300 p-0">
                    View Career Path
                  </Button>
                </CardFooter>
              </Card>
            )}

            <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-purple-400" />
                  Interview Techniques
                </CardTitle>
                <CardDescription>Master the STAR method and other interview techniques</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Video className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">STAR Method Masterclass</p>
                    <p className="text-sm text-muted-foreground">Structure your answers effectively</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Body Language Guide</p>
                    <p className="text-sm text-muted-foreground">Non-verbal communication tips</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="link" className="text-blue-400 hover:text-blue-300 p-0">
                  Learn More
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="technical">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userTechnologies.slice(0, 6).map((tech, index) => (
              <Card
                key={index}
                className="gradient-border bg-black/50 backdrop-blur-sm border-transparent overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <CardHeader>
                  <CardTitle>{tech} Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Video className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{tech} Deep Dive</p>
                      <p className="text-sm text-muted-foreground">Advanced concepts and patterns</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Interview Questions</p>
                      <p className="text-sm text-muted-foreground">Top {tech} questions and answers</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full gap-2 bg-white/10 hover:bg-white/20">
                    <Link href="#">
                      Explore {tech} Resources
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="behavioral">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-blue-500"></div>
              <CardHeader>
                <CardTitle>STAR Method</CardTitle>
                <CardDescription>Situation, Task, Action, Result</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Learn how to structure your behavioral interview answers using the STAR method to provide clear,
                  concise, and compelling responses.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full gap-2 bg-white/10 hover:bg-white/20">
                  <Link href="#">
                    Learn the STAR Method
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <CardHeader>
                <CardTitle>Leadership Stories</CardTitle>
                <CardDescription>Demonstrating leadership skills</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Develop compelling stories that showcase your leadership abilities, problem-solving skills, and impact
                  in previous roles.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full gap-2 bg-white/10 hover:bg-white/20">
                  <Link href="#">
                    Craft Leadership Stories
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
              <CardHeader>
                <CardTitle>Conflict Resolution</CardTitle>
                <CardDescription>Handling difficult situations</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Learn effective strategies for addressing conflicts in the workplace and how to present these
                  experiences positively in interviews.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full gap-2 bg-white/10 hover:bg-white/20">
                  <Link href="#">
                    Master Conflict Resolution
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="career">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <CardHeader>
                <CardTitle>Resume Building</CardTitle>
                <CardDescription>Craft an impressive resume</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Learn how to create a resume that stands out to recruiters and effectively showcases your skills and
                  experience.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full gap-2 bg-white/10 hover:bg-white/20">
                  <Link href="#">
                    Resume Templates & Tips
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-blue-500"></div>
              <CardHeader>
                <CardTitle>Salary Negotiation</CardTitle>
                <CardDescription>Get what you're worth</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Strategies and scripts for negotiating your salary and benefits package with confidence.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full gap-2 bg-white/10 hover:bg-white/20">
                  <Link href="#">
                    Negotiation Techniques
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <CardHeader>
                <CardTitle>Career Progression</CardTitle>
                <CardDescription>Plan your growth path</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Understand the skills and experience needed to advance in your career and how to position yourself for
                  promotion.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full gap-2 bg-white/10 hover:bg-white/20">
                  <Link href="#">
                    Career Path Planning
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

