"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { getUserInterviews } from "@/app/actions/db-actions"
import { useAuth } from "@/providers/auth-provider"
import { BarChart, Calendar, CheckCircle, Clock, Download, PieChart, TrendingUp, User } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AnalyticsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [interviews, setInterviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalInterviews: 0,
    completedInterviews: 0,
    averageScore: 0,
    bestScore: 0,
    worstScore: 0,
    totalTime: 0,
    averageTime: 0,
    byType: { technical: 0, behavioral: 0, mixed: 0 },
    byLevel: { junior: 0, mid: 0, senior: 0 },
    byRole: {},
    byTechnology: {},
    scoreHistory: [],
    recentActivity: [],
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
      return
    }

    if (user) {
      const fetchData = async () => {
        try {
          const interviewsData = await getUserInterviews(user.id)
          setInterviews(interviewsData || [])

          // Calculate statistics
          if (interviewsData && interviewsData.length > 0) {
            calculateStats(interviewsData)
          }
        } catch (error: any) {
          console.error("Error fetching data:", error)
          setError(error.message || "Failed to load data")
        } finally {
          setLoading(false)
        }
      }

      fetchData()
    }
  }, [user, authLoading, router])

  const calculateStats = (interviewsData: any[]) => {
    const completed = interviewsData.filter((i) => i.completed)
    const scores = completed.map((i) => i.score).filter(Boolean)

    // Calculate time spent (in minutes)
    const timeSpent = completed.map((i) => {
      if (i.startedAt && i.completedAt) {
        return (new Date(i.completedAt).getTime() - new Date(i.startedAt).getTime()) / (1000 * 60)
      }
      return 0
    })

    // Count by type
    const byType = {
      technical: interviewsData.filter((i) => i.type === "technical").length,
      behavioral: interviewsData.filter((i) => i.type === "behavioral").length,
      mixed: interviewsData.filter((i) => i.type === "mixed").length,
    }

    // Count by level
    const byLevel = {
      junior: interviewsData.filter((i) => i.level === "junior").length,
      mid: interviewsData.filter((i) => i.level === "mid").length,
      senior: interviewsData.filter((i) => i.level === "senior").length,
    }

    // Count by role
    const byRole = {}
    interviewsData.forEach((i) => {
      if (i.role) {
        byRole[i.role] = (byRole[i.role] || 0) + 1
      }
    })

    // Count by technology
    const byTechnology = {}
    interviewsData.forEach((i) => {
      if (i.technologies && Array.isArray(i.technologies)) {
        i.technologies.forEach((tech) => {
          byTechnology[tech] = (byTechnology[tech] || 0) + 1
        })
      }
    })

    // Score history (last 10 completed interviews)
    const scoreHistory = completed
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, 10)
      .map((i) => ({
        id: i.id,
        score: i.score,
        date: new Date(i.completedAt).toLocaleDateString(),
        role: i.role,
        type: i.type,
      }))
      .reverse() // For chronological order

    // Recent activity
    const recentActivity = interviewsData
      .sort((a, b) => {
        const dateA = a.completedAt || a.startedAt || a.createdAt
        const dateB = b.completedAt || b.startedAt || b.createdAt
        return new Date(dateB).getTime() - new Date(dateA).getTime()
      })
      .slice(0, 5)
      .map((i) => ({
        id: i.id,
        action: i.completed ? "Completed" : i.started ? "Started" : "Created",
        date: new Date(i.completedAt || i.startedAt || i.createdAt).toLocaleDateString(),
        time: new Date(i.completedAt || i.startedAt || i.createdAt).toLocaleTimeString(),
        role: i.role,
        type: i.type,
        score: i.score,
      }))

    setStats({
      totalInterviews: interviewsData.length,
      completedInterviews: completed.length,
      averageScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      bestScore: scores.length ? Math.max(...scores) : 0,
      worstScore: scores.length ? Math.min(...scores) : 0,
      totalTime: Math.round(timeSpent.reduce((a, b) => a + b, 0)),
      averageTime: timeSpent.length ? Math.round(timeSpent.reduce((a, b) => a + b, 0) / timeSpent.length) : 0,
      byType,
      byLevel,
      byRole,
      byTechnology,
      scoreHistory,
      recentActivity,
    })
  }

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <div className="container py-10 flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <div className="container py-10 flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your interview performance and progress</p>
        </div>
        <Button variant="outline" className="gap-2 border-white/20 hover:bg-white/10">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {interviews.length === 0 ? (
        <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent p-8 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="rounded-full bg-white/10 p-6">
              <BarChart className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold">No data to analyze yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Complete some interviews to see your performance analytics and track your progress
            </p>
            <Button asChild size="lg" className="mt-2 bg-white text-black hover:bg-gray-200">
              <a href="/create-interview">Create Interview</a>
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="mr-4 rounded-full bg-white/10 p-2">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.totalInterviews}</div>
                    <p className="text-xs text-muted-foreground">{stats.completedInterviews} completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="mr-4 rounded-full bg-white/10 p-2">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.averageScore}/100</div>
                    <p className="text-xs text-muted-foreground">
                      Best: {stats.bestScore}, Worst: {stats.worstScore}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="mr-4 rounded-full bg-white/10 p-2">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.totalTime} min</div>
                    <p className="text-xs text-muted-foreground">Avg: {stats.averageTime} min per interview</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="mr-4 rounded-full bg-white/10 p-2">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {stats.totalInterviews
                        ? Math.round((stats.completedInterviews / stats.totalInterviews) * 100)
                        : 0}
                      %
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stats.completedInterviews} of {stats.totalInterviews} interviews
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent">
                <CardHeader>
                  <CardTitle>Performance Over Time</CardTitle>
                  <CardDescription>Your interview scores from recent sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.scoreHistory.length > 0 ? (
                    <div className="h-[300px] w-full">
                      <div className="flex h-full items-end gap-2">
                        {stats.scoreHistory.map((item, index) => (
                          <div key={index} className="relative flex h-full w-full flex-col justify-end">
                            <div
                              className="bg-white/20 hover:bg-white/30 transition-colors rounded-t w-full"
                              style={{ height: `${item.score}%` }}
                              title={`${item.role} - ${item.score}/100`}
                            ></div>
                            <span className="mt-2 text-xs text-muted-foreground truncate">{item.date}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                      <BarChart className="h-12 w-12 mb-2 opacity-50" />
                      <p>Complete more interviews to see your performance over time</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent">
                <CardHeader>
                  <CardTitle>Interview Breakdown</CardTitle>
                  <CardDescription>Analysis by type, level, and technologies</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="type">
                    <TabsList className="grid w-full grid-cols-3 mb-4 bg-secondary">
                      <TabsTrigger value="type" className="data-[state=active]:bg-white/10">
                        Type
                      </TabsTrigger>
                      <TabsTrigger value="level" className="data-[state=active]:bg-white/10">
                        Level
                      </TabsTrigger>
                      <TabsTrigger value="tech" className="data-[state=active]:bg-white/10">
                        Technologies
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="type" className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Technical</span>
                            <span className="text-sm font-medium">{stats.byType.technical}</span>
                          </div>
                          <Progress value={(stats.byType.technical / stats.totalInterviews) * 100} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Behavioral</span>
                            <span className="text-sm font-medium">{stats.byType.behavioral}</span>
                          </div>
                          <Progress value={(stats.byType.behavioral / stats.totalInterviews) * 100} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Mixed</span>
                            <span className="text-sm font-medium">{stats.byType.mixed}</span>
                          </div>
                          <Progress value={(stats.byType.mixed / stats.totalInterviews) * 100} className="h-2" />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="level" className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Junior</span>
                            <span className="text-sm font-medium">{stats.byLevel.junior}</span>
                          </div>
                          <Progress value={(stats.byLevel.junior / stats.totalInterviews) * 100} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Mid-level</span>
                            <span className="text-sm font-medium">{stats.byLevel.mid}</span>
                          </div>
                          <Progress value={(stats.byLevel.mid / stats.totalInterviews) * 100} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Senior</span>
                            <span className="text-sm font-medium">{stats.byLevel.senior}</span>
                          </div>
                          <Progress value={(stats.byLevel.senior / stats.totalInterviews) * 100} className="h-2" />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="tech" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(stats.byTechnology)
                          .sort(([, countA], [, countB]) => Number(countB) - Number(countA))
                          .slice(0, 6)
                          .map(([tech, count]) => (
                            <div key={tech} className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm truncate">{tech}</span>
                                <span className="text-sm font-medium">{count}</span>
                              </div>
                              <Progress value={(Number(count) / stats.totalInterviews) * 100} className="h-2" />
                            </div>
                          ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest interview sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="rounded-full bg-white/10 p-2">
                          {activity.action === "Completed" ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : activity.action === "Started" ? (
                            <Clock className="h-4 w-4 text-yellow-500" />
                          ) : (
                            <Calendar className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {activity.action} {activity.role} interview
                          </p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <span>{activity.date}</span>
                            <span className="mx-1">•</span>
                            <span>{activity.type}</span>
                            {activity.score && (
                              <>
                                <span className="mx-1">•</span>
                                <span>Score: {activity.score}/100</span>
                              </>
                            )}
                          </div>
                          <div className="pt-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs border-white/20 hover:bg-white/10"
                              onClick={() => router.push(`/interview/${activity.id}`)}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {stats.recentActivity.length === 0 && (
                      <div className="text-center py-6 text-muted-foreground">
                        <p>No recent activity</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent">
                <CardHeader>
                  <CardTitle>Skill Distribution</CardTitle>
                  <CardDescription>Roles you've practiced for</CardDescription>
                </CardHeader>
                <CardContent>
                  {Object.keys(stats.byRole).length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(stats.byRole)
                        .sort(([, countA], [, countB]) => Number(countB) - Number(countA))
                        .map(([role, count]) => (
                          <div key={role} className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">{role}</span>
                              <span className="text-sm font-medium">{count}</span>
                            </div>
                            <Progress value={(Number(count) / stats.totalInterviews) * 100} className="h-2" />
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                      <PieChart className="h-12 w-12 mb-2 opacity-50" />
                      <p>No role data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

