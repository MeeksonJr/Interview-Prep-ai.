// This file contains functions for interacting with the PayPal API

// PayPal API credentials
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ""
const PAYPAL_CLIENT_SECRET = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_SECRET || ""
const PAYPAL_API_BASE = process.env.NEXT_PUBLIC_PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com" // Use sandbox for testing, later chnage to live api base after paypal verification

// Function to get an access token from PayPal
async function getPayPalAccessToken() {
  try {
    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
    })

    if (!response.ok) {
      const errorText = await response.text()
      try {
        // Try to parse as JSON
        const errorData = JSON.parse(errorText)
        throw new Error(`PayPal API error: ${errorData.error_description || "Failed to get access token"}`)
      } catch (parseError) {
        // If not JSON, use the text
        throw new Error(`PayPal API error: ${errorText.substring(0, 100)}...`)
      }
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error("Error getting PayPal access token:", error)
    throw error
  }
}

// Function to create a product in PayPal
export async function createPayPalProduct(name: string, description: string) {
  try {
    const accessToken = await getPayPalAccessToken()

    const response = await fetch(`${PAYPAL_API_BASE}/v1/catalogs/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name,
        description,
        type: "SERVICE",
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      try {
        // Try to parse as JSON
        const errorData = JSON.parse(errorText)
        throw new Error(`PayPal API error: ${errorData.message || "Failed to create product"}`)
      } catch (parseError) {
        // If not JSON, use the text
        throw new Error(`PayPal API error: ${errorText.substring(0, 100)}...`)
      }
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating PayPal product:", error)
    throw error
  }
}

// Function to create a plan in PayPal
export async function createPayPalPlan(
  productId: string,
  name: string,
  description: string,
  price: number,
  interval = "MONTH",
) {
  try {
    const accessToken = await getPayPalAccessToken()

    const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/plans`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        product_id: productId,
        name,
        description,
        billing_cycles: [
          {
            frequency: {
              interval_unit: interval,
              interval_count: 1,
            },
            tenure_type: "REGULAR",
            sequence: 1,
            total_cycles: 0, // Infinite
            pricing_scheme: {
              fixed_price: {
                value: (price / 100).toFixed(2), // Convert cents to dollars
                currency_code: "USD",
              },
            },
          },
        ],
        payment_preferences: {
          auto_bill_outstanding: true,
          setup_fee: {
            value: "0",
            currency_code: "USD",
          },
          setup_fee_failure_action: "CONTINUE",
          payment_failure_threshold: 3,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      try {
        // Try to parse as JSON
        const errorData = JSON.parse(errorText)
        throw new Error(`PayPal API error: ${errorData.message || "Failed to create plan"}`)
      } catch (parseError) {
        // If not JSON, use the text
        throw new Error(`PayPal API error: ${errorText.substring(0, 100)}...`)
      }
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating PayPal plan:", error)
    throw error
  }
}

// Function to create a subscription in PayPal
export async function createPayPalSubscription(planId: string, userEmail: string, userName: string) {
  try {
    const accessToken = await getPayPalAccessToken()

    // Make sure we have a valid plan ID
    if (!planId) {
      throw new Error("No valid plan ID provided")
    }

    const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        plan_id: planId,
        subscriber: {
          name: {
            given_name: userName.split(" ")[0] || "",
            surname: userName.split(" ").slice(1).join(" ") || "",
          },
          email_address: userEmail,
        },
        application_context: {
          brand_name: "Interview Prep AI",
          locale: "en-US",
          shipping_preference: "NO_SHIPPING",
          user_action: "SUBSCRIBE_NOW",
          payment_method: {
            payer_selected: "PAYPAL",
            payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED",
          },
          return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/subscription/success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/subscription/cancel`,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      try {
        // Try to parse as JSON
        const errorData = JSON.parse(errorText)
        throw new Error(`PayPal API error: ${errorData.message || "Failed to create subscription"}`)
      } catch (parseError) {
        // If not JSON, use the text
        throw new Error(`PayPal API error: ${errorText.substring(0, 100)}...`)
      }
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating PayPal subscription:", error)
    throw error
  }
}

// Function to get subscription details
export async function getPayPalSubscription(subscriptionId: string) {
  try {
    const accessToken = await getPayPalAccessToken()

    const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      try {
        // Try to parse as JSON
        const errorData = JSON.parse(errorText)
        throw new Error(`PayPal API error: ${errorData.message || "Failed to get subscription"}`)
      } catch (parseError) {
        // If not JSON, use the text
        throw new Error(`PayPal API error: ${errorText.substring(0, 100)}...`)
      }
    }

    return await response.json()
  } catch (error) {
    console.error("Error getting PayPal subscription:", error)
    throw error
  }
}

// Function to cancel a subscription
export async function cancelPayPalSubscription(subscriptionId: string, reason = "Not needed anymore") {
  try {
    const accessToken = await getPayPalAccessToken()

    const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        reason,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      try {
        // Try to parse as JSON
        const errorData = JSON.parse(errorText)
        throw new Error(`PayPal API error: ${errorData.message || "Failed to cancel subscription"}`)
      } catch (parseError) {
        // If not JSON, use the text
        throw new Error(`PayPal API error: ${errorText.substring(0, 100)}...`)
      }
    }

    return true
  } catch (error) {
    console.error("Error canceling PayPal subscription:", error)
    throw error
  }
}

// Function to handle PayPal webhook events
export async function handlePayPalWebhook(event: any) {
  try {
    const eventType = event.event_type

    switch (eventType) {
      case "BILLING.SUBSCRIPTION.CREATED":
        // Handle subscription created
        console.log("Subscription created:", event.resource)
        break
      case "BILLING.SUBSCRIPTION.ACTIVATED":
        // Handle subscription activated
        console.log("Subscription activated:", event.resource)
        break
      case "BILLING.SUBSCRIPTION.UPDATED":
        // Handle subscription updated
        console.log("Subscription updated:", event.resource)
        break
      case "BILLING.SUBSCRIPTION.CANCELLED":
        // Handle subscription cancelled
        console.log("Subscription cancelled:", event.resource)
        break
      case "BILLING.SUBSCRIPTION.SUSPENDED":
        // Handle subscription suspended
        console.log("Subscription suspended:", event.resource)
        break
      case "BILLING.SUBSCRIPTION.PAYMENT.FAILED":
        // Handle payment failed
        console.log("Subscription payment failed:", event.resource)
        break
      default:
        console.log("Unhandled webhook event:", eventType)
    }

    return true
  } catch (error) {
    console.error("Error handling PayPal webhook:", error)
    throw error
  }
}

export default {
  createPayPalProduct,
  createPayPalPlan,
  createPayPalSubscription,
  getPayPalSubscription,
  cancelPayPalSubscription,
  handlePayPalWebhook,
}

