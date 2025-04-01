"use client"
import { useRouter } from "next/navigation"

/**
 * A utility hook to force a hard refresh of the page
 * This can be useful when client-side navigation isn't updating properly
 */
export function useForceRefresh() {
  const router = useRouter()

  const forceRefresh = () => {
    window.location.reload()
  }

  return forceRefresh
}

/**
 * A utility function to force a redirect with a hard navigation
 * This bypasses Next.js client-side navigation when needed
 */
export function forceRedirect(path: string) {
  window.location.href = path
}

