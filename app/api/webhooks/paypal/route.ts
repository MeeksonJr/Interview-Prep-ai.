import { NextResponse } from "next/server"
import PayPalService from "@/lib/paypal-service"
import { updateUserSubscription, getUserByEmail } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const event = await request.json()

    console.log("Received PayPal webhook:", event.event_type)

    // Verify the webhook event
    // In production, you should verify the webhook signature

    // Handle the webhook event
    await PayPalService.handlePayPalWebhook(event)

    // Update user subscription based on the event
    if (event.resource && event.resource.subscriber && event.resource.subscriber.email_address) {
      const userEmail = event.resource.subscriber.email_address
      const user = await getUserByEmail(userEmail)

      if (user) {
        switch (event.event_type) {
          case "BILLING.SUBSCRIPTION.ACTIVATED":
            await updateUserSubscription(user.id, {
              status: "active",
              paypalSubscriptionId: event.resource.id,
              startDate: new Date(),
            })
            break
          case "BILLING.SUBSCRIPTION.CANCELLED":
            await updateUserSubscription(user.id, {
              plan: "free",
              status: "cancelled",
              paypalSubscriptionId: null,
              endDate: new Date(),
            })
            break
          case "BILLING.SUBSCRIPTION.SUSPENDED":
            await updateUserSubscription(user.id, {
              status: "suspended",
            })
            break
          // Add more cases as needed
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Error handling PayPal webhook:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

