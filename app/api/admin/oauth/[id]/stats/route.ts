import { NextRequest, NextResponse } from 'next/server';
import { auth, hasAdminAccess } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { oauthApplications, oauthApiLogs } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const isAdmin = await hasAdminAccess(session.user.id);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id: uuid } = await params;

  const app = await db.query.oauthApplications.findFirst({
    where: and(
      eq(oauthApplications.uuid, uuid),
      eq(oauthApplications.userId, session.user.id)
    ),
  });

  if (!app) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const apiLogsData = await db.select({
    date: sql<string>`date_trunc('day', ${oauthApiLogs.createdAt})`,
    requests: sql<number>`count(*)`,
  }).from(oauthApiLogs)
    .where(eq(oauthApiLogs.applicationId, app.id))
    .groupBy(sql`date_trunc('day', ${oauthApiLogs.createdAt})`)
    .orderBy(sql`date_trunc('day', ${oauthApiLogs.createdAt}) desc`)
    .limit(30);

  return NextResponse.json(apiLogsData);
}
