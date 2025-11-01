import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { books, user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function GET(request: Request, { params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params
  const session = await auth.api.getSession({ headers: await headers() })

  const [book] = await db.select().from(books).where(eq(books.uuid, uuid)).limit(1)
  if (!book) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 })
  }

  let userCredits = 0
  if (session) {
    const [userData] = await db.select({ credits: user.credits }).from(user).where(eq(user.id, session.user.id)).limit(1)
    userCredits = userData?.credits || 0
  }

  return NextResponse.json({ book, userCredits })
}
