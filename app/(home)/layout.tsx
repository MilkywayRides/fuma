import { OnboardingCheck } from '@/components/onboarding-check';
import { OnboardingDialog } from '@/components/onboarding-dialog';
import { CustomNavbar } from '@/components/custom-navbar';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <CustomNavbar />
      <OnboardingCheck><></></OnboardingCheck>
      <OnboardingDialog />
      {children}
    </>
  );
}
