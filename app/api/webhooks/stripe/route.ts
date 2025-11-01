import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/db'
import { subscriptions, user } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-10-29.clover' })

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const planType = session.metadata?.planType

        if (!userId) break

        if (planType === 'premium') {
          const [maxId] = await db.select({ max: sql<number>`COALESCE(MAX(id), 0)` }).from(subscriptions)
          const newId = (maxId.max || 0) + 1

          await db.insert(subscriptions).values({
            id: newId,
            userId,
            provider: 'stripe',
            subscriptionId: session.subscription as string,
            productId: 'unlimited_plan',
            status: 'active',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          })
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await db.update(subscriptions)
          .set({
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          })
          .where(eq(subscriptions.subscriptionId, subscription.id))
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await db.update(subscriptions)
          .set({ status: 'canceled' })
          .where(eq(subscriptions.subscriptionId, subscription.id))
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const userId = paymentIntent.metadata?.userId
        const planType = paymentIntent.metadata?.planType

        if (!userId) break

        if (planType === 'credits') {
          await db.update(user)
            .set({ credits: sql`${user.credits} + 250` })
            .where(eq(user.id, userId))
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
