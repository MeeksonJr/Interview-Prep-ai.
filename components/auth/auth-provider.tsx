"use client"

import { AuthProvider as ActualAuthProvider, useAuth as actualUseAuth } from "@/providers/auth-provider"

// Re-export the AuthProvider component
export const AuthProvider = ActualAuthProvider

// Re-export the useAuth hook
export const useAuth = actualUseAuth

