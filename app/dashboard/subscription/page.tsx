import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Crown, Check } from 'lucide-react'
import { db } from '@/lib/db'
import { subscriptions } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export default async function DashboardSubscriptionPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/sign-in')

  const [sub] = await db.select()
    .from(subscriptions)
    .where(and(
      eq(subscriptions.userId, session.user.id),
      eq(subscriptions.status, 'active')
    ))
    .limit(1)

  const now = new Date()
  const hasActiveSub = sub && new Date(sub.currentPeriodEnd) > now

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Subscription</h2>
        <p className="text-muted-foreground">Manage your subscription plan</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-6 w-6 text-primary" />
              <CardTitle>{hasActiveSub ? 'Premium Plan' : 'Free Plan'}</CardTitle>
            </div>
            <Badge variant={hasActiveSub ? 'default' : 'secondary'}>
              {hasActiveSub ? 'Active' : 'Free'}
            </Badge>
          </div>
          <CardDescription>
            {hasActiveSub 
              ? `Your subscription renews on ${new Date(sub.currentPeriodEnd).toLocaleDateString()}`
              : 'Upgrade to access all premium books'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasActiveSub ? (
            <>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Unlimited access to all books</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>All premium content</span>
                </div>
              </div>
              <Button variant="outline">Manage Subscription</Button>
            </>
          ) : (
            <Button size="lg">Upgrade to Premium</Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
