"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, BookOpen, Code, Video, FileText } from "lucide-react"
import Link from "next/link"

// Sample resources data - in a real app, this would come from an API or database
const RESOURCES = [
  {
    id: "interview-techniques",
    title: "Interview Techniques",
    description: "Learn effective techniques for answering common interview questions",
    type: "guide",
    icon: BookOpen,
  },
  {
    id: "coding-challenges",
    title: "Coding Challenges",
    description: "Practice coding challenges frequently asked in technical interviews",
    type: "practice",
    icon: Code,
  },
  {
    id: "behavioral-questions",
    title: "Behavioral Questions",
    description: "Prepare for behavioral questions with the STAR method",
    type: "guide",
    icon: FileText,
  },
  {
    id: "mock-interviews",
    title: "Mock Interview Videos",
    description: "Watch mock interviews to understand what to expect",
    type: "video",
    icon: Video,
  },
  {
    id: "resume-tips",
    title: "Resume Building Tips",
    description: "Learn how to create a resume that stands out to recruiters",
    type: "guide",
    icon: FileText,
  },
  {
    id: "system-design",
    title: "System Design Basics",
    description: "Introduction to system design concepts for technical interviews",
    type: "guide",
    icon: Code,
  },
]

export default function ResourcesPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading resources
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="container py-10 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Interview Resources</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {RESOURCES.map((resource) => (
          <Link href={`/resources/${resource.id}`} key={resource.id}>
            <Card className="h-full cursor-pointer transition-all duration-300 hover:scale-105 gradient-border bg-black/50 backdrop-blur-sm border-transparent">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <resource.icon className="h-5 w-5" />
                  <CardTitle>{resource.title}</CardTitle>
                </div>
                <CardDescription>{resource.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full border-white/20 hover:bg-white/10">
                  View Resource
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

