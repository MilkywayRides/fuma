import { OnboardingCheck } from '@/components/onboarding-check';
import { OnboardingDialog } from '@/components/onboarding-dialog';
import { CustomNavbar } from '@/components/custom-navbar';

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <CustomNavbar />
      <OnboardingCheck><></></OnboardingCheck>
      <OnboardingDialog />
      {children}
    </>
  );
}
