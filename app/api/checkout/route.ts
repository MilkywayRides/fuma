import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { plans } from '@/lib/db/payment-schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';
import { PaymentManager } from '@/lib/payment/manager';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-10-29.clover' });

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId } = await req.json();
    const [plan] = await db.select().from(plans).where(eq(plans.id, planId));

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const intervalMap: any = { monthly: 'month', yearly: 'year', lifetime: null };
    const stripeInterval = intervalMap[plan.interval];

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: plan.currency,
          product_data: { name: plan.name, description: plan.description || '' },
          unit_amount: plan.price,
          recurring: stripeInterval ? { interval: stripeInterval } : undefined,
        },
        quantity: 1,
      }],
      mode: plan.interval === 'lifetime' ? 'payment' : 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/cancel`,
      customer_email: session.user.email,
      metadata: { userId: session.user.id, planId: plan.id.toString() },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
