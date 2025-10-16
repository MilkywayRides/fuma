'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useOnboarding } from '@/hooks/use-onboarding';

export function AdminSettings() {
  const [onboardingEnabled, setOnboardingEnabled] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [updating, setUpdating] = React.useState(false);
  const { toast } = useToast();
  const isOnboardingRequested = useOnboarding();

  React.useEffect(() => {
    void fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings/onboarding');
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();
      setOnboardingEnabled(data.enabled ?? false);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOnboarding = async (checked: boolean) => {
    setUpdating(true);
    try {
      const res = await fetch('/api/admin/settings/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: checked }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update settings');
      }
      
      setOnboardingEnabled(checked);
      toast({
        title: 'Success',
        description: `Onboarding ${checked ? 'enabled' : 'disabled'} successfully.`,
      });
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update settings. Please try again.',
        variant: 'destructive',
      });
      // Revert the switch state
      setOnboardingEnabled(!checked);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
          <div className="h-8 w-1/2 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Site Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your site-wide settings and configurations.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-0.5">
            <Label htmlFor="onboarding">User Onboarding</Label>
            <p className="text-sm text-muted-foreground">
              Enable onboarding flow for new and existing users who haven&apos;t completed it.
            </p>
          </div>
          <Switch
            id="onboarding"
            disabled={updating}
            checked={onboardingEnabled}
            onCheckedChange={handleToggleOnboarding}
          />
        </div>
      </div>
    </Card>
  );
}