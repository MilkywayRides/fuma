'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useState } from 'react'

export function SubscriptionClient() {
  const [selectedProvider, setSelectedProvider] = useState<'polar' | 'stripe'>('polar')

  const handleUpgrade = async () => {
    const res = await fetch('/api/subscription/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: selectedProvider }),
    })
    const { url } = await res.json()
    window.location.href = url
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
