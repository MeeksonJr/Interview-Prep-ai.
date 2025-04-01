import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth/auth-provider"
import { ErrorBoundary } from "@/components/error-boundary"

// Import the MainNavigation component
import { MainNavigation } from "@/components/main-navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Interview Prep AI",
  description: "AI-powered interview preparation platform",
}

// Update the RootLayout component to include the MainNavigation
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-black text-white min-h-screen`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            <ErrorBoundary>
              <div className="relative min-h-screen">
                {/* Animated background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                  <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-purple-500/10 via-blue-500/5 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-[300px] bg-gradient-to-t from-blue-500/10 to-transparent"></div>
                </div>
                <MainNavigation />
                <div className="pt-16">{children}</div>
              </div>
            </ErrorBoundary>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'