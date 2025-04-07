// Remove the "use server" directive from the top of the file
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { pgTable, text, timestamp, serial, boolean, integer, jsonb, varchar } from "drizzle-orm/pg-core"
import bcrypt from "bcryptjs"
// Import the retry utility at the top of the file
import { retryWithBackoff } from "./db-retry"

// Updated connection string
export const connectionString =
  "postgresql://interview-prep-ai_owner:npg_gXVUIB8yYG2R@ep-silent-frost-a51pb9r1.us-east-2.aws.neon.tech/interview-prep-ai?sslmode=require"

// Create a SQL query function with better error handling
const createSqlClient = () => {
  try {
    return neon(connectionString)
  } catch (error) {
    console.error("Error creating SQL client:", error)
    throw new Error("Failed to connect to database")
  }
}

// Initialize the SQL client
const sql = createSqlClient()
const db = drizzle(sql)

// Define schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  // Subscription fields
  subscriptionPlan: varchar("subscription_plan", { length: 50 }).default("free"),
  subscriptionStatus: varchar("subscription_status", { length: 50 }).default("active"),
  subscriptionId: varchar("subscription_id", { length: 255 }),
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  paypalSubscriptionId: varchar("paypal_subscription_id", { length: 255 }),
  paypalCustomerId: varchar("paypal_customer_id", { length: 255 }),
  profileImageUrl: varchar("profile_image_url", { length: 255 }),
})

export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  price: integer("price").notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  interval: varchar("interval", { length: 20 }).default("month"),
  description: text("description"),
  features: jsonb("features"),
  paypalPlanId: varchar("paypal_plan_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
})

export const userUsage = pgTable("user_usage", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").defaultNow(),
  interviewsUsed: integer("interviews_used").default(0),
  resultsViewed: integer("results_viewed").default(0),
  retakesDone: integer("retakes_done").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
})

export const interviews = pgTable("interviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  role: text("role").notNull(),
  type: text("type").notNull(),
  level: text("level").notNull(),
  technologies: text("technologies").array().notNull(),
  questions: jsonb("questions").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  started: boolean("started").default(false),
  completed: boolean("completed").default(false),
  currentQuestionIndex: integer("current_question_index").default(0),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  score: integer("score"),
  title: text("title"),
})

export const sessions = pgTable("sessions", {
  token: varchar("token", { length: 255 }).primaryKey(),
  user_id: integer("user_id").notNull(),
  expires_at: timestamp("expires_at").notNull(),
})

// Replace the checkTablesExist function with this simplified version
async function checkTablesExist() {
  try {
    // First check if tables exist
    const tablesResult = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      ) as users_exist,
      EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'interviews'
      ) as interviews_exist,
      EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'sessions'
      ) as sessions_exist,
      EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'subscription_plans'
      ) as subscription_plans_exist,
      EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_usage'
      ) as user_usage_exist
    `

    if (!tablesResult || tablesResult.length === 0) {
      return false
    }

    const { users_exist, interviews_exist, sessions_exist, subscription_plans_exist, user_usage_exist } =
      tablesResult[0]

    // Check if users table has subscription fields
    if (users_exist) {
      const columnsResult = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      `

      const columnNames = columnsResult.map((col) => col.column_name)
      console.log("Existing user table columns:", columnNames)

      // Check if subscription fields exist
      if (!columnNames.includes("subscription_plan")) {
        console.log("Subscription fields missing, will update users table")
        return false
      }
    }

    return users_exist && interviews_exist && sessions_exist && subscription_plans_exist && user_usage_exist
  } catch (error) {
    console.error("Error checking if tables exist:", error)
    return false
  }
}

// Update the initializeDatabase function to handle existing tables properly
export async function initializeDatabase() {
  try {
    // First, check if tables exist with correct structure
    const tablesExist = await checkTablesExist()

    if (!tablesExist) {
      console.log("Tables don't exist or have incorrect structure, updating...")

      // Check if users table exists but needs updating
      const usersTableExists = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        ) as users_exist
      `

      if (usersTableExists[0].users_exist) {
        // Add subscription fields to users table if they don't exist
        try {
          await sql`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'free',
            ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'active',
            ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(255),
            ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE,
            ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE,
            ADD COLUMN IF NOT EXISTS paypal_subscription_id VARCHAR(255),
            ADD COLUMN IF NOT EXISTS paypal_customer_id VARCHAR(255),
            ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(255)
          `
          console.log("Added subscription fields and profile_image_url to users table")
        } catch (error) {
          console.warn("Error adding fields to users table:", error)
        }
      } else {
        // Create users table if it doesn't exist
        await sql`
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            name VARCHAR(255),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            subscription_plan VARCHAR(50) DEFAULT 'free',
            subscription_status VARCHAR(50) DEFAULT 'active',
            subscription_id VARCHAR(255),
            subscription_start_date TIMESTAMP WITH TIME ZONE,
            subscription_end_date TIMESTAMP WITH TIME ZONE,
            paypal_subscription_id VARCHAR(255),
            paypal_customer_id VARCHAR(255),
            profile_image_url VARCHAR(255)
          )
        `
        console.log("Users table created successfully")
      }

      // Create subscription_plans table if it doesn't exist
      await sql`
        CREATE TABLE IF NOT EXISTS subscription_plans (
          id SERIAL PRIMARY KEY,
          name VARCHAR(50) UNIQUE NOT NULL,
          price INTEGER NOT NULL,
          currency VARCHAR(3) DEFAULT 'USD',
          interval VARCHAR(20) DEFAULT 'month',
          description TEXT,
          features JSONB,
          paypal_plan_id VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE
        )
      `
      console.log("Subscription plans table created successfully")

      // Create user_usage table if it doesn't exist
      await sql`
        CREATE TABLE IF NOT EXISTS user_usage (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          interviews_used INTEGER DEFAULT 0,
          results_viewed INTEGER DEFAULT 0,
          retakes_done INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE
        )
      `
      console.log("User usage table created successfully")

      // Create interviews table if it doesn't exist
      await sql`
        CREATE TABLE IF NOT EXISTS interviews (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          role TEXT NOT NULL,
          type TEXT NOT NULL,
          level TEXT NOT NULL,
          technologies TEXT[] NOT NULL,
          questions JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          started BOOLEAN DEFAULT FALSE,
          completed BOOLEAN DEFAULT FALSE,
          current_question_index INTEGER DEFAULT 0,
          started_at TIMESTAMP WITH TIME ZONE,
          completed_at TIMESTAMP WITH TIME ZONE,
          score INTEGER,
          title TEXT
        )
      `
      console.log("Interviews table created successfully")

      // Create sessions table if it doesn't exist
      await sql`
        CREATE TABLE IF NOT EXISTS sessions (
          token VARCHAR(255) PRIMARY KEY,
          user_id INTEGER NOT NULL,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL
        )
      `
      console.log("Sessions table created successfully")

      // Add foreign key constraints
      try {
        await sql`
          ALTER TABLE interviews 
          ADD CONSTRAINT IF NOT EXISTS interviews_user_id_fkey 
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        `
        console.log("Added foreign key constraint to interviews table")
      } catch (error) {
        console.warn("Could not add foreign key to interviews table:", error)
      }

      try {
        await sql`
          ALTER TABLE sessions
          ADD CONSTRAINT IF NOT EXISTS sessions_user_id_fkey
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        `
        console.log("Added foreign key constraint to sessions table")
      } catch (error) {
        console.warn("Could not add foreign key to sessions table:", error)
      }

      try {
        await sql`
          ALTER TABLE user_usage
          ADD CONSTRAINT IF NOT EXISTS user_usage_user_id_fkey
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        `
        console.log("Added foreign key constraint to user_usage table")
      } catch (error) {
        console.warn("Could not add foreign key to user_usage table:", error)
      }

      // Insert default subscription plans if they don't exist
      try {
        const plansExist = await sql`SELECT COUNT(*) FROM subscription_plans`

        if (plansExist[0].count === "0") {
          await sql`
            INSERT INTO subscription_plans (name, price, description, features)
            VALUES 
              ('free', 0, 'Free plan with limited features', '{"interviewsPerDay": 3, "resultsPerDay": 3, "retakesPerDay": 3}'),
              ('pro', 2000, 'Pro plan with advanced features', '{"interviewsPerDay": 50, "resultsPerDay": 50, "retakesPerDay": 50}'),
              ('premium', 5000, 'Premium plan with unlimited features', '{"interviewsPerDay": -1, "resultsPerDay": -1, "retakesPerDay": -1}')
          `
          console.log("Inserted default subscription plans")
        }
      } catch (error) {
        console.warn("Error inserting default subscription plans:", error)
      }
    } else {
      console.log("Database tables already exist with correct structure")
    }

    console.log("Database schema initialized successfully")
  } catch (error) {
    console.error("Error initializing database schema:", error)
    throw error
  }
}

// Add this function to check and add the profile_image_url column
export async function ensureProfileImageColumn() {
  try {
    // Check if profile_image_url column exists
    const columnExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
        AND column_name = 'profile_image_url'
      ) as exists
    `

    if (!columnExists[0].exists) {
      console.log("Adding profile_image_url column to users table")
      try {
        await sql`
          ALTER TABLE users 
          ADD COLUMN profile_image_url VARCHAR(255)
        `
        console.log("Added profile_image_url column to users table")
      } catch (alterError) {
        // If the column was added by another concurrent request, this might fail
        // Check again to see if it exists now
        const columnExistsRetry = await sql`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'users'
            AND column_name = 'profile_image_url'
          ) as exists
        `

        if (!columnExistsRetry[0].exists) {
          // If it still doesn't exist, rethrow the error
          console.error("Failed to add profile_image_url column:", alterError)
          throw alterError
        } else {
          console.log("profile_image_url column was added by another process")
        }
      }
    }

    return true
  } catch (error) {
    console.error("Error ensuring profile_image_url column:", error)
    return false
  }
}

// User-related database functions
export async function createUser(email: string, password: string, name?: string) {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Use parameterized query with neon
    const result = await sql`
      INSERT INTO users (email, password, name) 
      VALUES (${email}, ${hashedPassword}, ${name || null}) 
      RETURNING id, email, name, created_at, subscription_plan, subscription_status
    `

    if (!result || result.length === 0) {
      throw new Error("Failed to create user")
    }

    // Initialize user usage
    await sql`
      INSERT INTO user_usage (user_id, date)
      VALUES (${result[0].id}, CURRENT_DATE)
    `

    return result[0]
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

export async function getUserByEmail(email: string) {
  try {
    const result = await sql`
      SELECT * FROM users WHERE email = ${email}
    `

    if (!result || result.length === 0) {
      return null
    }

    return result[0]
  } catch (error) {
    console.error("Error getting user by email:", error)
    throw error
  }
}

// Update the getUserById function with retry logic
export async function getUserById(id: number) {
  try {
    // First, ensure the profile_image_url column exists
    await ensureProfileImageColumn()

    // Use the retry mechanism for this query
    return await retryWithBackoff(
      async () => {
        const result = await sql`
          SELECT id, email, name, created_at, subscription_plan, subscription_status, 
          subscription_start_date, subscription_end_date, paypal_subscription_id, profile_image_url
          FROM users WHERE id = ${id}
        `

        return result.length > 0 ? result[0] : null
      },
      {
        maxRetries: 3,
        initialDelay: 300,
        maxDelay: 2000,
        onRetry: (error, attempt) => {
          console.warn(`Retry attempt ${attempt} for getUserById due to: ${error.message}`)
        },
      },
    )
  } catch (error) {
    // If there's an error with the profile_image_url column, try again without it
    if (error.message && error.message.includes("profile_image_url")) {
      console.warn("profile_image_url column not found, querying without it")
      try {
        return await retryWithBackoff(
          async () => {
            const result = await sql`
              SELECT id, email, name, created_at, subscription_plan, subscription_status, 
              subscription_start_date, subscription_end_date, paypal_subscription_id
              FROM users WHERE id = ${id}
            `
            return result.length > 0 ? result[0] : null
          },
          {
            maxRetries: 3,
            initialDelay: 300,
            maxDelay: 2000,
          },
        )
      } catch (fallbackError) {
        console.error("Error getting user by ID (fallback):", fallbackError)
        return null
      }
    }

    console.error("Error getting user by ID:", error)
    return null
  }
}

export async function verifyPassword(user: any, password: string) {
  return bcrypt.compare(password, user.password)
}

// Subscription-related database functions
export async function updateUserSubscription(userId: number, subscriptionData: any) {
  try {
    console.log(`Updating subscription for user ${userId}:`, subscriptionData)

    // Build the SQL update parts
    const updateFields = []
    const values = []
    let index = 1

    if (subscriptionData.plan !== undefined) {
      updateFields.push(`subscription_plan = $${index}`)
      values.push(subscriptionData.plan)
      index++
    }

    if (subscriptionData.status !== undefined) {
      updateFields.push(`subscription_status = $${index}`)
      values.push(subscriptionData.status)
      index++
    }

    if (subscriptionData.subscriptionId !== undefined) {
      updateFields.push(`subscription_id = $${index}`)
      values.push(subscriptionData.subscriptionId)
      index++
    }

    if (subscriptionData.startDate !== undefined) {
      updateFields.push(`subscription_start_date = $${index}`)
      values.push(subscriptionData.startDate)
      index++
    }

    if (subscriptionData.endDate !== undefined) {
      updateFields.push(`subscription_end_date = $${index}`)
      values.push(subscriptionData.endDate)
      index++
    }

    if (subscriptionData.paypalSubscriptionId !== undefined) {
      updateFields.push(`paypal_subscription_id = $${index}`)
      values.push(subscriptionData.paypalSubscriptionId)
      index++
    }

    if (subscriptionData.paypalCustomerId !== undefined) {
      updateFields.push(`paypal_customer_id = $${index}`)
      values.push(subscriptionData.paypalCustomerId)
      index++
    }

    // Add the user ID
    values.push(userId)

    // If no fields to update, return early
    if (updateFields.length === 0) {
      console.log("No subscription fields to update")
      return null
    }

    // Construct and execute the SQL query
    const updateQuery = `
      UPDATE users
      SET ${updateFields.join(", ")}
      WHERE id = $${index}
      RETURNING id, email, name, subscription_plan, subscription_status
    `

    console.log("Executing SQL update:", updateQuery, values)

    const result = await sql.query(updateQuery, values)

    if (!result || result.rows.length === 0) {
      throw new Error("Failed to update user subscription")
    }

    console.log("Subscription updated successfully:", result.rows[0])
    return result.rows[0]
  } catch (error) {
    console.error("Error updating user subscription:", error)
    throw error
  }
}

export async function getSubscriptionPlans() {
  try {
    const result = await sql`
      SELECT * FROM subscription_plans
      ORDER BY price ASC
    `

    // Add the daily interview limit to the plan details
    const plansWithLimits = result.map((plan: any) => {
      let dailyInterviewLimit = 3 // Default for free plan

      if (plan.name === "pro") {
        dailyInterviewLimit = 50
      } else if (plan.name === "premium") {
        dailyInterviewLimit = -1 // Unlimited
      }

      return {
        ...plan,
        dailyInterviewLimit,
      }
    })

    return plansWithLimits
  } catch (error) {
    console.error("Error getting subscription plans:", error)
    throw error
  }
}

// Update the getSubscriptionPlanByName function with retry logic
export async function getSubscriptionPlanByName(name: string) {
  try {
    // Use the retry mechanism for this query with more retries and longer delays
    return await retryWithBackoff(
      async () => {
        try {
          const result = await sql`
            SELECT * FROM subscription_plans
            WHERE name = ${name}
          `

          return result.length > 0 ? result[0] : null
        } catch (innerError) {
          console.error(`Inner error in getSubscriptionPlanByName: ${innerError.message}`)
          // If the inner query fails with a "Too Many Requests" error, throw it so the retry mechanism can catch it
          if (innerError.message && innerError.message.includes("Too Many")) {
            throw innerError
          }
          // For other errors, return a default plan
          return null
        }
      },
      {
        maxRetries: 5, // Increase from 3 to 5
        initialDelay: 500, // Increase from 300 to 500
        maxDelay: 5000, // Increase from 2000 to 5000
        onRetry: (error, attempt) => {
          console.warn(`Retry attempt ${attempt} for getSubscriptionPlanByName due to: ${error.message}`)
        },
      },
    )
  } catch (error) {
    console.error("Error getting subscription plan by name:", error)
    // Return a default free plan if there's an error
    return {
      id: 0,
      name: name || "free",
      price: 0,
      features: {
        interviewsPerDay: 3,
        resultsPerDay: 3,
        retakesPerDay: 3,
      },
    }
  }
}

export async function updateSubscriptionPlan(id: number, planData: any) {
  try {
    const result = await sql`
      UPDATE subscription_plans
      SET 
        price = ${planData.price},
        description = ${planData.description},
        features = ${JSON.stringify(planData.features)},
        paypal_plan_id = ${planData.paypalPlanId || null},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `

    if (!result || result.length === 0) {
      throw new Error("Failed to update subscription plan")
    }

    return result[0]
  } catch (error) {
    console.error("Error updating subscription plan:", error)
    throw error
  }
}

// Add this function to the existing db.ts file
export async function updateSubscriptionPlanInDb(planId: number, updateData: any) {
  try {
    // Create SQL update statement parts
    const updateParts = []

    if (updateData.paypal_plan_id !== undefined) {
      updateParts.push(`paypal_plan_id = '${updateData.paypal_plan_id}'`)
    }

    if (updateData.price !== undefined) {
      updateParts.push(`price = ${updateData.price}`)
    }

    if (updateData.description !== undefined) {
      updateParts.push(`description = '${updateData.description}'`)
    }

    if (updateData.features !== undefined) {
      updateParts.push(`features = '${JSON.stringify(updateData.features)}'`)
    }

    // Add updated_at timestamp
    updateParts.push(`updated_at = CURRENT_TIMESTAMP`)

    // If no updates, return early
    if (updateParts.length === 0) {
      console.log("No fields to update")
      return null
    }

    // Use the neon SQL template literal syntax with unsafe
    const updateStatement = updateParts.join(", ")
    const result = await sql`
      UPDATE subscription_plans
      SET ${sql.unsafe(updateStatement)}
      WHERE id = ${planId}
      RETURNING *
    `

    if (!result || result.length === 0) {
      throw new Error("Failed to update subscription plan")
    }

    return result[0]
  } catch (error) {
    console.error("Error updating subscription plan in database:", error)
    throw error
  }
}

// Update the getUserUsageForToday function with retry logic
export async function getUserUsageForToday(userId: number) {
  try {
    // Use the retry mechanism for this query
    return await retryWithBackoff(
      async () => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const result = await sql`
          SELECT * FROM user_usage
          WHERE user_id = ${userId}
          AND date >= ${today}
          ORDER BY date DESC
          LIMIT 1
        `

        if (!result || result.length === 0) {
          // Create a new usage record for today
          const newUsage = await sql`
            INSERT INTO user_usage (user_id, date)
            VALUES (${userId}, CURRENT_DATE)
            RETURNING *
          `
          return newUsage[0]
        }

        return result[0]
      },
      {
        maxRetries: 3,
        initialDelay: 300,
        maxDelay: 2000,
        onRetry: (error, attempt) => {
          console.warn(`Retry attempt ${attempt} for getUserUsageForToday due to: ${error.message}`)
        },
      },
    )
  } catch (error) {
    console.error("Error getting user usage for today:", error)
    // Return a default object instead of throwing an error
    // This allows the application to continue even if there's a database error
    return {
      id: 0,
      user_id: userId,
      date: new Date(),
      interviews_used: 0,
      results_viewed: 0,
      retakes_done: 0,
      created_at: new Date(),
      updated_at: new Date(),
    }
  }
}

export async function incrementUserUsage(userId: number, usageType: "interviews" | "results" | "retakes") {
  try {
    // Get today's usage record or create one if it doesn't exist
    const usage = await getUserUsageForToday(userId)

    if (!usage) {
      console.error("Could not find or create usage record for today")
      return null
    }

    // Determine which field to update based on usage type
    let updateField
    if (usageType === "interviews") {
      updateField = "interviews_used = interviews_used + 1"
    } else if (usageType === "results") {
      updateField = "results_viewed = results_viewed + 1"
    } else if (usageType === "retakes") {
      updateField = "retakes_done = retakes_done + 1"
    } else {
      throw new Error(`Invalid usage type: ${usageType}`)
    }

    // Use direct SQL query with better error handling
    try {
      const result = await sql`
        UPDATE user_usage
        SET ${sql.unsafe(updateField)}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${usage.id}
        RETURNING *
      `

      if (!result || result.length === 0) {
        throw new Error("No rows updated")
      }

      return result[0]
    } catch (sqlError) {
      console.error("SQL error in incrementUserUsage:", sqlError)

      // Fallback approach - try a different query format
      try {
        console.log("Trying fallback update approach...")
        let fallbackQuery

        if (usageType === "interviews") {
          fallbackQuery = sql`
            UPDATE user_usage
            SET interviews_used = interviews_used + 1, updated_at = CURRENT_TIMESTAMP
            WHERE id = ${usage.id}
            RETURNING *
          `
        } else if (usageType === "results") {
          fallbackQuery = sql`
            UPDATE user_usage
            SET results_viewed = results_viewed + 1, updated_at = CURRENT_TIMESTAMP
            WHERE id = ${usage.id}
            RETURNING *
          `
        } else if (usageType === "retakes") {
          fallbackQuery = sql`
            UPDATE user_usage
            SET retakes_done = retakes_done + 1, updated_at = CURRENT_TIMESTAMP
            WHERE id = ${usage.id}
            RETURNING *
          `
        }

        const fallbackResult = await fallbackQuery

        if (!fallbackResult || fallbackResult.length === 0) {
          throw new Error("No rows updated in fallback query")
        }

        return fallbackResult[0]
      } catch (fallbackError) {
        console.error("Fallback query also failed:", fallbackError)
        throw new Error("Failed to increment user usage after multiple attempts")
      }
    }
  } catch (error) {
    console.error("Error incrementing user usage:", error)
    // Return a default object instead of throwing an error
    // This allows the application to continue even if usage tracking fails
    return {
      id: 0,
      user_id: userId,
      date: new Date(),
      interviews_used: 0,
      results_viewed: 0,
      retakes_done: 0,
      created_at: new Date(),
      updated_at: new Date(),
    }
  }
}

export async function checkUserCanPerformAction(userId: number, actionType: "interviews" | "results" | "retakes") {
  try {
    // Get user's subscription plan
    const user = await getUserById(userId)
    if (!user) {
      console.warn(`User not found for ID: ${userId}, defaulting to free plan limits`)
      // Default to free plan limits if user not found
      return true
    }

    // Get plan limits with better error handling
    let plan
    try {
      plan = await getSubscriptionPlanByName(user.subscription_plan || "free")
    } catch (planError) {
      console.error(`Error getting subscription plan for ${user.subscription_plan}:`, planError)
      // Default to free plan if there's an error
      plan = {
        name: "free",
        features: {
          interviewsPerDay: 3,
          resultsPerDay: 3,
          retakesPerDay: 3,
        },
      }
    }

    // If plan is null, use a default free plan
    if (!plan) {
      console.warn(`Plan not found for: ${user.subscription_plan}, defaulting to free plan`)
      plan = {
        name: "free",
        features: {
          interviewsPerDay: 3,
          resultsPerDay: 3,
          retakesPerDay: 3,
        },
      }
    }

    // If premium plan with unlimited usage
    if (plan.name === "premium") {
      return true
    }

    // Get today's usage with better error handling
    let usage
    try {
      usage = await getUserUsageForToday(userId)
    } catch (usageError) {
      console.error(`Error getting usage for user ${userId}:`, usageError)
      // Default to empty usage if there's an error
      usage = {
        interviews_used: 0,
        results_viewed: 0,
        retakes_done: 0,
      }
    }

    // If usage is null, use default empty usage
    if (!usage) {
      console.warn(`Usage not found for user ID: ${userId}, defaulting to empty usage`)
      usage = {
        interviews_used: 0,
        results_viewed: 0,
        retakes_done: 0,
      }
    }

    // Check against limits with null/undefined checks
    const features = plan.features || { interviewsPerDay: 3, resultsPerDay: 3, retakesPerDay: 3 }
    let currentUsage = 0
    let limit = 3 // Default to 3 if not specified

    if (actionType === "interviews") {
      currentUsage = usage.interviews_used || 0
      limit = features.interviewsPerDay || 3
    } else if (actionType === "results") {
      currentUsage = usage.results_viewed || 0
      limit = features.resultsPerDay || 3
    } else if (actionType === "retakes") {
      currentUsage = usage.retakes_done || 0
      limit = features.retakesPerDay || 3
    }

    // -1 means unlimited
    if (limit === -1) {
      return true
    }

    return currentUsage < limit
  } catch (error) {
    console.error("Error checking if user can perform action:", error)
    // Default to allowing the action if there's an error
    // This ensures users can still use the app even if there are database issues
    return true
  }
}

// Interview-related database functions
export async function createInterview(interviewData: any) {
  try {
    const { userId, role, type, level, technologies, questions } = interviewData

    // Check if user can create a new interview
    const canCreate = await checkUserCanPerformAction(userId, "interviews")
    if (!canCreate) {
      throw new Error("You have reached your daily limit for creating interviews. Upgrade your plan for more.")
    }

    const result = await sql`
      INSERT INTO interviews 
        (user_id, role, type, level, technologies, questions) 
      VALUES (${userId}, ${role}, ${type}, ${level}, ${technologies}, ${JSON.stringify(questions)}) 
      RETURNING *
    `

    // Increment usage counter
    await incrementUserUsage(userId, "interviews")

    return { ...result[0], id: result[0].id.toString() }
  } catch (error) {
    console.error("Error creating interview:", error)
    throw error
  }
}

// Update the getInterviewById function with retry logic
export async function getInterviewById(id: string, userId: number) {
  try {
    // Use the retry mechanism for this query
    return await retryWithBackoff(
      async () => {
        const result = await sql`
          SELECT * FROM interviews WHERE id = ${id} AND user_id = ${userId}
        `

        if (result.length === 0) {
          return null
        }

        // Convert the row to match our expected format
        const interview = result[0]
        return {
          ...interview,
          id: interview.id.toString(),
          userId: interview.user_id,
          currentQuestionIndex: interview.current_question_index,
          startedAt: interview.started_at,
          completedAt: interview.completed_at,
          questions: interview.questions,
        }
      },
      {
        maxRetries: 3,
        initialDelay: 300,
        maxDelay: 2000,
        onRetry: (error, attempt) => {
          console.warn(`Retry attempt ${attempt} for getInterviewById due to: ${error.message}`)
        },
      },
    )
  } catch (error) {
    console.error("Error getting interview:", error)
    return null
  }
}

export async function updateInterview(id: string, userId: number, updateData: any) {
  try {
    console.log(`[SERVER] Updating interview: ID=${id}, UserID=${userId}, Data:`, JSON.stringify(updateData))

    // First, verify the interview exists for this user
    const existingInterview = await sql`
     SELECT * FROM interviews WHERE id = ${id} AND user_id = ${userId}
   `

    console.log(`[SERVER] Existing interview check result:`, existingInterview)

    if (!existingInterview || existingInterview.length === 0) {
      console.log(`[SERVER] Interview not found: ID=${id}, UserID=${userId}`)
      throw new Error("Interview not found or user not authorized")
    }

    // Use a simpler approach with individual updates
    let updatedInterview = existingInterview[0]

    try {
      // Update questions if provided
      if (updateData.questions !== undefined) {
        const questionsResult = await sql`
         UPDATE interviews 
         SET questions = ${JSON.stringify(updateData.questions)}
         WHERE id = ${id} AND user_id = ${userId}
         RETURNING *
       `
        if (questionsResult && questionsResult.length > 0) {
          updatedInterview = questionsResult[0]
        }
      }

      // Update current question index if provided
      if (updateData.currentQuestionIndex !== undefined) {
        const indexResult = await sql`
         UPDATE interviews 
         SET current_question_index = ${updateData.currentQuestionIndex}
         WHERE id = ${id} AND user_id = ${userId}
         RETURNING *
       `
        if (indexResult && indexResult.length > 0) {
          updatedInterview = indexResult[0]
        }
      }

      // Update started flag if provided
      if (updateData.started !== undefined) {
        const startedResult = await sql`
         UPDATE interviews 
         SET started = ${updateData.started}
         WHERE id = ${id} AND user_id = ${userId}
         RETURNING *
       `
        if (startedResult && startedResult.length > 0) {
          updatedInterview = startedResult[0]
        }
      }

      // Update completed flag if provided
      if (updateData.completed !== undefined) {
        const completedResult = await sql`
         UPDATE interviews 
         SET completed = ${updateData.completed}
         WHERE id = ${id} AND user_id = ${userId}
         RETURNING *
       `
        if (completedResult && completedResult.length > 0) {
          updatedInterview = completedResult[0]
        }
      }

      // Update started_at if provided
      if (updateData.startedAt !== undefined) {
        const startedAtResult = await sql`
         UPDATE interviews 
         SET started_at = NOW()
         WHERE id = ${id} AND user_id = ${userId}
         RETURNING *
       `
        if (startedAtResult && startedAtResult.length > 0) {
          updatedInterview = startedAtResult[0]
        }
      }

      // Update completed_at if provided
      if (updateData.completedAt !== undefined) {
        const completedAtResult = await sql`
         UPDATE interviews 
         SET completed_at = NOW()
         WHERE id = ${id} AND user_id = ${userId}
         RETURNING *
       `
        if (completedAtResult && completedAtResult.length > 0) {
          updatedInterview = completedAtResult[0]
        }
      }

      // Update score if provided
      if (updateData.score !== undefined) {
        const scoreResult = await sql`
         UPDATE interviews 
         SET score = ${updateData.score}
         WHERE id = ${id} AND user_id = ${userId}
         RETURNING *
       `
        if (scoreResult && scoreResult.length > 0) {
          updatedInterview = scoreResult[0]
        }
      }
    } catch (dbError) {
      console.error("Database operation failed:", dbError)
      throw new Error(`Database operation failed: ${dbError.message}`)
    }

    // Convert the row to match our expected format
    return {
      ...updatedInterview,
      id: updatedInterview.id.toString(),
      userId: updatedInterview.user_id,
      currentQuestionIndex: updatedInterview.current_question_index,
      startedAt: updatedInterview.started_at,
      completedAt: updatedInterview.completed_at,
      questions: updatedInterview.questions,
    }
  } catch (error) {
    console.error("Error updating interview:", error)
    throw error
  }
}

// Update the getUserInterviews function with retry logic and better error handling
export async function getUserInterviews(userId: number) {
  try {
    // Use the retry mechanism for this query
    return await retryWithBackoff(
      async () => {
        const result = await sql`
          SELECT * FROM interviews WHERE user_id = ${userId} ORDER BY created_at DESC
        `

        // Convert the rows to match our expected format
        return result.map((interview) => ({
          ...interview,
          id: interview.id.toString(),
          userId: interview.user_id,
          currentQuestionIndex: interview.current_question_index,
          startedAt: interview.started_at,
          completedAt: interview.completed_at,
          questions: interview.questions,
        }))
      },
      {
        maxRetries: 3,
        initialDelay: 300,
        maxDelay: 2000,
        onRetry: (error, attempt) => {
          console.warn(`Retry attempt ${attempt} for getUserInterviews due to: ${error.message}`)
        },
      },
    )
  } catch (error) {
    console.error("Error getting user interviews:", error)
    // Return an empty array instead of throwing an error
    // This allows the UI to still render even if there's a database error
    return []
  }
}

export async function getSessionByToken(token: string) {
  try {
    const result = await sql`
      SELECT * FROM sessions WHERE token = ${token}
    `

    if (!result || result.length === 0) {
      return null
    }

    return result[0]
  } catch (error) {
    console.error("Error getting session by token:", error)
    throw error
  }
}

// Add these functions to the existing db.ts file

export async function updateUser(id: number, userData: any) {
  try {
    console.log(`Updating user ${id} with data:`, userData)

    // Use a simpler approach with template literals
    if (userData.name !== undefined) {
      const result = await sql`
        UPDATE users
        SET name = ${userData.name}
        WHERE id = ${id}
        RETURNING id, email, name
      `

      if (result && result.length > 0) {
        console.log("User updated successfully:", result[0])
        return result[0]
      }
    }

    throw new Error("No fields to update or update failed")
  } catch (error) {
    console.error("Error updating user:", error)
    throw error
  }
}

export async function deleteUser(id: number) {
  try {
    console.log(`Deleting user ${id}`)

    // Delete user from database
    const result = await sql`
      DELETE FROM users
      WHERE id = ${id}
      RETURNING id
    `

    if (!result || result.length === 0) {
      throw new Error("Failed to delete user")
    }

    console.log("User deleted successfully:", result[0])
    return result[0]
  } catch (error) {
    console.error("Error deleting user:", error)
    throw error
  }
}

// Initialize the database on server start
initializeDatabase()
  .then(() => ensureProfileImageColumn())
  .then(() => import("./db-migration").then((module) => module.runMigrations()))
  .catch(console.error)

export { db, sql }

