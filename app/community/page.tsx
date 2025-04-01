"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageSquare, Eye, BookmarkPlus, BookmarkCheck, Search, Filter } from "lucide-react"
import { useAuth } from "@/providers/auth-provider"
import {
  fetchCommunityInterviews,
  toggleLikeInterview,
  toggleSaveInterview,
  viewInterview,
  checkUserLikedInterview,
  checkUserSavedInterview,
  fetchFilterOptions,
} from "@/app/actions/community-actions"
import { Skeleton } from "@/components/ui/skeleton"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function CommunityPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("recent")
  const [interviews, setInterviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<any>({})
  const [filterOptions, setFilterOptions] = useState<any>({
    roles: [],
    types: [],
    levels: [],
    technologies: [],
  })
  const [likedInterviews, setLikedInterviews] = useState<Record<number, boolean>>({})
  const [savedInterviews, setSavedInterviews] = useState<Record<number, boolean>>({})
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  useEffect(() => {
    if (!user) return

    const loadInterviews = async () => {
      setLoading(true)
      try {
        const result = await fetchCommunityInterviews(activeTab as "trending" | "popular" | "recent", 10, 0, filters)

        if (result.success && Array.isArray(result.interviews)) {
          console.log("Fetched interviews:", result.interviews)
          setInterviews(result.interviews)

          // Check which interviews are liked/saved by the user
          const likedStatus: Record<number, boolean> = {}
          const savedStatus: Record<number, boolean> = {}

          for (const interview of result.interviews) {
            try {
              const likedResult = await checkUserLikedInterview(user.id, interview.id)
              likedStatus[interview.id] = likedResult.liked

              const savedResult = await checkUserSavedInterview(user.id, interview.id)
              savedStatus[interview.id] = savedResult.saved
            } catch (error) {
              console.error("Error checking interview status:", error)
            }
          }

          setLikedInterviews(likedStatus)
          setSavedInterviews(savedStatus)
        } else {
          setError("Failed to load interviews")
          setInterviews([])
        }
      } catch (error: any) {
        console.error("Error loading interviews:", error)
        setError(error.message || "Failed to load interviews")
        setInterviews([])
      } finally {
        setLoading(false)
      }
    }

    const loadFilterOptions = async () => {
      try {
        const result = await fetchFilterOptions()
        if (result.success) {
          setFilterOptions(result.options)
        }
      } catch (error) {
        console.error("Error loading filter options:", error)
      }
    }

    loadInterviews()
    loadFilterOptions()
  }, [activeTab, user, filters])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  const handleViewInterview = async (interviewId: number) => {
    if (!user) return

    try {
      await viewInterview(interviewId)
      router.push(`/interview/${interviewId}`)
    } catch (error) {
      console.error("Error viewing interview:", error)
    }
  }

  const handleLikeInterview = async (interviewId: number, event: React.MouseEvent) => {
    event.stopPropagation()
    if (!user) return

    try {
      const result = await toggleLikeInterview(user.id, interviewId)
      if (result.success) {
        setLikedInterviews((prev) => ({
          ...prev,
          [interviewId]: result.liked,
        }))

        // Update the like count in the interviews list
        setInterviews((prev) =>
          prev.map((interview) => {
            if (interview.id === interviewId) {
              return {
                ...interview,
                like_count: result.liked ? (interview.like_count || 0) + 1 : (interview.like_count || 0) - 1,
              }
            }
            return interview
          }),
        )
      }
    } catch (error) {
      console.error("Error liking interview:", error)
    }
  }

  const handleSaveInterview = async (interviewId: number, event: React.MouseEvent) => {
    event.stopPropagation()
    if (!user) return

    try {
      const result = await toggleSaveInterview(user.id, interviewId)
      if (result.success) {
        setSavedInterviews((prev) => ({
          ...prev,
          [interviewId]: result.saved,
        }))
      }
    } catch (error) {
      console.error("Error saving interview:", error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality
    console.log("Searching for:", searchQuery)
  }

  const handleFilterChange = (key: string, value: string) => {
    if (value === "") {
      const newFilters = { ...filters }
      delete newFilters[key]
      setFilters(newFilters)
    } else {
      setFilters((prev: any) => ({
        ...prev,
        [key]: value,
      }))
    }
  }

  const clearFilters = () => {
    setFilters({})
    setIsFilterOpen(false)
  }

  const applyFilters = () => {
    setIsFilterOpen(false)
  }

  const filteredInterviews = interviews.filter((interview) => {
    if (!searchQuery) return true

    const searchLower = searchQuery.toLowerCase()
    return (
      (interview.title && interview.title.toLowerCase().includes(searchLower)) ||
      (interview.role && interview.role.toLowerCase().includes(searchLower)) ||
      (interview.type && interview.type.toLowerCase().includes(searchLower)) ||
      (interview.level && interview.level.toLowerCase().includes(searchLower)) ||
      (interview.technologies &&
        interview.technologies.some((tech: string) => tech.toLowerCase().includes(searchLower)))
    )
  })

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Community Interviews</h1>
          <p className="text-muted-foreground">Explore and learn from interviews shared by the community</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <form onSubmit={handleSearch} className="flex-1 md:w-auto">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search interviews..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Interviews</SheetTitle>
                <SheetDescription>Narrow down interviews based on your preferences</SheetDescription>
              </SheetHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role-filter">Role</Label>
                  <Select value={filters.role || ""} onValueChange={(value) => handleFilterChange("role", value)}>
                    <SelectTrigger id="role-filter">
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
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
                  <Label htmlFor="type-filter">Interview Type</Label>
                  <Select value={filters.type || ""} onValueChange={(value) => handleFilterChange("type", value)}>
                    <SelectTrigger id="type-filter">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
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
                  <Label htmlFor="level-filter">Experience Level</Label>
                  <Select value={filters.level || ""} onValueChange={(value) => handleFilterChange("level", value)}>
                    <SelectTrigger id="level-filter">
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
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
                  <Label htmlFor="technology-filter">Technology</Label>
                  <Select
                    value={filters.technology || ""}
                    onValueChange={(value) => handleFilterChange("technology", value)}
                  >
                    <SelectTrigger id="technology-filter">
                      <SelectValue placeholder="All Technologies" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Technologies</SelectItem>
                      {filterOptions.technologies.map((tech: string) => (
                        <SelectItem key={tech} value={tech}>
                          {tech}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between">
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                  <Button onClick={applyFilters}>Apply Filters</Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <Tabs defaultValue="recent" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-6">
          {renderInterviewList(filteredInterviews, loading, error)}
        </TabsContent>

        <TabsContent value="trending" className="space-y-6">
          {renderInterviewList(filteredInterviews, loading, error)}
        </TabsContent>

        <TabsContent value="popular" className="space-y-6">
          {renderInterviewList(filteredInterviews, loading, error)}
        </TabsContent>
      </Tabs>
    </div>
  )

  function renderInterviewList(interviews: any[], loading: boolean, error: string | null) {
    if (loading) {
      return Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="gradient-border bg-black/50 backdrop-blur-sm border-transparent">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-6 w-3/4 mb-4" />
            <div className="flex flex-wrap gap-2 mb-4">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
          <CardFooter>
            <div className="flex justify-between w-full">
              <div className="flex gap-4">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          </CardFooter>
        </Card>
      ))
    }

    if (error) {
      return (
        <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>We couldn't load the community interviews. Please try again later.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardFooter>
        </Card>
      )
    }

    if (interviews.length === 0) {
      return (
        <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent">
          <CardHeader>
            <CardTitle>No Interviews Found</CardTitle>
            <CardDescription>
              {Object.keys(filters).length > 0
                ? "No interviews match your current filters."
                : "There are no shared interviews in the community yet."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              {Object.keys(filters).length > 0
                ? "Try adjusting your filters or check back later."
                : "Be the first to share your interview with the community!"}
            </p>
          </CardContent>
          <CardFooter>
            {Object.keys(filters).length > 0 && <Button onClick={clearFilters}>Clear Filters</Button>}
          </CardFooter>
        </Card>
      )
    }

    return interviews.map((interview) => (
      <Card
        key={interview.id}
        className="gradient-border bg-black/50 backdrop-blur-sm border-transparent hover:bg-black/60 transition-colors cursor-pointer"
        onClick={() => handleViewInterview(interview.id)}
      >
        <CardHeader>
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={interview.profile_image_url || "/user-avatar.png"} />
              <AvatarFallback>{interview.user_name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{interview.title || `${interview.role} Interview`}</CardTitle>
              <CardDescription>
                Shared by {interview.user_name || "Anonymous"} • {new Date(interview.created_at).toLocaleDateString()}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline" className="bg-secondary/50">
              {interview.role || "General"}
            </Badge>
            <Badge variant="outline" className="bg-secondary/50">
              {interview.type || "Mixed"}
            </Badge>
            <Badge variant="outline" className="bg-secondary/50">
              {interview.level || "All Levels"}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-1 mb-4">
            {interview.technologies &&
              interview.technologies.map((tech: string) => (
                <Badge key={tech} variant="secondary" className="bg-secondary/20 text-xs">
                  {tech}
                </Badge>
              ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {interview.questions?.length || 0} questions •{" "}
            {interview.score ? `Score: ${interview.score}/100` : "Not rated"}
          </p>
        </CardContent>
        <CardFooter>
          <div className="flex justify-between w-full">
            <div className="flex gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 px-2"
                onClick={(e) => handleLikeInterview(interview.id, e)}
              >
                <Heart className={`h-4 w-4 ${likedInterviews[interview.id] ? "fill-red-500 text-red-500" : ""}`} />
                <span>{interview.like_count || 0}</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-1 px-2">
                <MessageSquare className="h-4 w-4" />
                <span>{interview.comment_count || 0}</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-1 px-2">
                <Eye className="h-4 w-4" />
                <span>{interview.view_count || 0}</span>
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 px-2"
              onClick={(e) => handleSaveInterview(interview.id, e)}
            >
              {savedInterviews[interview.id] ? (
                <BookmarkCheck className="h-4 w-4 text-green-500" />
              ) : (
                <BookmarkPlus className="h-4 w-4" />
              )}
              <span>{savedInterviews[interview.id] ? "Saved" : "Save"}</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
    ))
  }
}

