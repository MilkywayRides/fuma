import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { paymentGateways, paymentTransactions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature') || req.headers.get('x-webhook-signature')
  const provider = req.headers.get('x-payment-provider') || 'stripe'

  try {
    let event: any

    if (provider === 'stripe') {
      const gateways = await db.select().from(paymentGateways).where(eq(paymentGateways.provider, 'stripe'))
      if (gateways.length === 0) {
        return NextResponse.json({ error: 'No Stripe gateway configured' }, { status: 400 })
      }

      const gateway = gateways[0]
      const stripe = new Stripe(gateway.apiKey, { apiVersion: '2025-10-29.clover' })
      
      if (signature && gateway.webhookSecret) {
        event = stripe.webhooks.constructEvent(body, signature, gateway.webhookSecret)
      } else {
        event = JSON.parse(body)
      }

      await handleStripeEvent(event)
    } else if (provider === 'polar') {
      event = JSON.parse(body)
      await handlePolarEvent(event)
    } else if (provider === 'paytm') {
      event = JSON.parse(body)
      await handlePaytmEvent(event)
    } else if (provider === 'razorpay') {
      event = JSON.parse(body)
      await handleRazorpayEvent(event)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

async function handleStripeEvent(event: any) {
  switch (event.type) {
    case 'checkout.session.completed':
    case 'payment_intent.succeeded':
      await db.insert(paymentTransactions).values({
        uuid: Math.random().toString(36).substring(2, 15),
        amount: event.data.object.amount,
        currency: event.data.object.currency,
        status: 'completed',
        gatewayTransactionId: event.data.object.id,
      })
      break
  }
}

async function handlePolarEvent(event: any) {
  // Handle Polar webhooks
}

async function handlePaytmEvent(event: any) {
  // Handle PayTM webhooks
}

async function handleRazorpayEvent(event: any) {
  // Handle Razorpay webhooks
}
