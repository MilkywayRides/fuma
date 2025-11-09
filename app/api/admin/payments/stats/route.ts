import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { plans } from '@/lib/db/payment-schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || !session.user.role || !['Admin', 'SuperAdmin'].includes(session.user.role)) {
    return NextResponse.json({ totalRevenue: 0, activePlans: 0, paymentPages: 0, activeCoupons: 0 });
  }

  const activePlans = await db.select().from(plans).where(eq(plans.active, true));

  return NextResponse.json({
    totalRevenue: 0,
    activePlans: activePlans.length,
    paymentPages: 0,
    activeCoupons: 0,
  });
}
