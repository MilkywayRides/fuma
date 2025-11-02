'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Shield, Trash2, ExternalLink, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ManageAppPermissionsDialog } from '@/components/manage-app-permissions-dialog';

type AuthorizedApp = {
  id: number;
  applicationId: number;
  scope: string;
  createdAt: Date;
  expiresAt: Date;
  app: {
    id: number;
    name: string;
    description: string | null;
    homepageUrl: string;
  };
};

export function AuthorizedAppsList({ tokens }: { tokens: AuthorizedApp[] }) {
  const router = useRouter();

  async function revokeAccess(tokenId: number, appName: string) {
    try {
      const res = await fetch(`/api/oauth/tokens/${tokenId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to revoke access');

      toast.success(`Access revoked for ${appName}`);
      router.refresh();
    } catch (error) {
      toast.error('Failed to revoke access');
    }
  }

  if (tokens.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Shield className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">No authorized applications</p>
          <p className="text-sm text-muted-foreground text-center">
            Applications you authorize will appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {tokens.map((token) => (
        <Card key={token.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {token.app.name}
                  <Badge variant="secondary">{token.scope}</Badge>
                </CardTitle>
                {token.app.description && (
                  <CardDescription className="mt-2">{token.app.description}</CardDescription>
                )}
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Revoke Access</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will revoke {token.app.name}'s access to your account. The application will no longer be able to access your information.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => revokeAccess(token.id, token.app.name)}>
                      Revoke Access
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ExternalLink className="h-4 w-4" />
              <a
                href={token.app.homepageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {token.app.homepageUrl}
              </a>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Permissions</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {token.scope.split(',').map((s) => {
                  const scopeMap: Record<string, string> = {
                    profile: 'Read your profile information',
                    email: 'Access your email address',
                    phone: 'Access your phone number',
                    role: 'View your account role',
                    credits: 'View your credits balance',
                    subscription: 'View your subscription status',
                    all: 'Access all your data',
                  };
                  return (
                    <li key={s} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                      {scopeMap[s.trim()] || s}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Authorized {new Date(token.createdAt).toLocaleDateString()}
                </div>
                <div>
                  Expires {new Date(token.expiresAt).toLocaleDateString()}
                </div>
              </div>
              <ManageAppPermissionsDialog
                tokenId={token.id}
                appName={token.app.name}
                currentScope={token.scope}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
