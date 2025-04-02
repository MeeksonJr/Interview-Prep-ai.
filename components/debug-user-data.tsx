"use client"

import { useAuth } from "@/providers/auth-provider"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DebugUserData() {
  const { user, refreshUser } = useAuth()
  const [showDebug, setShowDebug] = useState(false)

  if (!user) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button variant="outline" size="sm" onClick={() => setShowDebug(!showDebug)} className="mb-2">
        {showDebug ? "Hide Debug" : "Debug User Data"}
      </Button>

      {showDebug && (
        <Card className="w-80 bg-black/90 border-white/10 text-xs">
          <CardHeader className="p-3">
            <CardTitle className="text-sm">User Data</CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-2">
            <div>
              <strong>ID:</strong> {user.id}
            </div>
            <div>
              <strong>Email:</strong> {user.email}
            </div>
            <div>
              <strong>Name:</strong> {user.name || "Not set"}
            </div>
            <div>
              <strong>subscriptionPlan:</strong> {user.subscriptionPlan || "Not set"}
            </div>
            <div>
              <strong>subscription_plan:</strong> {user.subscription_plan || "Not set"}
            </div>
            <div>
              <strong>Status:</strong> {user.subscriptionStatus || user.subscription_status || "Not set"}
            </div>
            <Button size="sm" onClick={refreshUser} className="mt-2 w-full">
              Refresh User Data
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

