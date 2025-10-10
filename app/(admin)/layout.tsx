import { auth, hasAdminAccess } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin-sidebar';

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
    <div className="flex min-h-screen">
      <AdminSidebar userName={session.user.name} userEmail={session.user.email} />
      <main className="lg:ml-64 flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
