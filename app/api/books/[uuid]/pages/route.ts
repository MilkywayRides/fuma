import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { books, bookPages } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq, sql } from 'drizzle-orm'

export async function POST(request: Request, { params }: { params: Promise<{ uuid: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug, title, content } = await request.json()
  const { uuid } = await params

  const [book] = await db.select().from(books).where(eq(books.uuid, uuid)).limit(1)
  if (!book) {
    return NextResponse.json({ error: 'Book not found', uuid }, { status: 404 })
  }

  const existingPages = await db.select().from(bookPages).where(eq(bookPages.bookId, book.id))
  const [existingPage] = existingPages.filter(p => p.slug === slug)

  if (existingPage) {
    const [updated] = await db.update(bookPages)
      .set({ content, title, updatedAt: new Date() })
      .where(eq(bookPages.id, existingPage.id))
      .returning()
    return NextResponse.json(updated)
  }

  const [maxId] = await db.select({ max: sql<number>`COALESCE(MAX(id), 0)` }).from(bookPages)
  const newId = (maxId.max || 0) + 1

  const [page] = await db.insert(bookPages).values({
    id: newId,
    bookId: book.id,
    slug,
    title,
    content,
  }).returning()

  return NextResponse.json(page)
}

export async function GET(request: Request, { params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params
  
  const [book] = await db.select().from(books).where(eq(books.uuid, uuid)).limit(1)
  if (!book) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 })
  }

  const pages = await db.select().from(bookPages).where(eq(bookPages.bookId, book.id))
  return NextResponse.json(pages)
}
