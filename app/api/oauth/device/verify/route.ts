import { db } from '@/lib/db'
import { oauthDeviceCodes, oauthApplications } from '@/lib/db/oauth-schema'
import { eq, and, gt } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { user_code, user_id } = await req.json()

  const [deviceAuth] = await db.select()
    .from(oauthDeviceCodes)
    .where(and(
      eq(oauthDeviceCodes.userCode, user_code),
      gt(oauthDeviceCodes.expiresAt, new Date())
    ))
    .limit(1)

  if (!deviceAuth) {
    return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })
  }

  const [app] = await db.select().from(oauthApplications).where(eq(oauthApplications.id, deviceAuth.applicationId)).limit(1)

  await db.update(oauthDeviceCodes)
    .set({ approved: true, userId: user_id })
    .where(eq(oauthDeviceCodes.id, deviceAuth.id))

  return NextResponse.json({ success: true, appName: app.name })
}
