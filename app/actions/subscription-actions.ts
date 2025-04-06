"use server"

import {
  getUserById,
  getSubscriptionPlans,
  getUserUsageForToday,
  checkUserCanPerformAction,
  updateUserSubscription,
  incrementUserUsage,
} from "@/lib/db"
import { createPayPalSubscription } from "@/lib/paypal-service"

// Add the missing createPayPalSubscriptionAction function
export async function createPayPalSubscriptionAction(userId: number, planName: string) {
  try {
    // Get user details
    const user = await getUserById(userId)
    if (!user) {
      return {
        success: false,
        error: "User not found",
      }
    }

    // Get subscription plans
    const plans = await getSubscriptionPlans()
    const plan = plans.find((p) => p.name === planName)
    if (!plan) {
      return {
        success: false,
        error: "Subscription plan not found",
      }
    }

    // Create PayPal subscription
    try {
      const subscription = await createPayPalSubscription(plan.paypal_plan_id, user.email, user.name || user.email)

      // Return the approval URL for the user to complete the subscription
      return {
        success: true,
        subscriptionId: subscription.id,
        approvalUrl: subscription.links.find((link: any) => link.rel === "approve")?.href,
      }
    } catch (error: any) {
      console.error("Error creating PayPal subscription:", error)
      return {
        success: false,
        error: error.message || "Failed to create subscription",
      }
    }
  } catch (error: any) {
    console.error("Error in createPayPalSubscriptionAction:", error)
    return {
      success: false,
      error: "An unexpected error occurred",
    }
  }
}

// Add the missing getSubscriptionPlansAction function
export async function getSubscriptionPlansAction() {
  try {
    const plans = await getSubscriptionPlans()
    return {
      success: true,
      plans,
    }
  } catch (error: any) {
    console.error("Error getting subscription plans:", error)
    return {
      success: false,
      error: error.message || "Failed to load subscription plans",
    }
  }
}

// Update the checkUserActionAllowedAction function to handle errors better
export async function checkUserActionAllowedAction(userId: number, actionType: "interviews" | "results" | "retakes") {
  try {
    // Get user details with better error handling
    let user
    try {
      user = await getUserById(userId)
    } catch (userError) {
      console.error(`Error getting user ${userId}:`, userError)
      // Return default values if user can't be fetched
      return {
        allowed: true,
        plan: "free",
        usage: {
          current: 0,
          limit: 3,
        },
      }
    }

    if (!user) {
      console.warn(`User not found for ID: ${userId} in checkUserActionAllowedAction`)
      return {
        allowed: true,
        plan: "free",
        usage: {
          current: 0,
          limit: 3,
        },
      }
    }

    // Check if user can perform action with better error handling
    let allowed = true
    try {
      allowed = await checkUserCanPerformAction(userId, actionType)
    } catch (actionError) {
      console.error(`Error checking if user ${userId} can perform action ${actionType}:`, actionError)
      // Default to allowing the action if there's an error
      allowed = true
    }

    // Get usage data with better error handling
    let usage = {
      interviews_used: 0,
      results_viewed: 0,
      retakes_done: 0,
    }

    try {
      const usageData = await getUserUsageForToday(userId)
      if (usageData) {
        usage = usageData
      }
    } catch (usageError) {
      console.error(`Error getting usage data for user ${userId}:`, usageError)
      // Continue with default usage values
    }

    // Get plan details with better error handling
    let plan = {
      name: "free",
      features: {
        interviewsPerDay: 3,
        resultsPerDay: 3,
        retakesPerDay: 3,
      },
    }

    try {
      const plans = await getSubscriptionPlans()
      const foundPlan = plans.find((p) => p.name === (user.subscription_plan || "free"))
      if (foundPlan) {
        plan = foundPlan
      }
    } catch (planError) {
      console.error(`Error getting subscription plans for user ${userId}:`, planError)
      // Continue with default plan values
    }

    // Determine limit based on action type with null/undefined checks
    let limit = 3 // Default limit
    if (plan && plan.features) {
      if (actionType === "interviews") {
        if (plan.name === "free") {
          limit = 10
        } else if (plan.name === "pro") {
          limit = 50
        } else if (plan.name === "premium") {
          limit = -1 // Unlimited
        } else {
          limit = plan.features.interviewsPerDay || 3
        }
      } else if (actionType === "results") {
        limit = plan.features.resultsPerDay || 3
      } else if (actionType === "retakes") {
        limit = plan.features.retakesPerDay || 3
      }
    }

    // Determine current usage based on action type with null/undefined checks
    let current = 0
    if (usage) {
      if (actionType === "interviews") {
        current = usage.interviews_used || 0
      } else if (actionType === "results") {
        current = usage.results_viewed || 0
      } else if (actionType === "retakes") {
        current = usage.retakes_done || 0
      }
    }

    return {
      allowed,
      plan: user.subscription_plan || "free",
      usage: {
        current,
        limit: limit === -1 ? "unlimited" : limit,
      },
    }
  } catch (error) {
    console.error("Error checking if user can perform action:", error)
    // Default to allowing the action if there's an error
    return {
      allowed: true,
      error: "Error checking usage limits, defaulting to allowed",
      plan: "free",
      usage: {
        current: 0,
        limit: 3,
      },
    }
  }
}

// Add the missing incrementUserUsageAction function
export async function incrementUserUsageAction(userId: number, actionType: "interviews" | "results" | "retakes") {
  try {
    // Validate inputs
    if (!userId || !actionType) {
      return {
        success: false,
        error: "Missing required parameters",
      }
    }

    // Get user details
    const user = await getUserById(userId)
    if (!user) {
      return {
        success: false,
        error: "User not found",
      }
    }

    // Increment usage
    await incrementUserUsage(userId, actionType)

    return {
      success: true,
    }
  } catch (error: any) {
    console.error(`Error incrementing user ${userId} usage for ${actionType}:`, error)
    return {
      success: false,
      error: error.message || "Failed to increment usage",
    }
  }
}

// Add the missing activateSubscriptionAction function
export async function activateSubscriptionAction(userId: number, subscriptionId: string, planName: string) {
  try {
    // Validate inputs
    if (!userId || !subscriptionId || !planName) {
      return {
        success: false,
        error: "Missing required parameters",
      }
    }

    // Get user details
    const user = await getUserById(userId)
    if (!user) {
      return {
        success: false,
        error: "User not found",
      }
    }

    // Update user subscription
    await updateUserSubscription(userId, {
      plan: planName,
      paypal_subscription_id: subscriptionId,
      status: "active",
      start_date: new Date(),
      end_date: null, // Will be calculated based on billing cycle
    })

    return {
      success: true,
    }
  } catch (error: any) {
    console.error(`Error activating subscription for user ${userId}:`, error)
    return {
      success: false,
      error: error.message || "Failed to activate subscription",
    }
  }
}

