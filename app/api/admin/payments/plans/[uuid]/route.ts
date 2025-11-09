import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { plans } from '@/lib/db/payment-schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest, { params }: { params: Promise<{ uuid: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || !session.user.role || !['Admin', 'SuperAdmin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { uuid } = await params;
  const [plan] = await db.select().from(plans).where(eq(plans.uuid, uuid));
  return NextResponse.json(plan);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ uuid: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || !session.user.role || !['Admin', 'SuperAdmin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { uuid } = await params;
  const data = await req.json();
  
  const updateData = {
    name: data.name,
    description: data.description,
    price: Number(data.price),
    currency: data.currency,
    interval: data.interval,
    features: data.features,
    permissions: data.permissions,
    allowedRoles: data.allowedRoles,
    active: data.active,
    popular: data.popular,
    order: data.order || 0,
    updatedAt: new Date(),
  };
  
  const [plan] = await db.update(plans).set(updateData).where(eq(plans.uuid, uuid)).returning();
  return NextResponse.json(plan);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ uuid: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || !session.user.role || !['Admin', 'SuperAdmin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { uuid } = await params;
  await db.delete(plans).where(eq(plans.uuid, uuid));
  return NextResponse.json({ success: true });
}
