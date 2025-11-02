import { auth, hasAdminAccess } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { oauthApplications } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { OAuthApplicationsList } from '@/components/oauth-applications-list';
import { CreateOAuthAppDialog } from '@/components/create-oauth-app-dialog';
import { OAuthQuickReference } from '@/components/oauth-quick-reference';

export default async function OAuthPage() {
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

  const applications = await db.select()
    .from(oauthApplications)
    .where(eq(oauthApplications.userId, session.user.id))
    .orderBy(desc(oauthApplications.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">OAuth Applications</h1>
          <p className="text-muted-foreground mt-2">
            Manage OAuth applications and API credentials
          </p>
        </div>
        <CreateOAuthAppDialog />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OAuthApplicationsList applications={applications} />
        </div>
        <div>
          <OAuthQuickReference />
        </div>
      </div>
    </div>
  );
}
