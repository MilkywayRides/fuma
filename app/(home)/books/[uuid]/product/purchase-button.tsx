'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function PurchaseButton({ 
  bookId, 
  bookUuid,
  price, 
  isLoggedIn 
}: { 
  bookId: number
  bookUuid: string
  price: number
  isLoggedIn: boolean 
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handlePurchase = async () => {
    if (!isLoggedIn) {
      router.push('/sign-in')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/books/${bookUuid}/purchase`, {
        method: 'POST',
      })
      
      if (res.ok) {
        router.refresh()
        setOpen(false)
      } else {
        const data = await res.json()
        alert(data.error || 'Purchase failed')
      }
    } catch (error) {
      alert('Purchase failed')
    } finally {
      setLoading(false)
    }
  }

  if (!isLoggedIn) {
    return (
      <Button asChild className="w-full" size="lg">
        <a href="/sign-in">
          <ShoppingCart className="mr-2 h-5 w-5" />
          Sign in to Purchase
        </a>
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg">
          <ShoppingCart className="mr-2 h-5 w-5" />
          Purchase Book
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Purchase Book</DialogTitle>
          <DialogDescription>
            This will deduct {price} credits from your account.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Once purchased, you'll have lifetime access to this book.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handlePurchase} disabled={loading} className="flex-1">
              {loading ? 'Processing...' : `Confirm Purchase`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
