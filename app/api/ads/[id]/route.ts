import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { advertisements } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { title, content, link, imageUrl, position, active } = body;

  const [ad] = await db.update(advertisements)
    .set({ title, content, link, imageUrl, position, active, updatedAt: new Date() })
    .where(eq(advertisements.id, parseInt(id)))
    .returning();

  return NextResponse.json(ad);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  await db.delete(advertisements).where(eq(advertisements.id, parseInt(id)));

  return NextResponse.json({ success: true });
}
