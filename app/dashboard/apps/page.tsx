import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirectToSignIn } from '@/lib/redirect-to-signin'
import { db } from '@/lib/db'
import { oauthTokens, oauthApplications } from '@/lib/db/oauth-schema'
import { eq, and, gt } from 'drizzle-orm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RevokeAccessButton } from '@/components/revoke-access-button'
import { Globe, Terminal, Monitor } from 'lucide-react'

export default async function AuthorizedAppsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    redirectToSignIn('/dashboard/apps')
    return
  }

  let authorizedApps: Array<{
    tokenId: number;
    appName: string;
    appDescription: string | null;
    appHomepage: string;
    appType: string;
    scope: string;
    expiresAt: Date;
    createdAt: Date;
  }> = [];
  try {
    authorizedApps = await db
      .select({
        tokenId: oauthTokens.id,
        appName: oauthApplications.name,
        appDescription: oauthApplications.description,
        appHomepage: oauthApplications.homepageUrl,
        appType: oauthApplications.applicationType,
        scope: oauthTokens.scope,
        expiresAt: oauthTokens.expiresAt,
        createdAt: oauthTokens.createdAt,
      })
      .from(oauthTokens)
      .innerJoin(oauthApplications, eq(oauthTokens.applicationId, oauthApplications.id))
      .where(
        and(
          eq(oauthTokens.userId, session.user.id),
          gt(oauthTokens.refreshExpiresAt, new Date())
        )
      );
  } catch (error) {
    console.error('Error fetching authorized apps:', error);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Authorized Apps</h1>
        <p className="text-muted-foreground mt-2">
          Manage applications that have access to your account
        </p>
      </div>

      {authorizedApps.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              You haven't authorized any applications yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {authorizedApps.map((app) => (
            <Card key={app.tokenId}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {app.appType === 'web' && <Globe className="h-5 w-5 text-muted-foreground" />}
                      {app.appType === 'cli' && <Terminal className="h-5 w-5 text-muted-foreground" />}
                      {app.appType === 'desktop' && <Monitor className="h-5 w-5 text-muted-foreground" />}
                      {!app.appType && <Globe className="h-5 w-5 text-muted-foreground" />}
                      <CardTitle className="text-lg">{app.appName}</CardTitle>
                    </div>
                    {app.appDescription && (
                      <CardDescription>
                        {app.appDescription}
                      </CardDescription>
                    )}
                  </div>
                  <RevokeAccessButton tokenId={app.tokenId} appName={app.appName} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Scope:</span>
                    <span className="font-medium">{app.scope}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Authorized:</span>
                    <span className="font-medium">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Access expires:</span>
                    <span className="font-medium">
                      {new Date(app.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                  {app.appHomepage && (
                    <div className="pt-2">
                      <Button variant="link" className="h-auto p-0" asChild>
                        <a href={app.appHomepage} target="_blank" rel="noopener noreferrer">
                          Visit app website →
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
