'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function NewPaymentLinkPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [link, setLink] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const uuid = Math.random().toString(36).substring(2, 15)
    
    setLink(`${window.location.origin}/pay/${uuid}`)
    toast.success('Payment link created!')
    setLoading(false)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Payment Link</h1>
        <p className="text-muted-foreground mt-2">Generate a shareable payment link</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Link Details</CardTitle>
          <CardDescription>Configure your payment link</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Link Name</Label>
              <Input id="name" name="name" placeholder="Product Purchase" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" name="amount" type="number" placeholder="99.00" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" name="currency" defaultValue="USD" required />
            </div>

            {link && (
              <div className="space-y-2">
                <Label>Generated Link</Label>
                <div className="flex gap-2">
                  <Input value={link} readOnly />
                  <Button type="button" onClick={() => {
                    navigator.clipboard.writeText(link)
                    toast.success('Copied!')
                  }}>
                    Copy
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Link'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
