import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PaymentManager } from '@/lib/payment/manager';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-10-29.clover' });

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId, planId, paymentId } = session.metadata!;

      await PaymentManager.completePayment(Number(paymentId), session.id);
      
      if (session.mode === 'subscription') {
        await PaymentManager.createSubscription({
          userId: userId!,
          planId: Number(planId),
          gatewaySubscriptionId: session.subscription as string,
          gatewayCustomerId: session.customer as string,
        });
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      // Handle subscription cancellation
      break;
    }
  }

  return NextResponse.json({ received: true });
}
