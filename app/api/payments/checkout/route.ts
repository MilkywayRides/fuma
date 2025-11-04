import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const { amount, email, gatewayId, title } = await req.json();

  if (gatewayId === 1) { // Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-10-29.clover' });
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: title },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      customer_email: email,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/cancel`,
    });

    return NextResponse.json({ url: session.url });
  }

  return NextResponse.json({ error: 'Gateway not supported' }, { status: 400 });
}
