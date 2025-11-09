import { db } from '@/lib/db'
import { oauthApplications, oauthDeviceCodes } from '@/lib/db/oauth-schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: Request) {
  const { client_id, scope = 'read' } = await req.json()

  const [app] = await db.select().from(oauthApplications).where(eq(oauthApplications.clientId, client_id)).limit(1)
  if (!app || !app.active) {
    return NextResponse.json({ error: 'invalid_client' }, { status: 400 })
  }

  const deviceCode = crypto.randomBytes(32).toString('hex')
  const userCode = crypto.randomBytes(4).toString('hex').toUpperCase()
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

  const [maxId] = await db.select({ id: oauthDeviceCodes.id }).from(oauthDeviceCodes).orderBy(oauthDeviceCodes.id).limit(1)
  const newId = (maxId?.id || 0) + 1

  await db.insert(oauthDeviceCodes).values({
    id: newId,
    deviceCode,
    userCode,
    applicationId: app.id,
    scope,
    expiresAt,
  })

  return NextResponse.json({
    device_code: deviceCode,
    user_code: userCode,
    verification_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/oauth/device`,
    expires_in: 900,
    interval: 5,
  })
}
