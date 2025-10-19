import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { flowExecution } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq, desc } from 'drizzle-orm';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const executions = await db
    .select()
    .from(flowExecution)
    .where(eq(flowExecution.flowId, id))
    .orderBy(desc(flowExecution.startedAt))
    .limit(1);

  if (!executions.length) {
    return NextResponse.json({ error: 'No execution found' }, { status: 404 });
  }

  const execution = executions[0];
  const logs = execution.logs ? JSON.parse(execution.logs) : {};

  return NextResponse.json({
    executionId: execution.id,
    flowId: execution.flowId,
    status: execution.status,
    startedAt: execution.startedAt,
    completedAt: execution.completedAt,
    output: logs.output || {},
    error: execution.error,
  });
}
