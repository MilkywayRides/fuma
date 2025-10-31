import { db } from '@/lib/db';
import { advertisements, adClicks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: adId } = await params;
  const adIdNum = Number(adId);
  if (Number.isNaN(adIdNum)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const [ad] = await db.select({ link: advertisements.link }).from(advertisements).where(eq(advertisements.id, adIdNum)).limit(1);
  
  if (!ad?.link) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const clickId = Math.floor(Math.random() * 1_000_000_000);
  db.insert(adClicks).values({ id: clickId, adId: adIdNum, ipAddress: ip, userAgent: request.headers.get('user-agent') || '' }).catch(() => {});

  const redirectUrl = ad.link.startsWith('http') ? ad.link : `https://${ad.link}`;
  return NextResponse.redirect(redirectUrl, 302);
}
