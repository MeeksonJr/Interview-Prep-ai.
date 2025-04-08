// This file should only be imported in server components or server actions
// IMPORTANT: This file should never be imported in client components

/**
 * Safely gets the Gemini API key from environment variables
 * This function should ONLY be called in server contexts
 */
export function getGeminiApiKey(): string {
  // We're checking for both environment variable names to support transition
  return process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
}

