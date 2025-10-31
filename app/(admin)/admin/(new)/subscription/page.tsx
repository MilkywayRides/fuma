'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

export default function SubscriptionPage() {
  const handleUpgrade = async () => {
    const res = await fetch('/api/subscription/checkout', { method: 'POST' })
    const { url } = await res.json()
    window.location.href = url
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Subscription</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardDescription>For getting started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">$0<span className="text-sm font-normal">/month</span></div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2"><Check className="h-4 w-4" /> 2 email addresses</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4" /> Basic features</li>
            </ul>
            <Button variant="outline" disabled>Current Plan</Button>
          </CardContent>
        </Card>

        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Pro</CardTitle>
            <CardDescription>For power users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">$9<span className="text-sm font-normal">/month</span></div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2"><Check className="h-4 w-4" /> 10 email addresses</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4" /> All features</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4" /> Priority support</li>
            </ul>
            <Button onClick={handleUpgrade}>Upgrade Now</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
