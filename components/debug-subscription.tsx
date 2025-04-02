"use client"

import { useState } from "react"
import { useAuth } from "@/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bug } from "lucide-react"

export function DebugSubscription() {
  const { user } = useAuth()
  const [showDebug, setShowDebug] = useState(false)

  if (!user) return null

  return (
    <div className="mt-6">
      <Button variant="outline" size="sm" onClick={() => setShowDebug(!showDebug)} className="mb-4 border-white/10">
        <Bug className="h-4 w-4 mr-2" />
        {showDebug ? "Hide" : "Show"} Subscription Debug
      </Button>

      {showDebug && (
        <Card className="bg-black/50 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-sm">Subscription Debug Info</CardTitle>
          </CardHeader>
          <CardContent className="text-xs font-mono">
            <div className="space-y-2">
              <div>
                <span className="text-gray-400">subscriptionPlan:</span>{" "}
                <span className="text-green-400">{user.subscriptionPlan || "Not set"}</span>
              </div>
              <div>
                <span className="text-gray-400">subscription_plan:</span>{" "}
                <span className="text-green-400">{user.subscription_plan || "Not set"}</span>
              </div>
              <div>
                <span className="text-gray-400">subscriptionStatus:</span>{" "}
                <span className="text-green-400">{user.subscriptionStatus || "Not set"}</span>
              </div>
              <div>
                <span className="text-gray-400">subscription_status:</span>{" "}
                <span className="text-green-400">{user.subscription_status || "Not set"}</span>
              </div>
              <div className="pt-2 border-t border-white/10">
                <span className="text-gray-400">Full user object:</span>
                <pre className="mt-2 p-2 bg-gray-900 rounded overflow-auto max-h-40">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

