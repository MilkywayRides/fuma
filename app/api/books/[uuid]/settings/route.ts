import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { books } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function POST(request: Request, { params }: { params: Promise<{ uuid: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { uuid } = await params
  const { premium, price, description, title } = await request.json()

  const updateData: any = { premium, price: premium ? price : 0 }
  if (description !== undefined) {
    updateData.description = description
  }
  if (title !== undefined) {
    updateData.title = title
  }

  await db.update(books)
    .set(updateData)
    .where(eq(books.uuid, uuid))

  return NextResponse.json({ success: true })
}
