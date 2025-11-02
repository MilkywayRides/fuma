import { auth, hasAdminAccess } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { oauthApplications } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { OAuthAppSettings } from '@/components/oauth-app-settings';

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{app.name}</h1>
        <p className="text-muted-foreground mt-2">
          Manage application settings and permissions
        </p>
      </div>

      <OAuthAppSettings app={app} />
    </div>
  );
}
