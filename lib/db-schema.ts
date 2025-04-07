import { pgTable, text, timestamp, serial, boolean, integer, jsonb, varchar, primaryKey } from "drizzle-orm/pg-core"

// Existing tables
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
  // New fields for interview limits
  dailyInterviewLimit: integer("daily_interview_limit").default(3), // Default to 3 for free
  interviewsUsedToday: integer("interviews_used_today").default(0),
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
  // New fields for community features
  isPublic: boolean("is_public").default(false), // Changed default to false
  viewCount: integer("view_count").default(0),
  likeCount: integer("like_count").default(0),
  // Field for job description based interviews
  jobDescription: text("job_description"),
  // Add responses field to store user responses
  responses: jsonb("responses"),
  // Add feedback field to store AI feedback
  feedback: jsonb("feedback"),
})

// New tables for community features
export const interviewLikes = pgTable(
  "interview_likes",
  {
    userId: integer("user_id").notNull(),
    interviewId: integer("interview_id").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.userId, table.interviewId] }),
    }
  },
)

export const savedInterviews = pgTable("saved_interviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  interviewId: integer("interview_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
})

// New table for community interviews
export const communityInterviews = pgTable("community_interviews", {
  id: serial("id").primaryKey(),
  interviewId: integer("interview_id").notNull(),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  // Additional metadata for community display
  title: text("title"),
  description: text("description"),
  tags: text("tags").array(),
})

export const jobDescriptions = pgTable("job_descriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  description: text("description").notNull(),
  title: text("title"),
  company: text("company"),
  createdAt: timestamp("created_at").defaultNow(),
  interviewId: integer("interview_id"),
})

