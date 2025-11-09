import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { plans } from '@/lib/db/payment-schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || !session.user.role || !['Admin', 'SuperAdmin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized', user: session?.user }, { status: 401 });
    }

    const allPlans = await db.select().from(plans).orderBy(plans.order);
    return NextResponse.json(allPlans);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || !session.user.role || !['Admin', 'SuperAdmin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await req.json();
  const [plan] = await db.insert(plans).values(data).returning();
  return NextResponse.json(plan);
}
