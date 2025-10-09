import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { flowcharts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [flowchart] = await db
    .select()
    .from(flowcharts)
    .where(eq(flowcharts.id, id));

  if (!flowchart) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(flowchart);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { title, data, published } = await request.json();

  const [flowchart] = await db
    .update(flowcharts)
    .set({ title, data, published, updatedAt: new Date() })
    .where(eq(flowcharts.id, id))
    .returning();

  return NextResponse.json(flowchart);
}
