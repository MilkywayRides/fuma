import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { subscriptions, user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { SubscriptionClient } from './subscription-client'

export default async function SubscriptionPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return null

  const userRecord = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1)
  const subscription = await db.select().from(subscriptions)
    .where(eq(subscriptions.userId, session.user.id))
    .limit(1)

  const currentPlan = subscription[0]?.status === 'active' ? 'pro' : 'free'
  const userRole = userRecord[0]?.role || 'Admin'

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Subscription</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card className={currentPlan === 'free' ? 'border-primary' : ''}>
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
            {currentPlan === 'free' ? (
              <Button variant="outline" disabled>Current Plan</Button>
            ) : (
              <Button variant="outline" disabled>Downgrade</Button>
            )}
          </CardContent>
        </Card>

        <Card className={currentPlan === 'pro' ? 'border-primary' : ''}>
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
            {currentPlan === 'pro' ? (
              <Button variant="outline" disabled>Current Plan</Button>
            ) : (
              <SubscriptionClient />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
