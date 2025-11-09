import { db } from '@/lib/db'
import { oauthDeviceCodes, oauthTokens } from '@/lib/db/oauth-schema'
import { eq, and, gt } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: Request) {
  const { device_code, client_id } = await req.json()

  const [deviceAuth] = await db.select()
    .from(oauthDeviceCodes)
    .where(and(
      eq(oauthDeviceCodes.deviceCode, device_code),
      gt(oauthDeviceCodes.expiresAt, new Date())
    ))
    .limit(1)

  if (!deviceAuth) {
    return NextResponse.json({ error: 'expired_token' }, { status: 400 })
  }

  if (!deviceAuth.approved || !deviceAuth.userId) {
    return NextResponse.json({ error: 'authorization_pending' }, { status: 400 })
  }

  const accessToken = crypto.randomBytes(32).toString('hex')
  const refreshToken = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
  const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  const [maxId] = await db.select({ id: oauthTokens.id }).from(oauthTokens).orderBy(oauthTokens.id).limit(1)
  const newId = (maxId?.id || 0) + 1

  await db.insert(oauthTokens).values({
    id: newId,
    accessToken,
    refreshToken,
    applicationId: deviceAuth.applicationId,
    userId: deviceAuth.userId,
    scope: deviceAuth.scope,
    deviceType: 'cli',
    expiresAt,
    refreshExpiresAt,
  })

  await db.delete(oauthDeviceCodes).where(eq(oauthDeviceCodes.id, deviceAuth.id))

  return NextResponse.json({
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: refreshToken,
    scope: deviceAuth.scope,
  })
}
