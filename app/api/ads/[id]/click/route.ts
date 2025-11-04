import { db } from '@/lib/db';
import { adClicks, advertisements } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adId = parseInt(id, 10);
    
    if (Number.isNaN(adId)) {
      return NextResponse.json({ error: 'Invalid ad id' }, { status: 400 });
    }
    
    const [ad] = await db.select().from(advertisements).where(eq(advertisements.id, adId)).limit(1);
    if (!ad) {
      console.error('Ad not found for click tracking:', adId);
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Use timestamp + random to ensure uniqueness
    const newId = Date.now() * 1000 + Math.floor(Math.random() * 1000);

    await db.insert(adClicks).values({
      id: newId,
      adId,
      ipAddress,
      userAgent,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ad click tracking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
