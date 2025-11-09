import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { PaymentManager } from '@/lib/payment/manager';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const subscription = await PaymentManager.getUserSubscription(session.user.id);
  return NextResponse.json(subscription);
}

export async function DELETE() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const subscription = await PaymentManager.getUserSubscription(session.user.id);
  if (!subscription) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
  }

  await PaymentManager.cancelSubscription(subscription.subscription.id);
  return NextResponse.json({ success: true });
}
