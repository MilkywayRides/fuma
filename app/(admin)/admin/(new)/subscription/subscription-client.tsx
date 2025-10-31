'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SubscriptionClient({ subscriptionId, showCancel }: { subscriptionId?: string; showCancel?: boolean }) {
  const [selectedProvider, setSelectedProvider] = useState<'polar' | 'stripe'>('polar')
  const router = useRouter()

  const handleUpgrade = async () => {
    const res = await fetch('/api/subscription/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: selectedProvider }),
    })
    const { url } = await res.json()
    window.location.href = url
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return
    
    const res = await fetch('/api/subscription/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionId }),
    })
    
    if (res.ok) {
      alert('Subscription cancelled successfully')
      router.refresh()
    }
  }

  if (showCancel) {
    return (
      <Button variant="destructive" onClick={handleCancel} className="w-full" size="sm">
        Cancel Subscription
      </Button>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Payment Gateway</Label>
        <div className="flex gap-2 mt-2">
          <Button
            variant={selectedProvider === 'polar' ? 'default' : 'outline'}
            onClick={() => setSelectedProvider('polar')}
            size="sm"
            className="flex-1"
          >
            Polar
          </Button>
          <Button
            variant={selectedProvider === 'stripe' ? 'default' : 'outline'}
            onClick={() => setSelectedProvider('stripe')}
            size="sm"
            className="flex-1"
          >
            Stripe
          </Button>
        </div>
      </div>
      <Button onClick={handleUpgrade} className="w-full">Upgrade Now</Button>
    </div>
  )
}
