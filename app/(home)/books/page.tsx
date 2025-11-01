import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Book, Lock, Coins } from 'lucide-react'
import Link from 'next/link'
import { db } from '@/lib/db'
import { books, user, bookPurchases, subscriptions } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export default async function BooksPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  
  const allBooks = await db.select({
    id: books.id,
    uuid: books.uuid,
    title: books.title,
    description: books.description,
    createdAt: books.createdAt,
    published: books.published,
    premium: books.premium,
    price: books.price,
    authorName: user.name,
  }).from(books).leftJoin(user, eq(books.authorId, user.id))

  let userPurchases: number[] = []
  let hasUnlimitedAccess = false
  
  if (session) {
    const purchases = await db.select({ bookId: bookPurchases.bookId })
      .from(bookPurchases)
      .where(eq(bookPurchases.userId, session.user.id))
    userPurchases = purchases.map(p => p.bookId)

    const [sub] = await db.select()
      .from(subscriptions)
      .where(and(
        eq(subscriptions.userId, session.user.id),
        eq(subscriptions.status, 'active')
      ))
      .limit(1)
    
    if (sub && sub.productId === 'unlimited_plan') {
      const now = new Date()
      hasUnlimitedAccess = new Date(sub.currentPeriodEnd) > now
    }
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Books</h1>
          <p className="text-muted-foreground text-lg">Explore our collection of books</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allBooks.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No books available yet
            </div>
          ) : (
            allBooks.map((book) => {
              const isPremium = book.premium
              const hasAccess = !isPremium || hasUnlimitedAccess || userPurchases.includes(book.id)
              
              return (
                <Link key={book.uuid} href={hasAccess ? `/books/${book.uuid}` : `/books/${book.uuid}/purchase`}>
                  <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3">
                          <Book className="h-6 w-6 text-primary" />
                          <CardTitle className="text-xl">{book.title}</CardTitle>
                        </div>
                        {isPremium && !hasAccess && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            {book.price} <Coins className="h-3 w-3" />
                          </Badge>
                        )}
                        {isPremium && hasAccess && (
                          <Badge variant="default">Premium</Badge>
                        )}
                      </div>
                      {book.description && (
                        <CardDescription className="line-clamp-2">{book.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Published {new Date(book.createdAt).toLocaleDateString()}
                        </p>
                        {book.authorName && (
                          <p className="text-sm text-muted-foreground">
                            By {book.authorName}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
