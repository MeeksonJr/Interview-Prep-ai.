"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, X, ArrowRight, AlertCircle } from "lucide-react"
import { getSubscriptionPlansAction, createPayPalSubscriptionAction } from "@/app/actions/subscription-actions"
import { useAuth } from "@/providers/auth-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SubscriptionPage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const fetchPlans = async () => {
      try {
        const result = await getSubscriptionPlansAction()
        if (result.success) {
          setPlans(result.plans)
        } else {
          setError(result.error || "Failed to load subscription plans")
        }
      } catch (error: any) {
        setError(error.message || "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
    setCurrentPlan(user.subscriptionPlan || "free")
  }, [user, router])

  const handleSubscribe = async (planName: string) => {
    if (!user) return

    setSubscribing(true)
    setError(null)

    try {
      const result = await createPayPalSubscriptionAction(user.id, planName)

      if (result.success && result.approvalUrl) {
        // Redirect to PayPal for approval
        window.location.href = result.approvalUrl
      } else {
        setError(result.error || "Failed to create subscription. Please try again later.")
      }
    } catch (error: any) {
      console.error("Subscription error:", error)
      setError("Failed to create subscription. Please try again later.")
    } finally {
      setSubscribing(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-10 flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading subscription plans...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight gradient-text">Subscription Plans</h1>
          <p className="text-xl text-muted-foreground mt-4">
            Choose the plan that best fits your interview preparation needs
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const features = plan.features || {}
            const isCurrent = currentPlan === plan.name

            return (
              <Card
                key={plan.id}
                className={`gradient-border bg-black/50 backdrop-blur-sm border-transparent ${
                  isCurrent ? "ring-2 ring-primary" : ""
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span className="capitalize">{plan.name}</span>
                    <span>${(plan.price / 100).toFixed(2)}/mo</span>
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>
                        {features.interviewsPerDay === -1
                          ? "Unlimited interviews"
                          : `${features.interviewsPerDay} interviews per day`}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>
                        {features.resultsPerDay === -1
                          ? "Unlimited result views"
                          : `${features.resultsPerDay} result views per day`}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>
                        {features.retakesPerDay === -1
                          ? "Unlimited interview retakes"
                          : `${features.retakesPerDay} interview retakes per day`}
                      </span>
                    </li>
                    {plan.name === "premium" && (
                      <>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>Priority support</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>Advanced analytics</span>
                        </li>
                      </>
                    )}
                    {plan.name === "free" && (
                      <li className="flex items-start gap-2">
                        <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <span>Limited features</span>
                      </li>
                    )}
                  </ul>
                </CardContent>
                <CardFooter>
                  {isCurrent ? (
                    <Button className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleSubscribe(plan.name)}
                      disabled={subscribing || plan.name === "free"}
                      className="w-full gap-2 bg-white text-black hover:bg-gray-200"
                    >
                      {subscribing ? "Processing..." : plan.name === "free" ? "Default Plan" : "Subscribe"}
                      {!subscribing && plan.name !== "free" && <ArrowRight className="h-4 w-4" />}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            All plans include access to our AI-powered interview preparation platform.
            <br />
            Subscriptions can be cancelled at any time.
          </p>
        </div>
      </div>
    </div>
  )
}

