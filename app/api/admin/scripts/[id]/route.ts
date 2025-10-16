import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { flowScript } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session?.user || (session.user.role !== 'Admin' && session.user.role !== 'SuperAdmin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const script = await db.select().from(flowScript).where(eq(flowScript.id, id)).limit(1);
  
  if (!script.length) {
    return NextResponse.json({ error: 'Script not found' }, { status: 404 });
  }

  return NextResponse.json({ script: script[0] });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session?.user || (session.user.role !== 'Admin' && session.user.role !== 'SuperAdmin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, description, nodes, edges, published } = await req.json();

  const updated = await db.update(flowScript)
    .set({
      title,
      description,
      nodes: JSON.stringify(nodes),
      edges: JSON.stringify(edges),
      published,
      updatedAt: new Date(),
    })
    .where(eq(flowScript.id, id))
    .returning();

  return NextResponse.json({ script: updated[0] });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session?.user || (session.user.role !== 'Admin' && session.user.role !== 'SuperAdmin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await db.delete(flowScript).where(eq(flowScript.id, id));

  return NextResponse.json({ success: true });
}
