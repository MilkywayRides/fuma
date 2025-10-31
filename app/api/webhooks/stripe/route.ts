import { db } from '@/lib/db'
import { subscriptions, user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()
  const event = body.type

  if (event === 'checkout.session.completed') {
    const session = body.data.object
    const userId = session.metadata?.userId

    if (!userId) {
      return NextResponse.json({ error: 'No userId in metadata' }, { status: 400 })
    }

    const subscriptionId = session.subscription

    await db.insert(subscriptions).values({
      id: Math.floor(Math.random() * 1_000_000_000),
      userId,
      provider: 'stripe',
      subscriptionId,
      productId: session.line_items?.data[0]?.price?.id || '',
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      emailLimit: 10,
    })

    await db.update(user).set({ role: 'SuperAdmin' }).where(eq(user.id, userId))
  }

  if (event === 'customer.subscription.updated') {
    const subscription = body.data.object
    await db.update(subscriptions)
      .set({
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      })
      .where(eq(subscriptions.subscriptionId, subscription.id))
  }

  if (event === 'customer.subscription.deleted') {
    const subscription = body.data.object
    await db.update(subscriptions)
      .set({ status: 'canceled', cancelAtPeriodEnd: true })
      .where(eq(subscriptions.subscriptionId, subscription.id))
  }

  return NextResponse.json({ received: true })
}
