import { db } from '@/lib/db';
import { advertisements, adClicks, adViews } from '@/lib/db/schema';
import { sql, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  const stats = await db
    .select({
      adId: advertisements.id,
      clicks: sql<number>`count(distinct ${adClicks.id})`,
      views: sql<number>`count(distinct ${adViews.id})`,
    })
    .from(advertisements)
    .leftJoin(adClicks, eq(adClicks.adId, advertisements.id))
    .leftJoin(adViews, eq(adViews.adId, advertisements.id))
    .groupBy(advertisements.id);

  const statsWithCTR = stats.map(stat => ({
    ...stat,
    ctr: stat.views > 0 ? (stat.clicks / stat.views) * 100 : 0,
  }));

  return NextResponse.json(statsWithCTR);
}
