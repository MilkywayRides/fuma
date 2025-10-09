import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { session as sessionTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { AccountSettings } from '@/components/account-settings';

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/sign-in');
  }

  const sessions = await db
    .select()
    .from(sessionTable)
    .where(eq(sessionTable.userId, session.user.id));

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Settings</h1>
      <p className="text-muted-foreground mb-8">Manage your account settings and preferences</p>
      <AccountSettings user={session.user} sessions={sessions} currentSessionId={session.session.id} />
    </div>
  );
}
