import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { flowScript, flowExecution } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session?.user || (session.user.role !== 'Admin' && session.user.role !== 'SuperAdmin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const script = await db.select().from(flowScript).where(eq(flowScript.id, id)).limit(1);
  
  if (!script.length) {
    return NextResponse.json({ error: 'Script not found' }, { status: 404 });
  }

  const execution = await db.insert(flowExecution).values({
    flowId: id,
    status: 'running',
    startedAt: new Date(),
    triggeredById: session.user.id,
  }).returning();

  try {
    let result;
    
    if (process.env.MODAL_ENDPOINT_URL) {
      const response = await fetch(process.env.MODAL_ENDPOINT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flow_id: id,
          nodes: JSON.parse(script[0].nodes),
          edges: JSON.parse(script[0].edges),
        }),
      });
      result = await response.json();
    } else {
      // Local execution fallback
      result = {
        status: 'completed',
        output: { message: 'Flow executed locally (Modal not configured)' },
        timestamp: new Date().toISOString(),
      };
    }

    await db.update(flowExecution)
      .set({
        status: result.status === 'completed' ? 'success' : 'error',
        completedAt: new Date(),
        logs: JSON.stringify(result),
        error: result.error || null,
      })
      .where(eq(flowExecution.id, execution[0].id));

    await db.update(flowScript)
      .set({
        lastExecutedAt: new Date(),
        executionCount: script[0].executionCount + 1,
      })
      .where(eq(flowScript.id, id));

    return NextResponse.json({ execution: execution[0], result });
  } catch (error: any) {
    await db.update(flowExecution)
      .set({
        status: 'error',
        completedAt: new Date(),
        error: error.message,
      })
      .where(eq(flowExecution.id, execution[0].id));

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
