import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Book, Coins, Crown } from 'lucide-react'
import Link from 'next/link'
import { db } from '@/lib/db'
import { user, books, bookPurchases, subscriptions } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/sign-in')

  const [userData] = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1)
  
  const purchases = await db.select({
    bookId: bookPurchases.bookId,
    bookTitle: books.title,
    bookUuid: books.uuid,
    creditsSpent: bookPurchases.creditsSpent,
    purchasedAt: bookPurchases.createdAt,
  }).from(bookPurchases)
    .leftJoin(books, eq(bookPurchases.bookId, books.id))
    .where(eq(bookPurchases.userId, session.user.id))

  const [sub] = await db.select()
    .from(subscriptions)
    .where(and(
      eq(subscriptions.userId, session.user.id),
      eq(subscriptions.status, 'active')
    ))
    .limit(1)

  const now = new Date()
  const hasActiveSub = sub && new Date(sub.currentPeriodEnd) > now

  return (
    <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {userData.name}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userData.credits}</div>
              <p className="text-xs text-muted-foreground">Available credits</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Books Purchased</CardTitle>
              <Book className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{purchases.length}</div>
              <p className="text-xs text-muted-foreground">Total books owned</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscription</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hasActiveSub ? 'Premium' : 'Free'}</div>
              <p className="text-xs text-muted-foreground">
                {hasActiveSub ? `Until ${new Date(sub.currentPeriodEnd).toLocaleDateString()}` : 'No active subscription'}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Books</CardTitle>
            <CardDescription>Books you have purchased</CardDescription>
          </CardHeader>
          <CardContent>
            {purchases.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No books purchased yet</p>
            ) : (
              <div className="space-y-4">
                {purchases.map((purchase) => (
                  <Link key={purchase.bookId} href={`/books/${purchase.bookUuid}`}>
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <Book className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-semibold">{purchase.bookTitle}</p>
                          <p className="text-sm text-muted-foreground">
                            Purchased {new Date(purchase.purchasedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">{purchase.creditsSpent} credits</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  )
}
