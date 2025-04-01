import { neon } from "@neondatabase/serverless"

// Maximum number of retry attempts
const MAX_RETRIES = 3
// Delay between retries in milliseconds (starts at 1s, then 2s, then 4s with exponential backoff)
const INITIAL_RETRY_DELAY = 1000

/**
 * Execute a database query with retry logic
 * @param connectionString The database connection string
 * @param queryFn The query function to execute
 * @param retries The number of retries (default: MAX_RETRIES)
 * @param delay The delay between retries in milliseconds (default: INITIAL_RETRY_DELAY)
 * @returns The result of the query
 */
export async function executeWithRetry<T>(
  connectionString: string,
  queryFn: (sql: any) => Promise<T>,
  retries = MAX_RETRIES,
  delay = INITIAL_RETRY_DELAY,
): Promise<T> {
  try {
    // Create a new SQL client for this operation
    const sql = neon(connectionString)

    // Execute the query
    return await queryFn(sql)
  } catch (error) {
    // If we have retries left, try again after a delay
    if (retries > 0) {
      console.log(`Database operation failed, retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`)

      // Wait for the specified delay
      await new Promise((resolve) => setTimeout(resolve, delay))

      // Retry with exponential backoff (double the delay each time)
      return executeWithRetry(connectionString, queryFn, retries - 1, delay * 2)
    }

    // If we're out of retries, throw the error
    console.error("Database operation failed after maximum retries:", error)
    throw error
  }
}

