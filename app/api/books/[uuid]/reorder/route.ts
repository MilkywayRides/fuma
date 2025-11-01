import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { bookPages } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'

export async function POST(request: Request, { params }: { params: Promise<{ uuid: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { pageIds } = await request.json()

  for (let i = 0; i < pageIds.length; i++) {
    await db.update(bookPages)
      .set({ order: i })
      .where(eq(bookPages.id, pageIds[i]))
  }

  return NextResponse.json({ success: true })
}
