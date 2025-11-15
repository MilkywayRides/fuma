import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { streams } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// This endpoint is called by Nginx RTMP module to validate stream keys
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const streamKey = formData.get('name') as string;

  if (!streamKey) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const [stream] = await db.select().from(streams).where(eq(streams.streamKey, streamKey));

  if (!stream) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Update stream status to live
  await db.update(streams)
    .set({ status: 'live', startedAt: new Date() })
    .where(eq(streams.streamKey, streamKey));

  return new NextResponse('OK', { status: 200 });
}
