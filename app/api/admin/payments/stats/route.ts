import { NextRequest, NextResponse } from 'next/server';
import { auth, hasAdminAccess } from '@/lib/auth';
import { db } from '@/lib/db';
import { paymentTransactions, paymentPlans, paymentPages, coupons } from '@/lib/db/schema';
import { headers } from 'next/headers';
import { eq, sql } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await hasAdminAccess(session.user.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const totalRevenue = await db.select({ sum: sql<number>`COALESCE(SUM(amount), 0)` })
    .from(paymentTransactions)
    .where(eq(paymentTransactions.status, 'completed'));

  const activePlans = await db.select({ count: sql<number>`COUNT(*)` })
    .from(paymentPlans)
    .where(eq(paymentPlans.active, true));

  const paymentPagesCount = await db.select({ count: sql<number>`COUNT(*)` })
    .from(paymentPages)
    .where(eq(paymentPages.active, true));

  const activeCoupons = await db.select({ count: sql<number>`COUNT(*)` })
    .from(coupons)
    .where(eq(coupons.active, true));

  return NextResponse.json({
    totalRevenue: (totalRevenue[0]?.sum || 0) / 100,
    activePlans: activePlans[0]?.count || 0,
    paymentPages: paymentPagesCount[0]?.count || 0,
    activeCoupons: activeCoupons[0]?.count || 0,
  });
}
