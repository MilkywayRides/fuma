import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Coins } from 'lucide-react'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function DashboardCreditsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/sign-in')

  const [userData] = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Credits</h2>
        <p className="text-muted-foreground">Manage your credits balance</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-6 w-6 text-primary" />
            Available Credits
          </CardTitle>
          <CardDescription>Use credits to purchase premium books</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-5xl font-bold">{userData.credits}</div>
          <Button size="lg">Buy More Credits</Button>
        </CardContent>
      </Card>
    </div>
  )
}
