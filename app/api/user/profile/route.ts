import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { user, account, session } from '@/lib/db/schema';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';

export async function GET() {
  const sessionData = await auth.api.getSession({ headers: await headers() });
  if (!sessionData) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userRecord = await db.query.user.findFirst({
    where: eq(user.id, sessionData.user.id),
  });

  const accounts = await db.query.account.findMany({
    where: eq(account.userId, sessionData.user.id),
  });

  const sessions = await db.query.session.findMany({
    where: eq(session.userId, sessionData.user.id),
  });

  const provider = accounts.find(acc => acc.providerId === 'google' || acc.providerId === 'github')?.providerId || 'email';

  return Response.json({
    user: userRecord,
    provider,
    sessionsCount: sessions.length,
  });
}

export async function PATCH(req: Request) {
  const sessionData = await auth.api.getSession({ headers: await headers() });
  if (!sessionData) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name } = await req.json();

  await db.update(user).set({ name, updatedAt: new Date() }).where(eq(user.id, sessionData.user.id));

  return Response.json({ success: true });
}
