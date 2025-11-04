import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { webhookLogs, paymentTransactions, paymentGateways } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const gatewayId = req.nextUrl.searchParams.get('gateway');
  
  if (!gatewayId) {
    return NextResponse.json({ error: 'Gateway ID required' }, { status: 400 });
  }

  const gateway = await db.select().from(paymentGateways).where(eq(paymentGateways.id, parseInt(gatewayId))).limit(1);
  
  if (!gateway[0]) {
    return NextResponse.json({ error: 'Gateway not found' }, { status: 404 });
  }

  const payload = await req.text();
  const signature = req.headers.get('stripe-signature') || req.headers.get('x-webhook-signature');

  try {
    const data = JSON.parse(payload);
    
    // Log webhook
    await db.insert(webhookLogs).values({
      gatewayId: gateway[0].id,
      event: data.type || data.event,
      payload,
      status: 'success',
    });

    // Handle different event types
    if (data.type === 'checkout.session.completed' || data.event === 'payment.succeeded') {
      // Update transaction status
      const transactionId = data.data?.object?.metadata?.transactionId;
      if (transactionId) {
        await db.update(paymentTransactions)
          .set({ status: 'completed', gatewayTransactionId: data.data.object.id })
          .where(eq(paymentTransactions.uuid, transactionId));
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    await db.insert(webhookLogs).values({
      gatewayId: gateway[0].id,
      event: 'error',
      payload,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
