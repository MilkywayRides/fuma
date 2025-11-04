import { NextRequest, NextResponse } from 'next/server';
import { auth, hasAdminAccess } from '@/lib/auth';
import { db } from '@/lib/db';
import { paymentPages } from '@/lib/db/schema';
import { headers } from 'next/headers';
import { randomBytes } from 'crypto';

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await hasAdminAccess(session.user.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await req.json();
  const uuid = randomBytes(8).toString('hex');
  
  await db.insert(paymentPages).values({
    uuid,
    title: data.title,
    description: data.description,
    planId: data.planId,
    customAmount: data.customAmount,
    minAmount: data.minAmount,
    maxAmount: data.maxAmount,
    successUrl: data.successUrl,
    cancelUrl: data.cancelUrl,
    active: true,
  });

  return NextResponse.json({ success: true, uuid });
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await hasAdminAccess(session.user.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const pages = await db.select().from(paymentPages);
  return NextResponse.json(pages);
}
