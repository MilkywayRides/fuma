import { db } from '@/lib/db';
import { adClicks, advertisements } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const adId = parseInt(id, 10);
  
  const [ad] = await db.select().from(advertisements).where(eq(advertisements.id, adId)).limit(1);
  if (!ad) {
    return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
  }

  const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  await db.insert(adClicks).values({
    id: Date.now(),
    adId,
    ipAddress,
    userAgent,
  });

  return NextResponse.json({ success: true });
}
