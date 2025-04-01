"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { X, ArrowLeft } from "lucide-react"

export default function SubscriptionCancelPage() {
  const router = useRouter()

  return (
    <div className="container py-10 flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md gradient-border bg-black/50 backdrop-blur-sm border-transparent">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center">
              <X className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl">Subscription Cancelled</CardTitle>
          <CardDescription className="text-center">You have cancelled the subscription process.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            No charges have been made to your account. You can still use the free features of Interview Prep AI or
            subscribe at any time.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            onClick={() => router.push("/subscription")}
            variant="outline"
            className="mr-2 gap-2 border-white/20 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Plans
          </Button>
          <Button onClick={() => router.push("/dashboard")} className="gap-2 bg-white text-black hover:bg-gray-200">
            Go to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

