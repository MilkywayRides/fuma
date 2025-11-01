import { db } from '@/lib/db'
import { books, bookPages, bookPurchases, subscriptions } from '@/lib/db/schema'
import { eq, asc, and } from 'drizzle-orm'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function BookViewerPage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params
  const session = await auth.api.getSession({ headers: await headers() })

  const [book] = await db.select().from(books).where(eq(books.uuid, uuid)).limit(1)
  if (!book) notFound()

  // Check if user has access to premium book
  if (book.premium && session) {
    const [purchase] = await db.select()
      .from(bookPurchases)
      .where(and(
        eq(bookPurchases.userId, session.user.id),
        eq(bookPurchases.bookId, book.id)
      ))
      .limit(1)

    const [sub] = await db.select()
      .from(subscriptions)
      .where(and(
        eq(subscriptions.userId, session.user.id),
        eq(subscriptions.status, 'active')
      ))
      .limit(1)

    const now = new Date()
    const hasUnlimitedAccess = sub && 
      sub.productId === 'unlimited_plan' && 
      new Date(sub.currentPeriodEnd) > now
    
    if (!purchase && !hasUnlimitedAccess) {
      redirect(`/books/${uuid}/purchase`)
    }
  } else if (book.premium && !session) {
    redirect(`/books/${uuid}/purchase`)
  }

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
