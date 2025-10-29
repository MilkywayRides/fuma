import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { emailAddresses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { uuid } = await params;
  const [email] = await db
    .select()
    .from(emailAddresses)
    .where(eq(emailAddresses.uuid, uuid))
    .limit(1);

  if (!email || email.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(email);
}
