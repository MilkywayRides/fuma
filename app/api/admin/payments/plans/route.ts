import { NextRequest, NextResponse } from 'next/server';
import { auth, hasAdminAccess } from '@/lib/auth';
import { db } from '@/lib/db';
import { paymentPlans } from '@/lib/db/schema';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await hasAdminAccess(session.user.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await req.json();
  
  await db.insert(paymentPlans).values({
    name: data.name,
    description: data.description,
    amount: data.amount,
    currency: data.currency,
    interval: data.interval,
    features: JSON.stringify(data.features),
    active: true,
  });

  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await hasAdminAccess(session.user.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const plans = await db.select().from(paymentPlans);
  return NextResponse.json(plans);
}
