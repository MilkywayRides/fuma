import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { plans } from '@/lib/db/payment-schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const activePlans = await db.select().from(plans).where(eq(plans.active, true)).orderBy(plans.order);
  return NextResponse.json(activePlans);
}
