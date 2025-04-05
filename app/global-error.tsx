"use client"

import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="container flex items-center justify-center min-h-screen bg-black text-white">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
            <p className="text-red-500 mb-4">{error.message || "An unexpected error occurred. Please try again."}</p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => (window.location.href = "/")}>
                Go Home
              </Button>
              <Button onClick={() => reset()}>Try Again</Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}

