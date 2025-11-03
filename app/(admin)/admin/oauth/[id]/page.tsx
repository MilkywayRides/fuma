import { auth, hasAdminAccess } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { oauthApplications, oauthApiLogs } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { OAuthAppSettings } from '@/components/oauth-app-settings';
import { OAuthApiChart } from '@/components/oauth-api-chart';

export default async function OAuthAppPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/sign-in');
  }

  const isAdmin = await hasAdminAccess(session.user.id);
  if (!isAdmin) {
    redirect('/');
  }

  const { id: uuid } = await params;

  const app = await db.query.oauthApplications.findFirst({
    where: and(
      eq(oauthApplications.uuid, uuid),
      eq(oauthApplications.userId, session.user.id)
    ),
  });

  if (!app) {
    redirect('/admin/oauth');
  }

  let apiLogsData: any[] = [];
  try {
    apiLogsData = await db.select({
      date: sql<string>`date_trunc('day', ${oauthApiLogs.createdAt})`,
      requests: sql<number>`count(*)`,
    }).from(oauthApiLogs)
      .where(eq(oauthApiLogs.applicationId, app.id))
      .groupBy(sql`date_trunc('day', ${oauthApiLogs.createdAt})`)
      .orderBy(sql`date_trunc('day', ${oauthApiLogs.createdAt}) desc`)
      .limit(30);
  } catch (error) {
    apiLogsData = [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{app.name}</h1>
        <p className="text-muted-foreground mt-2">
          Manage application settings and permissions
        </p>
      </div>

      <OAuthApiChart data={apiLogsData} appId={app.uuid} />

      <OAuthAppSettings app={app} />
    </div>
  );
}
