import { NextRequest, NextResponse } from 'next/server';
import { auth, hasAdminAccess } from '@/lib/auth';
import { db } from '@/lib/db';
import { paymentGateways } from '@/lib/db/schema';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await hasAdminAccess(session.user.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await req.json();
  
  await db.insert(paymentGateways).values({
    name: data.name,
    provider: data.provider,
    apiKey: data.apiKey,
    webhookSecret: data.webhookSecret,
    active: true,
  });

  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await hasAdminAccess(session.user.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const gateways = await db.select().from(paymentGateways);
  return NextResponse.json(gateways);
}
