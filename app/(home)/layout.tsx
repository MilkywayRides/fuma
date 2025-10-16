import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
import { OnboardingCheck } from '@/components/onboarding-check';
import { OnboardingDialog } from '@/components/onboarding-dialog';

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <HomeLayout {...baseOptions()}>
      <OnboardingCheck />
      <OnboardingDialog />
      {children}
    </HomeLayout>
  );
}
