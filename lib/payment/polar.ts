import { PaymentProvider } from './index'

export class PolarProvider implements PaymentProvider {
  private apiKey: string
  private baseUrl = 'https://api.polar.sh'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async createCheckoutSession(userId: string, productId: string): Promise<string> {
    const res = await fetch(`${this.baseUrl}/v1/checkouts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: productId,
        customer_metadata: { userId },
      }),
    })
    const data = await res.json()
    return data.url
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await fetch(`${this.baseUrl}/v1/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${this.apiKey}` },
    })
  }

  async getSubscription(subscriptionId: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/v1/subscriptions/${subscriptionId}`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` },
    })
    return res.json()
  }
}
