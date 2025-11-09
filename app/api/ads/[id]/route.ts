import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { advertisements } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [ad] = await db
    .select()
    .from(advertisements)
    .where(eq(advertisements.id, id))
    .limit(1);

  if (!ad) {
    return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
  }

  return NextResponse.json(ad);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const body = await request.json();
    const { title, content, link, imageUrl, position, active } = body;

    const [ad] = await db.update(advertisements)
      .set({ title, content, link, imageUrl, position, active, updatedAt: new Date() })
      .where(eq(advertisements.id, id))
      .returning();

    if (!ad) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    return NextResponse.json(ad);
  } catch (error) {
    console.error('Update ad error:', error);
    return NextResponse.json({ error: 'Failed to update ad' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const result = await db.delete(advertisements).where(eq(advertisements.id, id)).returning();
    
    if (result.length === 0) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete ad error:', error);
    return NextResponse.json({ error: 'Failed to delete ad' }, { status: 500 });
  }
}
