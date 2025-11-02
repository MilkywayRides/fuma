import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { bookReviews, bookPurchases } from '@/lib/db/schema'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { bookId, rating, review } = await req.json()

  if (!bookId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }

  const [purchase] = await db.select()
    .from(bookPurchases)
    .where(and(
      eq(bookPurchases.userId, session.user.id),
      eq(bookPurchases.bookId, bookId)
    ))
    .limit(1)

  if (!purchase) {
    return NextResponse.json({ error: 'You must purchase this book to review it' }, { status: 403 })
  }

  const [existing] = await db.select()
    .from(bookReviews)
    .where(and(
      eq(bookReviews.userId, session.user.id),
      eq(bookReviews.bookId, bookId)
    ))
    .limit(1)

  if (existing) {
    return NextResponse.json({ error: 'You have already reviewed this book' }, { status: 400 })
  }

  const [maxId] = await db.select({ max: db.$count(bookReviews) }).from(bookReviews)
  const newId = (maxId?.max || 0) + 1

  await db.insert(bookReviews).values({
    id: newId,
    bookId,
    userId: session.user.id,
    rating,
    review: review || null,
  })

  return NextResponse.json({ success: true })
}

export async function PUT(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { reviewId, rating, review } = await req.json()

  if (!reviewId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }

  const [existing] = await db.select()
    .from(bookReviews)
    .where(and(
      eq(bookReviews.id, reviewId),
      eq(bookReviews.userId, session.user.id)
    ))
    .limit(1)

  if (!existing) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 })
  }

  await db.update(bookReviews)
    .set({ rating, review: review || null, updatedAt: new Date() })
    .where(eq(bookReviews.id, reviewId))

  return NextResponse.json({ success: true })
}
