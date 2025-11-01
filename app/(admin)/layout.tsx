import { auth, hasAdminAccess } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminAppSidebar } from '@/components/admin-app-sidebar';
import { AdminBreadcrumb } from '@/components/admin-breadcrumb';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { db } from '@/lib/db';
import { user, subscriptions, sentEmails, emailAddresses } from '@/lib/db/schema';
import { eq, count, inArray } from 'drizzle-orm';
import { Separator } from '@/components/ui/separator';
import { EmailProvider } from '@/contexts/email-context';
import { DeveloperModeProvider } from '@/contexts/developer-mode-context';
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

  const userEmailAddresses = await db.select({ id: emailAddresses.id })
    .from(emailAddresses)
    .where(eq(emailAddresses.userId, session.user.id));
  
  const emailAddressIds = userEmailAddresses.map(e => e.id);
  
  let emailCount = 0;
  if (emailAddressIds.length > 0) {
    const emailCountResult = await db.select({ count: count() })
      .from(sentEmails)
      .where(inArray(sentEmails.emailAddressId, emailAddressIds));
    emailCount = emailCountResult[0]?.count || 0;
  }
  
  const emailLimit = subscription[0]?.emailLimit || 2;

  return (
    <DeveloperModeProvider initialMode={userRecord?.developerMode || false}>
      <EmailProvider>
        <SidebarProvider>
          <AdminAppSidebar userName={session.user.name} userEmail={session.user.email} routeBadges={routeBadges} isPro={isPro} userRole={userRecord?.role} emailCount={emailCount} emailLimit={emailLimit} />
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
    </DeveloperModeProvider>
  );
}
