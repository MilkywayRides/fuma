import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { UsersList } from '@/components/users-list';

export default async function UsersPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const users = await db.select().from(user);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">Manage all registered users</p>
      </div>
      <UsersList users={users} currentUserRole={session?.user.role || 'User'} />
    </div>
  );
}
