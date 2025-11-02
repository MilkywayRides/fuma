'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Star } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ReviewForm({ bookId, existingReview }: { bookId: number; existingReview?: { id: number; rating: number; review: string | null } }) {
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [review, setReview] = useState(existingReview?.review || '')
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(!!existingReview)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) return

    setLoading(true)
    try {
      const res = await fetch('/api/books/reviews', {
        method: existingReview ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, rating, review, reviewId: existingReview?.id }),
      })
      
      if (res.ok) {
        router.refresh()
        if (!existingReview) {
          setRating(0)
          setReview('')
        }
      }
    } catch (error) {
      alert('Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border rounded-lg p-4 bg-muted/50">
      {existingReview && (
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Your Review</h3>
          <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
        </div>
      )}
      <div>
        <label className="text-sm font-medium mb-2 block">{existingReview ? 'Rating' : 'Your Rating'}</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`h-6 w-6 ${
                  star <= rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
                aria-label={`${star} star`}
              />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">{existingReview ? 'Review' : 'Your Review'} (Optional)</label>
        <Textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Share your thoughts about this book..."
          rows={3}
          disabled={existingReview && !isEditing}
        />
      </div>
      {(!existingReview || isEditing) && (
        <Button type="submit" disabled={rating === 0 || loading}>
          {loading ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
        </Button>
      )}
    </form>
  )
}
