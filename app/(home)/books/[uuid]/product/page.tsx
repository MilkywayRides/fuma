import { db } from '@/lib/db'
import { books, user, bookPurchases, subscriptions, bookReviews } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Lock, Star } from 'lucide-react'
import Link from 'next/link'
import { PurchaseButton } from './purchase-button'
import { ReviewForm } from './review-form'

export const dynamic = 'force-dynamic'

const gradients = [
  'from-blue-600 to-blue-800',
  'from-purple-600 to-purple-800',
  'from-pink-600 to-pink-800',
  'from-emerald-600 to-emerald-800',
  'from-orange-600 to-orange-800',
  'from-rose-600 to-rose-800',
  'from-cyan-600 to-cyan-800',
  'from-indigo-600 to-indigo-800',
]

export default async function BookProductPage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params
  const session = await auth.api.getSession({ headers: await headers() })

  const [bookData] = await db.select({
    id: books.id,
    uuid: books.uuid,
    title: books.title,
    description: books.description,
    premium: books.premium,
    price: books.price,
    createdAt: books.createdAt,
    authorName: user.name,
    authorId: books.authorId,
  }).from(books).leftJoin(user, eq(books.authorId, user.id)).where(eq(books.uuid, uuid)).limit(1)

  if (!bookData) notFound()

  let hasPurchased = false
  let hasUnlimitedAccess = false
  
  if (session) {
    const [purchase] = await db.select()
      .from(bookPurchases)
      .where(and(
        eq(bookPurchases.userId, session.user.id),
        eq(bookPurchases.bookId, bookData.id)
      ))
      .limit(1)
    
    hasPurchased = !!purchase

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

  const hasAccess = !bookData.premium || hasPurchased || hasUnlimitedAccess

  const reviews = await db.select({
    id: bookReviews.id,
    rating: bookReviews.rating,
    review: bookReviews.review,
    createdAt: bookReviews.createdAt,
    userName: user.name,
    userId: bookReviews.userId,
  }).from(bookReviews)
    .leftJoin(user, eq(bookReviews.userId, user.id))
    .where(eq(bookReviews.bookId, bookData.id))
    .orderBy(desc(bookReviews.createdAt))

  const userReview = session ? reviews.find(r => r.userId === session.user.id) : null
  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0

  const gradient = gradients[bookData.id % gradients.length]

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className={`relative h-96 rounded-lg bg-gradient-to-br ${gradient} shadow-2xl overflow-hidden`}>
              <div className="absolute inset-0 p-8 flex flex-col justify-between">
                <div className="space-y-3">
                  <h1 className="text-4xl font-bold text-white leading-tight drop-shadow-lg">
                    {bookData.title}
                  </h1>
                  {bookData.authorName && (
                    <p className="text-white/90 text-lg font-medium drop-shadow">
                      by {bookData.authorName}
                    </p>
                  )}
                </div>
                {bookData.premium && (
                  <Badge className="w-fit bg-white/95 text-black">Premium</Badge>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20 pointer-events-none" />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>About this Book</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {bookData.description || 'No description available.'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Reviews</CardTitle>
                    <CardDescription>
                      {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                      {reviews.length > 0 && (
                        <span className="ml-2">
                          • {avgRating.toFixed(1)} <Star className="inline h-4 w-4 fill-yellow-400 text-yellow-400" />
                        </span>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {hasPurchased && !userReview && (
                  <ReviewForm bookId={bookData.id} />
                )}
                
                {reviews.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No reviews yet. Be the first to review!</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium">{review.userName}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.review && (
                          <p className="text-sm text-muted-foreground">{review.review}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>{bookData.title}</CardTitle>
                <CardDescription>
                  Published {new Date(bookData.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!bookData.premium ? (
                  <>
                    <div className="text-3xl font-bold text-green-600">Free</div>
                    <Button asChild className="w-full" size="lg">
                      <Link href={`/books/${uuid}`}>
                        <BookOpen className="mr-2 h-5 w-5" />
                        Start Reading
                      </Link>
                    </Button>
                  </>
                ) : hasAccess ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Purchased</Badge>
                      <span className="text-sm text-muted-foreground">{bookData.price} credits</span>
                    </div>
                    <Button asChild className="w-full" size="lg">
                      <Link href={`/books/${uuid}`}>
                        <BookOpen className="mr-2 h-5 w-5" />
                        Continue Reading
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                        <span className="text-2xl font-bold">{bookData.price} Credits</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Premium book - Purchase to unlock
                      </p>
                    </div>
                    <PurchaseButton 
                      bookId={bookData.id} 
                      bookUuid={uuid}
                      price={bookData.price}
                      isLoggedIn={!!session}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
