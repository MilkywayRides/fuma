import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { paymentGateways } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || !session.user.role || !['Admin', 'SuperAdmin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const data = await req.json()
  let webhookSecret = data.webhookSecret
  let webhookCreated = false

  // Auto-create webhook for Stripe
  if (data.provider === 'stripe' && data.autoSetupWebhook) {
    try {
      const stripe = new Stripe(data.apiKey, { apiVersion: '2025-10-29.clover' })
      const webhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/payments`
      
      const webhook = await stripe.webhookEndpoints.create({
        url: webhookUrl,
        enabled_events: [
          'checkout.session.completed',
          'payment_intent.succeeded',
          'payment_intent.payment_failed',
          'customer.subscription.created',
          'customer.subscription.updated',
          'customer.subscription.deleted',
        ],
      })
      
      webhookSecret = webhook.secret
      webhookCreated = true
    } catch (error: any) {
      console.error('Webhook creation error:', error)
      return NextResponse.json({ error: `Failed to create webhook: ${error.message}` }, { status: 400 })
    }
  }
  
  const [gateway] = await db.insert(paymentGateways).values({
    name: data.name,
    provider: data.provider,
    apiKey: data.apiKey,
    webhookSecret: webhookSecret || null,
    config: data.config || null,
    active: true,
  }).returning()

  return NextResponse.json({ ...gateway, webhookCreated })
}
