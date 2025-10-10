'use client';

import { RootProvider } from 'fumadocs-ui/provider/next';
import { AuthUIProvider } from '@daveyplate/better-auth-ui';
import { authClient } from '@/lib/auth-client';
import { VisitTracker } from '@/components/visit-tracker';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthUIProvider authClient={authClient}>
      <RootProvider>
        <VisitTracker />
        <Toaster position="top-right" />
        {children}
      </RootProvider>
    </AuthUIProvider>
  );
}
