'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Eye, EyeOff, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { EditOAuthAppDialog } from '@/components/edit-oauth-app-dialog';

type Application = {
  id: number;
  clientId: string;
  clientSecret: string;
  name: string;
  description: string | null;
  homepageUrl: string;
  callbackUrl: string;
  active: boolean;
  createdAt: Date;
};

export function OAuthApplicationsList({ applications }: { applications: Application[] }) {
  const [visibleSecrets, setVisibleSecrets] = useState<Set<number>>(new Set());
  const router = useRouter();

  const toggleSecretVisibility = (id: number) => {
    setVisibleSecrets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const deleteApplication = async (id: number) => {
    try {
      const res = await fetch(`/api/oauth/applications/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');

      toast.success('Application deleted');
      router.refresh();
    } catch (error) {
      toast.error('Failed to delete application');
    }
  };

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">No OAuth applications yet</p>
          <p className="text-sm text-muted-foreground">Create your first application to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {applications.map((app) => (
        <Card key={app.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {app.name}
                  {app.active ? (
                    <Badge variant="default">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </CardTitle>
                {app.description && (
                  <CardDescription className="mt-2">{app.description}</CardDescription>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={`/admin/oauth/${app.uuid}`}>Settings</a>
                </Button>
                <EditOAuthAppDialog app={app} />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Application</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the application and revoke all tokens. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteApplication(app.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Client ID</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(app.clientId, 'Client ID')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <code className="block p-2 bg-muted rounded text-sm break-all">
                  {app.clientId}
                </code>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Client Secret</span>
                </div>
                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                  Secret is only shown once during creation. This is the hashed version.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-sm font-medium">Homepage URL</span>
                  <a
                    href={app.homepageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                  >
                    {app.homepageUrl}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium">Callback URL</span>
                  <p className="text-sm text-muted-foreground break-all">
                    {app.callbackUrl}
                  </p>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                Created {new Date(app.createdAt).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
