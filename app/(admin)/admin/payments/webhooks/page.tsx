'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'
import { toast } from 'sonner'

export default function WebhooksPage() {
  const webhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/api/webhooks/payments`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Webhook Configuration</h1>
        <p className="text-muted-foreground mt-2">Set up webhooks for all payment gateways</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Unified Webhook Endpoint</CardTitle>
          <CardDescription>Use this single URL for all payment providers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Webhook URL</span>
              <Badge>Active</Badge>
            </div>
            <div className="flex gap-2">
              <code className="flex-1 p-3 bg-muted rounded text-sm break-all">
                {webhookUrl}
              </code>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(webhookUrl)
                  toast.success('Webhook URL copied!')
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
          <CardDescription>Configure webhooks for each provider</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Stripe</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Go to Stripe Dashboard → Developers → Webhooks</li>
              <li>Click "Add endpoint"</li>
              <li>Paste the webhook URL above</li>
              <li>Select events: checkout.session.completed, payment_intent.succeeded</li>
            </ol>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Polar</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Go to Polar Dashboard → Settings → Webhooks</li>
              <li>Add webhook URL with header: x-payment-provider: polar</li>
            </ol>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">PayTM / Razorpay</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Configure webhook in respective dashboard</li>
              <li>Add custom header with provider name</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
