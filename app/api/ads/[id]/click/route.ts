import { db } from '@/lib/db';
import { adClicks } from '@/lib/db/schema';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  await db.insert(adClicks).values({
    adId: parseInt(id),
    ipAddress,
    userAgent,
  });

  return NextResponse.json({ success: true });
}
