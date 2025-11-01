import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { UserDashboardSidebar } from '@/components/user-dashboard-sidebar'
import { Separator } from '@/components/ui/separator'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { user, subscriptions, sentEmails, emailAddresses } from '@/lib/db/schema'
import { eq, and, count, inArray } from 'drizzle-orm'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/sign-in')

  const [userData] = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1)
  
  const [sub] = await db.select()
    .from(subscriptions)
    .where(and(
      eq(subscriptions.userId, session.user.id),
      eq(subscriptions.status, 'active')
    ))
    .limit(1)

  const now = new Date()
  const isPro = sub && new Date(sub.currentPeriodEnd) > now

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
  
  const emailLimit = sub?.emailLimit || 2;

  return (
    <SidebarProvider>
      <UserDashboardSidebar userData={userData} isPro={!!isPro} emailCount={emailCount} emailLimit={emailLimit} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
