import { PaymentProvider } from './index'

export class StripeProvider implements PaymentProvider {
  private apiKey: string
  private baseUrl = 'https://api.stripe.com/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async createCheckoutSession(userId: string, priceId: string, email?: string): Promise<string> {
    const params = new URLSearchParams({
      'mode': 'subscription',
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      'success_url': `${process.env.NEXT_PUBLIC_SITE_URL}/admin/subscription?success=true`,
      'cancel_url': `${process.env.NEXT_PUBLIC_SITE_URL}/admin/subscription?canceled=true`,
      'metadata[userId]': userId,
    })

    if (email) {
      params.append('customer_email', email)
    }

    const res = await fetch(`${this.baseUrl}/checkout/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    })
    const data = await res.json()
    return data.url
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await fetch(`${this.baseUrl}/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${this.apiKey}` },
    })
  }

  async getSubscription(subscriptionId: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/subscriptions/${subscriptionId}`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` },
    })
    return res.json()
  }
}
