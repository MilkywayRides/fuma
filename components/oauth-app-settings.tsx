'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const AVAILABLE_SCOPES = [
  { id: 'profile', label: 'Profile Information', description: 'User name and ID' },
  { id: 'email', label: 'Email Address', description: 'User email address' },
  { id: 'phone', label: 'Phone Number', description: 'User phone number' },
  { id: 'role', label: 'Account Role', description: 'User role and permissions' },
  { id: 'credits', label: 'Credits Balance', description: 'User credits and balance' },
  { id: 'subscription', label: 'Subscription Status', description: 'User subscription details' },
  { id: 'all', label: 'Full Access', description: 'Access to all user data' },
];

export function OAuthAppSettings({ app }: { app: any }) {
  const [allowedScopes, setAllowedScopes] = useState<string[]>(
    app.allowedScopes ? app.allowedScopes.split(',') : ['profile', 'email']
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSave() {
    setLoading(true);
    try {
      const res = await fetch(`/api/oauth/applications/${app.id}/scopes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allowedScopes: allowedScopes.join(',') }),
      });

      if (!res.ok) throw new Error('Failed to update');

      toast.success('Permissions updated');
      router.refresh();
    } catch (error) {
      toast.error('Failed to update permissions');
    } finally {
      setLoading(false);
    }
  }

  function toggleScope(scopeId: string) {
    setAllowedScopes(prev =>
      prev.includes(scopeId)
        ? prev.filter(s => s !== scopeId)
        : [...prev, scopeId]
    );
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Application Details</CardTitle>
          <CardDescription>Basic information about your application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Client ID</Label>
            <code className="block mt-1 p-2 bg-muted rounded text-sm">{app.clientId}</code>
          </div>
          <div>
            <Label className="text-sm font-medium">Homepage URL</Label>
            <p className="text-sm text-muted-foreground mt-1">{app.homepageUrl}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Callback URL</Label>
            <p className="text-sm text-muted-foreground mt-1">{app.callbackUrl}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Permissions</CardTitle>
          <CardDescription>
            Control what user data this application can access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {AVAILABLE_SCOPES.map((scope) => (
            <div key={scope.id} className="flex items-start space-x-3 p-3 border rounded-lg">
              <Checkbox
                id={scope.id}
                checked={allowedScopes.includes(scope.id)}
                onCheckedChange={() => toggleScope(scope.id)}
              />
              <div className="flex-1">
                <Label htmlFor={scope.id} className="font-medium cursor-pointer">
                  {scope.label}
                </Label>
                <p className="text-sm text-muted-foreground">{scope.description}</p>
              </div>
            </div>
          ))}
          <Button onClick={handleSave} disabled={loading || allowedScopes.length === 0}>
            {loading ? 'Saving...' : 'Save Permissions'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
