import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { redirectToSignIn } from '@/lib/redirect-to-signin';
import { db } from '@/lib/db';
import { oauthApplications } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { AuthorizeForm } from '@/components/authorize-form';

export default async function AuthorizePage({
  searchParams,
}: {
  searchParams: Promise<{ client_id?: string; redirect_uri?: string; scope?: string; state?: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const { client_id, redirect_uri, scope, state } = await searchParams;

  if (!session) {
    const params = new URLSearchParams();
    if (client_id) params.set('client_id', client_id);
    if (redirect_uri) params.set('redirect_uri', redirect_uri);
    if (scope) params.set('scope', scope);
    if (state) params.set('state', state);
    const currentUrl = `/oauth/authorize?${params.toString()}`;
    redirectToSignIn(currentUrl);
  }

  if (!client_id || !redirect_uri) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Invalid Request</h1>
          <p className="text-gray-600 mt-2">Missing required parameters</p>
        </div>
      </div>
    );
  }

  const app = await db.query.oauthApplications.findFirst({
    where: eq(oauthApplications.clientId, client_id),
  });

  if (!app || !app.active) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Invalid Application</h1>
          <p className="text-gray-600 mt-2">Application not found or inactive</p>
        </div>
      </div>
    );
  }

  if (app.callbackUrl !== redirect_uri) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Invalid Redirect URI</h1>
          <p className="text-gray-600 mt-2">Redirect URI does not match</p>
        </div>
      </div>
    );
  }

  return (
    <AuthorizeForm
      app={app}
      user={session.user}
      clientId={client_id}
      redirectUri={redirect_uri}
      scope={scope || 'read'}
      state={state}
    />
  );
}
