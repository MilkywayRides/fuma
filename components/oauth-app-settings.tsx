'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

const DATA_PERMISSIONS = [
  { id: 'id', label: 'User ID', description: 'Unique user identifier' },
  { id: 'name', label: 'Full Name', description: 'User display name' },
  { id: 'email', label: 'Email Address', description: 'User email address' },
  { id: 'image', label: 'Profile Image', description: 'User avatar/profile picture' },
  { id: 'role', label: 'Account Role', description: 'User role (User/Admin/SuperAdmin)' },
  { id: 'userType', label: 'User Type', description: 'Account type classification' },
  { id: 'phoneNumber', label: 'Phone Number', description: 'User phone number' },
  { id: 'credits', label: 'Credits Balance', description: 'User account credits' },
  { id: 'createdAt', label: 'Account Created', description: 'Account creation date' },
  { id: 'emailVerified', label: 'Email Verified', description: 'Email verification status' },
  { id: 'phoneVerified', label: 'Phone Verified', description: 'Phone verification status' },
];

export function OAuthAppSettings({ app }: { app: any }) {
  const [allowedScopes, setAllowedScopes] = useState<string[]>(
    app.allowedScopes ? app.allowedScopes.split(',') : ['profile', 'email']
  );
  const [dataPermissions, setDataPermissions] = useState<Record<string, boolean>>(
    app.dataPermissions ? JSON.parse(app.dataPermissions) : { id: true, name: true, email: true }
  );
  const [applicationType, setApplicationType] = useState(app.applicationType || 'web');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSave() {
    setLoading(true);
    try {
      const res = await fetch(`/api/oauth/applications/${app.id}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          allowedScopes: allowedScopes.join(','),
          dataPermissions: JSON.stringify(dataPermissions),
          applicationType 
        }),
      });

      if (!res.ok) throw new Error('Failed to update');

      toast.success('Settings updated');
      router.refresh();
    } catch (error) {
      toast.error('Failed to update settings');
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
          <div>
            <Label className="text-sm font-medium">Application Type</Label>
            <Select value={applicationType} onValueChange={setApplicationType}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="web">Web Application</SelectItem>
                <SelectItem value="cli">CLI Tool</SelectItem>
                <SelectItem value="desktop">Desktop App</SelectItem>
                <SelectItem value="mobile">Mobile App</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Permissions</CardTitle>
          <CardDescription>
            Control exactly what user data this application can access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {DATA_PERMISSIONS.map((permission) => (
            <div key={permission.id} className="flex items-start space-x-3 p-3 border rounded-lg">
              <Checkbox
                id={permission.id}
                checked={dataPermissions[permission.id] || false}
                onCheckedChange={(checked) => 
                  setDataPermissions(prev => ({ ...prev, [permission.id]: !!checked }))
                }
              />
              <div className="flex-1">
                <Label htmlFor={permission.id} className="font-medium cursor-pointer">
                  {permission.label}
                </Label>
                <p className="text-sm text-muted-foreground">{permission.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>OAuth Scopes</CardTitle>
          <CardDescription>
            General permission scopes for this application
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
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
