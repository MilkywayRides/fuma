import { auth, hasAdminAccess } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminAppSidebar } from '@/components/admin-app-sidebar';
import { AdminBreadcrumb } from '@/components/admin-breadcrumb';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { db } from '@/lib/db';
import { user, subscriptions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Separator } from '@/components/ui/separator';
import { EmailProvider } from '@/contexts/email-context';
import { getRouteBadges } from '@/lib/route-badges';

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

  const subscription = await db.select().from(subscriptions)
    .where(eq(subscriptions.userId, session.user.id))
    .limit(1);

  const isPro = subscription[0]?.status === 'active' && 
                new Date(subscription[0].currentPeriodEnd) > new Date();

  const routeBadges = getRouteBadges();

  return (
    <EmailProvider>
      <SidebarProvider>
        <AdminAppSidebar userName={session.user.name} userEmail={session.user.email} developerMode={userRecord?.developerMode} routeBadges={routeBadges} isPro={isPro} />
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
    </EmailProvider>
  );
}
