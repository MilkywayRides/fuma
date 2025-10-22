import { db } from '@/lib/db';
import { adViews } from '@/lib/db/schema';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';

  await db.insert(adViews).values({
    adId: id,
    ipAddress,
  });

  return NextResponse.json({ success: true });
}
