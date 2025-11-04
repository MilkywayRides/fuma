import { db } from '@/lib/db';
import { advertisements, adClicks } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: adId } = await params;
    const adIdNum = Number(adId);
    
    if (Number.isNaN(adIdNum)) {
      console.error('Invalid ad ID:', adId);
      return NextResponse.redirect(new URL('/', request.url));
    }

    const [ad] = await db
      .select({ link: advertisements.link })
      .from(advertisements)
      .where(eq(advertisements.id, adIdNum))
      .limit(1);
    
    if (!ad) {
      console.error('Ad not found:', adIdNum);
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (!ad.link) {
      console.error('Ad has no link:', adIdNum);
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Track click
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    
    // Use timestamp + random to ensure uniqueness
    const newId = Date.now() * 1000 + Math.floor(Math.random() * 1000);
    
    await db.insert(adClicks).values({
      id: newId,
      adId: adIdNum,
      ipAddress: ip,
      userAgent: userAgent
    }).catch((err) => console.error('Failed to track click:', err));

    // Ensure URL has protocol
    let redirectUrl = ad.link.trim();
    if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
      redirectUrl = `https://${redirectUrl}`;
    }

    return NextResponse.redirect(redirectUrl, 302);
  } catch (error) {
    console.error('Ad redirect error:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
