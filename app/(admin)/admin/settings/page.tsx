import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { session as sessionTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { AccountSettings } from '@/components/account-settings';
import { AdminSettings } from '@/components/admin-settings';
import { Metadata } from 'next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const metadata: Metadata = {
  title: 'Settings - Admin',
};

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/sign-in');
  }

  console.log('User role:', session.user.role);

  const sessions = await db
    .select()
    .from(sessionTable)
    .where(eq(sessionTable.userId, session.user.id));

  return (
    <div className="max-w-4xl space-y-8">
      <h1 className="text-3xl font-bold mb-2">Settings</h1>
      <p className="text-muted-foreground mb-8">Manage your account settings and preferences</p>
      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          {session.user.role === 'Admin' || session.user.role === 'SuperAdmin' && <TabsTrigger value="site">Site Settings</TabsTrigger>}
        </TabsList>
        <TabsContent value="general">
          <AccountSettings user={session.user} sessions={sessions} currentSessionId={session.session.id} />
        </TabsContent>
        {(session.user.role === 'Admin' || session.user.role === 'SuperAdmin') && (
          <TabsContent value="site">
            <AdminSettings />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
