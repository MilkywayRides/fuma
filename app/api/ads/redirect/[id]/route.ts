import { db } from '@/lib/db';
import { advertisements, adClicks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: adId } = await params;
  const adIdNum = Number(adId);
  if (Number.isNaN(adIdNum)) {
    return Response.redirect(new URL('/', request.url));
  }

  try {
    const [ad] = await db.select({ link: advertisements.link }).from(advertisements).where(eq(advertisements.id, adIdNum)).limit(1);
    
    if (!ad?.link) {
      return Response.redirect(new URL('/', request.url));
    }

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

  // adClicks requires an `id` primary key at insert time in the current
  // schema; generate a temporary id here. In production the `id` should be
  // auto-incrementing.
  const clickId = Math.floor(Math.random() * 1_000_000_000);
  db.insert(adClicks).values({ id: clickId, adId: adIdNum, ipAddress: ip, userAgent }).execute().catch(() => {});

    return Response.redirect(ad.link, 302);
  } catch {
    return Response.redirect(new URL('/', request.url));
  }
}
