// This file should only be imported in server components or server actions
import { SignJWT, jwtVerify } from "jose"

// Secret key for JWT - in production, use an environment variable
const JWT_SECRET = new TextEncoder().encode("interview-prep-ai-secret-key-change-in-production")

// Generate a JWT token
export async function generateToken(payload: any): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET)
}

// Verify a JWT token
export async function verifyToken(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch (error) {
    console.error("Error verifying token:", error)
    return null
  }
}

