import '@/app/global.css';
import 'katex/dist/katex.css';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';
import { OnboardingCheck } from '@/components/onboarding-check';
import { RefreshProvider } from '@/contexts/refresh-context';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { PageSpinner } from '@/components/ui/spinner';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
  adjustFontFallback: true,
  fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
  title: {
    default: 'BlazeNeuro',
    template: '%s | BlazeNeuro',
  },
  description: 'Modern blog application with Next.js',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'BlazeNeuro',
  },
};

export const viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.github.com" />
      </head>
      <body className="flex flex-col min-h-screen" suppressHydrationWarning>
        <Providers>
          <RefreshProvider>
            <Suspense fallback={<PageSpinner />}>
              <OnboardingCheck>{children}</OnboardingCheck>
            </Suspense>
          </RefreshProvider>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
