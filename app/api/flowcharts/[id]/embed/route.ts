import { db } from '@/lib/db';
import { flowcharts, flowchartEmbeds } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const [flowchart] = await db
    .select()
    .from(flowcharts)
    .where(eq(flowcharts.id, id));

  if (!flowchart) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const referrer = request.headers.get('referer') || 'direct';
  await db.insert(flowchartEmbeds).values({
    flowchartId: id,
    userId,
    referrer,
  });

  return NextResponse.json(flowchart);
}
