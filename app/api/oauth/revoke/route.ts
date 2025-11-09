import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { oauthTokens } from '@/lib/db/oauth-schema'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { tokenId } = await req.json()

  await db
    .delete(oauthTokens)
    .where(
      and(
        eq(oauthTokens.id, tokenId),
        eq(oauthTokens.userId, session.user.id)
      )
    )

  return NextResponse.json({ success: true })
}
