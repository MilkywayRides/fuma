'use client';

import '@/app/global.css';
import 'katex/dist/katex.css';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { Inter } from 'next/font/google';
import { AuthUIProvider } from '@daveyplate/better-auth-ui';
import { authClient } from '@/lib/auth-client';

const inter = Inter({
  subsets: ['latin'],
});

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen" suppressHydrationWarning>
        <AuthUIProvider authClient={authClient}>
          <RootProvider>{children}</RootProvider>
        </AuthUIProvider>
      </body>
    </html>
  );
}
