"use client"

// Function to get the auth token from local storage
export function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null
  }

  return localStorage.getItem("auth_token")
}

// Function to get the user from local storage
export function getStoredUser(): any | null {
  if (typeof window === "undefined") {
    return null
  }

  const userJson = localStorage.getItem("user")
  if (!userJson) {
    return null
  }

  try {
    return JSON.parse(userJson)
  } catch (error) {
    console.error("Error parsing user from local storage:", error)
    return null
  }
}

// Function to set the auth token and user in local storage
export function setAuthData(token: string, user: any): void {
  if (typeof window === "undefined") {
    return
  }

  localStorage.setItem("auth_token", token)
  localStorage.setItem("user", JSON.stringify(user))
}

// Function to clear the auth data from local storage
export function clearAuthData(): void {
  if (typeof window === "undefined") {
    return
  }

  localStorage.removeItem("auth_token")
  localStorage.removeItem("user")
}

// Function to check if the user is authenticated
export function isAuthenticated(): boolean {
  return !!getAuthToken() && !!getStoredUser()
}

// Function to verify a token with the server
export async function verifyTokenWithServer(token: string): Promise<any> {
  try {
    const response = await fetch("/api/auth/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    })

    const data = await response.json()

    if (!response.ok || !data.authenticated) {
      return null
    }

    return data.user
  } catch (error) {
    console.error("Error verifying token with server:", error)
    return null
  }
}

