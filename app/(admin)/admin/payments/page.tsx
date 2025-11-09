export const dynamic = 'force-dynamic'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Link as LinkIcon, QrCode, Webhook, Plus, Settings } from 'lucide-react'
import Link from 'next/link'

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payment Gateway</h1>
          <p className="text-muted-foreground mt-2">
            Unified payment system supporting Stripe, Polar, PayTM, and more
          </p>
        </div>
        <Link href="/admin/payments/gateways/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Gateway
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Gateways</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Connected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Links</CardTitle>
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">QR Codes</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Generated</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common payment operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/payments/links/new">
              <Button variant="outline" className="w-full justify-start">
                <LinkIcon className="h-4 w-4 mr-2" />
                Create Payment Link
              </Button>
            </Link>
            <Link href="/admin/payments/pages/new">
              <Button variant="outline" className="w-full justify-start">
                <CreditCard className="h-4 w-4 mr-2" />
                Create Payment Page
              </Button>
            </Link>
            <Link href="/admin/payments/buttons/new">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                Create Payment Button
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Webhook Configuration</CardTitle>
            <CardDescription>Set up once for all gateways</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Webhook URL</span>
                <Badge variant="outline">Active</Badge>
              </div>
              <code className="block p-2 bg-muted rounded text-xs break-all">
                {process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/payments
              </code>
            </div>
            <Link href="/admin/payments/webhooks">
              <Button variant="outline" className="w-full">
                <Webhook className="h-4 w-4 mr-2" />
                Configure Webhooks
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supported Payment Gateways</CardTitle>
          <CardDescription>Connect and manage multiple payment providers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/admin/payments/gateways?provider=stripe">
              <Card className="cursor-pointer hover:border-primary transition-colors">
                <CardHeader>
                  <CardTitle className="text-base">Stripe</CardTitle>
                  <CardDescription>Global payment processing</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">Not Connected</Badge>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/payments/gateways?provider=polar">
              <Card className="cursor-pointer hover:border-primary transition-colors">
                <CardHeader>
                  <CardTitle className="text-base">Polar</CardTitle>
                  <CardDescription>Creator monetization</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">Not Connected</Badge>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/payments/gateways?provider=paytm">
              <Card className="cursor-pointer hover:border-primary transition-colors">
                <CardHeader>
                  <CardTitle className="text-base">PayTM</CardTitle>
                  <CardDescription>Indian payment gateway</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">Not Connected</Badge>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/payments/gateways?provider=razorpay">
              <Card className="cursor-pointer hover:border-primary transition-colors">
                <CardHeader>
                  <CardTitle className="text-base">Razorpay</CardTitle>
                  <CardDescription>Indian payments</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">Not Connected</Badge>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/payments/gateways?provider=paypal">
              <Card className="cursor-pointer hover:border-primary transition-colors">
                <CardHeader>
                  <CardTitle className="text-base">PayPal</CardTitle>
                  <CardDescription>Global payments</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">Not Connected</Badge>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/payments/gateways/new">
              <Card className="cursor-pointer hover:border-primary transition-colors border-dashed">
                <CardHeader>
                  <CardTitle className="text-base">Add Custom</CardTitle>
                  <CardDescription>Connect any gateway</CardDescription>
                </CardHeader>
                <CardContent>
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
