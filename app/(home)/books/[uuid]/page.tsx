import { db } from '@/lib/db'
import { books, bookPages } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { notFound, redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function BookViewerPage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params

  const [book] = await db.select().from(books).where(eq(books.uuid, uuid)).limit(1)
  if (!book) notFound()

  const pages = await db.select().from(bookPages).where(eq(bookPages.bookId, book.id)).orderBy(asc(bookPages.order))
  
  if (pages.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-4xl font-bold">{book.title}</h1>
          <p className="text-muted-foreground">This book has no pages yet.</p>
        </div>
      </div>
    )
  }

  redirect(`/books/${uuid}/${pages[0].slug}`)
}
