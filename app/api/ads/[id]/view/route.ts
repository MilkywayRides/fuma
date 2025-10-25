import { db } from '@/lib/db';
import { adViews } from '@/lib/db/schema';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';

  // adId column expects a number; route params are strings, so parse to int.
  const adIdNum = Number(id);
  if (Number.isNaN(adIdNum)) {
    return NextResponse.json({ error: 'Invalid ad id' }, { status: 400 });
  }

  // adViews currently requires an `id` (primary key) at insert time in the
  // schema. Generate a lightweight temporary id here so the insert satisfies
  // the typed signature. In a production schema this should be an auto-
  // incrementing/serial/identity column instead.
  const generatedId = Math.floor(Math.random() * 1_000_000_000);

  await db.insert(adViews).values({
    id: generatedId,
    adId: adIdNum,
    ipAddress,
  });

  return NextResponse.json({ success: true });
}
