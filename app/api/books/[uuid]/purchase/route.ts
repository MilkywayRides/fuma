import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { books, user, bookPurchases } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function POST(request: Request, { params }: { params: Promise<{ uuid: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { uuid } = await params

  const [book] = await db.select().from(books).where(eq(books.uuid, uuid)).limit(1)
  if (!book) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 })
  }

  if (!book.premium) {
    return NextResponse.json({ error: 'Book is not premium' }, { status: 400 })
  }

  const [userData] = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1)
  if (!userData || userData.credits < book.price) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 })
  }

  const [existing] = await db.select().from(bookPurchases)
    .where(and(
      eq(bookPurchases.userId, session.user.id),
      eq(bookPurchases.bookId, book.id)
    )).limit(1)

  if (existing) {
    return NextResponse.json({ error: 'Already purchased' }, { status: 400 })
  }

  await db.update(user)
    .set({ credits: sql`${user.credits} - ${book.price}` })
    .where(eq(user.id, session.user.id))

  const [maxId] = await db.select({ max: sql<number>`COALESCE(MAX(id), 0)` }).from(bookPurchases)
  const newId = (maxId.max || 0) + 1

  await db.insert(bookPurchases).values({
    id: newId,
    userId: session.user.id,
    bookId: book.id,
    creditsSpent: book.price,
  })

  return NextResponse.json({ success: true })
}
