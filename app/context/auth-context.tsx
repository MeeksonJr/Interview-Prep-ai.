"use client"
import { useAuth as useAuthFromProvider } from "@/providers/auth-provider"

// Re-export the useAuth hook from the provider
export const useAuth = useAuthFromProvider

