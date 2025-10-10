import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { user, session as sessionTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== 'SuperAdmin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId, banned } = await request.json();

  await db.update(user).set({ banned }).where(eq(user.id, userId));
  
  if (banned) {
    await db.delete(sessionTable).where(eq(sessionTable.userId, userId));
  }

  return NextResponse.json({ success: true });
}
