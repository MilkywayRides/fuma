import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { plans } from '@/lib/db/payment-schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || !session.user.role || !['Admin', 'SuperAdmin'].includes(session.user.role)) {
    return NextResponse.json([]);
  }

  const allPlans = await db.select().from(plans).orderBy(plans.order);
  return NextResponse.json(allPlans);
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || !session.user.role || !['Admin', 'SuperAdmin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await req.json();
  console.log('Received plan data:', JSON.stringify(data, null, 2));
  
  if (!data.name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }
  if (data.price === null || data.price === undefined || data.price === 0) {
    return NextResponse.json({ error: 'Price must be greater than 0' }, { status: 400 });
  }
  if (!data.features || data.features.length === 0) {
    return NextResponse.json({ error: 'At least one feature is required' }, { status: 400 });
  }

  const uuid = Math.random().toString(36).substring(2, 15);
  const planData = {
    uuid,
    name: data.name,
    description: data.description || '',
    price: Number(data.price),
    currency: data.currency || 'usd',
    interval: data.interval || 'monthly',
    features: data.features,
    permissions: data.permissions || {},
    allowedRoles: data.allowedRoles || ['User'],
    active: data.active ?? true,
    popular: data.popular ?? false,
    order: data.order || 0,
  };
  
  const [plan] = await db.insert(plans).values(planData).returning();
  return NextResponse.json(plan);
}
