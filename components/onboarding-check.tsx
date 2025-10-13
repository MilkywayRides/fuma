'use client';

import { type ReactElement, useEffect, useState } from 'react';
import { auth } from '@/lib/auth';
import { OnboardingDialog } from './onboarding-dialog';
import { useOnboarding } from '@/hooks/use-onboarding';

interface OnboardingCheckProps {
  children: React.ReactNode;
}

export function OnboardingCheck({ children }: OnboardingCheckProps): ReactElement | null {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const forceOnboarding = useOnboarding();

  useEffect(() => {
    let mounted = true;

    const checkOnboarding = async (): Promise<void> => {
      if (!mounted) return;

      try {
        // Get session
        const session = await auth.api.getSession({
          headers: { cookie: document.cookie }
        });

        if (!mounted || !session?.user) {
          setLoading(false);
          return;
        }

        // Get settings
        const res = await fetch('/api/admin/settings/onboarding');
        if (!res.ok) {
          throw new Error('Failed to fetch onboarding settings');
        }

        const data = await res.json();

        // Only update state if component is still mounted
        if (mounted) {
          if (data.onboardingEnabled || forceOnboarding) {
            setDialogOpen(true);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to check onboarding:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void checkOnboarding();

    return () => {
      mounted = false;
    };
  }, [forceOnboarding]);

  if (loading) {
    return null;
  }

  return (
    <>
      <OnboardingDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
      />
      {children}
    </>
  );
}