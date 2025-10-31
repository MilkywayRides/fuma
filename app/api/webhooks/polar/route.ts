import { db } from '@/lib/db'
import { subscriptions, user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()
  const event = body.type

  if (event === 'subscription.created' || event === 'subscription.updated') {
    const subscription = body.data
    const userId = subscription.customer_metadata?.userId

    if (!userId) {
      return NextResponse.json({ error: 'No userId in metadata' }, { status: 400 })
    }

    await db.insert(subscriptions).values({
      id: Math.floor(Math.random() * 1_000_000_000),
      userId,
      provider: 'polar',
      subscriptionId: subscription.id,
      productId: subscription.product_id,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start),
      currentPeriodEnd: new Date(subscription.current_period_end),
      emailLimit: 10,
    }).onConflictDoUpdate({
      target: subscriptions.subscriptionId,
      set: {
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end),
      },
    })

    await db.update(user).set({ role: 'SuperAdmin' }).where(eq(user.id, userId))
  }

  if (event === 'subscription.canceled') {
    const subscription = body.data
    await db.update(subscriptions)
      .set({ status: 'canceled', cancelAtPeriodEnd: true })
      .where(eq(subscriptions.subscriptionId, subscription.id))
  }

  return NextResponse.json({ received: true })
}
