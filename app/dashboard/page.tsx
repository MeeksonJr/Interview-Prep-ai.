"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  PlusCircle,
  Clock,
  CheckCircle,
  ArrowRight,
  CreditCard,
  AlertCircle,
  Briefcase,
  TrendingUp,
  Heart,
  Bookmark,
  BookmarkX,
  Eye,
  Filter,
  Search,
  Star,
  BarChart,
  Sparkles,
} from "lucide-react"
import { getUserInterviews } from "@/app/actions/db-actions"
import {
  fetchCommunityInterviews,
  toggleLikeInterview,
  toggleSaveInterview,
  fetchSavedInterviews,
  viewInterview,
  checkUserLikedInterview,
  fetchFilterOptions,
} from "@/app/actions/community-actions"
import { checkUserActionAllowedAction } from "@/app/actions/subscription-actions"
import Link from "next/link"
import { useAuth } from "@/providers/auth-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
// Add the import for the GeminiApiChecker component
import { GeminiApiChecker } from "@/components/gemini-api-checker"
// Import the debug component at the top
import { DebugUserData } from "@/components/debug-user-data"

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [interviews, setInterviews] = useState<any[]>([])
  const [communityInterviews, setCommunityInterviews] = useState<any[]>([])
  const [savedInterviews, setSavedInterviews] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [communityLoading, setCommunityLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usageLimits, setUsageLimits] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("my-interviews")
  const [communityTab, setCommunityTab] = useState("recent")
  const [filterOptions, setFilterOptions] = useState<any>({ roles: [], types: [], levels: [], technologies: [] })
  const [filters, setFilters] = useState<any>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [likedInterviews, setLikedInterviews] = useState<Record<number, boolean>>({})

  // Check authentication and redirect if needed
  useEffect(() => {
    console.log("Dashboard page loaded, auth state:", { user, authLoading })

    // If not loading and no user, redirect to login
    if (!authLoading && !user) {
      console.log("No user found, redirecting to login")
      router.push("/login")
      return
    }

    // Fetch interviews when user is available
    if (user) {
      fetchData()
    }
  }, [user, authLoading, router])

  // Fetch data when community tab changes or filters change
  useEffect(() => {
    if (user && (activeTab === "community" || activeTab === "saved")) {
      fetchCommunityData()
    }
  }, [user, activeTab, communityTab, filters])

  // Update the fetchData function in the dashboard page to handle errors better
  const fetchData = async () => {
    if (!user) return

    try {
      setDataLoading(true)
      console.log("Fetching interviews for user:", user.id)

      // Add error handling for getUserInterviews
      try {
        const interviewsData = await getUserInterviews(user.id)
        console.log("Fetched interviews:", interviewsData)
        setInterviews(interviewsData || [])
      } catch (interviewError) {
        console.error("Error fetching interviews:", interviewError)
        // Continue with empty interviews array
        setInterviews([])
        // Show a non-blocking error message
        setError("Could not load your interviews. Please try again later.")
      }

      // Add error handling for checkUserActionAllowedAction
      try {
        const usageCheck = await checkUserActionAllowedAction(user.id, "interviews")
        setUsageLimits(usageCheck)
      } catch (usageError) {
        console.error("Error checking usage limits:", usageError)
        // Set default usage limits
        setUsageLimits({
          allowed: true,
          plan: user.subscriptionPlan || "free",
          usage: { current: 0, limit: 3 },
        })
      }

      // Fetch filter options with better error handling
      try {
        const filterOptionsResult = await fetchFilterOptions()
        if (filterOptionsResult.success) {
          setFilterOptions(filterOptionsResult.options)
        } else {
          // Set default empty filter options
          setFilterOptions({ roles: [], types: [], levels: [], technologies: [] })
        }
      } catch (filterError) {
        console.error("Error fetching filter options:", filterError)
        // Set default empty filter options
        setFilterOptions({ roles: [], types: [], levels: [], technologies: [] })
      }

      // Fetch community data if on community tab
      if (activeTab === "community" || activeTab === "saved") {
        await fetchCommunityData()
      }
    } catch (error: any) {
      console.error("Error fetching data:", error)
      setError(error.message || "Failed to load data")
    } finally {
      setDataLoading(false)
    }
  }

  // Update the fetchCommunityData function with better error handling
  const fetchCommunityData = async () => {
    if (!user) return

    try {
      setCommunityLoading(true)

      if (activeTab === "community") {
        // Fetch community interviews based on selected tab and filters
        const result = await fetchCommunityInterviews(communityTab as any, 20, 0, filters)

        if (result.success) {
          // Ensure interviews is always an array
          const interviews = Array.isArray(result.interviews) ? result.interviews : []
          setCommunityInterviews(interviews)

          // Check which interviews the user has liked
          const likedStatus: Record<number, boolean> = {}
          for (const interview of interviews) {
            try {
              const likeCheck = await checkUserLikedInterview(user.id, interview.id)
              likedStatus[interview.id] = likeCheck.success ? likeCheck.liked : false
            } catch (likeError) {
              console.error(`Error checking like status for interview ${interview.id}:`, likeError)
              likedStatus[interview.id] = false
            }
          }
          setLikedInterviews(likedStatus)
        } else {
          console.error("Failed to fetch community interviews:", result.error)
          setCommunityInterviews([])
        }
      } else if (activeTab === "saved") {
        // Fetch saved interviews
        const result = await fetchSavedInterviews(user.id)

        if (result.success) {
          // Ensure interviews is always an array
          const interviews = Array.isArray(result.interviews) ? result.interviews : []
          setSavedInterviews(interviews)

          // Check which interviews the user has liked
          const likedStatus: Record<number, boolean> = {}
          for (const interview of interviews) {
            try {
              const likeCheck = await checkUserLikedInterview(user.id, interview.id)
              likedStatus[interview.id] = likeCheck.success ? likeCheck.liked : false
            } catch (likeError) {
              console.error(`Error checking like status for interview ${interview.id}:`, likeError)
              likedStatus[interview.id] = false
            }
          }
          setLikedInterviews(likedStatus)
        } else {
          console.error("Failed to fetch saved interviews:", result.error)
          setSavedInterviews([])
        }
      }
    } catch (error: any) {
      console.error("Error fetching community data:", error)
      // Set empty arrays to prevent further errors
      setCommunityInterviews([])
      setSavedInterviews([])
    } finally {
      setCommunityLoading(false)
    }
  }

  const handleLikeInterview = async (interviewId: number) => {
    if (!user) return

    try {
      const result = await toggleLikeInterview(user.id, interviewId)

      if (result.success) {
        // Update the liked status locally
        setLikedInterviews((prev) => ({
          ...prev,
          [interviewId]: result.liked,
        }))

        // Update the interview in the list
        setCommunityInterviews((prev) =>
          prev.map((interview) =>
            interview.id === interviewId
              ? {
                  ...interview,
                  like_count: result.liked
                    ? (interview.like_count || 0) + 1
                    : Math.max((interview.like_count || 0) - 1, 0),
                }
              : interview,
          ),
        )

        // Also update in saved interviews if present
        setSavedInterviews((prev) =>
          prev.map((interview) =>
            interview.id === interviewId
              ? {
                  ...interview,
                  like_count: result.liked
                    ? (interview.like_count || 0) + 1
                    : Math.max((interview.like_count || 0) - 1, 0),
                }
              : interview,
          ),
        )
      }
    } catch (error) {
      console.error("Error liking interview:", error)
    }
  }

  const handleSaveInterview = async (interviewId: number) => {
    if (!user) return

    try {
      const result = await toggleSaveInterview(user.id, interviewId)

      if (result.success) {
        // If we're on the saved tab, we need to refresh the list
        if (activeTab === "saved") {
          fetchCommunityData()
        } else {
          // Show a temporary notification
          // In a real app, you would use a toast notification
          alert(result.saved ? "Interview saved" : "Interview unsaved")
        }
      }
    } catch (error) {
      console.error("Error saving interview:", error)
    }
  }

  const handleViewInterview = async (interviewId: number) => {
    if (!user) return

    try {
      // Increment view count
      await viewInterview(interviewId)

      // Navigate to the interview
      router.push(`/interview/${interviewId}`)
    } catch (error) {
      console.error("Error viewing interview:", error)
    }
  }

  const filteredCommunityInterviews = communityInterviews.filter((interview) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      interview.title?.toLowerCase().includes(query) ||
      interview.role?.toLowerCase().includes(query) ||
      interview.user_name?.toLowerCase().includes(query) ||
      interview.technologies?.some((tech: string) => tech.toLowerCase().includes(query))
    )
  })

  const filteredSavedInterviews = savedInterviews.filter((interview) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      interview.title?.toLowerCase().includes(query) ||
      interview.role?.toLowerCase().includes(query) ||
      interview.user_name?.toLowerCase().includes(query) ||
      interview.technologies?.some((tech: string) => tech.toLowerCase().includes(query))
    )
  })

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <div className="container py-10 flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // If no user, show login prompt
  if (!user) {
    return (
      <div className="container py-10">
        <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>You need to be logged in to view this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/login")} className="bg-white text-black hover:bg-gray-200">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show loading state while data is being fetched
  if (dataLoading) {
    return (
      <div className="container py-10 flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Show error state if there was an error
  if (error) {
    return (
      <div className="container py-10">
        <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()} className="bg-white text-black hover:bg-gray-200">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Ensure interviews is always an array
  const safeInterviews = Array.isArray(interviews) ? interviews : []

  return (
    <div className="container py-10">
      {/* Add the GeminiApiChecker component at the top of the page */}
      <GeminiApiChecker />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Your Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your interview practice sessions</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="gap-2 border-white/20 hover:bg-white/10">
            <Link href="/job-analysis">
              <Briefcase className="h-5 w-5" />
              Job Description
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            className="gap-2 bg-white text-black hover:bg-gray-200"
            disabled={usageLimits && !usageLimits.allowed}
          >
            <Link href="/create-interview">
              <PlusCircle className="h-5 w-5" />
              New Interview
            </Link>
          </Button>
        </div>
      </div>

      {/* Subscription Status Card */}
      <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent mb-8">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>Subscription Status</CardTitle>
            <Button asChild variant="outline" size="sm" className="border-white/20 hover:bg-white/10">
              <Link href="/subscription">
                <CreditCard className="h-4 w-4 mr-2" />
                Manage Subscription
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium mb-1">Current Plan</p>
              <div className="flex items-center">
                <span className="text-xl font-bold capitalize">
                 {/* @ts-ignore */}
                  {user?.subscriptionPlan || user?.subscription_plan || "Free"}
                </span>
                 {/*  @ts-ignore */}
                {(user?.subscriptionPlan === "premium" || user?.subscription_plan === "premium") && (
                  <span className="ml-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-500 text-xs rounded-full">
                    Premium
                  </span>
                )}
              </div>
            </div>

            {usageLimits && (
              <>
                <div>
                  <p className="text-sm font-medium mb-1">Interviews Today</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{usageLimits.usage?.current || 0} used</span>
                      <span>
                        {usageLimits.usage?.limit === "unlimited"
                          ? "Unlimited"
                          : `${usageLimits.usage?.limit || 3} limit`}
                      </span>
                    </div>
                    {usageLimits.usage?.limit !== "unlimited" && (
                      <Progress
                        value={((usageLimits.usage?.current || 0) / (usageLimits.usage?.limit || 3)) * 100}
                        className="h-2"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Upgrade for More</p>
                  {user.subscriptionPlan === "free" &&
                   // @ts-ignore
                  user.subscription_plan !== "pro" &&
                   // @ts-ignore
                  user.subscription_plan !== "premium" ? (
                    <Button asChild size="sm" className="bg-white text-black hover:bg-gray-200">
                      <Link href="/subscription">Upgrade Now</Link>
                    </Button>
                     // @ts-ignore
                  ) : user.subscriptionPlan === "pro" || user.subscription_plan === "pro" ? (
                    <Button asChild size="sm" className="bg-white text-black hover:bg-gray-200">
                      <Link href="/subscription">Go Premium</Link>
                    </Button>
                  ) : (
                    <p className="text-sm text-muted-foreground">You're on our highest plan!</p>
                  )}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage limit warning */}
      {usageLimits && !usageLimits.allowed && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Daily Limit Reached</AlertTitle>
          <AlertDescription>
            You've reached your daily limit for interviews.
            <Link href="/subscription" className="ml-1 underline">
              Upgrade your plan
            </Link>{" "}
            for more.
          </AlertDescription>
        </Alert>
      )}

      {/* Main content tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-secondary/50 p-1 rounded-lg">
          <TabsTrigger value="my-interviews" className="data-[state=active]:bg-white/10 rounded-md">
            My Interviews
          </TabsTrigger>
          <TabsTrigger value="community" className="data-[state=active]:bg-white/10 rounded-md">
            Community
          </TabsTrigger>
          <TabsTrigger value="saved" className="data-[state=active]:bg-white/10 rounded-md">
            Saved
          </TabsTrigger>
        </TabsList>

        {/* My Interviews Tab */}
        <TabsContent value="my-interviews">
          {safeInterviews.length === 0 ? (
            <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent p-8 text-center">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="rounded-full bg-white/10 p-6">
                  <PlusCircle className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold">No interviews yet</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Create your first interview to start practicing and improving your skills
                </p>
                <Button
                  asChild
                  size="lg"
                  className="mt-2 bg-white text-black hover:bg-gray-200"
                  disabled={usageLimits && !usageLimits.allowed}
                >
                  <Link href="/create-interview">Create Interview</Link>
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {safeInterviews.map((interview) => (
                <Card
                  key={interview.id}
                  className="gradient-border bg-black/50 backdrop-blur-sm border-transparent overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      <span className="truncate">{interview.title || `${interview.role} Interview`}</span>
                      {interview.score !== undefined && (
                        <Badge variant="outline" className="ml-2 bg-white/10">
                          {interview.score}/100
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="bg-secondary/50">
                        {interview.type}
                      </Badge>
                      <Badge variant="secondary" className="bg-secondary/50">
                        {interview.level}
                      </Badge>
                      {interview.technologies?.slice(0, 2).map((tech: string) => (
                        <Badge key={tech} variant="secondary" className="bg-secondary/50">
                          {tech}
                        </Badge>
                      ))}
                      {interview.technologies?.length > 2 && (
                        <Badge variant="secondary" className="bg-secondary/50">
                          +{interview.technologies.length - 2}
                        </Badge>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>
                          {interview.completed
                            ? `Completed on ${new Date(interview.completed_at).toLocaleDateString()}`
                            : interview.started
                              ? "In progress"
                              : "Not started"}
                        </span>
                      </div>
                      {interview.completed && (
                        <div className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>
                            {interview.score >= 80
                              ? "Excellent"
                              : interview.score >= 60
                                ? "Good"
                                : interview.score >= 40
                                  ? "Fair"
                                  : "Needs Improvement"}
                          </span>
                        </div>
                      )}
                      {interview.job_description && (
                        <div className="flex items-center text-sm">
                          <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>Based on job description</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild variant="secondary" className="w-full gap-2 bg-white/10 hover:bg-white/20">
                      <Link href={`/interview/${interview.id}`}>
                        {interview.completed ? "View Results" : interview.started ? "Continue" : "Start"}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}

              <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent border-dashed flex flex-col items-center justify-center p-6 h-full">
                <PlusCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Create New Interview</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">Customize your next practice session</p>
                <Button
                  asChild
                  variant="outline"
                  className="border-white/20 hover:bg-white/10"
                  disabled={usageLimits && !usageLimits.allowed}
                >
                  <Link href="/create-interview">Get Started</Link>
                </Button>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Community Tab */}
        <TabsContent value="community">
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <Tabs value={communityTab} onValueChange={setCommunityTab} className="w-full md:w-auto">
                <TabsList className="bg-secondary/50 w-full md:w-auto">
                  <TabsTrigger value="recent" className="flex-1 md:flex-none">
                    <Clock className="h-4 w-4 mr-2" />
                    Recent
                  </TabsTrigger>
                  <TabsTrigger value="trending" className="flex-1 md:flex-none">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Trending
                  </TabsTrigger>
                  <TabsTrigger value="popular" className="flex-1 md:flex-none">
                    <Star className="h-4 w-4 mr-2" />
                    Popular
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search interviews..."
                    className="pl-8 bg-secondary/50 border-white/10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="border-white/20 hover:bg-white/10">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="bg-black/90 border-white/10">
                    <SheetHeader>
                      <SheetTitle>Filter Interviews</SheetTitle>
                      <SheetDescription>Narrow down interviews by specific criteria</SheetDescription>
                    </SheetHeader>
                    <div className="py-4 space-y-4">
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Select
                          value={filters.role || ""}
                          onValueChange={(value) => setFilters({ ...filters, role: value || undefined })}
                        >
                          <SelectTrigger className="bg-secondary/50 border-white/10">
                            <SelectValue placeholder="All Roles" />
                          </SelectTrigger>
                          <SelectContent className="bg-black/90 border-white/10">
                            <SelectItem value="all">All Roles</SelectItem>
                            {filterOptions.roles.map((role: string) => (
                              <SelectItem key={role} value={role}>
                                {role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select
                          value={filters.type || ""}
                          onValueChange={(value) => setFilters({ ...filters, type: value || undefined })}
                        >
                          <SelectTrigger className="bg-secondary/50 border-white/10">
                            <SelectValue placeholder="All Types" />
                          </SelectTrigger>
                          <SelectContent className="bg-black/90 border-white/10">
                            <SelectItem value="all">All Types</SelectItem>
                            {filterOptions.types.map((type: string) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Level</Label>
                        <Select
                          value={filters.level || ""}
                          onValueChange={(value) => setFilters({ ...filters, level: value || undefined })}
                        >
                          <SelectTrigger className="bg-secondary/50 border-white/10">
                            <SelectValue placeholder="All Levels" />
                          </SelectTrigger>
                          <SelectContent className="bg-black/90 border-white/10">
                            <SelectItem value="all">All Levels</SelectItem>
                            {filterOptions.levels.map((level: string) => (
                              <SelectItem key={level} value={level}>
                                {level}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Technology</Label>
                        <Select
                          value={filters.technology || ""}
                          onValueChange={(value) => setFilters({ ...filters, technology: value || undefined })}
                        >
                          <SelectTrigger className="bg-secondary/50 border-white/10">
                            <SelectValue placeholder="All Technologies" />
                          </SelectTrigger>
                          <SelectContent className="bg-black/90 border-white/10">
                            <SelectItem value="all">All Technologies</SelectItem>
                            {filterOptions.technologies.map((tech: string) => (
                              <SelectItem key={tech} value={tech}>
                                {tech}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <SheetFooter>
                      <Button
                        variant="outline"
                        className="border-white/20 hover:bg-white/10"
                        onClick={() => setFilters({})}
                      >
                        Reset Filters
                      </Button>
                      <SheetClose asChild>
                        <Button className="bg-white text-black hover:bg-gray-200">Apply Filters</Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {communityLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
              </div>
            ) : filteredCommunityInterviews.length === 0 ? (
              <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent p-8 text-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="rounded-full bg-white/10 p-6">
                    <Search className="h-12 w-12 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold">No interviews found</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {Object.keys(filters).length > 0
                      ? "Try adjusting your filters to see more results"
                      : "Be the first to share your interview with the community"}
                  </p>
                  {Object.keys(filters).length > 0 && (
                    <Button
                      variant="outline"
                      className="border-white/20 hover:bg-white/10"
                      onClick={() => setFilters({})}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCommunityInterviews.map((interview) => (
                  <Card
                    key={interview.id}
                    className="gradient-border bg-black/50 backdrop-blur-sm border-transparent overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={interview.profile_image_url || "/user-avatar.png"} />
                          <AvatarFallback>{interview.user_name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">{interview.user_name || "Anonymous"}</span>
                      </div>
                      <CardTitle className="text-base truncate">
                        {interview.title || `${interview.role} Interview`}
                      </CardTitle>
                      <CardDescription className="flex flex-wrap gap-1 mt-1">
                        <Badge variant="secondary" className="bg-secondary/50">
                          {interview.type}
                        </Badge>
                        <Badge variant="secondary" className="bg-secondary/50">
                          {interview.level}
                        </Badge>
                        {interview.technologies?.slice(0, 2).map((tech: string) => (
                          <Badge key={tech} variant="secondary" className="bg-secondary/50">
                            {tech}
                          </Badge>
                        ))}
                        {interview.technologies?.length > 2 && (
                          <Badge variant="secondary" className="bg-secondary/50">
                            +{interview.technologies.length - 2}
                          </Badge>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          <span>{interview.view_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3.5 w-3.5" />
                          <span>{interview.like_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{new Date(interview.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2 flex justify-between">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-white/10"
                          onClick={() => handleLikeInterview(interview.id)}
                        >
                          {likedInterviews[interview.id] ? (
                            <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                          ) : (
                            <Heart className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-white/10"
                          onClick={() => handleSaveInterview(interview.id)}
                        >
                          <Bookmark className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="gap-1 bg-white/10 hover:bg-white/20"
                        onClick={() => handleViewInterview(interview.id)}
                      >
                        View
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Saved Tab */}
        <TabsContent value="saved">
          <div className="space-y-6">
            <div className="flex justify-between gap-4">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search saved interviews..."
                  className="pl-8 bg-secondary/50 border-white/10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {communityLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
              </div>
            ) : filteredSavedInterviews.length === 0 ? (
              <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent p-8 text-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="rounded-full bg-white/10 p-6">
                    <Bookmark className="h-12 w-12 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold">No saved interviews</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Save interviews from the community to view them later
                  </p>
                  <Button
                    variant="outline"
                    className="border-white/20 hover:bg-white/10"
                    onClick={() => setActiveTab("community")}
                  >
                    Browse Community
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSavedInterviews.map((interview) => (
                  <Card
                    key={interview.id}
                    className="gradient-border bg-black/50 backdrop-blur-sm border-transparent overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={interview.profile_image_url || "/user-avatar.png"} />
                          <AvatarFallback>{interview.user_name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">{interview.user_name || "Anonymous"}</span>
                      </div>
                      <CardTitle className="text-base truncate">
                        {interview.title || `${interview.role} Interview`}
                      </CardTitle>
                      <CardDescription className="flex flex-wrap gap-1 mt-1">
                        <Badge variant="secondary" className="bg-secondary/50">
                          {interview.type}
                        </Badge>
                        <Badge variant="secondary" className="bg-secondary/50">
                          {interview.level}
                        </Badge>
                        {interview.technologies?.slice(0, 2).map((tech: string) => (
                          <Badge key={tech} variant="secondary" className="bg-secondary/50">
                            {tech}
                          </Badge>
                        ))}
                        {interview.technologies?.length > 2 && (
                          <Badge variant="secondary" className="bg-secondary/50">
                            +{interview.technologies.length - 2}
                          </Badge>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          <span>{interview.view_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3.5 w-3.5" />
                          <span>{interview.like_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{new Date(interview.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2 flex justify-between">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-white/10"
                          onClick={() => handleLikeInterview(interview.id)}
                        >
                          {likedInterviews[interview.id] ? (
                            <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                          ) : (
                            <Heart className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-white/10"
                          onClick={() => handleSaveInterview(interview.id)}
                        >
                          <BookmarkX className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="gap-1 bg-white/10 hover:bg-white/20"
                        onClick={() => handleViewInterview(interview.id)}
                      >
                        View
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Featured Section */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold gradient-text">Featured Resources</h2>
          <Button variant="link" asChild className="text-blue-400 hover:text-blue-300 p-0">
            <Link href="/resources">View All</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {interviews.length > 0 && interviews[0].technologies && interviews[0].technologies.length > 0 ? (
            <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-blue-500"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-400" />
                  {interviews[0].technologies[0]} Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Master {interviews[0].technologies[0]} interview questions with our comprehensive guide tailored to
                  your experience level.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="link" asChild className="text-blue-400 hover:text-blue-300 p-0">
                  <Link href="/resources">Read More</Link>
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-blue-500"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-400" />
                  Interview Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Learn the top strategies for acing your next technical interview with our comprehensive guide.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="link" asChild className="text-blue-400 hover:text-blue-300 p-0">
                  <Link href="/resources">Read More</Link>
                </Button>
              </CardFooter>
            </Card>
          )}

          <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5 text-purple-400" />
                Performance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {interviews.filter((i) => i.completed).length > 0
                  ? `Based on your ${interviews.filter((i) => i.completed).length} completed interviews, we've identified key areas for improvement.`
                  : "Track your progress and identify areas for improvement with our detailed analytics dashboard."}
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="link" asChild className="text-blue-400 hover:text-blue-300 p-0">
                <Link href="/analytics">Explore</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-red-400" />
                Job Search Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {interviews.length > 0 && interviews[0].role
                  ? `Find your dream ${interviews[0].role} job with our comprehensive guide to job searching and networking.`
                  : "Find your dream job with our comprehensive guide to job searching, resume building, and networking."}
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="link" asChild className="text-blue-400 hover:text-blue-300 p-0">
                <Link href="/resources">Get Started</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Add the debug component */}
      <DebugUserData />
    </div>
  )
}

