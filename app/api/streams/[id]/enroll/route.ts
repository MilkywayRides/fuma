import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { streamEnrollments, streams } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const [stream] = await db.select().from(streams).where(eq(streams.uuid, id));
  if (!stream) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Check if already enrolled
  const existing = await db.select().from(streamEnrollments)
    .where(and(eq(streamEnrollments.streamId, stream.id), eq(streamEnrollments.userId, session.user.id)));
  
  if (existing.length > 0) {
    return NextResponse.json({ message: 'Already enrolled' });
  }

  const [enrollment] = await db.insert(streamEnrollments).values({
    streamId: stream.id,
    userId: session.user.id,
  }).returning();

  return NextResponse.json(enrollment);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ enrolled: false });

  const { id } = await params;
  const [stream] = await db.select().from(streams).where(eq(streams.uuid, id));
  if (!stream) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const enrollment = await db.select().from(streamEnrollments)
    .where(and(eq(streamEnrollments.streamId, stream.id), eq(streamEnrollments.userId, session.user.id)));

  return NextResponse.json({ enrolled: enrollment.length > 0 });
}
