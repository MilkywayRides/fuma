import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { streams, streamEnrollments } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq, and } from 'drizzle-orm';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [stream] = await db.select().from(streams).where(eq(streams.uuid, id));
  if (!stream) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(stream);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  
  const [stream] = await db.update(streams)
    .set({ ...body, updatedAt: new Date() })
    .where(and(eq(streams.uuid, id), eq(streams.teacherId, session.user.id)))
    .returning();

  return NextResponse.json(stream);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await db.delete(streams).where(and(eq(streams.uuid, id), eq(streams.teacherId, session.user.id)));
  return NextResponse.json({ success: true });
}
