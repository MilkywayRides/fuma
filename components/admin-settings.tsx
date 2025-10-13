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
  const { toast } = useToast();
  const isOnboardingRequested = useOnboarding();

  React.useEffect(() => {
    fetchSettings();
  }, []);

  // Show onboarding if enabled in settings or requested via URL
  const showOnboarding = onboardingEnabled || isOnboardingRequested;

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings/onboarding');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // Update based on the API response format
      setOnboardingEnabled(data.onboardingEnabled ?? false);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load settings.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOnboarding = async (checked: boolean) => {
    try {
      const res = await fetch('/api/admin/settings/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: checked }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOnboardingEnabled(checked);
      toast({
        title: 'Settings Updated',
        description: `User onboarding is now ${checked ? 'enabled' : 'disabled'}.`,
      });
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update settings.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Site Settings</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-0.5">
            <Label htmlFor="onboarding">User Onboarding</Label>
            <p className="text-sm text-muted-foreground">
              When enabled, new users will go through an onboarding process to set up their profile.
            </p>
          </div>
          <Switch
            id="onboarding"
            disabled={loading}
            checked={onboardingEnabled}
            onCheckedChange={handleToggleOnboarding}
            onCheckedChange={handleToggleOnboarding}
          />
        </div>
      </div>
    </Card>
  );
}