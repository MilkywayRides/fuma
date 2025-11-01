import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { books } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { sql } from 'drizzle-orm'

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { uuid, title, description } = await request.json()

  const [maxId] = await db.select({ max: sql<number>`COALESCE(MAX(id), 0)` }).from(books)
  const newId = (maxId.max || 0) + 1

  const [book] = await db.insert(books).values({
    id: newId,
    uuid,
    title,
    description: description || '',
    authorId: session.user.id,
  }).returning()

  return NextResponse.json(book)
}

export async function GET() {
  const allBooks = await db.select().from(books)
  return NextResponse.json(allBooks)
}
