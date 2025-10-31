import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { subscriptions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const subscription = await db.select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, session.user.id))
    .limit(1)

  const active = subscription[0]?.status === 'active' && 
                 new Date(subscription[0].currentPeriodEnd) > new Date()

  return NextResponse.json({ active })
}
