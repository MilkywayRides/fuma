import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { streams } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';

export async function GET() {
  const allStreams = await db.select().from(streams).orderBy(streams.createdAt);
  return NextResponse.json(allStreams);
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const streamKey = Math.random().toString(36).substring(2, 15);
  const uuid = Math.random().toString(36).substring(2, 15);

  const [stream] = await db.insert(streams).values({
    uuid,
    title: body.title,
    description: body.description,
    streamKey,
    isClass: body.isClass || false,
    isPaid: body.isPaid || false,
    price: body.price || 0,
    scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
    teacherId: session.user.id,
  }).returning();

  return NextResponse.json(stream);
}
