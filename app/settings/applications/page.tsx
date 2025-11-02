import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { oauthTokens, oauthApplications } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { AuthorizedAppsList } from '@/components/authorized-apps-list';

export default async function ApplicationsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/sign-in');
  }

  const tokens = await db
    .select({
      id: oauthTokens.id,
      applicationId: oauthTokens.applicationId,
      scope: oauthTokens.scope,
      createdAt: oauthTokens.createdAt,
      expiresAt: oauthTokens.expiresAt,
      app: oauthApplications,
    })
    .from(oauthTokens)
    .innerJoin(oauthApplications, eq(oauthTokens.applicationId, oauthApplications.id))
    .where(eq(oauthTokens.userId, session.user.id));

  return (
    <div className="container max-w-4xl py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Authorized Applications</h1>
          <p className="text-muted-foreground mt-2">
            Manage applications that have access to your account
          </p>
        </div>

        <AuthorizedAppsList tokens={tokens} />
      </div>
    </div>
  );
}
