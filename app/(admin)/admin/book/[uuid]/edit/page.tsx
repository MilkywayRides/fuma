'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { useRouter, useParams } from 'next/navigation'
import { CustomMarkdownEditor } from '@/components/custom-markdown-editor'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function EditBookPage() {
  const params = useParams()
  const uuid = params.uuid as string
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [premium, setPremium] = useState(false)
  const [price, setPrice] = useState(0)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetch(`/api/books/${uuid}/info`)
      .then(res => res.json())
      .then(data => {
        setTitle(data.book.title)
        setDescription(data.book.description || '')
        setPremium(data.book.premium)
        setPrice(data.book.price)
      })
  }, [uuid])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/books/${uuid}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, premium, price: premium ? price : 0 }),
      })
      if (res.ok) {
        toast({ title: 'Success', description: 'Book updated successfully' })
        router.push(`/admin/book/${uuid}`)
      } else {
        throw new Error('Failed to update book')
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update book', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/book/${uuid}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Book</h1>
          <p className="text-muted-foreground">Update book details and settings</p>
        </div>
      </div>

      <form onSubmit={handleUpdate}>
        <Card>
          <CardHeader>
            <CardTitle>Book Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Book Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter book title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <CustomMarkdownEditor
                value={description}
                onChange={setDescription}
                placeholder="Enter book description..."
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="premium">Premium Book</Label>
                <p className="text-sm text-muted-foreground">Require credits to access this book</p>
              </div>
              <Switch id="premium" checked={premium} onCheckedChange={setPremium} />
            </div>

            {premium && (
              <div className="space-y-2">
                <Label htmlFor="price">Price (Credits)</Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  min="0"
                  placeholder="Enter price in credits"
                />
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Book'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
