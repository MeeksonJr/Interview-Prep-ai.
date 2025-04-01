"use server"

import { getGeminiApiKey } from "@/lib/server-utils"

export async function checkGeminiApiConfigured(): Promise<boolean> {
  const apiKey = getGeminiApiKey()
  return apiKey.length > 0
}

