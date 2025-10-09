import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { flowcharts } from '@/lib/db/schema';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

function generateId() {
  return Math.random().toString(36).substring(2, 7);
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, data, published } = await request.json();
  const id = generateId();

  const [flowchart] = await db
    .insert(flowcharts)
    .values({
      id,
      title,
      data,
      published: published || false,
      authorId: session.user.id,
    })
    .returning();

  return NextResponse.json(flowchart);
}
