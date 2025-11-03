import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { UserButton } from '@/components/user-button';
import { SignInButton } from '@/components/sign-in-button';

export async function NavbarUser({ variant = 'compact' }: { variant?: 'compact' | 'wide' }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return <SignInButton />;
  }

  return <UserButton name={session.user.name} email={session.user.email} image={session.user.image} variant={variant} />;
}
