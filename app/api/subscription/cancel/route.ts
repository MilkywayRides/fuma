import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { subscriptions, user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { subscriptionId } = await req.json()

  await db.update(subscriptions)
    .set({ status: 'canceled', cancelAtPeriodEnd: true })
    .where(eq(subscriptions.subscriptionId, subscriptionId))

  await db.update(user)
    .set({ role: 'Admin' })
    .where(eq(user.id, session.user.id))

  return NextResponse.json({ success: true })
}
