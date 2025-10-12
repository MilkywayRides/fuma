import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { session } from '@/lib/db/schema';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';

export async function DELETE() {
  const sessionData = await auth.api.getSession({ headers: await headers() });
  if (!sessionData) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await db.delete(session).where(eq(session.userId, sessionData.user.id));

  return Response.json({ success: true });
}
