import { db } from '@/lib/db';
import { adViews, advertisements } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    const adIdNum = Number(id);
    if (Number.isNaN(adIdNum)) {
      return NextResponse.json({ error: 'Invalid ad id' }, { status: 400 });
    }

    const [ad] = await db.select().from(advertisements).where(eq(advertisements.id, adIdNum)).limit(1);
    
    if (!ad) {
      console.error('Ad not found for view tracking:', adIdNum);
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    // Use timestamp + random to ensure uniqueness
    const newId = Date.now() * 1000 + Math.floor(Math.random() * 1000);

    await db.insert(adViews).values({
      id: newId,
      adId: adIdNum,
      ipAddress,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ad view tracking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
