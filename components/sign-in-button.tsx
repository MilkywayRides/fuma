'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname, useSearchParams } from 'next/navigation';

export function SignInButton() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
  const signInUrl = `/sign-in?redirectTo=${encodeURIComponent(currentUrl)}`;

  return (
    <Button asChild variant="ghost" size="sm">
      <Link href={signInUrl}>Sign In</Link>
    </Button>
  );
}
