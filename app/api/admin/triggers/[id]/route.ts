import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { paymentTriggers } from '@/lib/db/payment-schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || !session.user.role || !['Admin', 'SuperAdmin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const data = await req.json();
  const [trigger] = await db.update(paymentTriggers).set({ ...data, updatedAt: new Date() }).where(eq(paymentTriggers.id, Number(id))).returning();
  return NextResponse.json(trigger);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || !session.user.role || !['Admin', 'SuperAdmin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  await db.delete(paymentTriggers).where(eq(paymentTriggers.id, Number(id)));
  return NextResponse.json({ success: true });
}
