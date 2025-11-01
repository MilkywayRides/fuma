import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Book } from 'lucide-react'
import Link from 'next/link'
import { db } from '@/lib/db'
import { user, books, bookPurchases } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export default async function DashboardBooksPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/sign-in')

  const purchases = await db.select({
    bookId: bookPurchases.bookId,
    bookTitle: books.title,
    bookUuid: books.uuid,
    creditsSpent: bookPurchases.creditsSpent,
    purchasedAt: bookPurchases.createdAt,
  }).from(bookPurchases)
    .leftJoin(books, eq(bookPurchases.bookId, books.id))
    .where(eq(bookPurchases.userId, session.user.id))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">My Books</h2>
        <p className="text-muted-foreground">Books you have purchased</p>
      </div>

      {purchases.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No books purchased yet
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {purchases.map((purchase) => (
            <Link key={purchase.bookId} href={`/books/${purchase.bookUuid}`}>
              <Card className="hover:border-primary transition-colors h-full">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Book className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{purchase.bookTitle}</CardTitle>
                  </div>
                  <CardDescription>
                    Purchased {new Date(purchase.purchasedAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">{purchase.creditsSpent} credits</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
