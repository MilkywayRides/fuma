import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { streamMessages, streams } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq, and } from 'drizzle-orm';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [stream] = await db.select().from(streams).where(eq(streams.uuid, id));
    
    if (!stream) {
      return NextResponse.json([]);
    }

    const messages = await db.select().from(streamMessages)
      .where(and(eq(streamMessages.streamId, stream.id), eq(streamMessages.deleted, false)))
      .orderBy(streamMessages.createdAt);

    return NextResponse.json(messages || []);
  } catch (error) {
    console.error('Chat GET error:', error);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  
  const [stream] = await db.select().from(streams).where(eq(streams.uuid, id));
  if (!stream) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const [message] = await db.insert(streamMessages).values({
    streamId: stream.id,
    userId: session.user.id,
    message: body.message,
  }).returning();

  return NextResponse.json(message);
}
