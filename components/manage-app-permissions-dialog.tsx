'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const AVAILABLE_SCOPES = [
  { id: 'profile', label: 'Profile Information', description: 'Name and user ID' },
  { id: 'email', label: 'Email Address', description: 'Your email address' },
  { id: 'phone', label: 'Phone Number', description: 'Your phone number' },
  { id: 'role', label: 'Account Role', description: 'Your account role and permissions' },
  { id: 'credits', label: 'Credits Balance', description: 'Your credits and balance' },
  { id: 'subscription', label: 'Subscription Status', description: 'Your subscription details' },
  { id: 'all', label: 'Full Access', description: 'Access to all your data' },
];

export function ManageAppPermissionsDialog({ tokenId, appName, currentScope }: { tokenId: number; appName: string; currentScope: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scopes, setScopes] = useState<string[]>(currentScope.split(',').filter(Boolean));
  const router = useRouter();

  async function handleSave() {
    setLoading(true);
    try {
      const res = await fetch(`/api/oauth/tokens/${tokenId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope: scopes.join(',') }),
      });

      if (!res.ok) throw new Error('Failed to update permissions');

      toast.success('Permissions updated');
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error('Failed to update permissions');
    } finally {
      setLoading(false);
    }
  }

  function toggleScope(scopeId: string) {
    setScopes(prev =>
      prev.includes(scopeId)
        ? prev.filter(s => s !== scopeId)
        : [...prev, scopeId]
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Manage Permissions
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Permissions</DialogTitle>
          <DialogDescription>
            Control what information {appName} can access
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {AVAILABLE_SCOPES.map((scope) => (
            <div key={scope.id} className="flex items-start space-x-3 p-3 border rounded-lg">
              <Checkbox
                id={scope.id}
                checked={scopes.includes(scope.id)}
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
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading || scopes.length === 0}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
