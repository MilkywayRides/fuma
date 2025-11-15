'use client';

import { type ReactElement, useEffect, useState, Suspense } from 'react';
import { authClient } from '@/lib/auth-client';
import { OnboardingDialog } from './onboarding-dialog';
import { useOnboarding } from '@/hooks/use-onboarding';

interface OnboardingCheckProps {
  children: React.ReactNode;
}

function OnboardingCheckContent({ children }: OnboardingCheckProps): ReactElement | null {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);
  const forceOnboarding = useOnboarding();

  useEffect(() => {
    let mounted = true;

    const checkOnboarding = async (): Promise<void> => {
      if (!mounted) return;

      try {
        // Get session
        const { data: session } = await authClient.getSession();

        if (!mounted || !session?.user) {
          setLoading(false);
          return;
        }

        // Check if forced via URL param
        if (forceOnboarding) {
          setShowOnboarding(true);
          setLoading(false);
          return;
        }

        // Get user profile to check onboarding status
        const userRes = await fetch('/api/user/profile');
        if (!userRes.ok) {
          throw new Error('Failed to fetch user profile');
        }
        const userData = await userRes.json();

        // Get system onboarding settings
        const settingsRes = await fetch('/api/admin/settings/onboarding');
        if (!settingsRes.ok) {
          throw new Error('Failed to fetch onboarding settings');
        }
        const settingsData = await settingsRes.json();

        // Show onboarding if enabled and user hasn't completed it
        if (mounted) {
          const shouldShow = settingsData.enabled && !userData.user?.onboardingCompleted;
          setShowOnboarding(shouldShow);
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
      {showOnboarding && <OnboardingDialog />}
      {children}
    </>
  );
}

export function OnboardingCheck({ children }: OnboardingCheckProps): ReactElement {
  return (
    <Suspense fallback={children}>
      <OnboardingCheckContent>{children}</OnboardingCheckContent>
    </Suspense>
  );
}