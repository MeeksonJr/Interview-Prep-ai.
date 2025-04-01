"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowRight } from "lucide-react"
import { activateSubscriptionAction } from "@/app/actions/subscription-actions"
import { useAuth } from "@/providers/auth-provider"

export default function SubscriptionSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, refreshUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const activateSubscription = async () => {
      try {
        setLoading(true)

        const subscriptionId = searchParams.get("subscription_id")
        const planName = searchParams.get("plan") || "pro" // Default to pro if not specified

        console.log("Activating subscription:", {
          userId: user.id,
          subscriptionId,
          planName,
        })

        if (!subscriptionId) {
          setError("Missing subscription information")
          setLoading(false)
          return
        }

        const result = await activateSubscriptionAction(user.id, subscriptionId, planName)
        console.log("Activation result:", result)

        if (result.success) {
          setSuccess(true)
          // Refresh user data to get updated subscription info
          await refreshUser()
        } else {
          setError(result.error || "Failed to activate subscription")
        }
      } catch (error: any) {
        console.error("Error activating subscription:", error)
        setError(error.message || "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    activateSubscription()
  }, [user, router, searchParams, refreshUser])

  if (loading) {
    return (
      <div className="container py-10 flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Activating your subscription...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10 flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md gradient-border bg-black/50 backdrop-blur-sm border-transparent">
        <CardHeader>
          <div className="flex justify-center mb-4">
            {success ? (
              <CheckCircle className="h-16 w-16 text-green-500" />
            ) : (
              <div className="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <span className="text-red-500 text-2xl">!</span>
              </div>
            )}
          </div>
          <CardTitle className="text-center text-2xl">
            {success ? "Subscription Activated!" : "Activation Failed"}
          </CardTitle>
          <CardDescription className="text-center">
            {success
              ? "Your subscription has been successfully activated."
              : error || "There was a problem activating your subscription."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success && (
            <p className="text-center text-muted-foreground">
              Thank you for subscribing to Interview Prep AI. You now have access to all the features included in your
              plan.
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => router.push("/dashboard")} className="gap-2 bg-white text-black hover:bg-gray-200">
            Go to Dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

