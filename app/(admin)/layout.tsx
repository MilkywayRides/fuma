import { auth, hasAdminAccess } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminAppSidebar } from '@/components/admin-app-sidebar';
import { AdminBreadcrumb } from '@/components/admin-breadcrumb';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Separator } from '@/components/ui/separator';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session;
  try {
    session = await auth.api.getSession({
      headers: await headers(),
    });
  } catch (error) {
    console.error('Session error:', error);
    redirect('/sign-in');
  }

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
    <SidebarProvider>
      <AdminAppSidebar userName={session.user.name} userEmail={session.user.email} developerMode={userRecord?.developerMode} />
      <SidebarInset>
        <div className="flex flex-1 flex-col bg-sidebar">
          <div className="min-h-[100vh] flex-1 rounded-xl bg-background border md:min-h-min m-2 ml-0">
            <header className="flex h-16 shrink-0 items-center gap-2 px-6 border-b">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <AdminBreadcrumb />
            </header>
            <div className="p-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
