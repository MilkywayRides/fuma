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

    const [ad] = await db
      .select({ link: advertisements.link })
      .from(advertisements)
      .where(eq(advertisements.id, adId))
      .limit(1);
    
    if (!ad) {
      console.error('Ad not found:', adId);
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (!ad.link) {
      console.error('Ad has no link:', adId);
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Track click
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    
    await db.insert(adClicks).values({
      adId: adId,
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
