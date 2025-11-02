'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Globe, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

const SCOPE_INFO: Record<string, { label: string; description: string }> = {
  profile: { label: 'Profile Information', description: 'Name and user ID' },
  email: { label: 'Email Address', description: 'Your email address' },
  phone: { label: 'Phone Number', description: 'Your phone number' },
  role: { label: 'Account Role', description: 'Your account role and permissions' },
  credits: { label: 'Credits Balance', description: 'Your credits and balance' },
  subscription: { label: 'Subscription Status', description: 'Your subscription details' },
  all: { label: 'Full Access', description: 'Access to all your data' },
};

export function AuthorizeForm({
  app,
  user,
  clientId,
  redirectUri,
  scope,
  state,
}: {
  app: any;
  user: any;
  clientId: string;
  redirectUri: string;
  scope: string;
  state?: string;
}) {
  const [loading, setLoading] = useState(false);
  const allowedScopes = app.allowedScopes ? app.allowedScopes.split(',').map((s: string) => s.trim()).filter(Boolean) : ['profile', 'email'];
  const requestedScopes = allowedScopes.length > 0 ? allowedScopes : ['profile', 'email'];

  async function handleAuthorize() {
    setLoading(true);
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope,
      ...(state && { state }),
    });
    window.location.href = `/api/oauth/authorize?${params}`;
  }

  function handleCancel() {
    const url = new URL(redirectUri);
    url.searchParams.set('error', 'access_denied');
    if (state) url.searchParams.set('state', state);
    window.location.href = url.toString();
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Authorize Application</CardTitle>
          <CardDescription>
            <strong>{app.name}</strong> wants to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Application Details</p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>{app.name}</p>
                  {app.description && <p className="text-xs">{app.description}</p>}
                  <a href={app.homepageUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                    {app.homepageUrl}
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1 space-y-3">
                <p className="text-sm font-medium">This app will be able to:</p>
                <div className="space-y-2">
                  {requestedScopes.map((s: string) => {
                    const info = SCOPE_INFO[s];
                    if (!info) return null;
                    return (
                      <div key={s} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{info.label}</p>
                          <p className="text-xs text-muted-foreground">{info.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Logged in as</p>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Badge variant="secondary">{user.role || 'User'}</Badge>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleAuthorize}
              disabled={loading}
            >
              {loading ? 'Authorizing...' : 'Authorize'}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            By authorizing, you allow this application to access your information according to their terms of service and privacy policy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
