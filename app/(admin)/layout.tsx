import { auth, hasAdminAccess } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/sign-in');
  }

  const isAdmin = await hasAdminAccess(session.user.id);
  if (!isAdmin) {
    redirect('/');
  }

  return (
    <div className="min-h-screen">
      <nav className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/admin" className="text-xl font-bold">
            Admin Dashboard
          </Link>
          <div className="flex gap-4 items-center">
            <Link href="/" className="hover:underline">
              View Blog
            </Link>
            <span className="text-sm text-muted-foreground">{session.user.email}</span>
          </div>
        </div>
      </nav>
      <div className="container mx-auto px-4 py-8">{children}</div>
    </div>
  );
}
