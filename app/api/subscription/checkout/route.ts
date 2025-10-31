import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { PolarProvider } from '@/lib/payment/polar'

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const polarApiKey = process.env.POLAR_API_KEY
  const productId = process.env.POLAR_PRODUCT_ID

  if (!polarApiKey || !productId) {
    return NextResponse.json({ error: 'Payment not configured' }, { status: 500 })
  }

  const polar = new PolarProvider(polarApiKey)
  const url = await polar.createCheckoutSession(session.user.id, productId)

  return NextResponse.json({ url })
}
