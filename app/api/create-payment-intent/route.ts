import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { user, bookPurchases, books } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-11-20.acacia' })

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { amount, planType, bookUuid } = await request.json()

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency: 'usd',
    metadata: {
      userId: session.user.id,
      planType,
      bookUuid: bookUuid || '',
    },
  })

  // If credits plan, add credits to user
  if (planType === 'credits') {
    await db.update(user)
      .set({ credits: sql`${user.credits} + 250` })
      .where(eq(user.id, session.user.id))
  }

  // If purchasing a specific book with credits, record the purchase
  if (bookUuid && planType === 'book') {
    const [book] = await db.select().from(books).where(eq(books.uuid, bookUuid)).limit(1)
    if (book) {
      const [maxId] = await db.select({ max: sql<number>`COALESCE(MAX(id), 0)` }).from(bookPurchases)
      const newId = (maxId.max || 0) + 1
      
      await db.insert(bookPurchases).values({
        id: newId,
        userId: session.user.id,
        bookId: book.id,
        creditsSpent: book.price,
      })
    }
  }

  return NextResponse.json({ clientSecret: paymentIntent.client_secret })
}
