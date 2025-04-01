"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Heart, Bookmark, Eye } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import {
  likeInterviewAction,
  saveInterviewAction,
  incrementViewCount,
  checkUserLikedInterview,
  checkUserSavedInterview,
} from "@/app/actions/community-actions"

interface InterviewCardProps {
  interview: any
  onLike?: (interviewId: number, liked: boolean) => void
  onSave?: (interviewId: number, saved: boolean) => void
}

export function InterviewCard({ interview, onLike, onSave }: InterviewCardProps) {
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()
  const [isLiked, setIsLiked] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const checkLikeStatus = async () => {
      if (user?.id && interview?.id) {
        try {
          const result = await checkUserLikedInterview(user.id, interview.id)
          if (result.success) {
            setIsLiked(result.liked)
          }
        } catch (error) {
          console.error("Error checking like status:", error)
        }
      }
    }

    const checkSaveStatus = async () => {
      if (user?.id && interview?.id) {
        try {
          const result = await checkUserSavedInterview(user.id, interview.id)
          if (result.success) {
            setIsSaved(result.saved)
          }
        } catch (error) {
          console.error("Error checking save status:", error)
        }
      }
    }

    checkLikeStatus()
    checkSaveStatus()
  }, [user?.id, interview?.id])

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like interviews",
        variant: "destructive",
      })
      return
    }

    setIsLiking(true)
    try {
      const result = await likeInterviewAction(interview.id, user.id)
      if (result.success) {
        setIsLiked(result.liked)
        toast({
          title: result.message,
        })
        if (onLike) {
          onLike(interview.id, result.liked)
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to like interview",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error liking interview:", error)
      toast({
        title: "Error",
        description: "Failed to like interview",
        variant: "destructive",
      })
    } finally {
      setIsLiking(false)
    }
  }

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save interviews",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const result = await saveInterviewAction(interview.id, user.id)
      if (result.success) {
        setIsSaved(result.saved)
        toast({
          title: result.message,
        })
        if (onSave) {
          onSave(interview.id, result.saved)
        }
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
        description: "Failed to save interview",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleView = async () => {
    try {
      await incrementViewCount(interview.id)
      router.push(`/community/interview/${interview.id}`)
    } catch (error) {
      console.error("Error incrementing view count:", error)
      router.push(`/community/interview/${interview.id}`)
    }
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md dark:hover:shadow-primary/10">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={interview.profile_image_url || ""} alt={interview.user_name || "User"} />
            <AvatarFallback>{interview.user_name ? interview.user_name.charAt(0).toUpperCase() : "U"}</AvatarFallback>
          </Avatar>
          <div className="text-sm font-medium">{interview.user_name || "Anonymous"}</div>
        </div>

        <div className="mb-3">
          <h3 className="text-lg font-semibold mb-1 line-clamp-2">{interview.title || "Untitled Interview"}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {interview.description || "No description provided."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className="bg-primary/10">
            {interview.role || "Role"}
          </Badge>
          <Badge variant="outline" className="bg-primary/10">
            {interview.type || "Type"}
          </Badge>
          <Badge variant="outline" className="bg-primary/10">
            {interview.level || "Level"}
          </Badge>
          {interview.technologies &&
            Array.isArray(interview.technologies) &&
            interview.technologies.slice(0, 2).map((tech: string, index: number) => (
              <Badge key={index} variant="outline" className="bg-primary/10">
                {tech}
              </Badge>
            ))}
          {interview.technologies && Array.isArray(interview.technologies) && interview.technologies.length > 2 && (
            <Badge variant="outline" className="bg-primary/10">
              +{interview.technologies.length - 2}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between p-4 pt-0 border-t">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-1 ${isLiked ? "text-red-500" : ""}`}
            onClick={handleLike}
            disabled={isLiking}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            <span>{interview.like_count || 0}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-1 ${isSaved ? "text-primary" : ""}`}
            onClick={handleSave}
            disabled={isSaving}
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
            <span>Save</span>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Eye className="h-4 w-4 mr-1" />
            <span>{interview.view_count || 0}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleView}>
            View
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

