import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { UserButton } from '@/components/user-button';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export async function NavbarUser({ variant = 'compact' }: { variant?: 'compact' | 'wide' }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return (
      <Button asChild variant="ghost" size="sm">
        <Link href="/sign-in">Sign In</Link>
      </Button>
    );
  }

  return <UserButton name={session.user.name} email={session.user.email} image={session.user.image} variant={variant} />;
}
