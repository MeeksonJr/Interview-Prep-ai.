"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, AlertCircle, Loader2, CheckCircle, User, Key, Shield } from "lucide-react"
import { useAuth } from "@/providers/auth-provider"
import { updateUserProfile, deleteUserAccount } from "@/app/actions/user-actions"
import { CreateResumeContentsTable } from "@/components/admin/create-resume-contents-table"
import { CreateJobAnalysisTable } from "@/components/admin/create-job-analysis-table"
import { RunAllMigrations } from "@/components/admin/run-all-migrations"

export default function SettingsPage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState("")
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (user.name) {
      setName(user.name)
    }
  }, [user, router])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await updateUserProfile(user.id, { name })

      if (result.success) {
        setSuccess("Profile updated successfully")
        refreshUser()
      } else {
        setError(result.error || "Failed to update profile")
      }
    } catch (error: any) {
      console.error("Error updating profile:", error)
      setError(error.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return
    if (deleteConfirm !== user.email) return

    setDeleteLoading(true)
    setError(null)

    try {
      const result = await deleteUserAccount(user.id)

      if (result.success) {
        // Redirect to logout
        router.push("/api/auth/logout")
      } else {
        setError(result.error || "Failed to delete account")
      }
    } catch (error: any) {
      console.error("Error deleting account:", error)
      setError(error.message || "An error occurred")
    } finally {
      setDeleteLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="container py-10">
        <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>You need to be logged in to access this page.</CardDescription>
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

  const isAdmin = user.email === "admin@example.com" || user.email === "admin@test.com"

  return (
    <div className="container py-10">
      <Button variant="ghost" className="mb-6" onClick={() => router.push("/dashboard")}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Settings
                </CardTitle>
                <CardDescription>Manage your profile information</CardDescription>
              </CardHeader>

              {error && (
                <div className="px-6">
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </div>
              )}

              {success && (
                <div className="px-6">
                  <Alert className="mb-6 bg-green-500/10 text-green-500 border-green-500/20">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                </div>
              )}

              <form onSubmit={handleUpdateProfile}>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user.email} disabled className="bg-secondary/50 border-white/10" />
                    <p className="text-xs text-muted-foreground">Your email address cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-secondary/50 border-white/10"
                    />
                  </div>
                </CardContent>

                <CardFooter>
                  <Button type="submit" className="bg-white text-black hover:bg-gray-200" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card className="gradient-border bg-black/50 backdrop-blur-sm border-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Account Settings
                </CardTitle>
                <CardDescription>Manage your account</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Subscription</h3>
                  <p className="text-muted-foreground mb-4">
                    Current plan: <span className="font-medium text-white">{user.subscription_plan || "Free"}</span>
                  </p>
                  <Button onClick={() => router.push("/subscription")} variant="outline" className="border-white/10">
                    Manage Subscription
                  </Button>
                </div>

                <div className="pt-6 border-t border-white/10">
                  <h3 className="text-lg font-medium mb-2 text-red-500">Danger Zone</h3>
                  <p className="text-muted-foreground mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="delete-confirm">
                        Type <span className="font-medium">{user.email}</span> to confirm
                      </Label>
                      <Input
                        id="delete-confirm"
                        value={deleteConfirm}
                        onChange={(e) => setDeleteConfirm(e.target.value)}
                        className="bg-secondary/50 border-white/10"
                      />
                    </div>

                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirm !== user.email || deleteLoading}
                      className="w-full"
                    >
                      {deleteLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete Account"
                      )}
                    </Button>
                  </div>
                </div>

                {isAdmin && (
                  <div className="pt-6 border-t border-white/10">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Admin Tools
                    </h3>

                    <div className="space-y-6">
                      <RunAllMigrations />
                      <CreateResumeContentsTable />
                      <CreateJobAnalysisTable />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

