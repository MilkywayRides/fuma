import { auth, hasAdminAccess } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin-sidebar';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

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

  const userRecord = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  });

  return (
    <div className="flex min-h-screen">
      <AdminSidebar userName={session.user.name} userEmail={session.user.email} developerMode={userRecord?.developerMode} />
      <main className="lg:ml-64 flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
