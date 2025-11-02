'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Book as BookIcon, Crown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default function BookPage() {
  const [books, setBooks] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/books').then(res => res.json()).then(setBooks)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Books</h1>
          <p className="text-muted-foreground">Manage your book collection</p>
        </div>
        <Button asChild>
          <Link href="/admin/book/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Book
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {books.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center text-muted-foreground">
              No books yet. Create your first book to get started.
            </CardContent>
          </Card>
        ) : (
          books.map((book) => (
            <Link key={book.uuid} href={`/admin/book/${book.uuid}`}>
              <Card className="hover:border-primary transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookIcon className="h-5 w-5" />
                      <CardTitle className="text-lg">{book.title}</CardTitle>
                    </div>
                    {book.premium && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Crown className="h-3 w-3" />
                        {book.price}
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    Created {new Date(book.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
