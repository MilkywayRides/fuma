import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { PolarProvider, StripeProvider } from '@/lib/payment'

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { provider } = await req.json()

  if (provider === 'polar') {
    const apiKey = process.env.POLAR_API_KEY
    const productId = process.env.POLAR_PRODUCT_ID
    if (!apiKey || !productId) {
      return NextResponse.json({ error: 'Polar not configured' }, { status: 500 })
    }
    const polar = new PolarProvider(apiKey)
    const url = await polar.createCheckoutSession(session.user.id, productId, session.user.email)
    return NextResponse.json({ url })
  }

  if (provider === 'stripe') {
    const apiKey = process.env.STRIPE_SECRET_KEY
    const priceId = process.env.STRIPE_PRICE_ID
    if (!apiKey || !priceId) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }
    const stripe = new StripeProvider(apiKey)
    const url = await stripe.createCheckoutSession(session.user.id, priceId, session.user.email)
    return NextResponse.json({ url })
  }

  return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
}
