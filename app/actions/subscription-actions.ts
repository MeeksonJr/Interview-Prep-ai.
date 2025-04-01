"use server"

import {
  getUserById,
  getSubscriptionPlans,
  updateSubscriptionPlanInDb,
  updateUserSubscription,
  getUserUsageForToday,
  checkUserCanPerformAction,
  incrementUserUsage,
} from "@/lib/db"
import PayPalService from "@/lib/paypal-service"

// Get subscription plans
export async function getSubscriptionPlansAction() {
  try {
    const plans = await getSubscriptionPlans()
    return { success: true, plans }
  } catch (error: any) {
    console.error("Error getting subscription plans:", error)
    return { success: false, error: error.message }
  }
}

// Create a PayPal subscription
export async function createPayPalSubscriptionAction(userId: number, planName: string) {
  try {
    console.log(`Creating PayPal subscription for user ${userId} with plan ${planName}`)

    // Get user details
    const user = await getUserById(userId)
    if (!user) {
      return { success: false, error: "User not found" }
    }

    // Get subscription plan details
    const plans = await getSubscriptionPlans()
    const plan = plans.find((p) => p.name === planName)

    if (!plan) {
      return { success: false, error: "Subscription plan not found" }
    }

    // Check if plan already has a PayPal plan ID
    let paypalPlanId = plan.paypal_plan_id

    if (!paypalPlanId) {
      try {
        console.log("No PayPal plan ID found, creating new PayPal product and plan")

        // Create a product in PayPal
        const product = await PayPalService.createPayPalProduct(
          `Interview Prep AI ${plan.name.charAt(0).toUpperCase() + plan.name.slice(1)} Plan`,
          plan.description || `Interview Prep AI ${plan.name} subscription plan`,
        )

        console.log("Created PayPal product:", product.id)

        // Create a plan in PayPal
        const paypalPlan = await PayPalService.createPayPalPlan(
          product.id,
          `${plan.name.charAt(0).toUpperCase() + plan.name.slice(1)} Plan`,
          plan.description || `Interview Prep AI ${plan.name} subscription plan`,
          plan.price,
          plan.interval.toUpperCase(),
        )

        console.log("Created PayPal plan:", paypalPlan.id)

        paypalPlanId = paypalPlan.id

        // Update the plan in our database with the PayPal plan ID
        try {
          await updateSubscriptionPlanInDb(plan.id, {
            paypal_plan_id: paypalPlanId,
          })
          console.log("Updated subscription plan with PayPal plan ID:", paypalPlanId)
        } catch (dbError) {
          console.error("Failed to update subscription plan in database:", dbError)
          // Continue anyway - we'll use the PayPal plan ID we just created
        }
      } catch (paypalError) {
        console.error("PayPal API error:", paypalError)
        return {
          success: false,
          error: "Failed to create PayPal plan. Please try again later or contact support.",
        }
      }
    }

    // Create a subscription in PayPal
    try {
      // If we still don't have a plan ID, return an error
      if (!paypalPlanId) {
        console.log("No PayPal plan ID available, cannot create subscription")
        return {
          success: false,
          error: "Unable to create subscription plan. Please try again later or contact support.",
        }
      }

      console.log("Creating PayPal subscription with plan ID:", paypalPlanId)

      const subscription = await PayPalService.createPayPalSubscription(
        paypalPlanId,
        user.email,
        user.name || user.email,
      )

      console.log("Created PayPal subscription:", subscription.id)

      // Return the approval URL for the user to complete the subscription
      const approvalLink = subscription.links?.find((link: any) => link.rel === "approve")

      if (!approvalLink || !approvalLink.href) {
        throw new Error("No approval URL found in PayPal response")
      }

      // Add the plan name to the return URL so we know which plan to activate
      const approvalUrl = new URL(approvalLink.href)
      approvalUrl.searchParams.append("plan", planName)

      console.log("Returning approval URL:", approvalUrl.toString())

      return {
        success: true,
        approvalUrl: approvalUrl.toString(),
        subscriptionId: subscription.id,
      }
    } catch (subscriptionError) {
      console.error("PayPal subscription creation error:", subscriptionError)
      return {
        success: false,
        error: "Failed to create subscription. Please try again later or contact support.",
      }
    }
  } catch (error: any) {
    console.error("Error creating PayPal subscription:", error)
    return { success: false, error: error.message }
  }
}

// Activate a subscription after PayPal approval
export async function activateSubscriptionAction(userId: number, subscriptionId: string, planName: string) {
  try {
    console.log(`Activating subscription for user ${userId}: ${subscriptionId}, plan: ${planName}`)

    // Get user details
    const user = await getUserById(userId)
    if (!user) {
      console.error("User not found:", userId)
      return { success: false, error: "User not found" }
    }

    // Get subscription details from PayPal
    try {
      const subscription = await PayPalService.getPayPalSubscription(subscriptionId)
      console.log("PayPal subscription details:", {
        id: subscription.id,
        status: subscription.status,
      })
    } catch (paypalError) {
      console.error("Error getting PayPal subscription details:", paypalError)
      // Continue anyway - we'll update the subscription in our database
    }

    // Default to "pro" if planName is not provided
    const finalPlanName = planName || "pro"

    // Update user subscription in database
    console.log(`Updating user ${userId} subscription to ${finalPlanName}`)

    const updateResult = await updateUserSubscription(userId, {
      plan: finalPlanName,
      status: "active",
      paypalSubscriptionId: subscriptionId,
      startDate: new Date(),
    })

    console.log("Subscription update result:", updateResult)

    return { success: true }
  } catch (error: any) {
    console.error("Error activating subscription:", error)
    return { success: false, error: error.message }
  }
}

// Check if user can perform an action based on their subscription
export async function checkUserActionAllowedAction(userId: number, actionType: "interviews" | "results" | "retakes") {
  try {
    // Get user details
    const user = await getUserById(userId)
    if (!user) {
      return { allowed: false, error: "User not found" }
    }

    // Check if user can perform action
    const allowed = await checkUserCanPerformAction(userId, actionType)

    // Get usage data
    const usage = await getUserUsageForToday(userId)

    // Get plan details
    const plan = await getSubscriptionPlans().then((plans) =>
      plans.find((p) => p.name === (user.subscription_plan || "free")),
    )

    // Determine limit based on action type
    let limit = 3 // Default limit
    if (plan && plan.features) {
      if (actionType === "interviews") {
        limit = plan.features.interviewsPerDay
      } else if (actionType === "results") {
        limit = plan.features.resultsPerDay
      } else if (actionType === "retakes") {
        limit = plan.features.retakesPerDay
      }
    }

    // Determine current usage based on action type
    let current = 0
    if (usage) {
      if (actionType === "interviews") {
        current = usage.interviews_used
      } else if (actionType === "results") {
        current = usage.results_viewed
      } else if (actionType === "retakes") {
        current = usage.retakes_done
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
  } catch (error: any) {
    console.error("Error checking if user can perform action:", error)
    return { allowed: true, error: error.message }
  }
}

// Increment user usage
export async function incrementUserUsageAction(userId: number, usageType: "interviews" | "results" | "retakes") {
  try {
    const result = await incrementUserUsage(userId, usageType)
    return { success: true, result }
  } catch (error: any) {
    console.error("Error incrementing user usage:", error)
    return { success: false, error: error.message }
  }
}

