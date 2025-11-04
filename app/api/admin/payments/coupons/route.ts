import { NextRequest, NextResponse } from 'next/server';
import { auth, hasAdminAccess } from '@/lib/auth';
import { db } from '@/lib/db';
import { coupons } from '@/lib/db/schema';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await hasAdminAccess(session.user.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await req.json();
  
  await db.insert(coupons).values({
    code: data.code,
    type: data.type,
    value: data.value,
    maxUses: data.maxUses,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    active: true,
  });

  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await hasAdminAccess(session.user.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const allCoupons = await db.select().from(coupons);
  return NextResponse.json(allCoupons);
}
