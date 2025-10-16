import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { flowScript } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { desc } from 'drizzle-orm';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session?.user || (session.user.role !== 'Admin' && session.user.role !== 'SuperAdmin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const scripts = await db.select().from(flowScript).orderBy(desc(flowScript.createdAt));
  
  return NextResponse.json({ scripts });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session?.user || (session.user.role !== 'Admin' && session.user.role !== 'SuperAdmin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, title, description, nodes, edges, published } = await req.json();

  const newScript = await db.insert(flowScript).values({
    id,
    title,
    description,
    nodes: JSON.stringify(nodes),
    edges: JSON.stringify(edges),
    published,
    createdById: session.user.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();

  return NextResponse.json({ script: newScript[0] });
}
