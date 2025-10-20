import '@/app/global.css';
import 'katex/dist/katex.css';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';
import { OnboardingCheck } from '@/components/onboarding-check';
import { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: 'BlazeNeuro',
    template: '%s | BlazeNeuro',
  },
  description: 'Modern blog application with Next.js',
};

export const viewport = {
  themeColor: '#000000',
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen" suppressHydrationWarning>
        <Providers>
          <OnboardingCheck>{children}</OnboardingCheck>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
