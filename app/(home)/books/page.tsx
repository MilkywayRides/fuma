import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Book } from 'lucide-react'
import Link from 'next/link'
import { db } from '@/lib/db'
import { books, user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export default async function BooksPage() {
  const allBooks = await db.select({
    uuid: books.uuid,
    title: books.title,
    description: books.description,
    createdAt: books.createdAt,
    published: books.published,
    authorName: user.name,
  }).from(books).leftJoin(user, eq(books.authorId, user.id))

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Books</h1>
          <p className="text-muted-foreground text-lg">Explore our collection of books</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {books.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No books available yet
            </div>
          ) : (
            allBooks.map((book) => (
              <Link key={book.uuid} href={`/books/${book.uuid}`}>
                <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <Book className="h-6 w-6 text-primary" />
                      <CardTitle className="text-xl">{book.title}</CardTitle>
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
            ))
          )}
        </div>
      </div>
    </div>
  )
}
