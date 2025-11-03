import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { session } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(req: NextRequest) {
  const currentSession = await auth.api.getSession({ headers: await headers() });
  if (!currentSession) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { sessionId } = await req.json();
  await db.delete(session).where(eq(session.id, sessionId));

  return NextResponse.json({ success: true });
}
