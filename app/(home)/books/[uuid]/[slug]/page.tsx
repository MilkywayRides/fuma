import { db } from '@/lib/db'
import { books, bookPages, user } from '@/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ReactMarkdown from 'react-markdown'

export const dynamic = 'force-dynamic'

export default async function BookPageViewer({ params }: { params: Promise<{ uuid: string; slug: string }> }) {
  const { uuid, slug } = await params

  const [book] = await db.select({
    id: books.id,
    uuid: books.uuid,
    title: books.title,
    authorName: user.name,
  }).from(books).leftJoin(user, eq(books.authorId, user.id)).where(eq(books.uuid, uuid)).limit(1)
  
  if (!book) notFound()

  const allPages = await db.select().from(bookPages).where(eq(bookPages.bookId, book.id)).orderBy(asc(bookPages.order))
  const currentIndex = allPages.findIndex(p => p.slug === slug)
  
  if (currentIndex === -1) notFound()

  const currentPage = allPages[currentIndex]
  const prevPage = currentIndex > 0 ? allPages[currentIndex - 1] : null
  const nextPage = currentIndex < allPages.length - 1 ? allPages[currentIndex + 1] : null

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <Link href="/books" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Books
          </Link>
          <h1 className="text-4xl font-bold">{book.title}</h1>
          {book.authorName && (
            <p className="text-muted-foreground">By {book.authorName}</p>
          )}
        </div>

        <div className="border-t pt-8">
          <h2 className="text-2xl font-semibold mb-4">{currentPage.title}</h2>
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <ReactMarkdown>{currentPage.content}</ReactMarkdown>
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-6">
          {prevPage ? (
            <Button asChild variant="outline">
              <Link href={`/books/${uuid}/${prevPage.slug}`}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                {prevPage.title}
              </Link>
            </Button>
          ) : <div />}
          
          {nextPage ? (
            <Button asChild variant="outline">
              <Link href={`/books/${uuid}/${nextPage.slug}`}>
                {nextPage.title}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          ) : <div />}
        </div>
      </div>
    </div>
  )
}
