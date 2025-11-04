import { NextRequest, NextResponse } from 'next/server';
import { auth, hasAdminAccess } from '@/lib/auth';
import { db } from '@/lib/db';
import { paymentButtons } from '@/lib/db/schema';
import { headers } from 'next/headers';
import { randomBytes } from 'crypto';

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await hasAdminAccess(session.user.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await req.json();
  const uuid = randomBytes(8).toString('hex');
  
  await db.insert(paymentButtons).values({
    uuid,
    name: data.name,
    planId: data.planId,
    buttonText: data.buttonText,
    active: true,
  });

  return NextResponse.json({ success: true, uuid });
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await hasAdminAccess(session.user.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const buttons = await db.select().from(paymentButtons);
  return NextResponse.json(buttons);
}
