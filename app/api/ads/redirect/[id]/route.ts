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
  
  try {
    const [ad] = await db.select({ link: advertisements.link }).from(advertisements).where(eq(advertisements.id, adId)).limit(1);
    
    if (!ad?.link) {
      return Response.redirect(new URL('/', request.url));
    }

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    db.insert(adClicks).values({ adId, ipAddress: ip, userAgent }).execute().catch(() => {});

    return Response.redirect(ad.link, 302);
  } catch {
    return Response.redirect(new URL('/', request.url));
  }
}
