import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { emails, emailAddresses } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userEmails = await db
    .select({
      id: emails.id,
      from: emails.from,
      subject: emails.subject,
      body: emails.body,
      read: emails.read,
      starred: emails.starred,
      createdAt: emails.createdAt,
      address: emailAddresses.address,
    })
    .from(emails)
    .innerJoin(emailAddresses, eq(emails.emailAddressId, emailAddresses.id))
    .where(eq(emailAddresses.userId, session.user.id))
    .orderBy(desc(emails.createdAt))
    .limit(50);

  return NextResponse.json(userEmails);
}
