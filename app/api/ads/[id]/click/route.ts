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
    
    const [ad] = await db.select().from(advertisements).where(eq(advertisements.id, id)).limit(1);
    if (!ad) {
      console.error('Ad not found for click tracking:', id);
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await db.insert(adClicks).values({
      adId: id,
      ipAddress,
      userAgent,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ad click tracking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
