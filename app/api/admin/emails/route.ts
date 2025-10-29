import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { emailAddresses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { generateUUID } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const emails = await db.select().from(emailAddresses).where(eq(emailAddresses.userId, session.user.id));
  return NextResponse.json(emails);
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { address } = await req.json();
  const fullAddress = `${address}@blazeneuro.com`;
  const uuid = generateUUID(10);

  const [email] = await db.insert(emailAddresses).values({
    id: Math.floor(Math.random() * 1_000_000_000),
    uuid,
    address: fullAddress,
    userId: session.user.id,
  }).returning();

  return NextResponse.json(email);
}
