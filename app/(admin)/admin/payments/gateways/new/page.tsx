'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export default function NewGatewayPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name'),
      provider: formData.get('provider'),
      apiKey: formData.get('apiKey'),
      webhookSecret: formData.get('webhookSecret'),
      config: formData.get('config'),
      autoSetupWebhook: true,
    }

    try {
      const res = await fetch('/api/admin/payments/gateways', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create gateway')
      }

      const result = await res.json()
      toast.success(result.webhookCreated ? 'Gateway connected & webhook auto-configured!' : 'Gateway created successfully')
      router.push('/admin/payments/gateways')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create gateway')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Payment Gateway</h1>
        <p className="text-muted-foreground mt-2">Connect a new payment provider</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gateway Configuration</CardTitle>
          <CardDescription>Enter your payment provider credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Gateway Name</Label>
              <Input id="name" name="name" placeholder="My Stripe Gateway" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <input type="hidden" name="provider" id="provider-hidden" required />
              <Select onValueChange={(value) => {
                const input = document.getElementById('provider-hidden') as HTMLInputElement
                if (input) input.value = value
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="polar">Polar</SelectItem>
                  <SelectItem value="paytm">PayTM</SelectItem>
                  <SelectItem value="razorpay">Razorpay</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key / Secret Key</Label>
              <Input id="apiKey" name="apiKey" type="password" placeholder="sk_..." required />
              <p className="text-xs text-muted-foreground">
                For Stripe: Webhook will be automatically created and configured
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="config">Additional Config (JSON)</Label>
              <Textarea 
                id="config" 
                name="config" 
                placeholder='{"publishableKey": "pk_..."}'
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Connecting & Setting Up...' : 'Connect Gateway'}
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
